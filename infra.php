<?php
namespace infrajs\controller;
use infrajs\event\Event;
use infrajs\template\Template;
use infrajs\sequence\Sequence;

/**
 * У слоя созданы свойства
 * counter, parsed, unick, external, parsedtpl, onlyclient, parent, is_save_branch, onlyclient
 * 
 **/

Event::$classes['layer']=function($obj){
	if(!isset($obj['id'])) return '';
	return $obj['id'];
};

Event::handler('oninit', function () {
	Layer::parsedAdd('parsed');
	Layer::parsedAdd(function ($layer) {
		if (!isset($layer['parsedtpl'])) {
			return '';
		}
		return Template::parse(array($layer['parsedtpl']), $layer);
	});
});
Event::handler('oninit', function () {
	Template::$scope;
	$fn = function ($name, $value) {
		return Layer::find($name, $value);
	};
	Sequence::set(Template::$scope, Sequence::right('infrajs.find'), $fn);
	Sequence::set(Template::$scope, Sequence::right('infrajs.ids'), Layer::$ids);
});

Event::handler('layer.oninit', function (&$layer) {
	Layer::setId($layer);
}, 'layer');


Event::handler('layer.oninit', function (&$layer) {
	while (@$layer['external'] && !Layer::pop($layer, 'onlyclient')) {
		$ext = &$layer['external'];
		self::checkExt($layer, $ext);
	}
},'layer');
Event::handler('layer.isshow', function (&$layer) {
	if (!Event::fire('layer.ischeck', $layer)) return false;
},'layer');
Event::handler('layer.isshow', function (&$layer) {
	//Родитель скрывает ребёнка если у родителя нет опции что ветка остаётся целой
	if (@!$layer['parent']) return;

	if (Event::handler('layer.isshow', $layer['parent'])) return;

	//Какой-то родитель таки не показывается, например пустой слой, теперь нужно узнать скрывает родитель свою ветку или нет
	if (!empty($layer['parent']['is_save_branch'])) return;

	return false;
},'layer');
Event::handler('layer.oncheck', function (&$layer) {
	if (@!$layer['counter']) {
		$layer['counter'] = 0;
	}
},'layer');

Event::handler('layer.onshow', function (&$layer) {
	$layer['counter']++;
},'layer');

