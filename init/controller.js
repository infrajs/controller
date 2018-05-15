Controller.runAddKeys('divs');

Event.classes['Layer'] = function(layer){
	Controller.external.check(layer);
	Controller.unickCheck(layer);
	return layer.id;
}



Controller.runAddKeys('childs');
Controller.runAddList('child');

Event.one('Controller.oninit',function(){
	Controller.externalAdd('child','layers');
	Controller.externalAdd('crumb',function(now,ext,layer,external,i){//проверка external в onchange
		Controller.setCrumb(layer,'crumb',ext);
		return layer[i];
	});	
});

Event.handler('Controller.oninit', function () {
	//tpl
	var store=Controller.store();
	store.divs={};
}, 'tpl');


Event.handler('Layer.oninit', function (layer){
	//infrajs
	var store=Controller.store();
	layer['store']={'counter':store['counter']};
	delete layer.is_save_branch;
});	
Event.handler('Layer.oninit', function (layer){//это из-за child// всё что после child начинает плыть. по этому надо Crumb каждый раз определять, брать от родителя.
	//Crumb
	if(!layer['dyn']){//Делается только один раз
		Controller.setCrumb(layer,'crumb',layer['crumb']);
	}
},'crumb');
Event.handler('Layer.oninit', function (layer){
	//Crumb
	if(!layer['parent'])return;//слой может быть в child с динамическим state только если есть родитель
	Controller.setCrumb(layer,'crumb',layer['dyn']['crumb']);//Возможно у родителей обновился state из-за child у детей тоже должен обновиться хотя они не в child
},'crumb');
Event.handler('Layer.oninit', function (layer){
	//Crumb child
	if(!layer['child'])return;//Это услвие после setCrumb

	var st=layer['crumb']['child'];
	if(st) var name=st['name'];
	else var name='###child###';

	infra.fora(layer['child'], function(l){
		Controller.setCrumb(l,'crumb',name);
	});
},'crumb');
Event.handler('Layer.oninit', function (layer){//Должно быть после external, чтобы все свойства у слоя появились
	//Crumb childs
	infra.forx(layer['childs'], function(l,key){//У этого childs ещё не взять external
		if(!l['crumb'])l['crumb']=Controller.setCrumb(l,'crumb',key);
	});

},'crumb');

Event.handler('Layer.ischeck', function (layer){
	//crumb
	if (!layer['crumb']['is']) return false;
},'crumb');
/* Event.handler('Layer.oninit', function (layer){
	//crumb link
	if(!layer['link']&&!layer['linktpl'])layer['linktpl']='{crumb}';
});*/

//========================
// layer is check
//========================
Event.handler('Layer.ischeck', function (layer){
	if (!layer['parent']) return;
	if (!Event.fire('Layer.ischeck', layer['parent'])) return false;
},'layer');

Event.handler('Layer.ischeck', function (layer){//может быть у любого слоя в том числе и у не iswork, и когда нет старого значения
	if (!Controller.isWork(layer)) return false;//Нет сохранённого результата, и слой не в работе, если работа началась с Controller.check(layer) и у layer есть родитель
},'layer');



Event.handler('Layer.ischeck', function (layer){
	//tpl
	if (layer['onlyserver']) return false;
},'layer');


//========================
// layer oncheck
//========================
Event.handler('Layer.oncheck', function (layer){//Свойство counter должно быть до tpl чтобы counter прибавился а потом парсились
	//counter
	//if (layer.debugRubrics) console.log('Слой debugRubrics div content ', layer.div, layer);
	if (!layer.counter) layer.counter =	 0;
}, 'layer');

Event.handler('Layer.oncheck', function (layer){//В onchange слоя может не быть див// Это нужно чтобы в external мог быть определён div перед тем как наследовать div от родителя
	//div
	if (!layer.div && layer.parent) layer.div = layer.parent.div;
}, 'div');

Event.handler('Layer.oncheck', function (layer){//Без этого не показывается окно cо стилями.. только его заголовок..
	if (!layer['divs']) return; 
	for (var key in layer['divs']) { //Без этого не показывается окно cо стилями.. только его заголовок..
		Each.exec(layer['divs'][key], function (l) {
			if (!l['div']) l['div'] = key;
		});	
	}
}, 'div');

Event.handler('Layer.oncheck', function (layer){
	if (!layer['divtpl']) return;
	layer['div'] = Template.parse([layer['divtpl']], layer);
}, 'div');








