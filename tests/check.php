<?php
namespace infrajs\controller;

use infrajs\controller\Controller;
use infrajs\view\View;
use infrajs\ans\Ans;
use infrajs\path\Path;
use infrajs\crumb\Crumb;

if (!is_file('vendor/autoload.php')) {
    chdir('../../../../');
    require_once('vendor/autoload.php');
}

$ans = array();
$ans['title'] = 'Проверка функции Controller::check';


View::html('<div id="oh"></div>');


Path::req('*controller/infra.php');

//Нужно инициализировать Crumb с Контроллером, crumb может работать самостоятельно.
Crumb::init();

$layer = array('tpl' => array('хой<div id="test"></div>'),'div' => 'oh');
$html=Controller::check($layer);
if ($html != '<div id="oh">хой<div id="test"></div></div>') return Ans::err($ans, 'Ошибка');


$layer = array('tpl' => array('опа'),'div' => 'test');
$html=Controller::check($layer);
if ($html != '<div id="oh">хой<div id="test">опа</div></div>') return Ans::err($ans, 'Ошибка '.$html);


return Ans::ret($ans, 'Работает две генерации');
