
infrajs.checkAdd(infra.conf.controller.index);
Event.handler('Crumb.onchange', function () {
	infrajs.check();
}, 'infrajs');