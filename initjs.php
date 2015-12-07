<?php

require_once __DIR__.'/../infra/Infra.php';
infra_admin_modified();
$re = isset($_GET['re']);
$html = infra_admin_cache('infra_initjs_php', function ($str) {
	global $infra;
	$loadTEXT = function ($path) {
		$html = Load::loadTEXT($path);
		$html = 'infra.store("loadTEXT")["'.$path.'"]={value:"'.$html.'",status:"pre"};'; //код отметки о выполненных файлах
		return $html;
	};
	$loadJSON = function ($path) {
		$obj = Load::loadJSON($path);
		$html = 'infra.store("loadJSON")["'.$path.'"]={value:'.infra_json_encode($obj).',status:"pre"};'; //код отметки о выполненных файлах
		return $html;
	};
	$require = function ($path) {
		$html = "\n\n".'//requrie '.$path."\n";
		$html .= Load::loadTEXT($path).';';
		$html .= 'infra.store("require")["'.$path.'"]={value:true};'; //код отметки о выполненных файлах
		return $html;
	};
	$infra['require']=$require;
	$infra['loadJSON']=$loadJSON;
	$infra['loadTEXT']=$loadTEXT;

	$html = 'define(["?*once/once.js","?*infra/js.php"], function(){ ';

	$html .= $require('*controller/ext/once.js');//

	$html .= $require('*controller/ext/Crumb.js');//
	$html .= $require('*controller/ext/external.js');//
	$html .= $require('*controller/ext/env.js');//

	$html .= $require('*controller/ext/subs.js');
	$html .= $require('*controller/ext/divparent.js');

	//$html.=$require('*controller/ext/proptpl.js');//После external
	$html .= $require('*controller/ext/tpl.js');//
	$html .= $require('*controller/ext/parsed.js');//
	$html .= $require('*controller/ext/div.js');//После subs, до tpl
	$html .= $require('*controller/ext/autoview.js');
	$html .= $require('*controller/ext/code.js');
	$html .= $require('*controller/ext/css.js');
	$html .= $require('*controller/ext/js.js');
	$html .= $require('*controller/ext/layers.js');
	$html .= $require('*controller/ext/unick.js');//
	$html .= $require('*controller/ext/is.js');//
	$html .= $require('*controller/ext/show.js');//
	$html .= $require('*controller/ext/config.js');//


	$html .= $require('*infra/ext/tablecommon.js');

	$html .= $require('*seo/seo.ext.js');
	$html .= $require('*controller/ext/global.js');

	$html .= $require('*controller/ext/onsubmit.js');
	$html .= $require('*controller/ext/autosave.js');
	$html .= $require('*popup/popup.js');
	$html .= $require('*contacts/showContacts.js');
	$html .= $require('*session/session.js');
	$html .= $require('*controller/ext/session.js');
	$html .= $require('*controller/ext/autofocus.js');
	$html .= $require('*controller/make.js');

	$conf=Infra::config();
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
	Event::fireg('oninitjs');
	$infra['js'] .= '; return infrajs })';
	return $infra['js'];
}, array($_SERVER['QUERY_STRING']), $re);
@header('content-type: text/javascript; charset=utf-8');
echo $html;
