import { Crumb } from '/vendor/infrajs/controller/src/Crumb.js'
import { Event } from '/vendor/infrajs/event/Event.js'
import { Controller } from '/vendor/infrajs/controller/src/Controller.js'
import { External } from '/vendor/infrajs/controller/src/External.js'
import { Tpl } from '/vendor/infrajs/controller/src/Tpl.js'
import { Layer } from '/vendor/infrajs/controller/src/Layer.js'
import { Load } from '/vendor/infrajs/load/Load.js'
import { Access } from '/vendor/infrajs/access/Access.js'
import { View } from '/vendor/infrajs/view/View.js'
import { Parsed } from '/vendor/infrajs/controller/src/Parsed.js'
import { Seq } from '/vendor/infrajs/sequence/Seq.js'


Controller.runAddKeys('divs');

Controller.runAddList('layers');





Controller.runAddKeys('childs');
Controller.runAddList('child');

let setCrumb = function (layer, name, value) {
	if (!layer.dyn) layer.dyn = {};
	layer.dyn[name] = value;
	var root = layer.parent ? layer.parent[name] : Crumb.getInstance();//От родителя всегда сможем наследовать
	if (layer.dyn[name]) layer[name] = root.getInstance(layer.dyn[name]);
	else layer[name] = root;
}


External.add('child', 'layers');
External.add('crumb', function (now, ext, layer, external, i) {//проверка external в onchange
	setCrumb(layer, 'crumb', ext);
	return layer[i];
});


//tpl
Controller.store().divs = {};


Event.handler('Layer.oninit', function (layer) {
	//infrajs
	var store = Controller.store();
	layer['store'] = { 'counter': store['counter'] };
	delete layer.is_save_branch;
});
Event.handler('Layer.oninit', function (layer) {//это из-за child// всё что после child начинает плыть. по этому надо Crumb каждый раз определять, брать от родителя.
	//Crumb
	if (!layer['dyn']) {//Делается только один раз
		setCrumb(layer, 'crumb', layer['crumb']);
	}
}, 'crumb');
Event.handler('Layer.oninit', function (layer) {
	//Crumb
	if (!layer['parent']) return;//слой может быть в child с динамическим state только если есть родитель
	setCrumb(layer, 'crumb', layer['dyn']['crumb']);//Возможно у родителей обновился state из-за child у детей тоже должен обновиться хотя они не в child
}, 'crumb');
Event.handler('Layer.oninit', function (layer) {
	//Crumb child
	if (!layer['child']) return;//Это услвие после setCrumb

	var st = layer['crumb']['child'];
	if (st) var name = st['name'];
	else var name = '###child###';

	infra.fora(layer['child'], function (l) {
		setCrumb(l, 'crumb', name);
	});
}, 'crumb');
Event.handler('Layer.oninit', function (layer) {//Должно быть после external, чтобы все свойства у слоя появились
	//Crumb childs
	infra.forx(layer['childs'], function (l, key) {//У этого childs ещё не взять external
		if (!l['crumb']) l['crumb'] = setCrumb(l, 'crumb', key);
	});

}, 'crumb');

Event.handler('Layer.ischeck', function (layer) {
	//crumb
	if (!layer['crumb']['is']) return false;
}, 'crumb');
/* Event.handler('Layer.oninit', function (layer){
	//crumb link
	if(!layer['link']&&!layer['linktpl'])layer['linktpl']='{crumb}';
});*/

//========================
// layer is check
//========================
Event.handler('Layer.ischeck', function (layer) {
	if (!layer['parent']) return;

	if (!Controller.isWork(layer['parent'])) {
		if (!layer['parent'].showed) return false;
		return;
	}
	if (!Event.fire('Layer.ischeck', layer['parent'])) {
		return false;
	}
}, 'Layer');

Event.handler('Layer.ischeck', function (layer) {//может быть у любого слоя в том числе и у не iswork, и когда нет старого значения	
	if (!Controller.isWork(layer)) return false;//Нет сохранённого результата, и слой не в работе, если работа началась с Controller.check(layer) и у layer есть родитель
}, 'Layer');



Event.handler('Layer.ischeck', function (layer) {
	//tpl
	if (layer['onlyserver']) return false;
}, 'Layer');


//========================
// layer oncheck
//========================
Event.handler('Layer.oncheck', function (layer) {//Свойство counter должно быть до tpl чтобы counter прибавился а потом парсились
	//counter
	if (!layer.counter) layer.counter = 0;
}, 'layer');

Event.handler('Layer.oncheck', function (layer) {//В onchange слоя может не быть див// Это нужно чтобы в external мог быть определён div перед тем как наследовать div от родителя
	//div
	if (!layer.div && layer.parent) layer.div = layer.parent.div;
}, 'div');

