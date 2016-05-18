<?php
	namespace infrajs\controller;
	use infrajs\router\Router;
	use infrajs\load\Load;
	if (!is_file('vendor/autoload.php')) {
		chdir('../../../../');
		require_once('vendor/autoload.php');
		Router::init();
	}
	$data = Controller::$conf['index'];
	Run::exec($data, function(&$layer){
		while (@$layer['external'] && !Layer::pop($layer, 'onlyclient')) {
			$ext = &$layer['external'];
			External::checkExt($layer, $ext);
		}
	});
	$data = Load::json_decode($data);
?>
infrajs.checkAdd(<?php echo $data?>);
Event.handler('Crumb.onchange', function () {
	infrajs.check();
}, 'infrajs');