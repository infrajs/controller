<?php

use infrajs\controller\Controller;
use infrajs\view\View;
use infrajs\path\Path;

$ans = array();
$ans['title'] = 'проверка функции Controller::check';

View::html('<div id="oh"></div>');

Path::req('*controller/make.php');
$layer = array('tpl' => array('хой'),'div' => 'oh');
Controller::check($layer);

$html = View::html();

if ($html != '<div id="oh">хой</div>') {
	return Ans::err($ans, 'ошибка');
}

return Ans::ret($ans, 'работает');
