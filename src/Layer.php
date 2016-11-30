<?php
namespace infrajs\controller;
use infrajs\each\Each;
use infrajs\sequence\Sequence;
/**
 * Функции для написания плагинов
 **/
class Layer {
	/**
	 * Находит в цепочке родителей значение указанного свойства.
	 * Используется для onlyclient, domready
	 **/
	public static function &pop($layer, $prop){
		$parent = $layer;
		$r = null;
		while ($parent) {
			if (isset($parent[$prop])) return $parent[$prop];
			if (!isset($parent['parent'])) break;
			$parent = $parent['parent'];
		}
		return $r;
	}
	/**
	 * Поиск слоя по значению свойства
	 **/
	public static function &find($name, $value)
	{
		$right = Sequence::right($name);
		return Run::exec(Controller::$layers, function &(&$layer) use ($right, $value) {
			if (Sequence::get($layer, $right) == $value) {
				return $layer;
			}
			$r = null;

			return $r;
		});
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
	/**
	 * Механизм id и быстрый доступ к слою
	 **/
	public static $start_id = 1;
	
	public static function setId(&$layer)
	{
		if (empty($layer['id'])) $layer['id'] = Layer::$start_id++;
		Controller::$ids[$layer['id']] = &$layer;
		if (!empty($layer['name'])) Controller::$names[$layer['name']] = &$layer;
		return $layer['id'];
	}
	/**
	 * Механизм определения уникальности html получаемого от слоя
	 **/
	public static $props = array();
	public static function parsed($layer)
	{
		//Функция возвращает строку характеризующую настройки слоя 
		$str = array();
		for ($i = 0, $l = sizeof(self::$props);$i < $l;++$i) {
			$call = self::$props[$i];
			$val = $call($layer);
			if (!is_null($val)) {
				$str[] = $val;
			}
		}

		return implode('|', $str);
	}
	public static function parsedAdd($fn)
	{
		if (is_string($fn)) {
			$func = function ($layer) use ($fn) {
				if (!isset($layer[$fn])) {
					return '';
				}

				return print_r($layer[$fn], true);
			};
		} else {
			$func = $fn;
		}
		self::$props[] = $func;
	}
}