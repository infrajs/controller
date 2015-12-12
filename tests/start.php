<?php
namespace infrajs\controller;
use infrajs\ans\Ans;
use infrajs\path\Path;
use infrajs\view\View;
use infrajs\load\Load;
use infrajs\infra\Infra;

if (!is_file('vendor/autoload.php')) {
	chdir('../../../../');	
	require_once('vendor/autoload.php');
}

$ans = array('title' => 'Проверки контроллера');




Infra::req('controller');

$layer = array(
	'data' => 1,
	'tpl' => array('qewr{data}')
);
View::html('',true);
Crumb::change('');
$html = Controller::check($layer);

if ($html != 'qewr1') return Ans::err($ans,'Результат неожиданный '.$html);

return Ans::ret($ans);