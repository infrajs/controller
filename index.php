<?php
namespace infrajs\controller;

use infrajs\config\Config;
use infrajs\path\Path;
use infrajs\nostore\Nostore;
use infrajs\access\Access;

if (!is_file('vendor/autoload.php')) {
	chdir('../../../');	
}
require_once('vendor/autoload.php');

//Считывается .infra.json из корня и из данных
//Новые классы тянут за собой теперь и конфиги .infra.json автоматически
Config::init();

//По дате последней авторизации админа выход если нет изменений
Access::modified();

//Заголовки кэша по умолчанию или public или no-cache
Nostore::init();

//Справочные заголовки о правах текущего пользователя
Access::headers();

$query=Path::init();
header('Infrajs-Cache: true');
$html = Access::cache('index.php', function ($query) {
	header('Infrajs-Cache: false');	
	$conf = Config::get('controller');
	return Controller::check($conf['index']);
}, array($query));

echo $html;
