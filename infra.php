<?php
namespace infrajs\external;
use infrajs\event\Event;


Controller::isAdd('check', function (&$layer) {
	//может быть у любого слоя в том числе и у не iswork, и когда нет старого значения

	//infrajs это исключение
	if (!$layer) {
		return false;
	}//Может быть когда вернулись с check к родителю который ещё ниразу небыл в работе
	if (!Controller::isWork($layer)) {
		return false;
	} //Нет сохранённого результата, и слой не в работе, если работа началась с infrajs.check(layer) и у layer есть родитель, который не в работе
});