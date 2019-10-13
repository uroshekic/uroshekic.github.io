/*
 * Navodila: vključi cookies.js in v <body> tag dodaj onload="cookieLaw('tracking_code', 'domena' [, številka jezika])"
 * Limit je 4093 KB / domeno (JavaScript hrani stringe v UTF-16 formatu, 1 znak = 2B => 2046K znakov)
 *
 * Cookie.set:
 * 		path = '/' => Cookie je veljaven na celotni (pod)domeni
 * 		domain = '.domain.tld' => Cookie je veljaven na domain.tld in vseh njenih poddomenah!
 */
 var Cookie = {
 	set : function (name, value, expDays, path, domain) {
		var time = new Date();
		time.setTime((new Date()).getTime() + 24 * 3600 * 1000 * expDays);
		var extra = (expDays > 0 && expDays != null) ? '; expires=' + time.toUTCString() : '';
		extra += (path != null) ? '; path=' + path : '';
		extra += (domain != null) ? '; domain=' + domain : '';
		document.cookie = name + "=" + escape(value) + extra;
 	},

 	get : function (name) { return this.get2(name); },

 	isset : function (name) {
 		var c = this.get(name);
 		return (c != null && c != '');
 	},

 	get1 : function (name) {
		var i = document.cookie.indexOf(' ' + name + '=');
		if (i == -1) {
			i = document.cookie.indexOf(name + '='); // Cookie may exist at the beginning of string (i = 0)
			if (i != 0) return null; // In this case i == -1 or i > 0
		}
		var j = i + name.length + 1;
		var k = document.cookie.indexOf(';', j);
		if (k == -1) k = document.cookie.length; // Cookie is saved at the end of string
		return unescape(document.cookie.substring(j, k));
	},

 	get2 : function (name) {
		if (document.cookie == '') return null;
		var l = document.cookie.split('; ');
		for (var i = 0; i < l.length; i++) {
			var cookie = l[i].split('=');
			if (cookie.length != 2) return null; // Is this even possible?
			if (name == cookie[0]) return unescape(cookie[1]);
		}
		return null;
	}
};

/* Cookie Law Example */
var cL_code, cL_domain, cL_lang;
var cL_text = [
	{
		language : 'Slovenščina',
		title : 'Piškotki',
		description : 'Ta stran uporablja piškotke za spremljanje podatkov o obiskanosti strani. Z nadaljevanjem obiska strani soglašate z njihovo uporabo.',
		confirm : 'Vredu'
	},
	{
		language : 'English',
		title : 'Cookies',
		description : 'This site uses cookies to track anonymous usage statistics. Your continued use of this website indicates your acceptance of and consent to site\'s use of cookies.',
		confirm : 'Okay'
	}
];

function cL_changeLanguage(i) {
	document.body.removeChild(document.getElementById('cookieLaw'));
	cookieLaw(cL_code, cL_domain, i);
};

function cookieLaw(code, domain, lang) {
	if (/*location.host === 'localhost' && */location.search === "?nocookies") { console.log('No cookies!'); return; }
	cL_code = code;
	cL_domain = domain;
	if (lang == null) lang = 0;
	cL_lang = lang;

	if (Cookie.isset('cookieLaw')) {
		// Set cookies
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

		ga('create', code, domain);
		ga('send', 'pageview');
	} else {
		var languages = [];
		for (var i = 0; i < cL_text.length; i++) {
			if (i == cL_lang) {
				languages.push(cL_text[i]['language']);
			} else {
				languages.push('<a href="#" onclick="cL_changeLanguage(' + i + '); event.preventDefault();">' + cL_text[i]['language'] + '</a>');
			}
		}

		var node = document.createElement('div');
		node.setAttribute('id', 'cookieLaw');

		/* Bootstrap / Pure */
		var links = document.getElementsByTagName('link'), style = 'none';
		for (var i = 0; i < links.length; i++) {
			if (links[i].href.indexOf('pure-min.css') != -1) { style = 'pure'; break; }
			if (links[i].href.indexOf('bootstrap') != -1) { style = 'bootstrap'; break; }
		}
		switch (style) {
			case 'pure':
				node.setAttribute('style', "width: 100%; margin: 0px; padding: 0px 5px; position: fixed; bottom: 0px; opacity: 0.95; border-top: solid 1px #ccc;");
				node.innerHTML = '<div style="padding: 10px;">' + '<div style="display: inline-block;">' + '<h3>' + cL_text[cL_lang]['title'] + '</h3>' + '<p>' + cL_text[cL_lang]['description'] + '</p></div>' + 
				'<div style="display: inline-block; margin-left: 20px;">' + 
				'<button onclick="Cookie.set(\'cookieLaw\', \'true\', 3650, \'/\', \'.urosh.net\'); document.body.removeChild(document.getElementById(\'cookieLaw\')); cookieLaw();" class="pure-button pure-button-primary button-small button-success">' + 
				cL_text[cL_lang]['confirm'] + '</button></div>' +
				'<div>' + languages.join(' | ') + '</div></div>';
				break;

			default:
				node.setAttribute('style', "width: 100%; margin: 0px; padding: 5px 20px 10px; position: fixed; bottom: 0px; background: #eee; opacity: 0.9;");
				node.innerHTML = '<h4>' + cL_text[cL_lang]['title'] + '</h4><p>' + cL_text[cL_lang]['description'] + '</p>' +
				'<button onclick="Cookie.set(\'cookieLaw\', \'true\', 3650, \'/\', \'.urosh.net\'); document.body.removeChild(document.getElementById(\'cookieLaw\')); cookieLaw();" type="button" class="btn btn-success btn-sm">' + 
				cL_text[cL_lang]['confirm'] + '</button><br>' + 
				'<div class="pull-right">' + languages.join(' | ') + '</div>';
				break;
		}
		
		document.body.appendChild(node);
	}
};