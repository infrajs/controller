import { Each } from '/vendor/infrajs/each/Each.js'
import { Event } from '/vendor/infrajs/event/Event.js'
import { Fire } from '/vendor/akiyatkin/load/Fire.js'
import { Layer } from '/vendor/infrajs/controller/src/Layer.js'
import { DOM } from '/vendor/akiyatkin/load/DOM.js'

let Controller = { ...Fire }

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


Controller.ids = {};
Controller.names = {};
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
			await DOM.wait('load')
			var store = Controller.store();
			//процесс характеризуется двумя переменными process и timer... true..true..false.....false
			store.counter++;
			await Controller.on('init')

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
			Event.fire('Controller.oninit') //loader
			
			
			

			await Controller.runa(Controller.getWorkLayers(), async (layer, parent) => {//Запускается у всех слоёв в работе которые wlayers
				if (parent) layer['parent'] = parent;//Не обрабатывается ситуация когда check снутри иерархии
				Event.fire('Layer.oninit', layer);//устанавливается state
				await Layer.on('init', layer)
				if (Event.fire('Layer.ischeck', layer)) {
					Event.fire('Layer.oncheck', layer);//нельзя запускать is show так как ожидается что все oncheckb сделаются и в is будут на их основе соответствующие проверки
				}
			});//разрыв нужен для того чтобы можно было наперёд определить показывается слой или нет. oncheck у всех. а потом по порядку.

			await Controller.on('check')
			Event.fire('Controller.oncheck');//момент когда доступны слои для подписки и какой-то обработки, доступен unick

			await Controller.runa(Controller.getWorkLayers(), async (layer) => {//С чего вдруг oncheck у всех слоёв.. надо только у активных
				if (Event.fire('Layer.isshow', layer)) {
					
					if (!Event.fire('Layer.isrest', layer)) {
						await Layer.tikon('show', layer)
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
	Each.exec(layers, function (layer) {
		if (infra.fora(store.alayers, function (rl) {
			if (rl === layer) return true;
		})) return;
		store.alayers.push(layer);//Только если рассматриваемый слой ещё не добавлен
	});
};


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
	r = Each.exec(layers, function (layer) {
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
	return store['counter'] == cache['counter'];//Если слой в работе метки будут одинаковые
}
Controller.isParent = function (layer, parent) {
	while (layer) {
		if (parent === layer) return true;
		layer = layer.parent;
	}
	return false;
}


Controller.isSaveBranch = function (layer, val) {
	if (typeof (val) !== 'undefined') layer.is_save_branch = val;
	return layer.is_save_branch;
}
Controller.checkNow = function () {

};



window.Controller = Controller
export { Controller }