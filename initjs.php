<?php

require_once __DIR__.'/../infra/Infra.php';
infra_admin_modified();
$re = isset($_GET['re']);
$html = infra_admin_cache('infra_initjs_php', function ($str) {
	global $infra;
	$loadTEXT = function ($path) {
		$html = infra_loadTEXT($path);
		$html = 'infra.store("loadTEXT")["'.$path.'"]={value:"'.$html.'",status:"pre"};'; //код отметки о выполненных файлах
		return $html;
	};
	$loadJSON = function ($path) {
		$obj = infra_loadJSON($path);
		$html = 'infra.store("loadJSON")["'.$path.'"]={value:'.infra_json_encode($obj).',status:"pre"};'; //код отметки о выполненных файлах
		return $html;
	};
	$require = function ($path) {
		$html = "\n\n".'//requrie '.$path."\n";
		$html .= infra_loadTEXT($path).';';
		$html .= 'infra.store("require")["'.$path.'"]={value:true};'; //код отметки о выполненных файлах
		return $html;
	};
	$infra['require']=$require;
	$infra['loadJSON']=$loadJSON;
	$infra['loadTEXT']=$loadTEXT;

	$html = '';

	$html .= $require('*infrajs/ext/once.js');//

	$html .= $require('*infrajs/ext/Crumb.js');//
	$html .= $require('*infrajs/ext/external.js');//
	$html .= $require('*infrajs/ext/env.js');//

	$html .= $require('*infrajs/ext/subs.js');
	$html .= $require('*infrajs/ext/divparent.js');

	//$html.=$require('*infrajs/ext/proptpl.js');//После external
	$html .= $require('*infrajs/ext/tpl.js');//
	$html .= $require('*infrajs/ext/parsed.js');//
	$html .= $require('*infrajs/ext/div.js');//После subs, до tpl
	$html .= $require('*infrajs/ext/autoview.js');
	$html .= $require('*infrajs/ext/code.js');
	$html .= $require('*infrajs/ext/css.js');
	$html .= $require('*infrajs/ext/js.js');
	$html .= $require('*infrajs/ext/layers.js');
	$html .= $require('*infrajs/ext/unick.js');//
	$html .= $require('*infrajs/ext/is.js');//
	$html .= $require('*infrajs/ext/show.js');//
	$html .= $require('*infrajs/ext/config.js');//


	$html .= $require('*infra/ext/tablecommon.js');

	$html .= $require('*infrajs/ext/scroll.js');

	$html .= $require('*seo/seo.ext.js');
	$html .= $require('*infrajs/ext/global.js');

	$html .= $require('*infrajs/ext/onsubmit.js');
	$html .= $require('*infrajs/ext/autosave.js');
	$html .= $require('*popup/popup.js');
	$html .= $require('*contacts/showContacts.js');
	$html .= $require('*session/session.js');
	$html .= $require('*infrajs/ext/session.js');
	$html .= $require('*infrajs/ext/autofocus.js');
	$html .= $require('*infrajs/make.js');

	$conf=infra_config();
	foreach ($conf['infrajs_jsexts'] as $path => $val) {
		$html .= $require($path);
	}


	if (isset($_GET['loadJSON'])) {
		$ts = explode(',', $_GET['loadJSON']);
		for ($i = 0, $l = sizeof($ts); $i < $l; ++$i) {
			if (!$ts[$i]) {
				continue;
			}
			$html .= $loadJSON($ts[$i]);
		}
	}
	if (isset($_GET['loadTEXT'])) {
		$ts = explode(',', $_GET['loadTEXT']);
		for ($i = 0, $l = sizeof($ts); $i < $l; ++$i) {
			if (!$ts[$i]) {
				continue;
			}
			$html .= $loadTEXT($ts[$i]);
		}
	}
	$infra['js'] = $html;
	infra_fire($infra, 'oninitjs');
	return $infra['js'];
}, array($_SERVER['QUERY_STRING']), $re);
@header('content-type: text/javascript; charset=utf-8');
echo $html;
