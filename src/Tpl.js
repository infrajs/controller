import { Template } from '/vendor/infrajs/template/Template.js'
import { Load } from '/vendor/akiyatkin/load/Load.js'
//Обработка onshow и onhide, tpl, data
//onlyclient - парсить  на клиенте при первом запуске
//onlyserver - не показывать слой
//json
//tpl
//tpls
//tplroot

let Tpl = {}

Tpl.rootTpl = function (layer) {
	var prop = 'tplroot';
	var proptpl = prop + 'tpl';
	if (!layer[proptpl]) return;
	var p = layer[proptpl];
	if (layer[proptpl].constructor === Array) {
		p = Template.parse(p, layer);
		layer[prop] = [p];
	} else {
		p = Template.parse([p], layer);
		layer[prop] = p;
	}
}
Tpl.datarootTpl = function (layer) {
	var prop = 'dataroot';
	var proptpl = prop + 'tpl';
	if (!layer[proptpl]) return;
	var p = layer[proptpl];
	p = Template.parse([p], layer);
	layer[prop] = p;
}

Tpl.tpl = function (layer) {
	var prop = 'tpl';
	var proptpl = prop + 'tpl';
	if (!layer[proptpl]) return;
	var p = layer[proptpl];
	if (layer[proptpl].constructor === Array) {
		p = Template.parse(p, layer);
		layer[prop] = [p];
	} else {
		p = Template.parse([p], layer);
		layer[prop] = p;
	}
}
Tpl.json = function (layer) {
	var prop = 'json';
	var proptpl = prop + 'tpl';
	if (!layer[proptpl]) return;
	var p = layer[proptpl];
	if (layer[proptpl].constructor === Array) {
		p = Template.parse(p, layer);
		layer[prop] = [p];
	} else {
		p = Template.parse([p], layer);
		layer[prop] = p;
	}
}
Tpl.onlyclient = function (layer) {
	var parent = layer;
	while (parent) {
		if (parent['onlyclient']) return true;
		parent = parent['parent'];
	}
}
Tpl.getData = async layer => {
	//Используется в propcheck.js
	if (!layer.json) return layer.data
	let data = layer.json //Может быть и undefined
	if (data && data.constructor === Array) {//Если массив то это просто строка в виде данных
		data = await Load.fire('text', data[0])
		//data = OldLoad.loadTEXT(data[0]);
	} else if (typeof (data) === 'string') {
		data = await Load.fire('json', data)
		//data = OldLoad.loadJSON(data);//Забираем для текущего клиента что-то..
	}
	return data;
}
Tpl.getTpl = async layer => {
	var tpl = layer.tpl;
	if (typeof (tpl) == 'string') {
		tpl = await Load.fire('text', tpl)
		//tpl = OldLoad.loadTEXT(tpl);//M доп параметры после :
	} else if (tpl && tpl.constructor == Array) {
		tpl = tpl[0];
	} else {
		tpl = '';
	}
	if (!tpl) tpl = '';
	return tpl;
};
Tpl.getHtml = async layer => {//Вызывается как для основных так и для подслойв tpls frame.
	
	if (layer.data || layer.json || layer.tplsm || layer.tplroot) {
		var tpl = await Tpl.getTpl(layer);
		var tpls = await Template.make([tpl]);//С кэшем перепарсивания
		
		
		var repls = [];//- подшаблоны для замены, Важно, что оригинальный распаршеный шаблон не изменяется
		// Each.exec(layer.tplsm, function (tm) { //mix tpl
		// 	var t = Template.make(tm);//С кэшем перепарсивания
		// 	repls.push(t);
		// 	//for(var i in t)repls[i]=t[i];//Нельзя подменять в оригинальном шаблоне, который в других местах может использоваться без подмен
		// 	//^ из-за этого обработчики указанные в tplsm срабатывают постоянно, так как нельзя поставить отметку о том что обработчик сохранён
		// });
		layer.data = await Tpl.getData(layer); //подменили строку data на объект data
		tpls = Template.includes(tpls, layer, layer.dataroot);
		var html = Template.exec([repls, tpls], layer, layer.tplroot, layer.dataroot);
		
	} else {
		var tpl = await Tpl.getTpl(layer)
		var html = tpl
	}
	if (!html) html = '';
	return html;
}

/*Tpl.ignoreDOM = function (layer) {//onlyclient //после какого момента нужно возвращать результат true или false. на чём останавливаться.
	return false
	//Вообще полный и постоянный игнор не предусмотрен, только при первой пробежке в случае если нет onlyclient
	var store = Controller.store();
	var first = store['counter'] === 1;

	if (!first) return false;//Значит сервера небыло впринципе

	if (layer && Tpl.onlyclient(layer)) return false;


	return first;
}*/

// Tpl.jsonCheck = function (layer) {
// 	if (typeof (layer.jsoncheck) == 'undefined') return;
// 	var data = Tpl.getData(layer);
// 	if (layer.jsoncheck) {//Если true значит да только если данные есть
// 		if (!data || (typeof (data.result) !== 'undefined' && !data.result)) {
// 			layer.is_save_branch = false;
// 			return false;
// 		}
// 	} else if (!layer.jsoncheck) {//Если false Значит да только если данных нет
// 		if (data && (typeof (data.result) == 'undefined' || data.result)) {
// 			layer.is_save_branch = false;
// 			return false;
// 		}
// 	}
// };

window.Tpl = Tpl
export { Tpl }