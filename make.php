<?php

namespace infrajs\controller;
use infrajs\controller\ext;
use infrajs\event\Event;

//========================

/*if (!$infrajs) {
		$infrajs = array();
}*/
//========================
//infrajs oninit
//========================
//=======wait=====//
Event::waitg('oninit', function () {
	ext\subs::init();
	ext\layers::init();
	ext\unick::init();
	ext\env::init();
	ext\div::init();
	ext\config::init();
	ext\parsed::init();
});
//========================
//layer oninit
//========================

Event::listeng('layer.oninit.external', function (&$layer) {
	//config
	ext\config::configinherit($layer);
});
Event::listeng('layer.oninit.external', function (&$layer) {
	//infrajs
	$store = &Controller::store();
	$layer['store'] = array('counter' => $store['counter']);
});
Event::listeng('layer.oninit.external', function (&$layer) {
	//unick
	ext\unick::check($layer);
});


//========================
//layer is check
//========================




//========================
//layer oncheck
//========================

Event::listeng('layer.oncheck', function (&$layer) {
	//counter
	if (@!$layer['counter']) {
		$layer['counter'] = 0;
	}
});
Event::listeng('layer.oncheck', function (&$layer) {
	//В onchange слоя может не быть див// Это нужно чтобы в external мог быть определён div перед тем как наследовать div от родителя
	//div
	if (@!$layer['div'] && @$layer['parent']) {
		$layer['div'] = $layer['parent']['div'];
	}
});
Event::listeng('layer.oncheck', function (&$layer) {
	//Без этого не показывается окно cо стилями.. только его заголовок..
	//div
	Each::forx($layer['divs'], function (&$l, $div) {
		if (@!$l['div']) {
			$l['div'] = $div;
		}
	});
});

//Event::listeng('layer.oncheck', function (&$layer) {
	//autosave на сервере нет такого объекта у слоёв autosave и это не приводит к запрету кэширования
	//if(infrajs_tplonlyclient($layer))return;
	//infrajs_autosaveRestore($layer);
//});


/*Event::listeng('layer.oncheck', function (&$layer) {//Заменяем пустые слои иначе они считаются пустыми массивами в которых слоёв нет
	//subs
	if(@!$layer['subs'])return;
	Each::foro($layer['subs'], function (&$val){
		if(!$val||!is_array($val))$val=array('_'=>'notempty');
	});
});*/
Event::listeng('layer.oncheck', function (&$layer) {
	//external уже проверен
	//subs
	ext\subs::check($layer);
});

Event::listeng('layer.oncheck', function (&$layer) {
	//external уже проверен
	//config
	ext\config::configtpl($layer);
});

Event::listeng('layer.oncheck', function (&$layer) {
	//external то ещё не применился у вложенных слоёв, по этому используется свойство envtochild
	//env envs
	ext\env::checkinit($layer);
});
Event::listeng('layer.oncheck', function (&$layer) {
	//external то ещё не применился нельзя
	//env envtochild
	ext\env::envtochild($layer);

});
Event::listeng('layer.oncheck', function (&$layer) {
	//env envframe
	ext\env::envframe($layer);
});
Event::listeng('layer.oncheck', function (&$layer) {
	//env envframe
	ext\env::envframe2($layer);
});
Event::listeng('layer.oncheck', function (&$layer) {
	//external уже есть
	//env myenvtochild
	ext\env::envmytochild($layer);
});


Event::listeng('layer.oncheck', function (&$layer) {
	//div
	ext\div::divtpl($layer);

});

Event::listeng('layer.oncheck', function (&$layer) {
	//tpl
	ext\tpl::tplroottpl($layer);
	ext\tpl::dataroottpl($layer);
	ext\tpl::tpltpl($layer);
	ext\tpl::jsontpl($layer);
});



//========================
// infrajs oncheck
//========================

//========================
//layer is show
//========================
Controller::isAdd('show', function (&$layer) {
	//infrajs
	if (!Controller::is('check', $layer)) {
		return false;
	}
});
Controller::isAdd('show', function (&$layer) {
	//is
	ext\is::istpl($layer);

	return ext\is::check($layer);
});
Controller::isAdd('show', function (&$layer) {
	//tpl
	if (@$layer['tpl']) {
		return;
	}
	//Controller::isSaveBranch($layer,true);//Когда нет шаблона слой скрывается, но не скрывает свою ветку

	$r = true;
	if (!empty($layer['parent'])) {
		//Пустой слой не должен обрывать наследования если какой=то родитель скрывает всю ветку
		$r = Controller::isSaveBranch($layer['parent']);
		if (is_null($r)) {
			$r = true;
		}
	}
	Controller::isSaveBranch($layer, $r);

	return false;
});

Controller::isAdd('show', function (&$layer) {
	//Родитель скрывает ребёнка если у родителя нет опции что ветка остаётся целой
	//infrajs
	if (@!$layer['parent']) {
		return;
	}
	if (Controller::is('show', $layer['parent'])) {
		return;
	}

	if (Controller::isSaveBranch($layer['parent'])) {
		return;
	}//Какой-то родитель таки не показывается, например пустой слой, теперь нужно узнать скрывает родитель свою ветку или нет
	//echo $layer['tplroot'].':'.$layer['parent']['tplroot'].'<br>';

	return false;
});
Controller::isAdd('show', function (&$layer) {
	//div
	
	if (empty($layer['div'])&&!empty($layer['parent'])) return false;
	//Такой слой игнорируется, события onshow не будет, но обработка пройдёт дальше у других дивов
});
Controller::isAdd('show', function (&$layer) {
	//div
	return ext\div::divcheck($layer);
});


Controller::isAdd('show', function (&$layer) {
	//tpl depricated
	if (is_string(@$layer['tpl']) && @$layer['tplcheck']) {
		//Мы не можем делать проверку пока другой плагин не подменит tpl
		$res = Load::loadTEXT($layer['tpl']);
		if (!$res) {
			return false;
		}
	}
});
Controller::isAdd('show', function (&$layer) {
	//tpl depricated
	if (ext\tpl::onlyclient($layer)) {
		return;
	}

	return ext\tpl::jsoncheck($layer);
});

Controller::isAdd('show', function (&$layer) {
	//counter должно быть до getHtml
	++$layer['counter'];
});
Controller::isAdd('show', function (&$layer) {
	//env
	return ext\env::check($layer);
});
//Controller::isAdd('show', function (&$layer) {
	//tpl
	//if(@$layer['onlyclient'])return false;
//});
//========================
//layeext/
//====::init====================

Event::listeng('layer.onshow', function (&$layer) {
	//tpl
	if (ext\tpl::onlyclient($layer)) {
		return;
	}
	$layer['html'] = ext\tpl::getHtml($layer);
});
Event::listeng('layer.onshow', function (&$layer) {
	//css
	if (ext\tpl::onlyclient($layer)) {
		return;
	}
	ext\css::check($layer);
});
Event::listeng('layer.onshow', function (&$layer) {
	//tpl
	if (ext\tpl::onlyclient($layer)) {
		return;
	}

	$r = View::html($layer['html'], $layer['div']);
	if (!$r && (!isset($layer['divcheck']) || !$layer['divcheck'])) {
		echo 'Не найден div '.$layer['div'].' infra_html<br>';
	}
	unset($layer['html']);//нефиг в памяти весеть
});

Event::listeng('layer.onshow', function (&$layer) {
	//seojson
	if (ext\tpl::onlyclient($layer)) {
		return;
	}
	ext\seojson::check($layer);
});
//========================
//infrajs onshow
//========================