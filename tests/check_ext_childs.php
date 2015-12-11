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
$ans['title'] = 'check_ext_childs';

$r=Path::reqif('*controller/infra.php');
if(!$r) Ans::err($ans, 'Требуется infrajs/controller');
Path::req('*crumb/infra.php');


View::html('<div id="main1"></div><div id="main2"></div>', true);
$layers = Load::loadJSON('*crumb/tests/resources/check_ext_childs.json');

Crumb::change('test');
$html = Controller::check($layers);
preg_match_all('/x/', $html, $matches);
$count = sizeof($matches[0]);
$countneed = 2;

if ($count != $countneed) return Ans::err($ans, 'line:'.__LINE__.' '.$count);	

return Ans::ret($ans, 'ret');

