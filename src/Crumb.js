
infra.Crumb = function () { };
window.Crumb = infra.Crumb;
infra.Crumb.childs = {};
infra.Crumb.prototype = {

	getInstance: function (name) {
		//static public
		//Запускается у объектов и класса
		if (!name) name = '';
		var right = [];
		if (this instanceof infra.Crumb) right = this.path;
		right = this.right(right.concat(this.right(name)));
		if (right[0] === '') right = [];
		var short = this.short(right);
		if (!infra.Crumb.childs[short]) {
			var that = new infra.Crumb();
			that.path = right;
			that.name = right[right.length - 1] ? right[right.length - 1] : '';
			that.value = that.query = that.is = that.counter = null;
			infra.Crumb.childs[short] = that;
			if (that.name) that.parent = that.getInstance('//');
		}
		return infra.Crumb.childs[short];
	},
	right: function (short) {
		//static
		//Запускается у класса
		return infra.seq.right(short, '/');
	},
	short: function (right) {
		//static
		//Запускается у класса
		return infra.seq.short(right, '/');
	},
	toString: function () {
		//public
		return this.short(this.path);
	}
}

infra.Crumb.change = function (query) {
	//static
	//Запускается паблик у класса
	if (Crumb.search) Crumb.referrer = '/' + Crumb.search;
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
		get[unescape(k)] = v;
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
	Crumb.child = Crumb.getInstance(infra.Crumb.value);

	var that = infra.Crumb.getInstance(infra.Crumb.path);
	var child = null;
	while (that) {
		that.counter = counter;
		that.is = true;
		that.child = child;
		that.value = right[that.path.length] ? right[that.path.length] : '';
		that.query = infra.Crumb.short(right.slice(that.path.length));
		child = that;
		that = that.parent;
	};
	that = infra.Crumb.getInstance(old);
	if (!that) return;
	while (that) {
		if (that.counter == counter) break;
		that.is = that.child = that.value = that.query = null;
		that = that.parent;
	};
}
infra.Crumb.init = () => {
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
	}

	if (document.readyState !== "loading") {
		window.addEventListener('popstate', listen, false); //Генерировать заранее нельзя
		return setTimeout(function () {
			listen();
		}, 1);
	}
	document.addEventListener("DOMContentLoaded", function () {
		window.addEventListener('popstate', listen, false); //Генерировать заранее нельзя
		listen();//Даже если html5 не поддерживается мы всё равно считаем первую загрузку а дальше уже будут полные переходы и всё повториться
	});
}
infra.Crumb.isInternal = function (href) {
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
infra.Crumb.go = function (href, nopushstate) {
	if (!Crumb.isInternal(href)) return;
	href = href.split('#', 2);
	if (href[1]) var anchor = '#' + href[1];
	else var anchor = '';

	href = href[0];

	Crumb.anchor = anchor;

	if (href == '.') { //Правильная ссылка на главную страницу
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
		infra.Crumb.popstate = false;
		infra.Crumb.change(query);
		return;
	} else if (!nopushstate) {
		history.pushState(null, null, query + anchor);
		infra.Crumb.popstate = false;
	}

	let r = query.split('/');
	if (!r[0]) {
		r.shift();
		query = r.join('/');
	}
	infra.Crumb.change(query);
	Event.tik('Crumb.onchange');
	Event.fire('Crumb.onchange');

}
infra.Crumb.handA = function (a) {
	var ainfra = a.getAttribute('infra');
	//nothref заменяем на infra=false
	if (ainfra) return;//Ссылка проверена обновлять её не нужно
	a.setAttribute('infra', 'true');
	a.addEventListener('click', function (event) {


		var is = a.getAttribute('infra');
		if (is != 'true') return;

		var is = a.getAttribute('data-crumb');
		if (is == 'false') return;

		let href = a.getAttribute('href');
		if (!infra.Crumb.isInternal(a.getAttribute('href'))) return;

		if (!event.defaultPrevented) { //Добавляется ли адрес в историю? Кто отменил стандартное действие тот и добавил в историю
			event.preventDefault();
			window.history.pushState(null, null, a.getAttribute('href'));
		}

		var r = href.split('#');
		var r1 = r.shift();
		var r2 = r.join('#');

		// && location.pathname+location.search == href
		if (r.length > 1 && location.pathname + location.search == r1) {
			infra.Crumb.anchor = href;
			return;
		}
		href = decodeURI(href);
		infra.Crumb.a = a;
		infra.Crumb.go(href, true);
		infra.Crumb.a = false;
	});
}
infra.Crumb.setA = function (div) {

	if (typeof (div) == 'string') div = document.getElementById(div);
	if (!div) return;

	var as = div.getElementsByTagName('a');

	for (var i = 0, len = as.length; i < len; i++) {
		var a = as[i];
		infra.Crumb.handA(a);
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
infra.Crumb.value = '';
infra.Crumb.query = null;
infra.Crumb.path = [];
infra.Crumb.counter = 0;
infra.Crumb.getInstance = infra.Crumb.prototype.getInstance;
infra.Crumb.right = infra.Crumb.prototype.right;
infra.Crumb.short = infra.Crumb.prototype.short;