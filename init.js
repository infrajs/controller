define('/-controller/init.js', ['/-controller/src/infrajs.js'], function (infrajs) {
	console.log('init defined');
	infrajs.checkAdd(infra.conf.controller.index);
	infra.handle(infra.Crumb, 'onchange', function () {
		infrajs.check();
	});
	return infrajs;
});