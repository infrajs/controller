<?php

//Свойство dyn, state, crumb
namespace infrajs\controller\ext;

use infrajs\controller\Controller;
use infrajs\event\Event;
use infrajs\sequence\Sequence;
use infrajs\template\Template;

class Crumb
{
	public static function init()
	{

		Event::waitg('oninit', function () {

			$root = \infrajs\crumb\Crumb::getInstance();
			
			Sequence::set(Template::$scope, Sequence::right('infra.Crumb.query'), $root->query);
			Sequence::set(Template::$scope, Sequence::right('infra.Crumb.params'), \infrajs\crumb\Crumb::$params);
			Sequence::set(Template::$scope, Sequence::right('infra.Crumb.get'), \infrajs\crumb\Crumb::$get);

			$cl = function ($mix = null) {
				return ext\Crumb::getInstance($mix);
			};
			Sequence::set(Template::$scope, Sequence::right('infra.Crumb.getInstance'), $cl);
			external::add('child', 'layers');
			external::add('childs', function (&$now, &$ext) {
				//Если уже есть значения этого свойства то дополняем
				if (!$now) {
					$now = array();
				}
				Event::forx($ext, function (&$n, $key) use (&$now) {
					if (@$now[$key]) {
						return;
					}
					//if(!now[key])now[key]=[];
					//else if(now[key].constructor!==Array)now[key]=[now[key]];
					//now[key].push({external:n});
					$now[$key] = array('external' => &$n);
				});

				return $now;
			});
			external::add('crumb', function (&$now, &$ext, &$layer, &$external, $i) {//проверка external в onchange
				\infrajs\crumb\Crumb::set($layer, 'crumb', $ext);

				return $layer[$i];
			});
			Controller::runAddKeys('childs');
			Controller::runAddList('child');

});
	}
	public static function set(&$layer, $name, &$value)
	{
		if (!isset($layer['dyn'])) {
			$layer['dyn'] = array();
		}
		$layer['dyn'][$name] = $value;
		if (isset($layer['parent'])) {
			$root = &$layer['parent'][$name];
		} else {
			$root = &ext\Crumb::getInstance();
		}
		if ($layer['dyn'][$name]) {
			$layer[$name] = &$root->getInst($layer['dyn'][$name]);
		} else {
			$layer[$name] = &$root;
		}
	}
}
