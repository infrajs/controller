define('/-controller/src/layers.js', ['/-event/event.js'], function () {
	//Свойство layers
	infra.wait(infrajs,'oninit',function(){
		infrajs.runAddList('layers');	
	});
});