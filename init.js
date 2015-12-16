define('?-controller/init.js', function () {
		infrajs.checkAdd(infra.conf.controller.index);

		infra.handle(infra.Crumb, 'onchange', function () {
			infrajs.check();
		});

		require(['vendor/twbs/bootstrap/dist/js/bootstrap.min.js']);
	}
);