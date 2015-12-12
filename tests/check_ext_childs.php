<?php

namespace infrajs\controller;
use infrajs\infra\Infra;
use infrajs\view\View;
use infrajs\load\Load;
use infrajs\ans\Ans;



if (!is_file('vendor/autoload.php')) {
    chdir('../../../../');
    require_once('vendor/autoload.php');
}

$ans = array();
$ans['title'] = 'check_ext_childs';

Infra::req('controller');


View::html('<div id="main1"></div><div id="main2"></div>', true);
$layers = Load::loadJSON('*controller/tests/resources/check_ext_childs.json');
Crumb::change('test');

$html = Controller::check($layers);
preg_match_all('/x/', $html, $matches);
$count = sizeof($matches[0]);
$countneed = 2;

if ($count != $countneed) return Ans::err($ans, 'line:'.__LINE__.' '.$count);	

return Ans::ret($ans, 'ret');

