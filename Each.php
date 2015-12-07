<?php

namespace infrajs\controller;

class Each {
	public static function &forr(&$el, $callback, $back = false) 
	{
		//Бежим по индекснему массиву
		$r = null;//Notice без этого генерируется Only variable references should be returned by reference
		if (!is_array($el)) return $r;

		if ($back) {
			for ($i = sizeof($el) - 1;$i >= 0;--$i) {
				if (is_null($el[$i])) {
					continue;
				}
				$r = &$callback($el[$i], $i, $el); //3тий аргумент $el depricated
				if (is_null($r)) continue;
				if ($r instanceof infra_Fix) {
					if ($r->opt['del']) {
						array_splice($el, $i, 1);
					}

					if (!is_null($r->opt['ret'])) {
						return $r->opt['ret'];
					}
				} else {
					return $r;
				}
			}
		} else {
			for ($i = 0, $l = sizeof($el); $i < $l; ++$i) {
				if (is_null($el[$i])) continue;
				
				$r = &$callback($el[$i], $i, $el);
				if (is_null($r)) continue;
				if ($r instanceof infra_Fix) {
					if ($r->opt['del']) {
						array_splice($el, $i, 1);
						--$l;
						--$i;
					}
					if (!is_null($r->opt['ret'])) {
						return $r->opt['ret'];
					}
				} else {
					return $r;
				}
			}
		}

		return $r;
	}
	public static function &fora(&$el, $callback, $back = false, &$_group = null, $_key = null)
	{
		//Бежим по массиву рекурсивно
		if (Each::isAssoc($el) === false) {
			return Each::forr($el, function &(&$v, $i) use (&$el, $callback, $back) {
				return Each::fora($v, $callback, $back, $el, $i);
			}, $back);
		} elseif (!is_null($el)) {
			//Если undefined callback не вызывается, Таким образом можно безжать по переменной не проверя определена она или нет.
			return $callback($el, $_key, $_group);
			//return infra_forcall($callback,$nar,$el,$_key,$_group);
		} else {
			return $el;
		}
	}
	public static function isInt($id)
	{
		if ($id === '') {
			return false;
		}
		if (!$id) {
			$id = 0;
		}
		$idi = (int) $id;
		$idi = (string) $idi; //12 = '12 asdf' а если и то и то строка '12'!='12 asdf'
		return $id == $idi;
	}
	public static function isEqual(&$a, &$b)
	{
		//являются ли две переменные ссылкой друг на друга иначе array()===array() а слои то разные
		if (is_object($a)) {
			if (!is_object($b)) {
				return false;
			}
			$a->____test____ = true;
			if ($b->____test____) {
				unset($a->____test____);

				return true;
			}
			unset($a->____test____);

			return false;
		}
		$t = $a;//Делаем копию со ссылки
		if ($r = ($b === ($a = 1))) {
			$r = ($b === ($a = 0));
		}//Приравниваем а 1 потом 0 и если b изменяется следом значит это одинаковые ссылки.
		$a = $t;//Возвращаем ссылке прежнее значение
		return $r;
	}
	public static function isAssoc(&$array)
	{
		//(c) Kohana http://habrahabr.ru/qa/7689/
		if (!is_array($array)) {
			return;
		}
		$keys = array_keys($array);

		return array_keys($keys) !== $keys;
	}
	public static function &foro(&$obj, $callback, $back = false)
	{
		//Бежим по объекту
		if (is_array($back)) {
			$nar = $back;
			$back = false;
		}
		$r = null;
		if (Each::isAssoc($obj) !== true) {
			return $r;
		}//Только ассоциативные массивы

		$ar = array();
		foreach ($obj as $key => &$val) {
			$ar[] = array('key' => $key,'val' => &$val);
		}

		return Each::forr($ar, function &(&$el) use ($callback, &$obj) {
			if (is_null($el['val'])) {
				return $el['val'];
			}
			$r = &$callback($el['val'], $el['key'], $obj);
			if (is_null($r)) {
				return $r;
			}
			if ($r instanceof infra_Fix) {
				if ($r->opt['del']) {
					unset($obj[$el['key']]);
				}
				if (!is_null($r->opt['ret'])) {
					return $r->opt['ret'];
				}
			} else {
				return $r;
			}
		}, $back);
	}

	public static function &forx(&$obj, $callback, $back = false)
	{
		//Бежим сначало по объекту а потом по его свойствам как по массивам
		return Each::foro($obj, function &(&$v, $key) use (&$obj, $callback, $back) {
			return Each::fora($v, function &(&$el, $i, &$group) use ($callback, $key) {
				$r = &$callback($el, $key, $group, $i);

				return $r;
			}, $back);
		}, $back);
	}

}
class infra_Fix
{
	public function __construct($opt, $ret = null)
	{
		if (is_string($opt)) {
			if ($opt == 'del') {
				$opt = array(
					'del' => true,
					'ret' => $ret,
				);
			}
		}
		$this->opt = $opt;
	}
}