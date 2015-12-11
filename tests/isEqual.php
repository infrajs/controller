<?php
namespace infrajs\controller;

use infrajs\controller\Controller;
use infrajs\controller\Run;
use infrajs\view\View;
use infrajs\ans\Ans;
use infrajs\path\Path;

if (!is_file('vendor/autoload.php')) {
    chdir('../../../../');
    require_once('vendor/autoload.php');
}

$ans = array();
$ans['title'] = 'isEqual';

$l = array('tpl' => 'asdf','test' => 'bad');

$layers = array(&$l);
$msg = 'Maybe good';


$layer = &Run::exec($layers, function &(&$layer) use ($msg) {
	$layer['test'] = $msg;

	return $layer;
});

$l['test'] = 'Good';
if ($l['test'] != $layer['test']) {
	return Ans::err($ans, 'err');
}

return Ans::ret($ans, 'ret');
