<?php

namespace infrajs\controller;
use infrajs\infra\Infra;
use infrajs\event\Event;
use infrajs\view\View;

//require_once __DIR__.'/../infra/Infra.php';

/*//Функции для написания плагинов
Controller::store();
Controller::storeLayer(layer)

Controller::run(layers,callback);
Controller::runAddList('layers')
Controller::runAddKeys('divs');

Controller::isSaveBranch(layer,val);
Controller::isParent(layer,parent);

Event::fire('layer.is rest|show|check',layer);
Controller::isAdd('rest|show|check',callback(layer));

Controller::check(layer);


*/
/*if (!$infrajs) {
	$infrajs=array();
}*/
class Controller
{
	public static $counter = 0;//Счётчик сколько раз перепарсивался сайт, посмотреть можно в firebug
	public static $store = array(
		'timer' => false,
		'run' => array('keys' => array(),'list' => array()),
		'waits' => array(),
		'process' => false
		
	);
	public static $layers;
	public static function reset(){
		static::$store = array(
			'timer' => false,
			'run' => array('keys' => array(),'list' => array()),
			'waits' => array(),
			'process' => false
		);	
	}
	public static function &storeLayer(&$layer)
	{
		if (@!$layer['store']) {
			$layer['store'] = array('counter' => 0);
		}//Кэш используется во всех is функциях... iswork кэш, ischeck кэш используется для определения iswork слоя.. путём сравнения ))
		return $layer['store']; //Очищается кэш в checkNow
	}
	public static function &store()
	{
		return static::$store;
	}

	public static function getAllLayers()
	{
		$store = &self::store();

		return $store['alayers'];
	}
	/*
		в check вызывается check// игнор
		два check подряд будет два выполнения.

		###mainrun всегда check всегда один на php, но для совместимости..., для тестов.. нужно помнить что каждый check работает с одним и тем же infra_html

		Гипотетически можем работать вне клиента.. дай один html дай другой... выдай клиенту третий
		без mainrun мы не считаем env
	*/
	public static function check(&$layers)
	{
		static::$layers=$layers;
		static::$counter++;
		//Пробежка по слоям
		$store = &self::store();

		Event::fire('oninit');//сборка событий

		self::run(static::$layers, function (&$layer, &$parent) {
			//Запускается у всех слоёв в работе
			if ($parent) $layer['parent'] = &$parent;
			Event::fire('layer.oninit', $layer);
			if (!Event::fire('layer.ischeck', $layer)) {
				return;
			}
			Event::fire('layer.oncheck', $layer);
		});//разрыв нужен для того чтобы можно было наперёд определить показывается слой или нет. oncheck у всех. а потом по порядку.

		Event::fire('oncheck');//момент когда доступны слои по getUnickLayer

		self::run(static::$layers, function (&$layer) {
			//С чего вдруг oncheck у всех слоёв.. надо только у активных
			if (Event::fire('layer.isshow', $layer)) {
				//Событие в котором вставляется html
				Event::fire('layer.onshow', $layer);//при клике делается отметка в конфиге слоя и слой парсится... в oncheck будут подстановки tpl и isRest вернёт false
				//onchange показанный слой не реагирует на изменение адресной строки, нельзя привязывать динамику интерфейса к адресной строке, только черещ перепарсивание
			}
		});//у родительского слоя showed будет реальное а не старое


		Event::fire('onshow');
		//loader, setA, seo добавить в html, можно зациклить check
		//$store['process']=false;
		$html=View::html();

		View::html('',true);
		static::reset();

		return $html; 
	}
	public static function &run(&$layers, $callback, &$parent = null)
	{
		$store = &Controller::store();
		if (!$store['run']) {
			$store['run'] = array();
		}
		$props = &$store['run'];

		$r = &Each::fora($layers, function &(&$layer) use (&$parent, $callback, $props) {
			$r = &$callback($layer, $parent);
			if (!is_null($r)) {
				return $r;
			}

			$r = &Each::foro($layer, function &(&$val, $name) use (&$layer, $callback, $props) {
				$r = null;
				if (isset($props['list'][$name])) {
					$r = &Controller::run($val, $callback, $layer);
					if (!is_null($r)) {
						return $r;
					}
				} else if (isset($props['keys'][$name])) {
					$r = &Each::foro($val, function &(&$v, $i) use (&$layer, $callback) {
						$r = &Controller::run($v, $callback, $layer);
						if (!is_null($r)) {
							return $r;
						}
					});
					if (!is_null($r)) {
						return $r;
					}
				}

				return $r;
			});
			if (!is_null($r)) {
				return $r;
			}
			$r=null;
			return $r;
		});
		return $r;
	}
	public static function runAddKeys($name)
	{
		$store = &self::store();
		$store['run']['keys'][$name] = true;
	}
	public static function runAddList($name)
	{
		$store = &self::store();
		$store['run']['list'][$name] = true;
	}

	public static function isWork($layer)
	{
		//val для отладки, делает метку что слой в работе
		$cache = &self::storeLayer($layer);//work
		return $cache['counter'] && $cache['counter'] == static::$counter;//Если слой в работе метки будут одинаковые
	}
	public static function isParent(&$layer, &$parent)
	{
		while ($layer) {
			if (Each::isEqual($parent, $layer)) {
				return true;
			}
			$layer = &$layer['parent'];
		}

		return false;
	}
	public static function isSaveBranch(&$layer, $val = null)
	{
		$cache = &self::storeLayer($layer);
		if (!is_null($val)) {
			$cache['is_save_branch'] = $val;
		}

		return @$cache['is_save_branch'];
	}
	public static function init($layer)
	{
		Infra::init();
		Crumb::init();
		Path::req('*controller/make.php');
		infra_admin_modified();//Здесь уже выход если у браузера сохранена версия
		@header('Infrajs-Cache: true');//Афигенный кэш, когда используется infrajs не подгружается даже
		$query=Path::toutf($_SERVER['QUERY_STRING']);
		$args=array($layer, $query);
		$html = Access::adminCache('index.php', function ($layer, $query) {
			@header('Infrajs-Cache: false');//Афигенный кэш, когда используется infrajs не подгружается даже
			$strlayer=json_encode($layer);
			
			$conf = Infra::config('controller');
			
			if ($conf['server']) {

				Controller::check($layer);//В infra_html были добавленыs все указаные в layers слои
			}
			$html = View::html();

			if ($conf['client']) {
				$script = <<<END
\n<script type="text/javascript">
	require([
		'?*once/once.js', 
		'?*infra/js.php',
		'?*controller/initjs.php',
		'?*jquery/jquery.min.js'
	], function (once, infra, infrajs) {

		infrajs.checkAdd(infra.conf.controller.index);

		infra.handle(infra.Crumb, 'onchange', function(){
			infrajs.check();
		});

		require(['vendor/twbs/bootstrap/dist/js/bootstrap.min.js']);
	});
</script>
END;
				$html = str_replace('</body>', "\n\t".$script.'</body>', $html);
			}

			return $html;
		}, $args);//Если не кэшировать то будет reparse

		//@header('HTTP/1.1 200 Ok'); Приводит к появлению странных 4х символов в начале страницы guard-service
		echo $html;
	}
}
