Event.handler('layer.oninit', function (layer){
	//external
	infrajs.external.check(layer);
},'external');

Event.handler('layer.oninit', function (layer){
	//infrajs
	var store=infrajs.store();
	layer['store']={'counter':store['counter']};
},'counter:external');
Event.handler('layer.oninit', function (layer){
	//unick
	infrajs.unickCheck(layer);
},'unick:counter');
Event.handler('layer.oninit', function (layer){//это из-за child// всё что после child начинает плыть. по этому надо Crumb каждый раз определять, брать от родителя.
	//Crumb
	if(!layer['dyn']){//Делается только один раз
		infrajs.setCrumb(layer,'crumb',layer['crumb']);
	}
},'crumb:unick');
Event.handler('layer.oninit', function (layer){
	//Crumb
	if(!layer['parent'])return;//слой может быть в child с динамическим state только если есть родитель
	infrajs.setCrumb(layer,'crumb',layer['dyn']['crumb']);//Возможно у родителей обновился state из-за child у детей тоже должен обновиться хотя они не в child
},'crumb:unick');
Event.handler('layer.oninit', function (layer){
	//Crumb child
	if(!layer['child'])return;//Это услвие после setCrumb

	var st=layer['crumb']['child'];
	if(st) var name=st['name'];
	else var name='###child###';

	infra.fora(layer['child'], function(l){
		infrajs.setCrumb(l,'crumb',name);
	});
},'crumb:unick');
Event.handler('layer.oninit', function (layer){//Должно быть после external, чтобы все свойства у слоя появились
	//Crumb childs
	infra.forx(layer['childs'], function(l,key){//У этого childs ещё не взять external
		if(!l['crumb'])l['crumb']=infrajs.setCrumb(l,'crumb',key);
	});

},'crumb:unick');

/* Event.handler('layer.oninit', function (layer){
	//crumb link
	if(!layer['link']&&!layer['linktpl'])layer['linktpl']='{crumb}';
});*/

//========================
// layer is check
//========================

Event.handler('layer.ischeck', function (layer){//может быть у любого слоя в том числе и у не iswork, и когда нет старого значения
	if(!infrajs.isWork(layer))return false;//Нет сохранённого результата, и слой не в работе, если работа началась с infrajs.check(layer) и у layer есть родитель
},'layer');
Event.handler('layer.ischeck', function (layer){
	//crumb
	if (!layer['crumb']['is']) return false;
},'crumb:layer');
Event.handler('layer.ischeck', function (layer){
	//tpl
	if (layer['onlyserver']) return false;
},'layer');


//========================
// layer oncheck
//========================

Event.handler('layer.oncheck', function (layer){//Свойство counter должно быть до tpl чтобы counter прибавился а потом парсились
	//counter
	if(!layer.counter)layer.counter=0;
}, 'counter');
Event.handler('layer.oncheck', function (layer){//Без этого не показывается окно cо стилями.. только его заголовок..
	//div
	infra.forx(layer.divs, function(l,key){
		if(!l.div)l.div=key;
	});
}, 'div:counter');
Event.handler('layer.oncheck', function (layer){//В onchange слоя может не быть див// Это нужно чтобы в external мог быть определён div перед тем как наследовать div от родителя
	//div
	if(!layer.div&&layer.parent)layer.div=layer.parent.div;
}, 'div:counter');





Event.handler('layer.oncheck', function (layer){
	//envs
	infrajs.envEnvs(layer);
}, 'envs');
Event.handler('layer.oncheck', function (layer){
	//envframe
	infrajs.envframe(layer);
}, 'envs');
Event.handler('layer.oncheck', function (layer){
	//envframe
	infrajs.envframe2(layer);
}, 'envs');
Event.handler('layer.oncheck', function (layer){//external то ещё не применился нельзя
	//env myenvtochild
	infrajs.envmytochild(layer);
}, 'envs');
Event.handler('layer.oncheck', function (layer){//external то ещё не применился нельзя
	//envtochild
	infrajs.envtochild(layer)
}, 'envs');




