
infrajs.setCrumb=function(layer,name,value){
	if(!layer.dyn)layer.dyn={};
	layer.dyn[name]=value;
	var root=layer.parent?layer.parent[name]:infra.Crumb.getInstance();//От родителя всегда сможем наследовать

	
	if(layer.dyn[name])layer[name]=root.getInstance(layer.dyn[name]);
	else layer[name]=root;
}