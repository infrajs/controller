import { Controller } from '/vendor/infrajs/controller/src/Controller.js'
import { Load } from '/vendor/infrajs/load/Load.js'
import { Each } from '/vendor/infrajs/each/Each.js'
//Свойство external
//unick:(number),//Уникальное обозначение слоя
//Нужно для уникальной идентификации какого-то слоя. Для хранения данных слоя в глобальной области при генерации слоя на сервере и его отсутствия на клиенте. Slide

let External = {};
let counter = 1000;
External.unickCheck = function (layer) {
	if (!layer.id) layer.id = ++counter;
	Controller.ids[layer.id] = layer;
	if (layer.name) Controller.names[layer.name] = layer;
}
External.props = { //Расширяется в env.js
	'div': function (now, ext) {
		return ext;
	},
	'layers': function (now, ext) {
		if (!now) now = [];
		else if (now.constructor !== Array) now = [now];
		infra.fora(ext, function (e) {//Каждый элемент в layers должен попасть в отдельный слой, а не объединитсья в один
			now.push({ external: e });
		});
		return now;
	},
	'external': function (now, ext) {//Используется в global.js, css
		if (!now) now = [];
		else if (now.constructor !== Array) now = [now];
		now.push(ext);
		return now;
	},
	'config': function (now, ext, layer) {//object|string any
		if (ext && typeof (ext) == 'object' && ext.constructor != Array) {
			if (!now) now = {};
			for (var j in ext) {
				if (!ext.hasOwnProperty(j)) continue;
				if (now.hasOwnProperty(j) && now[j] !== undefined) continue;
				now[j] = ext[j];
			}
		} else {
			if (now === undefined) now = ext;
		}
		return now;
	}
}
External.add = function (name, func) {
	External.props[name] = func;
}

External.check = function (layer) {
	while (layer.external) {
		var ext = layer.external;
		this.checkExt(layer, ext);
	}
}
External.merge = function (layer, external, i) {//Используется в configinherit
	if (external[i] === layer[i]) {
	} else if (this.props[i]) {
		var func = this.props[i];
		while (typeof (func) == 'string') {//Указана не сама обработка а свойство с такойже обработкой
			func = this.props[func];
		}
		layer[i] = func.apply(Controller, [layer[i], external[i], layer, external, i]);
	} else if (typeof (external[i]) == 'function') {//Функции вызываются сначало у описания потом у external потому что external добавляется потом
		if (layer[i] === undefined) layer[i] = external[i];
	} else {
		if (layer[i] === undefined) layer[i] = external[i];
	}
}
External.checkExt = function (layer, external) {
	if (!external) return;
	delete layer.external;
	/* ie изменить порядок неудаётся
	//-------- Управляем порядком свойств в слое
		var tlayer={};
		for(var i in layer){ if(!layer.hasOwnProperty(i))continue;
			if(i=='external'){
				delete layer[i];//Всё что до external остаётся в томже порядке, всё что после будет после свойств external
			}else if(!layer['external']){
				tlayer[i]=layer[i];

				delete layer[i];
			}
		}
		infra.fora(external,function(external){
			if(typeof(external)=='string')var external=Load.loadJSON(external);

			if(external)for(var i in external){
				if(typeof(layer[i])!=='undefined')continue;//Свойство было указано до external и не удалялось
				layer[i]=undefined;//создали пустые свойства в новом порядке. 
			}
		});
		for(var i in tlayer){ if(!tlayer.hasOwnProperty(i))continue;//Вернули родные свойства обратно но уже в нужном порядке
			layer[i]=tlayer[i];
		}
	//-----------
	*/

	infra.fora(external, function (external) {
		if (typeof (external) == 'string') var external = Load.loadJSON(external);
		//Есть или нет external проверяется на случай ошибок или отсутствия файла external	
		if (external) for (var i in external) {
			External.merge(layer, external, i);
		}
	});
}


window.External = External
export { External }