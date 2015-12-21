<?php
namespace infrajs\controller;

use infrajs\config\Config;
use infrajs\path\Path;

if (!is_file('vendor/autoload.php')) {
	chdir('../../../');	
}
require_once('vendor/autoload.php');

Path::$conf['sefurl']=true;

Config::init();

Path::req('-controller/index.php');

