<?php
namespace infrajs\controller;
use infrajs\event\Event;
use infrajs\template\Template;
use infrajs\view\View;
use infrajs\each\Each;
use infrajs\load\Load;

use infrajs\infra\Infra;
use infrajs\sequence\Sequence;
use infrajs\controller\Tpl;

use infrajs\controller\External;

/**
 * У слоя созданы свойства
 * counter, parsed, unick, external, parsedtpl, onlyclient, parent, is_save_branch, onlyclient
 * 
 **/
Event::$classes['Layer'] = function (&$obj) {
	return Layer::setId($obj);
};

Event::handler('Controller.oninit', function &() {
	$r = null;
	Layer::parsedAdd('parsed');
	Layer::parsedAdd(function ($layer) {
		if (!isset($layer['parsedtpl'])) {
			return '';
		}
		return Template::parse(array($layer['parsedtpl']), $layer);
	});
	return $r;
});

Event::handler('Layer.oninit', function &(&$layer) {
	$r = null;
	while (!empty($layer['external']) && !Layer::pop($layer, 'onlyclient')) {
		$ext = &$layer['external'];
		External::checkExt($layer, $ext);
	}
	//Layer::setId($layer);//layer.name добавим в архив
	return $r;
}, 'layer');


Event::handler('Layer.isshow', function (&$layer) {
	$r = null;
	if (!Event::fire('Layer.ischeck', $layer)) return false;
	return $r;
}, 'layer');

Event::handler('Layer.isshow', function (&$layer) {
	//Родитель скрывает ребёнка если у родителя нет опции что ветка остаётся целой
	if (empty($layer['parent'])) return;
	if (Event::fire('Layer.isshow', $layer['parent'])) return;
	//Какой-то родитель таки не показывается, например пустой слой, теперь нужно узнать скрывает родитель свою ветку или нет
	if (!empty($layer['parent']['is_save_branch'])) return;
	return false;
}, 'layer');

Event::handler('Layer.isshow', function (&$layer) {
	if (empty($layer['tpl'])) {
		$layer['is_save_branch'] = true;
		return false;
	}
}, 'layer');

//Свойство counter есть на клиенте
Event::handler('Layer.oncheck', function (&$layer) {
	$layer['counter'] = 0;

}, 'layer');
Event::handler('Layer.onshow', function (&$layer) {
	$layer['counter']++;
}, 'layer');

/**
 * div, divs, divtpl
 *
 **/
Run::runAddKeys('divs');
Event::handler('Layer.oncheck', function (&$layer) {
	//В onchange слоя может не быть див// Это нужно чтобы в external мог быть определён div перед тем как наследовать div от родителя
	$r = null;
	if (empty($layer['parent'])) return $r;
	if (isset($layer['div'])) return $r;
	if (empty($layer['parent']['div'])) return $r;
	
	$layer['div'] = $layer['parent']['div'];
	return $r;
}, 'div');

Event::handler('Layer.oncheck', function (&$layer) {
	$r = null;
	if (empty($layer['divs'])) return $r; 
	foreach ($layer['divs'] as $key => &$v) { //Без этого не показывается окно cо стилями.. только его заголовок..
		Each::exec($v, function &(&$l) use ($key) {
			$r = null;
			if (empty($l['div'])) $l['div'] = $key;
			return $r;
		});	
	}
	return $r;
}, 'div');

Event::handler('Layer.oncheck', function (&$layer) {
	if (!isset($layer['divtpl'])) return;
	$layer['div'] = Template::parse(array($layer['divtpl']), $layer);
}, 'div');
/*
if ($layer['debug']) {
	unset($layer['crumb']);
	unset($layer['parent']);
	unset($layer['divs']);
	echo '<pre>';
	print_r($layer);
	exit;
}
Event::handler('Layer.isshow', function (&$layer) {
	if (empty($layer['tpl'])) {
		echo 1;
		$layer['is_save_branch'] = true;
		return false;
	}
}, 'layer');
*/

