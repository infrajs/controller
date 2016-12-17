
//Обработка onshow и onhide, tpl, data
//onlyclient - парсить  на клиенте при первом запуске
//onlyserver - не показывать слой
//json
//tpl
//tpls
//tplroot



infrajs.tplrootTpl=function(layer){
	var prop='tplroot';
	var proptpl=prop+'tpl';
	if(!layer[proptpl])return;
	var p=layer[proptpl];
	if(layer[proptpl].constructor===Array){
		p=infra.template.parse(p,layer);
		layer[prop]=[p];
	}else{
		p=infra.template.parse([p],layer);
		layer[prop]=p;
	}
}
infrajs.tpldatarootTpl=function(layer){
	var prop='dataroot';
	var proptpl=prop+'tpl';
	if(!layer[proptpl])return;
	var p=layer[proptpl];
	p=infra.template.parse([p],layer);
	layer[prop]=p;
}

infrajs.tplTpl=function(layer){
	var prop='tpl';
	var proptpl=prop+'tpl';
	if(!layer[proptpl])return;
	var p=layer[proptpl];
	if(layer[proptpl].constructor===Array){
		p=infra.template.parse(p,layer);
		layer[prop]=[p];
	}else{
		p=infra.template.parse([p],layer);
		layer[prop]=p;
	}
}
infrajs.tplJson=function(layer){
	var prop='json';
	var proptpl=prop+'tpl';
	if(!layer[proptpl])return;
	var p=layer[proptpl];
	if(layer[proptpl].constructor===Array){
		p=infra.template.parse(p,layer);
		layer[prop]=[p];
	}else{
		p=infra.template.parse([p],layer);
		layer[prop]=p;
	}
}
infrajs.tplonlyclient = function(layer){
	var parent = layer;
	while (parent){
		if (parent['onlyclient']) return true;
		parent = parent['parent'];
	}
}
infrajs.getData=function(layer){
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
infrajs.getTpl=function(layer){
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
infrajs.getHtml=function(layer){//Вызывается как для основных так и для подслойв tpls frame.
	if(layer.data||layer.json||layer.tplsm||layer.tplroot){
		var tpls=infra.template.make(layer.tpl);//С кэшем перепарсивания
		
		infrajs.com=infra.com;
		var repls=[];//- подшаблоны для замены, Важно, что оригинальный распаршеный шаблон не изменяется
		infra.fora(layer.tplsm,function(tm){//mix tpl
			var t=infra.template.make(tm);//С кэшем перепарсивания
			repls.push(t);
			//for(var i in t)repls[i]=t[i];//Нельзя подменять в оригинальном шаблоне, который в других местах может использоваться без подмен
			//^ из-за этого обработчики указанные в tplsm срабатывают постоянно, так как нельзя поставить отметку о том что обработчик сохранён
		});
		layer.data=this.getData(layer);//подменили строку data на объект data
		infra.template.includes(tpls, layer.data, layer.dataroot);
		var html=infra.template.exec([repls,tpls],layer,layer.tplroot,layer.dataroot);
	}else{
		var tpl=this.getTpl(layer);
		infrajs.com=infra.com;
		var html=tpl;
	}
	
	if(!html)html='';
	return html;
}
infrajs.ignoreFirst=function(layer){//depricated
	return infrajs.ignoreDOM(layer);
}
infrajs.ignoreDOM=function(layer){//onlyclient //после какого момента нужно возвращать результат true или false. на чём останавливаться.
	
	//Вообще полный и постоянный игнор не предусмотрен, только при первой пробежке в случае если нет onlyclient
	var store=infrajs.store();
	var first=store['counter']===1;
	var conf=infra.conf;
	

	
	if (!first) return false;//Значит сервера небыло впринципе

	if (layer && infrajs.tplonlyclient(layer)) return false;

	
	return first;
}

infrajs.tplJsonCheck=function(layer){
	if(typeof(layer.jsoncheck)=='undefined')return;
	var data=infrajs.getData(layer);
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