Event.handler('Layer.oncheck', function (layer) {//Без этого не показывается окно cо стилями.. только его заголовок..
	if (!layer['divs']) return;
	for (var key in layer['divs']) { //Без этого не показывается окно cо стилями.. только его заголовок..
		Each.exec(layer['divs'][key], function (l) {
			if (!l['div']) l['div'] = key;
		});
	}
}, 'div');

Event.handler('Layer.oncheck', function (layer) {
	if (!layer['divtpl']) return;
	layer['div'] = Template.parse([layer['divtpl']], layer);
}, 'div');








Event.handler('Layer.oncheck', function (layer) {
	//tpl
	Tpl.rootTpl(layer);
	Tpl.datarootTpl(layer);
	Tpl.tpl(layer);
}, 'tpl:div');

Event.handler('Layer.isshow', function (layer) {
	Tpl.json(layer);
}, 'Layer');

Event.handler('Layer.onshow', function (layer) {
	Tpl.json(layer);
}, 'Layer');


//========================
// infrajs oncheck
//========================

//========================
// layer is show
//========================
Event.handler('Layer.isshow', function (layer) {
	if (!Event.fire('Layer.ischeck', layer)) return false;
	//Event.fire('Layer.oncheck',layer);
}, 'Layer');

Event.handler('Layer.isshow', function (layer) {//Родитель скрывает ребёнка если у родителя нет опции что ветка остаётся целой
	//infrajs
	if (!layer.parent) return;
	if (!Controller.isWork(layer.parent)) return;
	if (Event.fire('Layer.isshow', layer.parent)) return;
	if (layer.parent.is_save_branch) return;//Какой-то родитель таки не показывается.. теперь нужно узнать скрыт он своей веткой или чужой

	return false;
});

Event.handler('Layer.isshow', function (layer) {
	//is
	var prop = 'is';
	var proptpl = prop + 'tpl';
	if (layer[proptpl]) {
		var p = layer[proptpl];
		p = Template.parse([p], layer);
		layer[prop] = p;
	}

	let is = (layer.is === undefined) ? true : layer.is;
	if (is == '0') is = false;//В шаблоне false не удаётся вернуть
	return is;
}, 'is');

/*
Event.handler('Layer.isshow', function (layer){
	if (layer['tpl']) return;
	var r=true;
	if(layer['parent']){
		r=layer.parent.is_save_branch;
		if (typeof(r) == 'undefined') r = true;
	}
	layer.is_save_branch=r;
}, 'tpl:is');
*/



/*Event.handler('Layer.isshow', function (layer){
	if (!layer['tpl']) return false;
});*/

Event.handler('Layer.isshow', function (layer) {
	//tpl
	if (layer.tpl) return;
	var r = true;
	if (layer['parent']) {//Пустой слой не должен обрывать наследования если какой=то родитель скрывает всю ветку		
		r = layer['parent'].is_save_branch;
		if (typeof (r) === 'undefined') r = true;
	}
	layer.is_save_branch = r;

	return false;
}, 'tpl:div');

Event.handler('Layer.isshow', function (layer) {//tpl должен существовать, ветка скрывается
	//tpl
	if (!layer.tplcheck) return;
	var res = Load.loadTEXT(layer.tpl);
	if (res) return;//Без шаблона в любом случае показывать нечего... так что вариант показа когда нет результата не рассматриваем
	layer.is_save_branch = false;
	return false;
}, 'tplcheck:tpl,is')

Event.handler('Layer.isshow', function (layer) {//isShow учитывала зависимости дивов layerindiv ещё не работает
	//div
	
	if (!layer['div']) return;
	var start = false;
	
	if (Controller.run(Controller.getWorkLayers(), function (l) { //Пробежка не по слоям на ветке, а по всем слоям обрабатываемых после.. .то есть и на других ветках тоже
		if (!start) {
			if (layer === l) start = true;
			return;
		}
		if (!l.tpl) return;
		if (!l.div) return;
		if (l.div !== layer.div) return;//ищим совпадение дивов впереди
		if (Event.fire('Layer.isshow', l)) {
			layer.is_save_branch = Controller.isParent(l, layer);
			return true;//Слой который дальше показывается в том же диве найден
		}
	})) return false;
}, 'div');




