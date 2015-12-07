<?php

namespace infrajs\controller\ext;

use infrajs\infra;
Path::req('*session/session.php');
class session
{
	public static function init()
	{
		global $infrajs;
		Event::waitg('oninit', function () {//интеграция session template
			
			global $infra_template_scope;
			$cl = function ($name, $def = null) { return infra_session_get($name, $def); };
			Sequence::set($infra_template_scope, Sequence::right('infra.session.get'), $cl);

			$cl = function () { return infra_session_getLink(); };
			Sequence::set($infra_template_scope, Sequence::right('infra.session.getLink'), $cl);

			$cl = function () { return infra_session_getTime(); };
			Sequence::set($infra_template_scope, Sequence::right('infra.session.getTime'), $cl);

			$cl = function () { return infra_session_getId(); };
			Sequence::set($infra_template_scope, Sequence::right('infra.session.getId'), $cl);
		});
	}
}
