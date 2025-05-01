(function ($) {
	$.fn.caret = function (s, e) {
		var setPosition = function (el, start, end) {
			if (el.setSelectionRange) {
				el.focus();
				el.setSelectionRange(start, end);
			} else if (el.createTextRange) {
				var range = el.createTextRange();
				range.collapse(true);
				range.moveEnd('character', end);
				range.moveStart('character', start);
				range.select();
			}
		};

		if (s != null && e != null) { //setting range
			return this.each(function () {
				setPosition(this, s, e);
			});
		} else if (s != null) { //setting position
			return this.each(function () {
				setPosition(this, s, s);
			});
		} else { //getting
			var el = this[0];
			if (el.createTextRange) {
				var r = document.selection.createRange().duplicate();

				var end = el.value.lastIndexOf(r.text) + r.text.length;

				r.moveEnd('character', el.value.length);
				var start = (r.text == '') ? el.value.length : el.value.lastIndexOf(r.text);

				return [start, end];
			} else {
				return [el.selectionStart, el.selectionEnd];
			}
		}

	};
})(jQuery);

(function ($) {
	$.fn.ipaddress = function (params) {

		return $(this).each(function () {
			var $this = $(this);
			var options = $.extend({
				is_v6: false,
				cidr: false,
				tmp_id: '',
				copy_ip: ''
			}, params);

			var id_prefix = $this.attr('name').replace(/\[/g, '_').replace(/\]/g, '');

			var ip_split = (this.value) ? this.value.split('/') : ['...', '32'];
			var ip_cidr = ip_split[1] || '32';
			var ip_value = ip_split[0].split('.');

			var isNumeric = function (e) {
				if (e.shiftKey)
					return false;
				return (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105);
			};

			var isValidKey = function (e) {
				var valid = [
					8, // backspace
					9, // tab
					13, // enter
					17, // ctrl
					27, // escape
					35, // end
					36, // home
					37, // left arrow
					39, // right arrow
					46, // delete
					48, 96, // 0
					49, 97, // 1
					50, 98, // 2
					51, 99, // 3
					52, 100, // 4
					53, 101, // 5
					54, 102, // 6
					55, 103, // 7
					56, 104, // 8
					57, 105, // 9
					86, // v
					110, 190  // period
				];

				if (options.cidr) {
					valid.push(111, 191); // slash
				}

				// only allow shift key with tab
				if (e.shiftKey && e.keyCode != 9)
					return false;

				for (var i = 0, c; c = valid[i]; i++) {
					if (e.keyCode == c)
						return true;
				}

				return false;
			};

			if (options.is_v6) {
				$this.attr("maxlength", "39");
				$this.addClass("wdhf214");

				$this.bind('keyup', function (e) {
					if (options.copy_ip && id_prefix != options.copy_ip) {
						$("#" + options.copy_ip).val($this.val());
					}
				});

			} else {
				if (!$this.hasClass('ip-enabled')) {
					$this.hide();

					var octets = [];

					for (var i = 0; i <= 3; i++) {
						octets.push('<input type="text" name="' + id_prefix + '_octet_' + (i + 1) + '" class="ip_octet cl' + id_prefix + '" id="' + id_prefix + '_octet_' + (i + 1) + '" maxlength="3" value="' + ip_value[i] + '" numberOnly="1"/>');
					}
					var octet_html = octets.join('.');
					if (options.cidr) {
						octet_html += '/<input type="text" class="ip_cidr ip_octet" id="' + id_prefix + '_octet_cidr" maxlength="2" value="' + ip_cidr + '" />';
					}

					$this.after($('<div class="ip_container" style="display: inline-block;"/>').html(octet_html));
					$this.addClass('ip-enabled');
				} else {
					for (var i = 0; i <= 3; i++) {
						$('#' + id_prefix + '_octet_' + (i + 1)).val(ip_value[i]);
					}
				}

				var saveIP = function (el) {
					// save value to original input if all octets have been entered
//					if ($('input.ip_octet:not(.ip_cidr)', $(el).parent()).filter(function () {
//						return this.value.length;
//					}).length == 4) {
					var ip_value = [], ip = '', cidr = '';
					$('input.ip_octet:not(.ip_cidr)', $(el).parent()).each(function () {
						if (this.value == "") {
							ip_value.push("");
						} else {
							ip_value.push(parseInt(this.value));
						}
					});
					ip = ip_value.join('.');

					if (options.cidr) {
						var $cidr = $('input.ip_cidr', $(el).parent());
						cidr = ($cidr.length) ? '/' + $cidr.val() : '/32';
					}

					$this.val(ip + cidr);
//					} else {
//						$this.val('');
//					}
				};

				//$('input.ip_octet').bind('keydown', function(e) {
				$('.cl' + $this.attr("id")).bind('keydown', function (e) {
					if (!isValidKey(e))
						return false;

					var next_octet = $(this).next('input.ip_octet');
					var prev_octet = $(this).prev('input.ip_octet');

					// jump to next octet on period if this octet has a value
					if (e.keyCode == 110 || e.keyCode == 190) {
						if (this.value.length) {
							if (next_octet.length) {
								next_octet.focus();
								next_octet.select();
							}
						}
						return false;
					}

					// set empty octets to zero and jump to cidr input on slash
					if ((e.keyCode == 111 || e.keyCode == 191) && options.cidr) {
						$('input.ip_octet:not(.ip_cidr)', $(this).parent()).filter(function () {
							return !this.value.length;
						}).val('0');
						$('input.ip_cidr', $(this).parent()).focus();
						return false;
					}

					if (($(this).caret()[1] - $(this).caret()[0]) && isNumeric(e)) {
						return true;
					}

					// jump to next octet if maxlength is reached and number key or right arrow is pressed
					if ((this.value.length == this.getAttribute('maxlength') && $(this).caret()[0] == this.getAttribute('maxlength') && (isNumeric(e) || e.keyCode == 39)) || (e.keyCode == 39 && $(this).caret()[0] == this.value.length)) {
						if (next_octet.length) {
							$(this).trigger('blur');
							next_octet.focus().caret(0);
							return true;
						}
					}

					// jump to previous octet if left arrow is pressed and caret is at the 0 position
					if (e.keyCode == 37 && $(this).caret()[0] == 0) {
						if (prev_octet.length) {
							$(this).trigger('blur');
							prev_octet.caret(prev_octet.val().length);
							return false;
						}
					}

					// jump to previous octet on backspace
					if (e.keyCode == 8 && $(this).caret()[0] == 0 && $(this).caret()[0] == $(this).caret()[1]) {
						if (prev_octet.length) {
							$(this).trigger('blur');
							prev_octet.focus().caret(prev_octet.val().length);
							return false;
						}
					}

					// 컨트롤 + v를 눌렀을 때 조건문이 발생하게 하려 했는데 안먹혀서 v를 눌렀을 때로 설정했습니다.
					// 붙여넣기 할 시 모든 칸을 초기화 하고 붙여넣을 수 있게 했습니다.
					if (e.keyCode == 86) {
						if (this.value.length) {
							for (var i = 0; i < 4; i++) {
								$('#' + id_prefix + '_octet_' + (i + 1)).val('');
							}
						}
						$(this).attr("maxlength", null);
					}

				}).bind('keyup', function (e) {
					if (this.value == 'v') { // 그냥 v만 눌렀을 시 maxlength가 0으로 고정되는데 3으로 다시 맞춰줌.
						$(this).attr("maxlength", "3");
					}

					if (this.value.length > 3) {
						// IPv4 정규식
						var IPRegExp = /^([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\.([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])){3}$/;
						if (IPRegExp.test(this.value)) {
							var splitIP = this.value.split(".");
							for (var i = 0; i < 4; i++) {
								var toInt = parseInt(splitIP[i]);
								$('#' + id_prefix + '_octet_' + (i + 1)).val(toInt);
							}
						} else {
							this.value = '';
						}
						$(this).attr("maxlength", "3");
					}

					if (this.value > 255)
						this.value = 255;

					saveIP(this);
				}).bind('focusout', function (e) {
					if (this.value)
						this.value = parseInt(this.value);

					if (options.copy_ip && id_prefix != options.copy_ip) {
						$('#' + options.copy_ip + '_octet_' + this.name.substr(this.name.length - 1, 1)).val(this.value);
						$('#' + options.copy_ip + '_octet_' + this.name.substr(this.name.length - 1, 1)).trigger('keyup');
					}
				});

				$('input.ip_cidr').bind('keyup', function (e) {
					if (this.value > 32)
						this.value = 32;

					saveIP(this);
				});
			}
		});
	};
})(jQuery);