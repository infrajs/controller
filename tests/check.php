<?php

use infrajs\controller\Controller;

$ans = array();
$ans['title'] = 'проверка функции Controller::check';

infra_html('<div id="oh"></div>');

infra_require('*controller/make.php');
$layer = array('tpl' => array('хой'),'div' => 'oh');
Controller::check($layer);

$html = infra_html();

if ($html != '<div id="oh">хой</div>') {
	return infra_err($ans, 'ошибка');
}

return infra_ret($ans, 'работает');
