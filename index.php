<?php
	namespace infrajs\controller;
	use infrajs\load\Load;
	
	$data = Controller::$conf['index'];
	
	Run::exec($data, function &(&$layer) {
		Layer::setId($layer);
		// while (!empty($layer['external']) && !Layer::pop($layer, 'onlyclient')) {
		// 	$ext = &$layer['external'];
		// 	External::checkExt($layer, $ext);
		// }

		// Нужно чтобы нумерация слоёв на сервере совпадала с нумерацией в браузере
		while (!empty($layer['external'])) {
			$ext = &$layer['external'];
			External::checkExt($layer, $ext);
		}
		$r = null;
		return $r;
	});
    $data = Load::json_encode($data);
    
    header('Content-type: application/javascript');
    echo 'export default ';
    echo $data;