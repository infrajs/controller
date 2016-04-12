<?php

namespace infrajs\controller;
use infrajs\infra\Infra;
use infrajs\event\Event;
use infrajs\access\Access;
use infrajs\load\Load;
use infrajs\view\View;
use infrajs\config\Config;
/*//
Event::fire('layer.is|on show|check|init',layer);
Controller::check(layer);
*/
class Controller
{
	public static $layers;
	public static $conf=array(
		"client" => true,
		"index" => array(
			"external" => "index.json"
		)
	);
	public static function init(){
		$query = urldecode($_SERVER['REQUEST_URI']);
		header('Infrajs-Cache: true');
		$html = Access::cache(__FILE__.':init', function ($query) {
			header('Infrajs-Cache: false');	
			Config::get();
			$conf = Config::get('controller');
			return Controller::check($conf['index']);
		}, array($query));
		echo $html;
		exit;
	}
	public static function check(&$layers)
	{
		static::$layers=&$layers;
		//Пробежка по слоям
		Event::tik('Infrajs');
		Event::tik('layer');
		Event::fire('Infrajs.oninit');//сборка событий

		Run::exec(static::$layers, function (&$layer, &$parent) {
			//Запускается у всех слоёв в работе
			if ($parent) $layer['parent'] = &$parent;
			Layer::setId($layer);//Иначе у layer нет ID а должен быть
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
		Event::fire('Infrajs.onshow');
		//loader, setA, seo добавить в html, можно зациклить check
		$html=View::html();

		//View::html('',true);

		return $html; 
	}
}
