import { Event } from '/vendor/infrajs/event/Event.js'
import { Fire } from '/vendor/akiyatkin/load/Fire.js'
/*


layer={
	tpl:(string)//файл шаблона,
	css:(mix),//таблицы стилей
	js:(mix),//Подключаются расширения
	tplroot:(string),//начальный шаблон в указанном шаблоне
	dataroot:(string),//hidden относительный путь до данных с которыми парсится шаблон... корневой объект данных это layer
	data:(string),//Если data obj то каждое свойство data будет воспринято как путь до отдельного файла с данными
	parent:layer;//Слой в котором был отмечен текущий слой. Автоматическое свойство
	is:string;//При изменени is слой перепарсивается
	reparse:(bool),//всегда перепарсивать слой при пробежке check
	reparseone:(bool),

	sesold:(object), //старый ses, замена происходит каждый check
	ses:{
		showed:(bool),//показывался ли слой в прошлый раз, при следующем check свойство попадает в sesold
	}

	_parsed:string,//hidden Авто свойство
	state:(mix),//Откуда брать параметры слоя
	crumb:(mix),//Используется для определения когда показывать слой
	dyn:(mix),//hidden Выставляется системой автоматически. хранит значения пользователя crumb state

	global:array,//external

	child:(layer), //слой с динмаическим state, state будет равен тому childs который в адресе сейчас... Такой слой привязывается сразу ко всем состояниям после состояния родителя
	childs:(object layers), //распределение слоёв по состояниям
	divs:(object layers), //распределение слоёв по дивам
	layers:(array layer),
	frames:(array layer),
	config:(mix) - конфиг не меняется для одного слоя
}

//Свойства слоя
{
	parent
	showed
}
//Функции для написания плагинов
Controller.store(name);
Controller.storeLayer(layer);
Controller.getLayers(iswork);

Controller.run(layers,callback);


Controller.isSaveBranch(layer,val);
Controller.isParent(layer,parent);
Controller.isWork(layer);

Event.fire('Layer.is rest|show|check',layer);
Controller.handler('Layer.is rest|show|check',callback(layer));



Controller.check(layer);
Controller.checkAdd(layer);
*/


let Controller = {}

Controller.storeLayer = function (layer) {//кэш на каждый iswork
	if (!layer['store']) layer['store'] = { 'counter': 0 };//Кэш используется во всех is функциях... iswork кэш, ischeck кэш используется для определения iswork слоя.. путём сравнения ))
	return layer['store'];//Очищается кэш в checkNow
}
Controller.store = function () {//Для единобразного доступа в php, набор глобальных переменных
	if (!this.store.data) this.store.data = {
		timer: false,
		run: { 'keys': {}, 'list': {} },
		waits: [],
		counter: 0,//Счётчик сколько раз перепарсивался сайт, посмотреть можно в firebug
		alayers: [],//Записываются только слои у которых нет родителя...
		wlayers: []//Записываются обрабатываемые сейчас слои
	};
	return this.store.data;
};
//Чтобы сработал check без аргументов нужно передать слои в add
//Слои переданные в check напрямую не сохраняются
Controller.getDebugLayers = function () {
	var list = [];
	Controller.run(Controller.getAllLayers(), function (layer) {
		if (layer.debug) list.push(layer);
	});
	return list;
}
Controller.getWorkLayers = function () {
	var store = Controller.store();
	return store.wlayers;
};
Controller.getAllLayers = function () {
	var store = Controller.store();
	return store.alayers;
};

