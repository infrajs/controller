define('?*controller/init.js', 
	[
		'?*once/once.js',
		'?*infra/js.php',
		'?*controller/initjs.php',
		'?*jquery/jquery.min.js'
	], function(once, infra, infrajs) {
		infrajs.checkAdd(infra.conf.controller.index);

		infra.handle(infra.Crumb, 'onchange', function(){
			infrajs.check();
		});

		require(['vendor/twbs/bootstrap/dist/js/bootstrap.min.js']);
	}
);