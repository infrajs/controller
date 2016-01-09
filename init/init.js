
infrajs.checkAdd(infra.conf.controller.index);
Event.handler('Crumb.onchange', function () {
	console.log('infrajs.check(). STOP. Testing');
	return;
	infrajs.check();
});