/* controller.check=function(layers){//Пробежка по слоям

	var store=Controller.store();

	if(store.process&&!store.timer){//Функция checkNow сейчас выполняется и в каком-то
		//Момент когда process уже начался но ещё не запустился после timer
		setTimeout(function(){//обработчике прошёл вызов пробежки...  Если мы добавим текущий слой в массив всех слоёв.. он начнёт участвовать в пробежке в операциях после той в которой был вызов создавший этот слой... короче не добавляем его
			Controller.check(layers);
		},1);//Запоминаем всё в этой ловушке...
		return;
	}
	store.process=true;
	if(store.waits===undefined)return;//уже пробежка по всем слоям выходим
	if(!layers){
		store.waits=undefined;
	}else{
		store.waits.push(layers);
	}
	if(store.timer)return;
	//процесс характеризуется двумя переменными process и timer... true..true..false.....false
	store.counter++;

	store.timer=setTimeout(function(){
			store.ismainrun=!store.waits;
			store.timer=false;//Все новые слои будут ждать пока не станет false
			if(store.waits){
				var wlayers=store.waits;
			}else{//Если конкретные слои не указаны беруться все упоминавшиеся слои
				var wlayers=store.alayers.concat();//далее alayers может наполняться, чтобы небыло копии
			}
			store.waits=[];//При запуске checkNow все ожидающие слои обнуляются
			store.wlayers=wlayers;

			Event.fire('Controller.oncheck');//loader

			Controller.checkNow();
			store.process=false;

			Event.fire('Controller.onshow');//loader, setA, в onshow можно зациклить check
	},1);//Если вызывать Controller.check() и вместе с этим переход по ссылке проверка слоёв сработает только один раз за счёт это паузы.. два вызова объединяться за это время в один.

};// child, layers*/
Controller.show = function (layer, div) {
	layer.div = div;
	layer.parsed = Math.random();
	Controller.check(layer);
}
Controller.check = (layers) => {
	if (Controller.check.promise) {
		//При поторном запросе добаляем в очередь на запуск после уже выполняющегося
		return Controller.check.promise = Controller.check.promise.then(() => Controller.check(layers))
	}
	return Controller.check.promise = new Promise((resolve) => {
		setTimeout(async () => {
			var store = Controller.store();
			//процесс характеризуется двумя переменными process и timer... true..true..false.....false
			store.counter++;


			store.ismainrun = !layers;
			//store.ismainrun=true;

			if (layers) {
				console.log('Controller.check(layers)');
				var wlayers = layers;
			} else { //Если конкретные слои не указаны беруться все упоминавшиеся слои
				console.log('Controller.check()');
				var wlayers = store.alayers.concat();//далее alayers может наполняться, чтобы не было копии
			}

			store.wlayers = wlayers;
			Event.tik('Controller');
			Event.tik('Layer');
			Event.fire('Controller.oninit');//loader
			await Fire.on(Controller, 'init')

			Controller.run(Controller.getWorkLayers(), function (layer, parent) {//Запускается у всех слоёв в работе которые wlayers
				if (parent) layer['parent'] = parent;//Не обрабатывается ситуация когда check снутри иерархии
				Event.fire('Layer.oninit', layer);//устанавливается state
				if (Event.fire('Layer.ischeck', layer)) {
					Event.fire('Layer.oncheck', layer);//нельзя запускать is show так как ожидается что все oncheckb сделаются и в is будут на их основе соответствующие проверки
				}
			});//разрыв нужен для того чтобы можно было наперёд определить показывается слой или нет. oncheck у всех. а потом по порядку.

			Event.fire('Controller.oncheck');//момент когда доступны слои для подписки и какой-то обработки, доступен unick

			Controller.run(Controller.getWorkLayers(), function (layer) {//С чего вдруг oncheck у всех слоёв.. надо только у активных
				if (Event.fire('Layer.isshow', layer)) {
					if (!Event.fire('Layer.isrest', layer)) {

						Event.fire('Layer.onshow', layer);//Событие в котором вставляется html
						//infra.fire(layer,'onshow');//своевременное выполнение Event.onext onshow в кэше html когда порядок слоёв не играет роли
						//при клике делается отметка в конфиге слоя и слой парсится... в oncheck будут подстановки tpl и isRest вернёт false
					}//onchange показанный слой не реагирует на изменение адресной строки, нельзя привязывать динамику интерфейса к адресной строке, только черещ перепарсивание
				} else if (layer.showed) {
					//Правильная форма события (conteiner,name,obj)
					Event.fire('Layer.onhide', layer); //нужно для autosave
					//infra.fire(layer,'onhide');//сбросить catalog когда скрылся слой поиска в каталоге
				}
				layer.showed = Event.fire('Layer.isshow', layer);//Свойства showed. Нужно знать предыдущее значение isShow с последней проверки. Используется в admin.js
			});//у родительского слоя showed будет реальное а не старое, назад showed проверять нельзя



			Event.fire('Controller.onshow');//loader, setA, в onshow можно зациклить check
			delete Controller.check.promise
			resolve()
			//onshow1
			//вызван check (нужен setTimeout чтобы не разворачивало всё.)
			//вызван onshow1
			//вызван onshow2
			//вызван onshow2
			//событие будет сгенерировано два раза, с одним counter
		}, 1)
	})
};// child, layers

Controller.checkAdd = function (layers) {
	var store = Controller.store();
	infra.fora(layers, function (layer) {
		if (infra.fora(store.alayers, function (rl) {
			if (rl === layer) return true;
		})) return;
		store.alayers.push(layer);//Только если рассматриваемый слой ещё не добавлен
	});
};
/*Controller.isAdd=function(name,callback){//def undefined быть не может
	var store=Controller.store();
	if(!store[name])store[name]=[];//Если ещё нет создали очередь
	return store[name].push(callback);
}
Controller.is=function(name,layer){//def undefined быть не может
	if(typeof(layer)=='function')exit;
	var store=Controller.store();
	//Обновлять с новым check нужно только результат в слое, подписки в store сохраняются, Обновлять только в случае когда слой в работе
	if(!layer) return store[name];//Без параметров возвращается массив подписчиков
	var cache=Controller.storeLayer(layer)//кэш сбрасываемый каждый iswork


	if(!Controller.isWork(layer)){//если не в работе.
			//return false;//Проверять isWork перед is( в функциях
			//для show старое - показан, скрыт
			//для rest всегда true - в покое
			//для check старое -
		if(typeof(cache[name])!=='undefined'){//Результат уже есть
			return cache[name];//Хранить результат для каждого слоя
		}else{//Небывает ситуации когда слой не в работе и нет кэша. любое add должно сопровождаться check ~mainrun.
			//divcheck херачит это исключение
			return;//не знаю почему но так работает
			//error;
		}
	}
	//слой проверили по всей очередь
	if(typeof(cache[name])!=='undefined'){//Результат уже есть
		return cache[name];//Хранить результат для каждого слоя
	}
	cache[name]=true;//взаимозависимость не мешает, Защита от рекурсии, повторный вызов вернёт true как предварительный кэш
	for(var i=0,l=store[name].length;i<l;i++){
		var r=store[name][i](layer);
		if(typeof(r)!='undefined'&&!r){
			cache[name]=r;
			break;
		}
	}
	return cache[name];//check//show//rest
};

*/

