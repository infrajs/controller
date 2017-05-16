
//Обработка onshow и onhide, tpl, data
//onlyclient - парсить  на клиенте при первом запуске
//onlyserver - не показывать слой
//json
//tpl
//tpls
//tplroot



Controller.tplrootTpl=function(layer){
	var prop='tplroot';
	var proptpl=prop+'tpl';
	if(!layer[proptpl])return;
	var p=layer[proptpl];
	if(layer[proptpl].constructor===Array){
		p=Template.parse(p,layer);
		layer[prop]=[p];
	}else{
		p=Template.parse([p],layer);
		layer[prop]=p;
	}
}
Controller.tpldatarootTpl=function(layer){
	var prop='dataroot';
	var proptpl=prop+'tpl';
	if(!layer[proptpl])return;
	var p=layer[proptpl];
	p=Template.parse([p],layer);
	layer[prop]=p;
}

Controller.tplTpl=function(layer){
	var prop='tpl';
	var proptpl=prop+'tpl';
	if(!layer[proptpl])return;
	var p=layer[proptpl];
	if(layer[proptpl].constructor===Array){
		p=Template.parse(p,layer);
		layer[prop]=[p];
	}else{
		p=Template.parse([p],layer);
		layer[prop]=p;
	}
}
Controller.tplJson=function(layer){
	var prop='json';
	var proptpl=prop+'tpl';
	if(!layer[proptpl])return;
	var p=layer[proptpl];
	if(layer[proptpl].constructor===Array){
		p=Template.parse(p,layer);
		layer[prop]=[p];
	}else{
		p=Template.parse([p],layer);
		layer[prop]=p;
	}
}
Controller.tplonlyclient = function(layer){
	var parent = layer;
	while (parent){
		if (parent['onlyclient']) return true;
		parent = parent['parent'];
	}
}
Controller.getData=function(layer){
	//Используется в propcheck.js
	if(typeof(layer.json)=='undefined')return layer.data;
	var data=layer.json;//Может быть и undefined
	if(data&&data.constructor===Array){//Если массив то это просто строка в виде данных
		data=infra.loadTEXT(data[0]);
	}else if(typeof(data)==='string'){
		data=infra.loadJSON(data);//Забираем для текущего клиента что-то..
	}
	return data;
}
Controller.getTpl=function(layer){
	var tpl=layer.tpl;
	if(typeof(tpl)=='string'){
		tpl=infra.loadTEXT(tpl);//M доп параметры после :
	}else if(tpl&&tpl.constructor==Array){
		tpl=tpl[0];
	}else{
		tpl='';
	}
	if(!tpl)tpl='';
	return tpl;
};
Controller.getHtml=function(layer){//Вызывается как для основных так и для подслойв tpls frame.
	if (layer.data || layer.json || layer.tplsm || layer.tplroot) {
		var tpls=Template.make(layer.tpl);//С кэшем перепарсивания
		var repls = [];//- подшаблоны для замены, Важно, что оригинальный распаршеный шаблон не изменяется
		Each.exec(layer.tplsm, function(tm) { //mix tpl
			var t = Template.make(tm);//С кэшем перепарсивания
			repls.push(t);
			//for(var i in t)repls[i]=t[i];//Нельзя подменять в оригинальном шаблоне, который в других местах может использоваться без подмен
			//^ из-за этого обработчики указанные в tplsm срабатывают постоянно, так как нельзя поставить отметку о том что обработчик сохранён
		});
		layer.data = Controller.getData(layer); //подменили строку data на объект data
		tpls = Template.includes(tpls, layer, layer.dataroot);
		var html = Template.exec([repls, tpls], layer, layer.tplroot, layer.dataroot);
	}else{
		var tpl = Controller.getTpl(layer);
		
		var html = tpl;
	}
	
	if (!html) html='';
	return html;
}
Controller.ignoreFirst=function(layer){//depricated
	return Controller.ignoreDOM(layer);
}
Controller.ignoreDOM=function(layer){//onlyclient //после какого момента нужно возвращать результат true или false. на чём останавливаться.
	
	//Вообще полный и постоянный игнор не предусмотрен, только при первой пробежке в случае если нет onlyclient
	var store=Controller.store();
	var first=store['counter']===1;
	var conf=infra.conf;
	

	
	if (!first) return false;//Значит сервера небыло впринципе

	if (layer && Controller.tplonlyclient(layer)) return false;

	
	return first;
}

Controller.tplJsonCheck=function(layer){
	if(typeof(layer.jsoncheck)=='undefined')return;
	var data=Controller.getData(layer);
	if(layer.jsoncheck){//Если true значит да только если данные есть
		if(!data||(typeof(data.result)!=='undefined'&&!data.result)){
			layer.is_save_branch = false;
			return false;
		}
	}else if(!layer.jsoncheck){//Если false Значит да только если данных нет
		if(data&&(typeof(data.result)=='undefined'||data.result)){
			layer.is_save_branch = false;
			return false;
		}
	}
};