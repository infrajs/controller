<?php
namespace infrajs\controller;
use infrajs\ans\Ans;
use infrajs\path\Path;
use infrajs\view\View;

if (!is_file('vendor/autoload.php')) {
	chdir('../../../../');	
	require_once('vendor/autoload.php');
}

$ans = array('title' => 'Проверки контроллера');


Path::req('*controller/infra.php');
Path::req('*layer-div/infra.php');
Path::req('*layer-tpl/infra.php');

$layer = array(
	'data' => 1,
	'tpl' => array('qewr{data}')
);

$html = Controller::check($layer);

if ($html != 'qewr1') return Ans::err($ans,'Результат неожиданный');

return Ans::ret($ans);