<?php

namespace infrajs\controller;
use infrajs\infra\Infra;
use infrajs\event\Event;
use infrajs\view\View;

//require_once __DIR__.'/../infra/Infra.php';

/*//




Event::fire('layer.is|on show|check|init',layer);

Controller::check(layer);

*/
class Controller
{
	public static $layers;
	public static function check(&$layers)
	{
		static::$layers=&$layers;
		//Пробежка по слоям

		Event::fire('oninit');//сборка событий

		Run::exec(static::$layers, function (&$layer, &$parent) {
			//Запускается у всех слоёв в работе
			if ($parent) $layer['parent'] = &$parent;
			Layer::setId($layer);
			Event::fire('layer.oninit', $layer);
			if (!Event::fire('layer.ischeck', $layer)) return;
			Event::fire('layer.oncheck', $layer);
		});//разрыв нужен для того чтобы можно было наперёд определить показывается слой или нет. oncheck у всех. а потом по порядку.

		Event::fire('oncheck');//момент когда доступны слои по getUnickLayer

		Run::exec(static::$layers, function (&$layer) {
			//С чего вдруг oncheck у всех слоёв.. надо только у активных
			if (Event::fire('layer.isshow', $layer)) {
				//Событие в котором вставляется html
				Event::fire('layer.onshow', $layer);//при клике делается отметка в конфиге слоя и слой парсится... в oncheck будут подстановки tpl и isRest вернёт false
				//onchange показанный слой не реагирует на изменение адресной строки, нельзя привязывать динамику интерфейса к адресной строке, только черещ перепарсивание
			}
		});//у родительского слоя showed будет реальное а не старое


		Event::fire('onshow');
		//loader, setA, seo добавить в html, можно зациклить check
		$html=View::html();

		//View::html('',true);

		return $html; 
	}
	public static function init($layer)
	{
		Infra::init();
		Crumb::init();

		header('Infrajs-Cache: true');//Афигенный кэш, когда используется infrajs не подгружается даже
		$query=Path::toutf($_SERVER['QUERY_STRING']);
		$args=array($layer, $query);
		$html = Access::adminCache('index.php', function ($layer, $query) {
			header('Infrajs-Cache: false');//Афигенный кэш, когда используется infrajs не подгружается даже
			$strlayer=json_encode($layer);
			
			$conf = Infra::config('controller');
			
			if ($conf['server']) {

				Controller::check($layer);//В infra_html были добавленыs все указаные в layers слои
			}
			$html = View::html();

			if ($conf['client']) {
				$script = '<script>require("?*controller/init.js")</script>';
				$html = str_replace('</body>', "\n\t".$script.'</body>', $html);
			}
			return $html;
		}, $args);//Если не кэшировать то будет reparse

		//@header('HTTP/1.1 200 Ok'); Приводит к появлению странных 4х символов в начале страницы guard-service
		return $html;
	}
}
