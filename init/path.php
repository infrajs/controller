<?php
namespace infrajs\template;
use infrajs\event\Event;
use infrajs\path\Path;

//При инсталяции создание папок cache и data
Event::handler('oninstall', function () {
	Path::mkdir(Path::$conf['cache']);
	Path::mkdir(Path::$conf['data']);
});
