<?php
namespace infrajs\controller;
use infrajs\event\Event;
use infrajs\template\Template;
use infrajs\path\Path;
use infrajs\view\View;
use infrajs\each\Each;
use infrajs\load\Load;

use infrajs\infra\Infra;
use infrajs\sequence\Sequence;
use infrajs\controller\Tpl;

/**
 * У слоя созданы свойства
 * counter, parsed, unick, external, parsedtpl, onlyclient, parent, is_save_branch, onlyclient
 * 
 **/

Event::$classes['layer']=function($obj){
	if(!isset($obj['id'])) return '';
	return $obj['id'];
};
Event::handler('Infrajs.oninit', function () {
	Layer::parsedAdd('parsed');
	Layer::parsedAdd(function ($layer) {
		if (!isset($layer['parsedtpl'])) {
			return '';
		}
		return Template::parse(array($layer['parsedtpl']), $layer);
	});
});
Event::handler('Infrajs.oninit', function () {
	Template::$scope;
	$fn = function ($name, $value) {
		return Layer::find($name, $value);
	};
	Sequence::set(Template::$scope, Sequence::right('infrajs.find'), $fn);
	Sequence::set(Template::$scope, Sequence::right('infrajs.ids'), Layer::$ids);
});





Event::handler('layer.oninit', function (&$layer) {
	while (@$layer['external'] && !Layer::pop($layer, 'onlyclient')) {
		$ext = &$layer['external'];
		External::checkExt($layer, $ext);
	}
}, 'layer');
Event::handler('layer.oninit', function(&$layer) {
	if(empty($layer['name'])) return;
	Layer::$name[$layer['name']] = &$layer;
}, 'name');

Event::handler('layer.isshow', function (&$layer) {
	if (!Event::fire('layer.ischeck', $layer)) return false;
}, 'layer');
Event::handler('layer.isshow', function (&$layer) {
	//Родитель скрывает ребёнка если у родителя нет опции что ветка остаётся целой
	if (empty($layer['parent'])) return;

	if (Event::fire('layer.isshow', $layer['parent'])) return;
	//Какой-то родитель таки не показывается, например пустой слой, теперь нужно узнать скрывает родитель свою ветку или нет
	if (!empty($layer['parent']['is_save_branch'])) return;

	return false;
}, 'layer');


//Свойство counter есть на клиенте
Event::handler('layer.oncheck', function (&$layer) {
	$layer['counter'] = 0;

}, 'layer');
Event::handler('layer.onshow', function (&$layer) {
	$layer['counter']++;
}, 'layer');

/**
 * div, divs, divtpl
 *
 **/
Event::handler('Infrajs.oninit', function () {
	Run::runAddKeys('divs');
	
	External::add('divs', function (&$now, $ext) {//Если уже есть пропускаем
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

});
Event::handler('layer.oncheck', function (&$layer) {
	//В onchange слоя может не быть див// Это нужно чтобы в external мог быть определён div перед тем как наследовать div от родителя
	if (@!$layer['div'] && @$layer['parent']) {
		$layer['div'] = $layer['parent']['div'];
	}
	
}, 'div');

Event::handler('layer.oncheck', function (&$layer) {
	//Без этого не показывается окно cо стилями.. только его заголовок..
	Each::forx($layer['divs'], function (&$l, $div) {
		if (@!$l['div']) {
			$l['div'] = $div;
		}
	});

}, 'div');


Event::handler('layer.oncheck', function (&$layer) {
	if (!isset($layer['divtpl'])) return;
	$layer['div'] = Template::parse(array($layer['divtpl']), $layer);
}, 'div');

Event::handler('layer.isshow', function (&$layer) {
	//Если не указан див и указан родитель, не показываем ничего
	if (empty($layer['div'])) {
		//$layer['is_save_branch'] = true;
		return; //Отсутсвие дива не запрещает показ	
	} 

	//Такой слой игнорируется, события onshow не будет, но обработка пройдёт дальше у других дивов
	$start = false;
	if (Run::exec(Controller::$layers, function (&$l) use (&$layer, &$start) {//Пробежка не по слоям на ветке, а по всем слоям обрабатываемых после.. .то есть и на других ветках тоже
		if (!$start) {
			if (Each::isEqual($layer, $l)) {
				$start = true;
			}

			return;
		}
		if (@$l['div'] !== @$layer['div']) return; //ищим совпадение дивов впереди
		if (Event::fire('layer.isshow', $l)) {
			$layer['is_save_branch'] = Layer::isParent($l, $layer);
			return true;//Слой который дальше показывается в томже диве найден
		}
	})) {
		return false;
	}
}, 'div');



/**
 * У слоя созданы свойства
 * tpl, json, dataroot, tplroot, data, tplcheck, datacheck
 **/
Layer::parsedAdd('tpl');
Layer::parsedAdd('json');
Layer::parsedAdd('dataroot');
Layer::parsedAdd('tplroot');


Event::handler('layer.oncheck', function (&$layer) {
	Tpl::tplroottpl($layer);
	Tpl::dataroottpl($layer);
	Tpl::tpltpl($layer);
	Tpl::jsontpl($layer);
}, 'tpl:div');



Event::handler('layer.isshow', function (&$layer) {
	//tpl
	if (!empty($layer['tpl'])) return;
	$r = true;
	if (!empty($layer['parent'])) {//Пустой слой не должен обрывать наследования если какой=то родитель скрывает всю ветку		
		$r = $layer['parent']['is_save_branch'];
		if (is_null($r)) $r = true;
	}
	$layer['is_save_branch'] = $r;
	return false;
}, 'tpl:div');




Event::handler('layer.onshow', function (&$layer) {
	if (Layer::pop($layer, 'onlyclient')) return;
	$layer['html'] = Tpl::getHtml($layer);
}, 'tpl:div');

Event::handler('layer.onshow', function (&$layer) {
	//tpl
	
	if (Layer::pop($layer, 'onlyclient')) return;
	if(!empty($layer['div'])){
		$div = $layer['div'];
	}else{
		$div = null;
	}
	$r = View::html($layer['html'], $div);
	if (!$r && (!isset($layer['divcheck']) || !$layer['divcheck'])) {
		echo 'Не найден div '.$layer['div'].' infra_html<br>';
	}
	unset($layer['html']);//нефиг в памяти весеть
}, 'tpl:div');




Run::runAddList('layers');

Layer::parsedAdd('is');

Event::handler('layer.isshow', function (&$layer) {
	$prop = 'is';
	$proptpl = $prop.'tpl';
	if (isset($layer[$proptpl])) {
		$p = $layer[$proptpl];
		$p = Template::parse(array($p), $layer);
		$layer[$prop] = $p;	
	}
	
	if (!isset($layer['is']) || is_null($layer['is'])) {
		$is = true;
	} else {
		$is = $layer['is'];
	}
	if ($is == '0') {
		$is = false;
	}//В шаблоне false не удаётся вернуть
	return $is;
}, 'is:div');


Event::handler('layer.isshow', function (&$layer) {
	//tpl depricated
	if (is_string(@$layer['tpl']) && @$layer['tplcheck']) {
		//Мы не можем делать проверку пока другой плагин не подменит tpl
		$res = Load::loadTEXT($layer['tpl']);
		if (!$res) {
			return false;
		}
	}
}, 'tplcheck:is');
Event::handler('layer.isshow', function (&$layer) {
	//tpl depricated
	if (Layer::pop($layer, 'onlyclient')) return;
	return Tpl::jsoncheck($layer);
}, 'jsoncheck:is');
	