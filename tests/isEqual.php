<?php

use infrajs\controller\Controller;

$ans = array();
$ans['title'] = 'isEqual';

$l = array('tpl' => 'asdf','test' => 'bad');

$layers = array(&$l);
$msg = 'Maybe good';

Path::req('*controller/make.php');
$layer = &Controller::run($layers, function &(&$layer) use ($msg) {
	$layer['test'] = $msg;

	return $layer;
});

$l['test'] = 'Good';
if ($l['test'] != $layer['test']) {
	return Ans::err($ans, 'err');
}

return Ans::ret($ans, 'ret');
