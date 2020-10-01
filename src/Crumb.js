import { Seq } from '/vendor/infrajs/sequence/Seq.js'
import { Event } from '/vendor/infrajs/event/Event.js'
import { Fire } from '/vendor/akiyatkin/load/Fire.js'

let Crumb = function () { };

Crumb.emit = Fire.emit
Crumb.hand = Fire.hand
Crumb.fire = Fire.fire


Crumb.childs = {};
Crumb.prototype = {

	getInstance: function (name) {
		//static public
		//Запускается у объектов и класса
		if (!name) name = '';
		var right = [];
		if (this instanceof Crumb) right = this.path;
		right = this.right(right.concat(this.right(name)));
		if (right[0] === '') right = [];
		var short = this.short(right);
		if (!Crumb.childs[short]) {
			var that = new Crumb();
			that.path = right;
			that.name = right[right.length - 1] ? right[right.length - 1] : '';
			that.value = that.query = that.is = that.counter = null;
			Crumb.childs[short] = that;
			if (that.name) that.parent = that.getInstance('//');
		}
		return Crumb.childs[short];
	},
	right: function (short) {
		//static
		//Запускается у класса
		return Seq.right(short, '/');
	},
	short: function (right) {
		//static
		//Запускается у класса
		return Seq.short(right, '/');
	},
	toString: function () {
		//public
		return Seq.short(this.path, '/');
	}
}

