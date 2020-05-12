import { Template } from '/vendor/infrajs/template/Template.js'
//parsed
let Parsed = {}
Parsed.props = [];//Расширяется в global.js

//Обработка - перепарсиваем слой если изменились какие-то атрибуты
Parsed.get = layer => { 
	//Функция возвращает строку характеризующую настройки слоя 
	let str = ''
	for (let i = 0, l = Parsed.props.length; i < l; i++) {
		let val = Parsed.props[i](layer)
		if (typeof (val) == 'undefined') val = ''
		str += '|' + val;
	}
	return str;
}

Parsed.add = function (fn) {
	if (typeof (fn) == 'string') var func = function (layer) { return layer[fn] };
	else var func = fn;
	Parsed.props.push(func);
}

Parsed.add('parsed');
Parsed.add(function (layer) {
	if (!layer.parsedtpl) return '';
	return Template.parse([layer.parsedtpl], layer);
});

Parsed.add('tpl');
Parsed.add('json');
Parsed.add('dataroot');
Parsed.add('tplroot');
Parsed.add('id');
Parsed.add('is');

export {Parsed}