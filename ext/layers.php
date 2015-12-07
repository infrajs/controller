<?php

//Свойство layers
namespace infrajs\controller\ext;

use infrajs\controller\Controller;

class layers
{
	public static function init()
	{
		global $infrajs;
		Event::waitg('oninit', function () {
			Controller::runAddList('layers');
		});
	}
}
