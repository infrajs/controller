<?php
namespace infrajs\controller;
use infrajs\path\Path;

if (!is_file('vendor/autoload.php')) {
	chdir('../../../');	
}
require_once('vendor/autoload.php');

Path::$conf['sefurl']=true;

$html=Controller::init();

echo $html;