/**
 * Пробежка идёт сначало по спискам (layers,childs и только потом по divs, childs, subs)
 * занчения по ключу более важны и перехватывают инициативу в случае конфликат
 */
//run
Controller.fora = async function (el, callback, group, key) {//Бежим по массиву рекурсивно
	if (el instanceof Array) {
		for (let i = 0; i < el.length; i++) {
			const v = el[i];
			let r = await infra.fora(v, callback, el, i);
			if (r != null) return r;
		}
	} else if (el != null) {
		return await callback(el, key, group);
	}
};
Controller.runa = async function (layers, callback, parent) {
	let props = Controller.store();
	props = props['run'];
	let r = await Controller.fora(layers, async function (layer) {
		let r = await callback.apply(Controller, [layer, parent]);
		if (r != null) return r;
		for (const name in layer) {
			let val = layer[name]
			if (props['list'].hasOwnProperty(name)) {
				let r = await Controller.runa(val, callback, layer);
				if (r != null) return r;
			} else if (props['keys'].hasOwnProperty(name)) {
				if (!val || typeof (val) !== 'object') continue;
				
				for (let i in val) {
					let v = val[i]
					let r = await Controller.runa(v, callback, layer);
					if (r != null) return r;
				}
			}
		}
	});
	return r;
}
Controller.run = function (layers, callback, parent) {
	var r;
	var props = Controller.store();
	props = props['run'];
	r = infra.fora(layers, function (layer) {
		r = callback.apply(Controller, [layer, parent]);
		if (r !== undefined) return r;//выход
		r = infra.foro(layer, function (val, name) {
			if (props['list'].hasOwnProperty(name)) {
				r = Controller.run(val, callback, layer);
				if (r !== undefined) return r;
			} else if (props['keys'].hasOwnProperty(name)) {
				r = infra.foro(val, function (v, i) {
					r = Controller.run(v, callback, layer);
					if (r !== undefined) return r;
				});
				if (r !== undefined) return r;
			}
		});
		if (r !== undefined) return r;
	});
	return r;
}
/*controller.run=function(layers,callback,parent){
	var r;
	var props=Controller.store();
	props=props['run'];
	r=infra.fora(layers,function(layer){
		r=callback.apply(Controller,[layer,parent]);
		if(r!==undefined)return r;//выход
		r=infra.foro(layer,function(val,name){
			if(props['list'].hasOwnProperty(name)){
				r=Controller.run(val,callback,layer);
				if(r!==undefined)return r;
			}
		});
		if(r!==undefined)return r;
		r=infra.foro(layer,function(val,name){
			if(props['keys'].hasOwnProperty(name)){
				r=infra.foro(val,function(v,i){
					r=Controller.run(v,callback,layer);
					if(r!==undefined)return r;
				});
				if(r!==undefined)return r;
			}
		});
		if(r!==undefined)return r;
	});
	return r;
}*/
Controller.runAddKeys = function (name) {
	var props = Controller.store();
	props['run']['keys'][name] = true;
}
Controller.runAddList = function (name) {
	var props = Controller.store();
	props['run']['list'][name] = true;
}


Controller.isWork = function (layer) {
	var store = Controller.store();
	var cache = Controller.storeLayer(layer);
	return cache['counter'] && store['counter'] == cache['counter'];//Если слой в работе метки будут одинаковые
}
Controller.isParent = function (layer, parent) {
	while (layer) {
		if (parent === layer) return true;
		layer = layer.parent;
	}
	return false;
},


Controller.isSaveBranch = function (layer, val) {
		if (typeof (val) !== 'undefined') layer.is_save_branch = val;
		return layer.is_save_branch;
	}
/*controller.getParent=function(layer){//пробежка по Controller_getWorkLayers не гарантирует правильного родителя
	if(typeof(layer['parent']))!='undefined')return layer['parent'];
	var ls=[Controller.getAllLayers(),Controller.getWorkLayers()];
	layer['parent']=Controller.run(ls,function(l,parent){
		if(layer===l)return parent;
	});
	if(!layer['parent'])layer['parent']=false;
	return layer['parent'];
}*/
Controller.checkNow = function () {

};

window.Controller = window.infrajs = Controller
export {Controller}