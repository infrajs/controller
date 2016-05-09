<?php
namespace infrajs\controller;
use infrajs\each\Each;
class Run {
	/**
	 * Пробежка по слоям
	 **/
	public static $props=array('keys' => array(),'list' => array());
	public static function &exec(&$layers, $callback, &$parent = null)
	{
		$props = &static::$props;
		
		$r = &Each::exec($layers, function &(&$layer) use (&$parent, $callback, $props) {
			$r = &$callback($layer, $parent);
			if (!is_null($r)) return $r;
			$r = &Each::foro($layer, function &(&$val, $name) use (&$layer, $callback, $props) {
				$r = null;
				if (isset($props['list'][$name])) {
					$r = &Run::exec($val, $callback, $layer);
					if (!is_null($r)) return $r;
				} else if (isset($props['keys'][$name])) {
					$r = &Each::foro($val, function &(&$v, $i) use (&$layer, $callback) {
						return Run::exec($v, $callback, $layer);
					});
					if (!is_null($r)) return $r;
				}

				return $r;
			});
			return $r;
		});
		return $r;
	}
	public static function runAddKeys($name)
	{
		static::$props['keys'][$name] = true;
	}
	public static function runAddList($name)
	{
		static::$props['list'][$name] = true;
	}
}