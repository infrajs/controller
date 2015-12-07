<?php

use infrajs\controller\Controller;

infrajs\controller\ext\Crumb::change('test');
Path::req('*controller/make.php');

$ans = array();
$ans['title'] = 'проверка чек';

View::html('<div id="main"></div>');

$layers = Load::loadJSON('*controller/tests/resources/check2.json');
Controller::check($layers);

$layer = &$layers['layers'];

$html = View::html();

preg_match_all('/x/', $html, $matches);
$count = sizeof($matches[0]);

if ($count != 4) {
	return Ans::err($ans, 'нууль '.$count);
}

return Ans::ret($ans, 'daa');
