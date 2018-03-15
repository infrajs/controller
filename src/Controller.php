<?php

namespace infrajs\controller;
use infrajs\infra\Infra;
use infrajs\event\Event;
use infrajs\access\Access;
use infrajs\load\Load;
use infrajs\view\View;
use akiyatkin\boo\MemCache;
use infrajs\config\Config;
/*//
Event::fire('Layer.is|on show|check|init',layer);
Controller::check(layer);
*/
class Controller
{
	public static $ids = array();
	public static $names = array();
	public static $layers;
	public static $conf=array(
		"client" => true,
		"index" => array(
			"external" => "index.json"
		)
	);
	/*public static function init(){
		$query = urldecode($_SERVER['REQUEST_URI']);
		header('Infrajs-Cache: true');
		$html = Access::cache(__FILE__.':init', function ($query) {
			header('Infrajs-Cache: false');	
			Config::get(); //Нужно собрать все расширения, чтобы выполнились все подписки
			$conf = Config::get('controller');
			return Controller::check($conf['index']);
		}, array($query));
		echo $html;
		exit;
	}*/
	public static $parsed = '';
	public static function init(){
		$conf = Config::get('controller');

		header('Controller-Cache: true');
		Controller::$parsed = '';
		Event::tik('Controller.parsed');
		Event::fire('Controller.parsed');
		//$crumb = Crumb::getInstance();
		$query = urldecode($_SERVER['REQUEST_URI']);
		$html = MemCache::func( function ($parsed) use ($conf) {
			header('Controller-Cache: false'); 
			
			$html = Controller::check($conf['index']);
			return $html;
		}, [Controller::$parsed,$query]);
		//}, [Controller::$parsed,$crumb->value, Crumb::$get], ['infrajs\\access\Access','adminTime'] );
		
		echo $html;
		return !!$html;
		/*$conf = Config::get('controller');
		
		$crumb = Crumb::getInstance();
		if ($crumb->value) {
			header('Controller-Cache: false');
			$html = Controller::check($conf['index']);
		} else { //Исключение для главной. Полный кэш
			header('Controller-Cache: true');
			
			Controller::$parsed = '';
			Event::tik('Controller.parsed');
			Event::fire('Controller.parsed');

			$html = Access::cache(__FILE__.Controller::$parsed, function () use ($conf) {
				header('Controller-Cache: false');
				$html = Controller::check($conf['index']);
				return $html;
			});
		}

		echo $html;
		return !!$html;*/
	}
	public static function check(&$layers)
	{
		static::$layers = &$layers;
		//Пробежка по слоям

		Event::tik('Controller');
		Event::tik('Layer');
		Event::fire('Controller.oninit');//сборка событий
		
		Run::exec(static::$layers, function &(&$layer, &$parent) {
			//Запускается у всех слоёв в работе
			$r = null;
			if ($parent) $layer['parent'] = &$parent;
			Event::fire('Layer.oninit', $layer);
			
			if (!Event::fire('Layer.ischeck', $layer)) return $r;
			
			Event::fire('Layer.oncheck', $layer);
			return $r;

		});//разрыв нужен для того чтобы можно было наперёд определить показывается слой или нет. oncheck у всех. а потом по порядку.

		//Event::fire('Controller.oncheck');//момент когда доступны слои по getUnickLayer

		Run::exec(static::$layers, function &(&$layer) {
			//С чего вдруг oncheck у всех слоёв.. надо только у активных
			$r = null;
			if (Event::fire('Layer.isshow', $layer)) {
				//Событие в котором вставляется html
				Event::fire('Layer.onshow', $layer);//при клике делается отметка в конфиге слоя и слой парсится... в oncheck будут подстановки tpl и isRest вернёт false
				//onchange показанный слой не реагирует на изменение адресной строки, нельзя привязывать динамику интерфейса к адресной строке, только черещ перепарсивание
			}
			return $r;
		});//у родительского слоя showed будет реальное а не старое
			
		Event::fire('Controller.onshow');

		//loader, setA, seo добавить в html, можно зациклить check

		$html = View::html();
		//View::html('',true);
		return $html; 
	}
}
