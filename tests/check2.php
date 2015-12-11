<?php

use infrajs\controller\Controller;
use infrajs\view\View;
use infrajs\ans\Ans;
use infrajs\crumb\Crumb;
use infrajs\path\Path;
use infrajs\load\Load;



if (!is_file('vendor/autoload.php')) {
    chdir('../../../../');
    require_once('vendor/autoload.php');
}

$r=Path::reqif('*controller/infra.php');

if(!$r) Ans::err($ans, 'Требуется infrajs/controller');
echo 1;
Path::req('*crumb/infra.php');
exit;
Crumb::change('test');


$ans = array();
$ans['title'] = 'Проверка чек';

View::html('<div id="main"></div>');

$layers = Load::loadJSON('*crumb/tests/resources/check2.json');
$html = Controller::check($layers);

preg_match_all('/x/', $html, $matches);
$count = sizeof($matches[0]);

if ($count != 4) {
	return Ans::err($ans, 'Нет '.$count);
}

return Ans::ret($ans, 'daa');