//========================
// layer is rest
//========================
Event.handler('Layer.isrest', function (layer) {//Будем проверять все пока не найдём
	//infrajs
	if (!Controller.isWork(layer)) return true;//На случай если забежали к родителю а он не в работе	
	
	//if (!layer.div) return true
	
	//когда родитель в томже диве и скрыт а у скрытого родитель не спокоен и надо дочерний слой перепарсить, но из за скрытого промежуточного родителя проверка обрывалась. Теперь проверка продолжается и вроде ок.
	if (!Event.fire('Layer.isshow', layer) && (layer['parent'] && Event.fire('Layer.isrest', layer['parent']))) return true;//На случай если забежали окольными путями к слою который не показывается (вообще в check это исключено, но могут быть другие забеги)
	

	if (layer['parent'] 
		//&& layer['parent']['parent'] 
		&& Controller.isWork(layer['parent']) && !Event.fire('Layer.isrest', layer['parent'])) {

		return false;//Парсится родитель парсимся и мы
	}

	
	if (!layer.showed) return false;//Ещё Непоказанный слой должен перепарситься..
	
}, 'Layer');
Event.handler('Layer.isrest', function (layer) {
	//tpl parsed

	if (!Controller.isWork(layer)) return true;//На случай если забежали к родителю а он не в работе

	if (!Event.fire('Layer.isshow', layer)) return true;//На случай если забежали окольными путями к слою который не показывается (вообще в check это исключено, но могут быть другие забеги)
	if (layer.div && layer._parsed != Parsed.get(layer)) {
	//if (layer._parsed != Parsed.get(layer)) {
		return false;//'свойство parsed изменилось';
	}


}, 'parsed');
Event.handler('Layer.isrest', function (layer) {
	//divparent
	if (!Controller.isWork(layer)) return true;//На случай если забежали к родителю а он не в работе
	if (!Event.fire('Layer.isshow', layer)) return true;//На случай если забежали окольными путями к слою который не показывается (вообще в check это исключено, но могут быть другие забеги)

	if (!layer.divparent) return;
	var store = Controller.store();
	var l = store.divs[layer.divparent];
	if (!l) return;
	if (!Event.fire('Layer.isrest', l)) return false;

}, 'divparent:parsed');





//========================
// layer onshow
//========================

Layer.hand('show', async layer => { //Должно идти до tpl
 	layer._parsed = Parsed.get(layer)	//Выставляется после обработки шаблонов в которых в событиях onparse могла измениться data
 	layer.counter++;
 	//if (Tpl.ignoreDOM(layer)) return;
 	layer.html = await Tpl.getHtml(layer); //До того как сработает событие самого слоя в котором уже будут обработчики вешаться

	if (!layer.div) return; //При перепарсивании и изменении global или parsed срабатывает ошбка на самом первом слое у которого нет div.
	var div = document.getElementById(layer.div);
	//if (div) div.style.display = ''; //ЗАЧЕМ ЭТО? 04.05.19
	//if (Tpl.ignoreDOM(layer)) return;
	if (!div) {//Мы не можем проверить это в isshow так как для проверки надо чтобы например родитель показался, Но показ идёт одновременно уже без проверок.. сейчас.  По этому сейчас и проверяем. Пользователь не должне допускать таких ситуаций.
		if (!layer.divcheck && Access.debug()) {//Также мы не можем проверить в layer.oninsert.cond так как ситуация когда див не найден это ошибка, у слоя должно быть определено условие при которых он не показывается и это совпадает с тем что нет родителя. В конце концов указываться divparent
			console.log('Не найден контейнер для слоя:' + '\ndiv:' + layer.div + '\ntpl:' + layer.tpl + '\ntplroot:' + layer.tplroot + '\nparent.tpl:' + (layer.parent ? layer.parent.tpl : ''));
		}
		return false;
	} else {
		
		if (Layer.pop(layer, 'showanimate')) {
			div.style.opacity = 0
		}
		
		await View.html(layer.html, layer.div, layer._parsed)
		
		delete layer.html;//нефиг в памяти весеть
	}

	//слой который показан и не перепарсивается сюда не попадает, но и скрывать из этого дива никого не надо будет ведь этот слой и был показан.
	//if (!layer.tpl) return;
	var store = Controller.store();
	store.divs[layer.div] = layer;
//}, 'dom:html');
})

//========================
// layer onhide
//========================

Event.handler('Layer.onhide', function (layer) {//onhide запускается когда слой ещё виден

	//tpl
	var store = Controller.store();
	var l = store.divs[layer.div];//Нужно проверить не будет ли див заменён самостоятельно после показа. Сейчас мы знаем что другой слой в этом диве прямо не показывается. Значит после того как покажутся все слои и див останется в вёрстке только тогда нужно его очистить.
	//if (l && l != layer) return;//значит другой слой щас в этом диве покажется и реальное скрытие этого дива ещё впереди. Это чтобы не было скачков
	//console.log('hide', layer.div, l)
	if (l && l != layer) return;
	View.htmlclear(layer.div);
}, 'controller');


//========================
// infrajs onshow
//========================








Seq.set(Template.scope, Seq.right('Controller.ids'), Controller.ids);
Seq.set(Template.scope, Seq.right('Controller.names'), Controller.names);

/*Seq.set(Template.scope, Seq.right('Crumb.query'), Crumb.getInstance().query);
Seq.set(Template.scope, Seq.right('Crumb.referrer'), Crumb.referrer);
Seq.set(Template.scope, Seq.right('Crumb.params'), Crumb.params);
Seq.set(Template.scope, Seq.right('Crumb.get'), Crumb.get);*/
Template.scope.Crumb = Crumb

