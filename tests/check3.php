<?php

use infrajs\controller\Controller;
use infrajs\infra;

$ans = array();
$ans['title'] = 'check3';

Path::req('*controller/make.php');

View::html('<div id="main"></div>', true);

$layers = Load::loadJSON('*controller/tests/resources/check3.json');

controller\ext\Crumb::change('test');

Controller::check($layers);

$html = View::html();
preg_match_all('/x/', $html, $matches);
$count = sizeof($matches[0]);
$countneed = 4;

if ($count == $countneed) {
	return Ans::ret($ans, 'ret');
}

return Ans::err($ans, 'err');
