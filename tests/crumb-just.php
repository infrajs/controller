<?php

namespace infrajs\controller;
use infrajs\infra\Infra;
use infrajs\path\Path;
use infrajs\view\View;
use infrajs\load\Load;
use infrajs\infra\Each;
use infrajs\ans\Ans;



if (!is_file('vendor/autoload.php')) {
    chdir('../../../../');
    require_once('vendor/autoload.php');
}


$ans = array();
$ans['title'] = 'Хлебные крошки';



$obj = Crumb::getInstance('test/check');
$parent = Crumb::getInstance('test');
if (Crumb::$childs['test/check'] !== $obj) {
	return Ans::err($ans, 'Некорректно определяется крошка 1');
}
if (Crumb::$childs['test'] !== $parent) {
	return Ans::err($ans, 'Некорректно определяется крошка 2');
}

if ($obj->parent !== $parent) {
	return Ans::err($ans, 'Некорректно определён parent');
}

Crumb::change('test/hi');
$obj = Crumb::getInstance('test');

if (!$obj->is) {
	return Ans::err($ans, 'Не применилась крошка на втором уровне');
}

$root = Crumb::getInstance();

Crumb::change('');
$crumb = Crumb::getInstance('');
$f = $crumb->query;

Crumb::change('test');

$s = &Crumb::getInstance('some');
$s2 = &Crumb::getInstance('some');
$r = Each::isEqual($s, $s2);

$s = Crumb::$childs;
$r2 = Each::isEqual($s[''], Crumb::getInstance());

$r = $r && $r2;

$crumb = Crumb::getInstance('test');
$crumb2 = Crumb::getInstance('test2');

if (!($f == null && $r && !is_null($crumb->query) && is_null($crumb2->query))) {
	return Ans::err($ans, 'Изменения крошек');
}

Crumb::change('test/test');
$inst = Crumb::getInstance('test/test/test');

return Ans::ret($ans, 'Всё ок');
