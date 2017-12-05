<?php
namespace infrajs\controller;
use infrajs\each\Each;
use infrajs\load\Load;
use infrajs\view\View;
/**
 * Свойство layer.external
 **/
class External {
	public static $props;
	public static function add($name, $func)
	{
		static::$props[$name] = $func;
	}
	public static function merge(&$layer, &$external, $i)
	{
		//Используется в configinherit
		if (Each::isEqual($external[$i], $layer[$i])) {//Иначе null равено null но null свойство есть и null свойства нет разные вещи
		} elseif (isset(static::$props[$i])) {
			$func = static::$props[$i];
			while (is_string($func)) {
				//Указана не сама обработка а свойство с такойже обработкой
				$func = static::$props[$func];
			}
			$layer[$i] = call_user_func_array($func, array(&$layer[$i], &$external[$i], &$layer, &$external, $i));
		} else {
			if (is_null($layer[$i])) {
				$layer[$i] = $external[$i];
			}
		}
	}
	public static function checkExt(&$layer, &$external)
	{
		if (!$external) return;
		unset($layer['external']);

		Each::fora($external, function &(&$exter) use (&$layer) {

			if (is_string($exter)) {
				$external = &Load::loadJSON($exter);
			} else {
				$external = $exter;
			}

			if ($external) {
				foreach ($external as $i => $v) {
					external::merge($layer, $external, $i);
				}
			}
			
			$r = null;
			return $r;
		});
	}
}
/**
 * В массиве $props указаны функции объединения разных свойство слоя. 
 * Обработчику передаётся текущее описание слоя и новое значение.
 **/
External::$props = array(
	'div' => function (&$now, &$ext) {
		return $ext;
	},
	'layers' => function (&$now, &$ext) {
		if (!$now) {
			$now = array();
		} elseif (Each::isAssoc($now) !== false) {
			$now = array($now);
		}

		Each::fora($ext, function &($j) use (&$now) {
			//array_unshift($now,array('external'=>&$ext));
			array_push($now, array('external' => &$j));
			$r=null; return $r;
		});

		return $now;
	},
	'external' => function (&$now, &$ext) {//Используется в global.js, css
		if (!$now) {
			$now = array();
		} elseif (Each::isAssoc($now) !== false) {
			$now = array(&$now);
		}
		array_push($now, $ext);

		return $now;
	},
	'config' => function (&$now, &$ext, &$layer) {//object|string any
		if (Each::isAssoc($ext) === true) {
			if (!$now) $now = array();
			foreach ($ext as $j => $v) {
				if (isset($now[$j]) && !is_null($now[$j])) continue;
				$now[$j] = &$ext[$j];
			}
		} else {
			if (is_null($now)) $now = &$ext;
		}

		return $now;
	}
);