Event.handler('layer.oncheck', function (layer){
	//div
	infrajs.divtpl(layer);
}, 'divtpl:envs');
Event.handler('layer.oncheck', function (layer){
	//tpl
	infrajs.tplrootTpl(layer);
	infrajs.tpldatarootTpl(layer);
	infrajs.tplTpl(layer);
	infrajs.tplJson(layer);
}, 'tpl:divtpl');


//========================
// infrajs oncheck
//========================

//========================
// layer is show
//========================
Event.handler('layer.isshow', function (layer){
	//infrajs
	if(!Event.fire('layer.ischeck',layer))return false;
},'layer');

Event.handler('layer.isshow', function (layer){//Родитель скрывает ребёнка если у родителя нет опции что ветка остаётся целой
	//infrajs
	if(!layer.parent)return;
	if(Event.fire('layer.isshow',layer.parent))return;

	if(infrajs.isSaveBranch(layer.parent))return;//Какой-то родитель таки не показывается.. теперь нужно узнать скрыт он своей веткой или чужой
	return false;
},'layer');

Event.handler('layer.isshow', function (layer){
	//is
	infrajs.istplparse(layer);
	return infrajs.isCheck(layer);
},'is');

Event.handler('layer.isshow', function (layer){
	if (layer['tpl']) return;
	var r=true;
	if(layer['parent']){
		r=infrajs.isSaveBranch(layer['parent']);
		if (typeof(r) == 'undefined') r = true;
	}
	infrajs.isSaveBranch(layer,r);
}, 'tpl:is');





Event.handler('layer.isshow', function (layer){
	//tpl
	if(layer.tpl)return;
	infrajs.isSaveBranch(layer,true);//Когда нет шаблона слой скрывается, но не скрывает свою ветку
	return false;
}, 'tpl:is');

Event.handler('layer.isshow', function (layer){//tpl должен существовать, ветка скрывается
	//tpl
	if(!layer.tplcheck)return;
	var res=infra.loadTEXT(layer.tpl);
	if(res)return;//Без шаблона в любом случае показывать нечего... так что вариант показа когда нет результата не рассматриваем
	infrajs.isSaveBranch(layer,false);
	return false;
}, 'tplcheck:tpl,is');

Event.handler('layer.isshow', function (layer){//ветка скрывается
	//tpl
	return infrajs.tplJsonCheck(layer);
}, 'tpl:is');
Event.handler('layer.isshow', function (layer){
	//div
	if(!layer.div&&layer.parent)return false;//Такой слой игнорируется, события onshow не будет, но обработка пройдёт дальше у других дивов
}, 'div:tpl');
Event.handler('layer.isshow', function (layer){//isShow учитывала зависимости дивов layerindiv ещё не работает
	//div
	var r=infrajs.divCheck(layer);
	return r;
}, 'div:tpl');

Event.handler('layer.isshow', function (layer){
	//env, counter
	return infrajs.envCheck(layer);
}, 'env:div');


//========================
// layer is rest
//========================
Event.handler('layer.isrest' , function (layer){//Будем проверять все пока не найдём
	//infrajs

	if(!infrajs.isWork(layer))return true;//На случай если забежали к родителю а он не в работе
	if(!Event.fire('layer.isshow',layer))return true;//На случай если забежали окольными путями к слою который не показывается (вообще в check это исключено, но могут быть другие забеги)

	if(layer['parent']&&infrajs.isWork(layer['parent'])&&!Event.fire('layer.isrest',layer['parent'])){
		return false;//Парсится родитель парсимся и мы
	}

	if(!layer.showed)return false;//Ещё Непоказанный слой должен перепарситься..
}, 'layer');
Event.handler('layer.isrest' , function (layer){
	//tpl parsed
	if(!infrajs.isWork(layer))return true;//На случай если забежали к родителю а он не в работе
	if(!Event.fire('layer.isshow',layer))return true;//На случай если забежали окольными путями к слою который не показывается (вообще в check это исключено, но могут быть другие забеги)

	if(layer._parsed!=infrajs.parsed(layer)){
		return false;//'свойство parsed изменилось';
	}
}, 'parsed');
Event.handler('layer.isrest' , function (layer){
	//divparent
	if(!infrajs.isWork(layer))return true;//На случай если забежали к родителю а он не в работе
	if(!Event.fire('layer.isshow',layer))return true;//На случай если забежали окольными путями к слою который не показывается (вообще в check это исключено, но могут быть другие забеги)

	var r=infrajs.divparentIsRest(layer);
	return r;
}, 'divparent:parsed');





