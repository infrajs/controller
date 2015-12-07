<?php

//Свойство div
//div::layerindiv


/* Это нужно чтобы скрывать слой.. а на php слои не скрываются
$store=&Controller::store();
$store['divs']=array();
function layerindiv($div,&$layer=null){//Функция в любой момент говорит правду какой слой находится в каком диве
	$store=&Controller::store();
	if($layer)$store['divs'][$div]=&$layer;
	return $store['divs'][$div];
}
global $infra;
Event::listeng('layer.onshow',function(&$layer){
	if(!Controller::is('show',$layer))return;
	layerindiv($layer['div'],$layer);
});
*/

namespace infrajs\controller\ext;

use infrajs\controller\Controller;

class div
{
	public static function init()
	{
		Controller::runAddKeys('divs');
		external::add('divs', function (&$now, $ext) {//Если уже есть пропускаем
			if (!$now) {
				$now = array();
			}
			foreach ($ext as $i => $v) {
				if (isset($now[$i])) {
					continue;
				}
				$now[$i] = array();
				Each::fora($ext[$i], function (&$l) use (&$now, $i) {
					array_push($now[$i], array('external' => $l));
				});
			}

			return $now;
		});
	}
	public static function divtpl(&$layer)
	{
		if (!isset($layer['divtpl'])) {
			return;
		}
		$layer['div'] = infra_template_parse(array($layer['divtpl']), $layer);
	}
	public static function divcheck(&$layer)
	{

		$start = false;
		if (Controller::run(Controller::getWorkLayers(), function (&$l) use (&$layer, &$start) {//Пробежка не по слоям на ветке, а по всем слоям обрабатываемых после.. .то есть и на других ветках тоже
			if (!$start) {
				if (infra_isEqual($layer, $l)) {
					$start = true;
				}

				return;
			}
			if (@$l['div'] !== @$layer['div']) return; //ищим совпадение дивов впереди
			if (Controller::is('show', $l)) {

				Controller::isSaveBranch($layer, Controller::isParent($l, $layer));
				return true;//Слой который дальше показывается в томже диве найден
			}
		})) {

			return false;
		}
	}
}
