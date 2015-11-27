<?php

chdir('../../../');
require_once('vendor/autoload.php');


require_once('vendor/infrajs/infra/Infra.php');

$conf=infra_config();

infrajs\controller\Controller::init($conf['controller']['index']);
