<?php

use infrajs\controller\Controller;

infrajs\infra\ext\Crumb::change('test');
infra_require('*controller/make.php');

$ans = array();
$ans['title'] = 'проверка чек';

infra_html('<div id="main"></div>');

$layers = infra_loadJSON('*controller/tests/resources/check2.json');
Controller::check($layers);

$layer = &$layers['layers'];

$html = infra_html();

preg_match_all('/x/', $html, $matches);
$count = sizeof($matches[0]);

if ($count != 4) {
	return infra_err($ans, 'нууль '.$count);
}

return infra_ret($ans, 'daa');
