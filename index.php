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

Config::init();
Nostore::init(); //Заголовки кэша по умолчанию
Access::modified();
Access::headers();
$query=Path::init();
header('Infrajs-Cache: true');
$html = Access::cache('index.php', function ($query) {
	header('Infrajs-Cache: false');	
	$conf = Config::get('controller');
	return Controller::check($conf['index']);//В infra_html были добавленыs все указаные в layers слои
}, array($query));

/*
echo '<pre>';
print_r(get_declared_classes());
exit;
*/

echo $html;
