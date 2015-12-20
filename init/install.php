<?php
namespace infrajs\access;

use infrajs\event\Event;

Event::handler('oninstall', function () {
	header('Infra-Update: OK');
});