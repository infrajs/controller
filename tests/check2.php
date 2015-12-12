<?php
namespace infrajs\controller;
use infrajs\view\View;
use infrajs\ans\Ans;
use infrajs\infra\Infra;
use infrajs\path\Path;
use infrajs\load\Load;



if (!is_file('vendor/autoload.php')) {
    chdir('../../../../');
    require_once('vendor/autoload.php');
}

Infra::req('controller');

Crumb::change('test');


$ans = array();
$ans['title'] = 'Проверка чек';

View::html('<div id="main"></div>');

$layers = Load::loadJSON('*controller/tests/resources/check2.json');
$html = Controller::check($layers);

preg_match_all('/x/', $html, $matches);
$count = sizeof($matches[0]);

if ($count != 4) {
	return Ans::err($ans, 'Нет '.$count);
}

return Ans::ret($ans, 'daa');