Event::handler('Layer.isshow', function (&$layer) {
	//Если не указан див и указан родитель, не показываем ничего
	//Отсутсвие дива не запрещает показ	
	//Такой слой игнорируется, события onshow не будет, но обработка пройдёт дальше у других дивов
	if (empty($layer['div'])) return;
	
	$start = false;
	if ($master = Run::exec(Controller::$layers, function &(&$l) use (&$layer, &$start) {//Пробежка не по слоям на ветке, а по всем слоям обрабатываемых после.. .то есть и на других ветках тоже
		$r = null;
		if (!$start) {
			if (Each::isEqual($layer, $l)) $start = true;
			return $r;
		}
		if (empty($l['div'])) return $r;
		if (empty($l['tpl'])) return $r;
		if ($l['div'] !== $layer['div']) return $r; //ищим совпадение дивов впереди

		if (Event::fire('Layer.isshow', $l)) {
			$layer['is_save_branch'] = Layer::isParent($l, $layer);
			return $l;//Слой который дальше показывается в этом же диве найден
		}
		return $r;
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
Layer::parsedAdd('id');


Event::handler('Layer.oncheck', function (&$layer) {
	Tpl::tplroottpl($layer);
	Tpl::dataroottpl($layer);
	Tpl::tpltpl($layer);
}, 'tpl:div');
Event::handler('Layer.onshow', function (&$layer) {
	Tpl::jsontpl($layer);
},'Layer');




Event::handler('Layer.isshow', function (&$layer) {
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




Event::handler('Layer.onshow', function (&$layer) {
	if (Layer::pop($layer, 'onlyclient')) return;
	$layer['html'] = Tpl::getHtml($layer);
}, 'tpl:div');

Event::handler('Layer.onshow', function (&$layer) {
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

Event::handler('Layer.isshow', function (&$layer) {
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

Event::handler('Layer.isshow', function (&$layer) {
	//tpl depricated
	if (isset($layer['tpl']) && is_string($layer['tpl']) && !empty($layer['tplcheck'])) {
		//Мы не можем делать проверку пока другой плагин не подменит tpl
		$res = Load::loadTEXT($layer['tpl']);
		if (!$res) return false;
	}
}, 'tplcheck:is');
Event::handler('Layer.isshow', function (&$layer) {
	//tpl depricated
	if (Layer::pop($layer, 'onlyclient')) return;
	return Tpl::jsoncheck($layer);
}, 'jsoncheck:is');



Run::runAddKeys('childs');
Run::runAddList('child');
	
External::add('child', 'layers');
External::add('crumb', function (&$now, &$ext, &$layer, &$external, $i) {//проверка external в onchange
	Crumb::set($layer, 'crumb', $ext);
	return $layer[$i];
});


Event::handler('Layer.oninit', function (&$layer) {
	//это из-за child// всё что после child начинает плыть. по этому надо crumb каждый раз определять, брать от родителя.
	if (!isset($layer['dyn'])) {
		//Делается только один раз
		Crumb::set($layer, 'crumb', $layer['crumb']);
	}
	if (empty($layer['parent'])) return;
	Crumb::set($layer, 'crumb', $layer['dyn']['crumb']);//Возможно у родителей обновился crumb из-за child у детей тоже должен обновиться хотя они не в child
}, 'crumb');

Event::handler('Layer.oninit', function (&$layer) {	
	if (empty($layer['child'])) return;//Это услвие после Crumb::set
	$crumb = &$layer['crumb']->child;
	if ($crumb) {
		$name = $crumb->name;
	} else {
		$name = '###child###';
	}
	Each::fora($layer['child'], function &(&$l) use (&$name) {
		$r = null;
		Crumb::set($l, 'crumb', $name);
		return $r;
	});
}, 'crumb');

Event::handler('Layer.oninit', function (&$layer) {
	if (empty($layer['childs'])) return;
	foreach ($layer['childs'] as $key => &$v) {
		Each::exec($v, function &(&$l) use ($key) {
			$r = null;
			if (!empty($l['crumb'])) return $r;
			Crumb::set($l, 'crumb', $key);
			return $r;
		});	
	}
}, 'crumb');

Event::handler('Layer.ischeck', function ($layer){
	if (empty($layer['parent'])) return;
	if (!Event::fire('Layer.ischeck', $layer['parent'])) return false;
}, 'layer');

Event::handler('Layer.ischeck', function (&$layer) {
	if (!$layer['crumb']->is) return false;
}, 'crumb');

Crumb::init();

Event::one('Controller.oninit', function &() {
	$r = null;

	Template::$scope;

	Sequence::set(Template::$scope, Sequence::right('infrajs.ids'), Controller::$ids);
	Sequence::set(Template::$scope, Sequence::right('infrajs.names'), Controller::$names);

	Sequence::set(Template::$scope, Sequence::right('Controller.ids'), Controller::$ids);
	Sequence::set(Template::$scope, Sequence::right('Controller.names'), Controller::$names);

	
	
	return $r;

}, 'Controller');

Event::handler('Controller.oninit', function &() {
	$r = null;
	$root = Crumb::getInstance();
	Sequence::set(Template::$scope, Sequence::right('infra.Crumb.params'), Crumb::$params);
	Sequence::set(Template::$scope, Sequence::right('infra.Crumb.get'), Crumb::$get);
	//Sequence::set(Template::$scope, Sequence::right('infra.Crumb.query'), Crumb::$query);

	Sequence::set(Template::$scope, Sequence::right('Crumb.params'), Crumb::$params);
	Sequence::set(Template::$scope, Sequence::right('Crumb.get'), Crumb::$get);
	//Sequence::set(Template::$scope, Sequence::right('Crumb.query'), Crumb::$query);
	return $r;
}, 'Controller');