Crumb.change = function (query) {
	//static
	//Запускается паблик у класса
	//if (Crumb.search) 
	if (Crumb.search) Crumb.referrer = '/' + Crumb.search;
	else Crumb.referrer = false;
	
	Crumb.search = query;
	var amp = query.split('?');
	if (amp.length > 1) amp = [amp.shift(), amp.join('&')];

	var eq = amp[0].split('=', 2);

	var sl = eq[0].split('/', 2);


	if (eq.length !== 1 && sl.length === 1) {
		//В первой крошке нельзя использовать символ "="
		var params = query;
		var query = '';
	} else {
		var params = amp[1] ? amp[1] : '';
		var query = amp[0];
	}
	//Crumb.refparams = Crumb.params;
	Crumb.params = params;

	var ar = params.split('&');
	var get = {};
	for (var tmp, x = 0; x < ar.length; x++) {
		tmp = ar[x].split('=');
		var k = tmp.shift();
		var v = tmp.join('=');
		/*if(typeof(v)!='undefined'){
			v=unescape(tmp[1]).replace(/[+]/g, ' ');
		} else {
			v='';
		}*/
		get[decodeURI(k)] = decodeURI(v);
	}
	//Crumb.refget = Crumb.get;
	Crumb.get = get;

	var right = Crumb.right(query);
	var counter = ++Crumb.counter;
	var old = Crumb.path;
	//Crumb.refpath = Crumb.path;
	Crumb.path = right;

	Crumb.value = right[0] ? right[0] : '';
	//Crumb.refquery = Crumb.query;
	Crumb.query = Crumb.short(right);
	Crumb.href = Crumb.short(right);
	Crumb.child = Crumb.getInstance(Crumb.value);

	var that = Crumb.getInstance(Crumb.path);
	var child = null;
	while (that) {
		that.counter = counter;
		that.is = true;
		that.child = child;
		that.value = right[that.path.length] ? right[that.path.length] : '';
		that.query = Crumb.short(right.slice(that.path.length));
		child = that;
		that = that.parent;
	};
	that = Crumb.getInstance(old);
	if (!that) return;
	while (that) {
		if (that.counter == counter) break;
		that.is = that.child = that.value = that.query = null;
		that = that.parent;
	};
}
Crumb.init = async () => {
	let listen = async () => {
		var src = location.pathname.substr(1);
		src = decodeURI(src);

		var query = src + location.search;//URN.getQuery();
		if (Crumb.search === query) return;//chrome при загрузки запускает собыите а FF нет. Первый запуск мы делаем сами по этому отдельно для всех а тут игнорируются совпадения.
		Crumb.popstate = true;
		Crumb.anchor = location.hash;
		Crumb.change(query);
		Event.tik('Crumb.onchange');
		Event.fire('Crumb.onchange');
		Crumb.emit('change')
	}
	//await DOM()
	window.addEventListener('popstate', listen, false)
	listen()
}
Crumb.isInternal = function (href) {
	if (href == '.') return true;
	if (typeof (href) == 'undefined' || href == null) return false;//У ссылки нет ссылки
	//if(/^javascript:/.test(href))return false;
	//if(/^mailto:/.test(href))return false;
	//if(/^http.?:/.test(href))return false;
	if (/^\w+:/.test(href)) return false;

	href = href.replace(/^\//, '');
	if (href[0] == '-') return false;
	if (href[0] == '!') return false;
	if (href[0] == '~') return false;
	return true;
}
Crumb.go = function (href, nopushstate) {
	if (!Crumb.isInternal(href)) return;
	href = href.split('#', 2);
	if (href[1]) var anchor = '#' + href[1];
	else var anchor = '';
	
	href = href[0];
	let oldanchor = Crumb.anchor
	Crumb.anchor = anchor
	if (href == '.') {
		href = '';
	} else if (href[0] == '?') {//Относительная ссылка
		href = location.pathname + href;
		//var r=href.split('?');
		//var val=r.shift();
		//if(val) return;	
		//href=r.join('?');
	}

	var query = href;

	//var path=(query?('?'+encodeURI(query)):location.pathname);

	if (nopushstate === false) { //Тихое изменение состояния
		history.replaceState(null, null, query + anchor);
		Crumb.popstate = false;
		Crumb.change(query);
		return;
	} else if (!nopushstate) {
		history.pushState(null, null, query + anchor);
		Crumb.popstate = false;
	}

	let r = query.split('/');
	if (!r[0]) {
		r.shift();
		query = r.join('/');
	}
	
	Crumb.change(query);
	
	if (anchor && query == Crumb.query) return
	Event.tik('Crumb.onchange');
	Event.fire('Crumb.onchange');
	Crumb.emit('change')

}
Crumb.handA = function (a) {
	var ainfra = a.getAttribute('infra');
	//nothref заменяем на infra=false
	if (ainfra) return;//Ссылка проверена обновлять её не нужно
	a.setAttribute('infra', 'true');

	a.addEventListener('click', function (event) {
		
		var is = a.getAttribute('infra');
		if (is != 'true') return;
		
		var is = a.dataset.crumb;
		if (is == 'false') return;

		let href = a.getAttribute('href');
		href = decodeURI(href);
		if (!Crumb.isInternal(a.getAttribute('href'))) return;
		var r = href.split('#');
		var r1 = r.shift();
		var r2 = r.join('#');
		if (r.length) Crumb.anchor = r2;
		if (r2 && location.pathname + location.search == r1) {
			return;
		}
		if(r.length && !r1) r1 = location.pathname
		href = r1
		
		if (!event.defaultPrevented) { //Добавляется ли адрес в историю? Кто отменил стандартное действие тот и добавил в историю
			event.preventDefault();
			window.history.pushState(null, null, a.getAttribute('href'));
		}

		Crumb.a = a;
		Crumb.go(href, true);
		Crumb.a = false;
		
	})
}
Crumb.setA = async (div) => {
	if (typeof (div) == 'string') div = document.getElementById(div);
	if (!div) return;

	var as = div.getElementsByTagName('a');

	for (var i = 0, len = as.length; i < len; i++) {
		var a = as[i];
		Crumb.handA(a);
	}
}
/*public $name;
	public $parent;
	static $child;
	static $value;//Строка или null значение следующей кроки
	static $query;//Строка или null значение следующей и последующих крошек
	static $childs=array();
	static $counter=0;
	static $path;//Путь текущей крошки
	static $params;//Всё что после первого амперсанда
	static $get;
	public $is;*/
Crumb.value = '';
Crumb.query = null;
Crumb.path = [];
Crumb.counter = 0;
Crumb.getInstance = Crumb.prototype.getInstance;
Crumb.right = Crumb.prototype.right;
Crumb.short = Crumb.prototype.short;

window.Crumb = Crumb
Crumb.init()
export { Crumb }