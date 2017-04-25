//divparent
/*controller.isAdd('show',function(layer){//Слой в divparent обязательно должен показываться, ветка скрывается
		//divparent
		return infrajs.divparentIsShow(layer);
	});
/*controller.divparentIsShow=function(layer){
	if(!layer.divparent)return;
	var store=infrajs.store();
	var l=store.divs[layer.divparent];
	if(!l){
		return;
	}
	if(!Event.fire('Layer.isshow',l)){
		infrajs.isSaveBranch(layer,false);
		return false;
	}
}*/
infrajs.divparentIsRest = function (layer){//Нам нужен массив слоёв по дивам чтобы найти слой показываемый в родительском диве
	if(!layer.divparent) return;
	var store=infrajs.store();
	var l=store.divs[layer.divparent];
	if (!l) return;
	if (!Event.fire('Layer.isrest',l)) return false;
}