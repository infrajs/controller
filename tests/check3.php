<?php

use infrajs\controller\Controller;
use infrajs\infra;
use infrajs\path\Path;
use infrajs\view\View;
use infrajs\crumb\Crumb;
use infrajs\load\Load;
use infrajs\ans\Ans;



if (!is_file('vendor/autoload.php')) {
    chdir('../../../../');
    require_once('vendor/autoload.php');
}



$ans = array();
$ans['title'] = 'check3';

$r=Path::reqif('*controller/infra.php');
if(!$r) Ans::err($ans, 'Требуется infrajs/controller');
Path::req('*crumb/infra.php');

View::html('<div id="main"></div>', true);

$layers = Load::loadJSON('*crumb/tests/resources/check3.json');

Crumb::change('test');

$html = Controller::check($layers);

preg_match_all('/x/', $html, $matches);
$count = sizeof($matches[0]);
$countneed = 4;

if ($count != $countneed) return Ans::err($ans, 'Неожиданный результат '.$count);

return Ans::ret($ans, 'ret');

