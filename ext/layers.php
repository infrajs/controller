<?php

//Свойство layers
namespace infrajs\infrajs\ext;

use infrajs\controller\Controller;

class layers
{
	public static function init()
	{
		global $infrajs;
		infra_wait($infrajs, 'oninit', function () {
			infrajs::runAddList('layers');
		});
	}
}