Event.handler('Layer.oncheck', function (layer){
	//tpl
	Controller.tplrootTpl(layer);
	Controller.tpldatarootTpl(layer);
	Controller.tplTpl(layer);
}, 'tpl:div');

Event.handler('Layer.isshow', function (layer){
	Controller.tplJson(layer);
}, 'Layer');

Event.handler('Layer.onshow', function (layer){
	Controller.tplJson(layer);
}, 'Layer');


//========================
// infrajs oncheck
//========================

//========================
// layer is show
//========================
Event.handler('Layer.isshow', function (layer){
	if (!Event.fire('Layer.ischeck',layer)) return false;
	//Event.fire('Layer.oncheck',layer);
},'layer');

Event.handler('Layer.isshow', function (layer){//Родитель скрывает ребёнка если у родителя нет опции что ветка остаётся целой
	//infrajs
	if(!layer.parent)return;
	if(Event.fire('Layer.isshow',layer.parent))return;
	if(layer.parent.is_save_branch)return;//Какой-то родитель таки не показывается.. теперь нужно узнать скрыт он своей веткой или чужой
	return false;
});

Event.handler('Layer.isshow', function (layer){
	//is
	Controller.istplparse(layer);
	return Controller.isCheck(layer);
},'is');

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

Event.handler('Layer.isshow', function (layer){
	//tpl
	if (layer.tpl) return;
	var r = true;
	if (layer['parent']) {//Пустой слой не должен обрывать наследования если какой=то родитель скрывает всю ветку		
		r = layer['parent'].is_save_branch;
		if (typeof(r)==='undefined') r = true;
	}
	layer.is_save_branch = r;

	return false;
}, 'tpl:div');

Event.handler('Layer.isshow', function (layer){//tpl должен существовать, ветка скрывается
	//tpl
	if (!layer.tplcheck) return;
	var res=infra.loadTEXT(layer.tpl);
	if(res)return;//Без шаблона в любом случае показывать нечего... так что вариант показа когда нет результата не рассматриваем
	layer.is_save_branch = false;
	return false;
}, 'tplcheck:tpl,is');

Event.handler('Layer.isshow', function (layer){//ветка скрывается
	//tpl
	return Controller.tplJsonCheck(layer);
}, 'tpl:div');

Event.handler('Layer.isshow', function (layer){//isShow учитывала зависимости дивов layerindiv ещё не работает
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
		if (Event.fire('Layer.isshow', l)){
			layer.is_save_branch = Controller.isParent(l, layer);
			return true;//Слой который дальше показывается в том же диве найден
		}
	})) return false;
}, 'div');




//========================
// layer is rest
//========================
Event.handler('Layer.isrest' , function (layer){//Будем проверять все пока не найдём
	//infrajs
	if (!Controller.isWork(layer)) return true;//На случай если забежали к родителю а он не в работе	
	
	//когда родитель в томже диве и скрыт а у скрытого родитель не спокоен и надо дочерний слой перепарсить, но из за скрытого промежуточного родителя проверка обрывалась. Теперь проверка продолжается и вроде ок.
	if (!Event.fire('Layer.isshow', layer) && (layer['parent'] && Event.fire('Layer.isrest', layer['parent']))) return true;//На случай если забежали окольными путями к слою который не показывается (вообще в check это исключено, но могут быть другие забеги)
	
	if (layer['parent'] && Controller.isWork(layer['parent']) && !Event.fire('Layer.isrest', layer['parent'])){
		
		return false;//Парсится родитель парсимся и мы
	}
	if(!layer.showed)return false;//Ещё Непоказанный слой должен перепарситься..
}, 'layer');
Event.handler('Layer.isrest' , function (layer){
	//tpl parsed
	if(!Controller.isWork(layer))return true;//На случай если забежали к родителю а он не в работе
	if(!Event.fire('Layer.isshow',layer))return true;//На случай если забежали окольными путями к слою который не показывается (вообще в check это исключено, но могут быть другие забеги)

	if(layer._parsed!=Controller.parsed(layer)){
		return false;//'свойство parsed изменилось';
	}
}, 'parsed');
Event.handler('Layer.isrest' , function (layer){
	//divparent
	if(!Controller.isWork(layer))return true;//На случай если забежали к родителю а он не в работе
	if(!Event.fire('Layer.isshow',layer))return true;//На случай если забежали окольными путями к слою который не показывается (вообще в check это исключено, но могут быть другие забеги)

	var r=Controller.divparentIsRest(layer);
	return r;
}, 'divparent:parsed');





