<?php
namespace infrajs\controller;
use infrajs\event\Event;


Event::$classes['layer']=function($obj){
	if(!isset($obj['unick'])) return '';
	return $obj['unick'];
};


Event::handler('layer.oninit', function (&$layer) {
	$layer['store'] = array('counter' => Controller::$counter);
},'layer');
Event::handler('layer.oninit', function (&$layer) {
	while (@$layer['external'] && (!isset($layer['onlyclient']) || !$layer['onlyclient'])) {
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
	if (Controller::isSaveBranch($layer['parent'])) return;

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