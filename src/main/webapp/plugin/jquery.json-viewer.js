/**
 * jQuery json-viewer
 * @author: Alexandre Bodelot <alexandre.bodelot@gmail.com>
 */
(function ($) {

	/**
	 * Check if arg is either an array with at least 1 element, or a dict with at least 1 key
	 * @return boolean
	 */
	function isCollapsable(arg) {
		return arg instanceof Object && Object.keys(arg).length > 0;
	}

	/**
	 * Check if a string represents a valid url
	 * @return boolean
	 */
	function isUrl(string) {
		var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		return regexp.test(string);
	}

	/**
	 * Transform a json object into html representation
	 * @return string
	 */
	function json2html(json, options) {
		var html = '';
		//속도개선 jsonViewer
		switch (typeof json) {
			case 'string':
				json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
				var re = new RegExp(options.keyword, "gi");
				json = json.replace(re, options.keyword);
				if (isUrl(json))
					html += '<a href="' + json + '" class="json-string" style="text-decoration:underline" target="_blank" >' + json + '</a>';
				else
					html += '<span class="json-string">"' + json + '"</span>';
				break;
			case 'number':
				html += '<span class="json-literal">' + json + '</span>';
				break;
			case 'boolean' :
				html += '<span class="json-literal">' + json + '</span>';
				break;
			case 'object' :
				if (json != null) {
					var key_count = Object.keys(json).length;
					if (key_count > 0) {
						html += '{<ul class="json-dict">';
						for (var key in json) {
							if (json.hasOwnProperty(key)) {
								var rtKey = key + '';
								if (key == 'index') {
									rtKey = '데이터 유형';
								} else if (key == '_id') {
									rtKey = '아이디';
								} else if (key == 'obj') {
									rtKey = '데이터';
								} else if (key == '_source') {
									rtKey = '데이터';
								}
								html += '<li>';
								var keyRepr = options.withQuotes ?
										'<span class="json-string">"' + options.map.get(rtKey) ? options.map.get(rtKey) : rtKey + '"</span>' : options.map.get(rtKey) ? options.map.get(rtKey) : rtKey;
								/* Add toggle button if item is collapsable */
								if (isCollapsable(json[key])) {
									html += '<a href class="json-toggle">' + keyRepr + '</a>';
								} else {
									html += keyRepr;
								}
								html += ': ' + json2html(json[key], options);
								/* Add comma if item is not last */
								if (--key_count > 0)
									html += ',';
								html += '</li>';
							}
						}
						html += '</ul>}';
					} else {
						html += '{}';
					}
				} else if (json instanceof Array) {
					if (json.length > 0) {
						var i = 0;
						html += '[<ol class="json-array">';
						for (var i = 0; i < json.length; ++i) {
							html += '<li>';
							/* Add toggle button if item is collapsable */
							if (isCollapsable(json[i])) {
								html += '<a href class="json-toggle"></a>';
							}
							html += json2html(json[i], options);
							/* Add comma if item is not last */
							if (i < json.length - 1) {
								html += ',';
							}
							html += '</li>';
						}
						html += '</ol>]';
					} else {
						html += '[]';
					}
				} else {
					html += '<span class="json-literal">null</span>';
				}
				break;
		}

		//기존의 jsonViewer
//		if (typeof json === 'string') {
//			/* Escape tags */
//			json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
//			var re = new RegExp(options.keyword, "gi")
//			json = json.replace(re, '<strong style="background: #faf3d9">' + options.keyword + '</strong>');
//			if (isUrl(json))
//				html += '<a href="' + json + '" class="json-string">' + json + '</a>';
//			else
//				html += '<span class="json-string">"' + json + '"</span>';
//		} else if (typeof json === 'number') {
//			html += '<span class="json-literal">' + json + '</span>';
//		} else if (typeof json === 'boolean') {
//			html += '<span class="json-literal">' + json + '</span>';
//		} else if (json === null) {
//			html += '<span class="json-literal">null</span>';
//		} else if (json instanceof Array) {
//			if (json.length > 0) {
//				html += '[<ol class="json-array">';
//				for (var i = 0; i < json.length; ++i) {
//					html += '<li>';
//					/* Add toggle button if item is collapsable */
//					if (isCollapsable(json[i])) {
//						html += '<a href class="json-toggle"></a>';
//					}
//					html += json2html(json[i], options);
//					/* Add comma if item is not last */
//					if (i < json.length - 1) {
//						html += ',';
//					}
//					html += '</li>';
//				}
//				html += '</ol>]';
//			} else {
//				html += '[]';
//			}
//		} else if (typeof json === 'object') {
////			console.info(json);
////			console.info(json instanceof Array);
//			var key_count = Object.keys(json).length;
//			if (key_count > 0) {
//				html += '{<ul class="json-dict">';
//				for (var key in json) {
//					if (json.hasOwnProperty(key)) {
//						var rtKey = key + '';
//						if (key == '_index') {
//							rtKey = '데이터 유형';
//						} else if (key == '_source') {
//							rtKey = '데이터';
//						}
//						html += '<li>';
//						var keyRepr = options.withQuotes ?
//								'<span class="json-string">"' + options.map.get(rtKey) ? options.map.get(rtKey) : rtKey + '"</span>' : options.map.get(rtKey) ? options.map.get(rtKey) : rtKey;
//						/* Add toggle button if item is collapsable */
//						if (isCollapsable(json[key])) {
//							html += '<a href class="json-toggle">' + keyRepr + '</a>';
//						} else {
//							html += keyRepr;
//						}
//						html += ': ' + json2html(json[key], options);
//						/* Add comma if item is not last */
//						if (--key_count > 0)
//							html += ',';
//						html += '</li>';
//					}
//				}
////				console.timeEnd('json2html');
//				html += '</ul>}';
//			} else {
//				html += '{}';
//			}
//		}

		return html;
	}

	/**
	 * jQuery plugin method
	 * @param json: a javascript object
	 * @param options: an optional options hash
	 */
	$.fn.jsonViewer = function (json, options) {
		options = options || {};

		/* jQuery chaining */
		return this.each(function () {

			/* Transform to HTML */
			var html = json2html(json, options);
			if (isCollapsable(json))
				html = '<a href class="json-toggle"></a>' + html;
			/* Insert HTML in target DOM element */
			$(this).html(html);

			/* Bind click on toggle buttons */
			$(this).off('click');
			$(this).on('click', 'a.json-toggle', function () {
				var target = $(this).toggleClass('collapsed').siblings('ul.json-dict, ol.json-array');
				target.toggle();
				if (target.is(':visible')) {
					target.siblings('.json-placeholder').remove();
				} else {
					var count = target.children('li').length;
					var placeholder = count + (count > 1 ? ' items' : ' item');
					target.after('<a href class="json-placeholder">' + placeholder + '</a>');
				}
				return false;
			});

			/* Simulate click on toggle button when placeholder is clicked */
			$(this).on('click', 'a.json-placeholder', function () {
				$(this).siblings('a.json-toggle').click();
				return false;
			});

			if (options.collapsed == 'all') {
				/* Trigger click to collapse all nodes */
				$(this).find('a.json-toggle').click();
			} else {
				if (options.collapsed == 1) {
					$(this).find('a.json-toggle').click();
					$(this).children('a').click();
					$(this).children().children().children('a').click();
				}
			}
		});
	};
})(jQuery);
