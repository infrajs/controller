<?php
namespace infrajs\access;

use infrajs\event\Event;

Event::handler('oninstall', function () {
	Access::adminSetTime();
},'access:mem');