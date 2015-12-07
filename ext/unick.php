<?php

namespace infrajs\controller\ext;

//unick:(number),//Уникальное обозначение слоя
//Нужно для уникальной идентификации какого-то слоя. Для хранения данных слоя в глобальной области при генерации слоя на сервере и его отсутствия на клиенте. Slide
use infrajs\controller\Controller;

class unick
{
	public static $counter = 1;
	public static function init()
	{
		global $infra,$infrajs;
		Event::waitg('oninit', function () {
			//session и template
			global $infra_template_scope;
			$fn = function ($name, $value) {
				return unick::find($name, $value);
			};
			Sequence::set($infra_template_scope, Sequence::right('infrajs.find'), $fn);

Sequence::set($infra_template_scope, Sequence::right('infrajs.unicks'), unick::$unicks);
		});
	}
	public static $unicks = array();
	public static function check(&$layer)
	{
		if (@!$layer['unick']) {
			$layer['unick'] = self::$counter++;
		}
		self::$unicks[$layer['unick']] = &$layer;
	}
	public static function &find($name, $value)
	{
		$layers = Controller::getAllLayers();
		$right = Sequence::right($name);

		return Controller::run($layers, function &(&$layer) use ($right, $value) {
			if (Sequence::get($layer, $right) == $value) {
				return $layer;
			}
			$r = null;

			return $r;
		});
	}
}