//========================
// layer onshow
//========================
Event.handler('Layer.onshow', function (layer){//Должно идти до tpl
	//counter
	layer.counter++;
}, 'layer');
Event.handler('Layer.onshow', function (layer){
	//tpl
	layer._parsed=Controller.parsed(layer);	//Выставляется после обработки шаблонов в которых в событиях onparse могла измениться data
},'parsed');
Event.handler('Layer.onshow', function (layer){//До того как сработает событие самого слоя в котором уже будут обработчики вешаться
	//tpl
	if(Controller.ignoreDOM(layer))return;
	layer.html=Controller.getHtml(layer);
},'html:parsed');


Event.handler('Layer.onshow', function (layer){//До того как сработает событие самого слоя в котором уже будут обработчики вешаться
	//tpl
	if (!layer.div) return; //При перепарсивании и изменении global или parsed срабатывает ошбка на самом первом слое у которого нет div.
	var div = document.getElementById(layer.div);
	if (div) div.style.display = '';
	if (Controller.ignoreDOM(layer)) return;
	if (!div){//Мы не можем проверить это в isshow так как для проверки надо чтобы например родитель показался, Но показ идёт одновременно уже без проверок.. сейчас.  По этому сейчас и проверяем. Пользователь не должне допускать таких ситуаций.
		if (!layer.divcheck && infra.debug()){//Также мы не можем проверить в layer.oninsert.cond так как ситуация когда див не найден это ошибка, у слоя должно быть определено условие при которых он не показывается и это совпадает с тем что нет родителя. В конце концов указываться divparent
			console.log('Не найден контейнер для слоя:'+'\ndiv:'+layer.div+'\ntpl:'+layer.tpl+'\ntplroot:'+layer.tplroot+'\nparent.tpl:'+(layer.parent?layer.parent.tpl:''));
		}
		return false;
	}
	if(div){
		infra.html(layer.html,layer.div);
		delete layer.html;//нефиг в памяти весеть
	}
}, 'dom:html');


Event.handler('Layer.onshow', function (layer){
	//tpl
	//слой который показан и не перепарсивается сюда не попадает, но и скрывать из этого дива никого не надо будет ведь этот слой и был показан.
	//if (!layer.tpl) return;
	var store=Controller.store();
	store.divs[layer.div]=layer;
}, 'dom:html');


//========================
// layer onhide
//========================

Event.handler('Layer.onhide', function (layer){//onhide запускается когда слой ещё виден
	//tpl
	var store=Controller.store();
	var l=store.divs[layer.div];//Нужно проверить не будет ли див заменён самостоятельно после показа. Сейчас мы знаем что другой слой в этом диве прямо не показывается. Значит после того как покажутся все слои и див останется в вёрстке только тогда нужно его очистить.

	if(l)return;//значит другой слой щас в этом диве покажется и реальное скрытие этого дива ещё впереди. Это чтобы не было скачков
	infra.htmlclear(layer.div);
},'controller');


//========================
// infrajs onshow
//========================

Event.handler('Controller.onshow', function () {
	//crumb
	var conf = Config.get('controller');
	if (!conf.client) return;
	infra.Crumb.setA(document);//Пробежаться по всем ссылкам и добавить спeциальный обработчик на onclick... для перехода по состояниям сайта.
},'crumb');





Event.one('Controller.oninit', function() {
	//div
	Sequence.set(Template.scope, Sequence.right('infrajs.ids'), Controller.ids);
	Sequence.set(Template.scope, Sequence.right('infrajs.names'), Controller.names);

	Sequence.set(Template.scope, Sequence.right('Controller.ids'), Controller.ids);
	Sequence.set(Template.scope, Sequence.right('Controller.names'), Controller.names);
	
	//Sequence.set(Template.scope, Sequence.right('infra.Crumb'), Crumb);
	//Sequence.set(Template.scope, Sequence.right('Crumb'), Crumb);

	
}, 'Controller');
Event.handler('Controller.oninit', function () {
	var root = Crumb.getInstance();
	//Sequence.set(Template.scope, Sequence.right('Crumb.query'), root.query);
	Sequence.set(Template.scope, Sequence.right('Crumb.params'), Crumb.params);
	Sequence.set(Template.scope, Sequence.right('Crumb.get'), Crumb.get);

	//Sequence.set(Template.scope, Sequence.right('infra.Crumb.query'), root.query);
	Sequence.set(Template.scope, Sequence.right('infra.Crumb.params'), Crumb.params);
	Sequence.set(Template.scope, Sequence.right('infra.Crumb.get'), Crumb.get);
}, 'Controller');
