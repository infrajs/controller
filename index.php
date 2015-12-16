<?php
namespace infrajs\controller;

if (!is_file('vendor/autoload.php')) {
	chdir('../../../');	
}
require_once('vendor/autoload.php');


$html=Controller::init();

echo $html;