//========================
// layer onshow
//========================
Event.handler('layer.onshow', function (layer){//Должно идти до tpl
	//counter
	layer.counter++;
},'layer');
Event.handler('layer.onshow', function (layer){
	//tpl
	layer._parsed=infrajs.parsed(layer);	//Выставляется после обработки шаблонов в которых в событиях onparse могла измениться data
},'parsed');
Event.handler('layer.onshow', function (layer){//До того как сработает событие самого слоя в котором уже будут обработчики вешаться
	//tpl
	if(infrajs.ignoreDOM(layer))return;
	layer.html=infrajs.getHtml(layer);
},'html:parsed');


Event.handler('layer.onshow', function (layer){//До того как сработает событие самого слоя в котором уже будут обработчики вешаться
	//tpl

	var div=document.getElementById(layer.div);
	if(div)div.style.display='';
	if(infrajs.ignoreDOM(layer))return;
	if(!div){//Мы не можем проверить это в isshow так как для проверки надо чтобы например родитель показался, Но показ идёт одновременно уже без проверок.. сейчас.  По этому сейчас и проверяем. Пользователь не должне допускать таких ситуаций.
		if(!layer.divcheck&&infra.debug()){//Также мы не можем проверить в layer.oninsert.cond так как ситуация когда див не найден это ошибка, у слоя должно быть определено условие при которых он не показывается и это совпадает с тем что нет родителя. В конце концов указываться divparent
			console.log('Не найден контейнер для слоя:'+'\ndiv:'+layer.div+'\ntpl:'+layer.tpl+'\ntplroot:'+layer.tplroot+'\nparent.tpl:'+(layer.parent?layer.parent.tpl:''));
		}
		return false;
	}
	if(div){
		infra.html(layer.html,layer.div);
		delete layer.html;//нефиг в памяти весеть
	}
}, 'dom:html');


Event.handler('layer.onshow', function (layer){
	//tpl
	//слой который показан и не перепарсивается сюда не попадает, но и скрывать из этого дива никого не надо будет ведь этот слой и был показан.
	var store=infrajs.store();
	store.divs[layer.div]=layer;
}, 'dom:html');

/* Event.handler('layer.onshow', function (layer){
	//popup
	//layer.showmsg='popup';
	//popup.layeronshow(layer);
});*/





Event.handler('layer.onshow', function (layer){
	//autosave
	infrajs.autosaveHand(layer);
}, 'autosave:dom');




//========================
// layer onhide
//========================

Event.handler('layer.onhide', function (layer){//onhide запускается когда слой ещё виден
	//tpl
	var store=infrajs.store();
	var l=store.divs[layer.div];//Нужно проверить не будет ли див заменён самостоятельно после показа. Сейчас мы знаем что другой слой в этом диве прямо не показывается. Значит после того как покажутся все слои и див останется в вёрстке только тогда нужно его очистить.

	if(l)return;//значит другой слой щас в этом диве покажется и реальное скрытие этого дива ещё впереди. Это чтобы не было скачков
	infra.htmlclear(layer.div);
},'controller');


//========================
// infrajs onshow
//========================

Event.handler('Infrajs.onshow', function () {
	//crumb
	infra.Crumb.setA(document);//Пробежаться по всем ссылкам и добавить спeциальный обработчик на onclick... для перехода по состояниям сайта.
},'crumb');



Event.one('Infrajs.onshow', function () {
	//code
	infrajs.code_restore();
}, 'code');