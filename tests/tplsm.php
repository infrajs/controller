<?php
namespace infrajs\controller;

use infrajs\controller\Controller;
use infrajs\controller\Run;
use infrajs\view\View;
use infrajs\ans\Ans;
use infrajs\template\Template;
use infrajs\path\Path;

if (!is_file('vendor/autoload.php')) {
    chdir('../../../../');
    require_once('vendor/autoload.php');
}
$ans=array();

$obj = array();
$obj['tpl'] = array('1{:add}');
$obj['tplsm'] = array('{add:}2');
$obj['data'] = array('asdf' => 1);

$tpls = Template::make($obj['tpl']);//С кэшем перепарсивания

$repls = array();
$t = Template::make($obj['tplsm']);
$repls[] = $t;
$alltpls = array(&$repls,&$tpls);

$html = Template::exec($alltpls, $obj['data']);

if ($html != '12') {
	return Ans::err($ans, 'err');
}

return Ans::ret($ans, 'ret');
