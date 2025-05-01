var niUt;
var niChartUt;
var niCvUt;
var niDateUt;
var niIpUt;
var niValiUt;

(function (factory) {
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		//define('niUt', factory);
		niUt = factory();
	} else {
		niUt = factory();
	}
}(function () {
	return {
		defaultSettings: {
			centerBrowser: 1, // center window over browser window? {1 (YES) or 0 (NO)}. overrides top and left
			centerScreen: 1, // center window over entire screen? {1 (YES) or 0 (NO)}. overrides top and left
			height: 500, // sets the height in pixels of the window.
			left: 0, // left position when the window appears.
			location: 0, // determines whether the address bar is displayed {1 (YES) or 0 (NO)}.
			menubar: 0, // determines whether the menu bar is displayed {1 (YES) or 0 (NO)}.
			resizable: 0, // whether the window can be resized {1 (YES) or 0 (NO)}. Can also be overloaded using resizable.
			scrollbars: 0, // determines whether scrollbars appear on the window {1 (YES) or 0 (NO)}.
			status: 0, // whether a status line appears at the bottom of the window {1 (YES) or 0 (NO)}.
			width: 500, // sets the width in pixels of the window.
			windowName: null, // name of window set from the name attribute of the element that invokes the click
			windowURL: null, // url used for the popup
			top: 0, // top position when the window appears.
			toolbar: 0 // determines whether a toolbar (includes the forward and back buttons) is displayed {1 (YES) or 0 (NO)}.
		},
		defLcst : function(key, value) {
		    var rt = this.lcst(key);
		    if (!rt) {
		      rt = this.lcst(key, value);
		    }
		
		    return rt;
		},
		lcst: function(key, value) {
		    if (value !== undefined) {
		      value = JSON.stringify(value);
		
		      localStorage[key] = value;   
		    }
		
		    if (localStorage[key] !== undefined) {
		      return JSON.parse(localStorage[key]);
		    }
		},
		setCookie: function (name, value, option) {	//expires == 쿠키 파기 날짜, default는 다음날 자정
			if (option.expires == undefined || option.expires == "") {
				var date = new Date();
				option.expires = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1, 00, 00, 00);
			}
			if (option.path == undefined || option.path == "") {
				option.path = "/";
			}
			
			document.cookie = name + "=" + value + ";" + "expires=" + option.expires.toUTCString() + ";" + "path="+option.path;
		},
		getCookie: function (name) {	//name == key, 원하는 key의 쿠키값이 없으면 "" 을 내보냄
			if (name == "" || name == undefined)	//name 값이 없으면 전체 쿠키값을 내보냄
				return document.cookie;
			
			var c_name = "";
			var c_value = "";
			var cookies = document.cookie.split(";");
			
			for (var i=0; i<cookies.length; i++) {
				c_name = cookies[i].substr(0, cookies[i].indexOf("="));
				c_value = cookies[i].substr(cookies[i].indexOf("=")+1);
				c_name = c_name.replace(/^\s+|\s+$/g, "");
				
				if (c_name == name) {
					return c_value;
				} else {
					c_value = "";
				}
			}
			return c_value;
		},
		popUp: function (name, url, instanceSettings) {
			settings = $.extend({}, this.defaultSettings, instanceSettings || {});

			var windowFeatures = 'height=' + settings.height +
					',width=' + settings.width +
					',toolbar=' + settings.toolbar +
					',scrollbars=' + settings.scrollbars +
					',status=' + settings.status +
					',resizable=' + settings.resizable +
					',location=' + settings.location +
					',menuBar=' + settings.menubar;

			settings.windowName = name || settings.windowName;
			settings.windowURL = url || settings.windowURL;
			var centeredY, centeredX;

			var rt;
			try {
				if (settings.centerBrowser) {
					//if ($.browser.msie) {//hacked together for IE browsers
					//	centeredY = (window.screenTop - 120) + ((((document.documentElement.clientHeight + 120) / 2) - (settings.height / 2)));
					//	centeredX = window.screenLeft + ((((document.body.offsetWidth + 20) / 2) - (settings.width / 2)));
					//} else {
					centeredY = window.screenY + (((window.outerHeight / 2) - (settings.height / 2)));
					centeredX = window.screenX + (((window.outerWidth / 2) - (settings.width / 2)));
					//}
					rt = window.open(settings.windowURL, settings.windowName, windowFeatures + ',left=' + centeredX + ',top=' + centeredY);
					rt.focus();
				} else if (settings.centerScreen) {
					centeredY = (screen.height - settings.height) / 2;
					centeredX = (screen.width - settings.width) / 2;
					rt = window.open(settings.windowURL, settings.windowName, windowFeatures + ',left=' + centeredX + ',top=' + centeredY);
					rt.focus();
				} else {
					rt = window.open(settings.windowURL, settings.windowName, windowFeatures + ',left=' + settings.left + ',top=' + settings.top);
					rt.focus();
				}
				return rt;
			} catch (e) {
				return rt;
			}
		},
		ipToGrp: function (probe, ip_long) {
			var ret;
			var sList = NI_GRP_SIP.get(probe).LIST;
			var diff = -1;

			_.each(sList, function (o) {
				if (o.STARTIP <= ip_long && o.ENDIP >= ip_long) {
					var cur_diff = o.ENDIP - o.STARTIP;
					if (diff == -1 || diff > cur_diff) {
						diff = cur_diff;
						ret = o;
					}
				}
			});

			if (!ret) {
				ret = {
					O_CODE: "999",
					O_NAME: "미분류",
					O_PCODE: probe
				};
			}
			return ret;
		},
		ipToGrpV6: function (probe, ip) {
			var ret;
			var sList = NI_GRP_SIP.get(probe).LIST;
			var diff = -1;

			var ip_long = niIpUt.ipv6Tolong(ip);

			_.each(sList, function (o) {
				var sip = niIpUt.ipv6Tolong(o.STARTIP);
				var eip = niIpUt.ipv6Tolong(o.ENDIP);

				if (sip.length == 4) {
					if (sip.length == ip_long.length) {
						var iis = true;

						for (var i = 0; i < sip.length; i++) {
							if (sip[i] > ip_long[i] || eip[i] < ip_long[i]) {
								iis = false;
							}
						}

						if (iis) {
							cur_diff = eip[4] - sip[4];
							if (diff == -1 || diff > cur_diff) {
								diff = cur_diff;
								ret = o;
							}
							ret = o;
						}
					}
				} else {
					if (sip[0] <= ip_long[0] && eip[0] >= ip_long[0]) {
						var cur_diff = eip[0] - sip[0];
						if (diff == -1 || diff > cur_diff) {
							diff = cur_diff;
							ret = o;
						}
					}
				}
			});

			if (!ret) {
				ret = {
					O_CODE: "999",
					O_NAME: "미분류",
					O_PCODE: probe
				};
			}
			return ret;
		},
		htmlToStr: function (html) {
			var val = html;

			val = val.replace(/</gi, "&lt");
			val = val.replace(/>/gi, "&gt");

			return val;
		},
		inputHtmlChk: function (html) {
			var val = html;

			if (val.match(/</gi) || val.match(/>/gi)) {
				return false;
			} else {
				return true;
			}
		},
		makeGrpCode: function (pid, grpcode) {
			var rt = "";
			if (grpcode < 0) {
				rt = pid + "_" + (-1) * grpcode;
			} else {
				rt = pid + "_" + grpcode;
			}
			return rt;
		},
		leadingZeros: function (n, digits) {
			var zero = '';
			n = n.toString();
			if (n.length < digits) {
				for (var i = 0; i < digits - n.length; i++) {
					zero += '0';
				}
			}
			return zero + n;
		},
		fileDownload: function (url, paramFile, method) {
			var inputs = '';
			if (paramFile.file_id == 'null' || paramFile.file_id == '') {
				return false;
			}
			inputs += '<input type="hidden" name="file_id" value="' + paramFile.file_id + '"\>';
			inputs += '<input type="hidden" name="file_index" value="' + paramFile.file_index + '"\>';
			
			if (paramFile.pkt_size && paramFile.pkt_name) {
				inputs += '<input type="hidden" name="pkt_size" value="' + paramFile.pkt_size + '"\>';
				inputs += '<input type="hidden" name="pkt_name" value="' + paramFile.pkt_name + '"\>';
			}
			
			jQuery('<form action="' + url + '"method="' + (method || 'post') + '">' + inputs + '</form>').appendTo('body').submit().remove();
		},

		/**
		 * CSV 다운로드
		 */
		fileCsvDownload: function (param) {
			var inputs = '';
			if ((param.index == 'null' || param.index == '') || (param.query == 'null' || param.query == '') || (param.file_nm == 'null' || param.file_nm == '')) {
				return false;
			}

			let memo = param.memo || '';
			memo = memo.replace(/\"/g, '&quot;');

			if ($('#hiddenifr').length == 0) {
				$('<iframe id="hiddenifr" name="hiddenifr" style="display:none;"></iframe>').appendTo('body');
			}
			inputs += `<input type="hidden" name="index" value="${param.index}">`;
			inputs += `<input type="hidden" name="query" value='${param.query}'>`;
			inputs += `<input type="hidden" name="format" value="${param.format}">`;
			inputs += `<input type="hidden" name="file_nm" value="${param.file_nm}">`;
			inputs += `<input type="hidden" name="aggs_val" value="${param.aggs_val}">`;
			inputs += `<input type="hidden" name="aggs_info" value="${param.aggs_info}">`;
			inputs += `<input type="hidden" name="data_type" value=${param.data_type}>`;
			inputs += `<input type="hidden" name="format" value=${param.format}>`;
			inputs += `<input type="hidden" name="include_columns" value=${param.include_columns}>`;
			inputs += `<input type="hidden" name="memo" value="${memo}">`

			$(`<form action="../getCsvDownload" method="post" target="hiddenifr">${inputs}</form>`).appendTo('body').submit().remove();
		},
		indexFileDownload: function (url, paramFile, method) {
			var inputs = '';
			if (paramFile._index == 'null' || paramFile._id == 'null' || paramFile.field == 'null') {
				return false;
			}
			inputs += '<input type="hidden" name="_index" value="' + paramFile._index + '"\>';
			inputs += '<input type="hidden" name="_id" value="' + paramFile._id + '"\>';
			inputs += '<input type="hidden" name="field" value="' + paramFile.field + '"\>';


			jQuery('<form action="' + url + '"method="' + (method || 'post') + '">' + inputs + '</form>').appendTo('body').submit().remove();
		},
		startLoading: function (element) {

			var background_color = "rgba(255, 255, 255, 0.7)";
			if (NI_CONF.mode === "B") { // 넷빅모드의 경우 배경 어둡게 설정
				background_color = "rgba(100, 100, 100, 0.7)";
			}

			$(element).waitMe({
				effect: 'facebook',
				text: 'Please wait...',
				bg: background_color,
				color: '#000',
				maxSize: '',
				waitTime: -1,
				textPos: 'vertical',
				fontSize: '',
				source: '',
				onClose: function () {}
			});

			var scroll = $(window).scrollTop();
			$('html').scrollTop(scroll / 2);
		},
		endLoading: function (element) {
			$(element).waitMe('hide');
		},
		endFileLoad: function (element) {
			$("div[class*='waitMe']").remove();
			$("div[class*='waitme']").remove();
		},
		startPlaying: function (element) {
			$(element).waitMe({
				effect: 'facebook',
				text: '진행중',
				bg: 'rgba(255,255,255,1)',
				color: '#000',
				maxSize: '30',
				waitTime: -1,
				textPos: 'horizontal',
				fontSize: '',
				onClose: function () {}
			});
			$(element).css("cursor","pointer");
		},
		endPlaying: function (element) {
			$(element).waitMe('hide');
		},
		gerSortedCmnCode: function (auth_arr) {
			for (var l = 0; l < auth_arr.length; l++) {
				for (var k = 0; k < auth_arr.length - l - 1; k++) {
					if (parseInt(auth_arr[k].CC_CODE) > parseInt(auth_arr[	k + 1].CC_CODE)) {
						var temp = auth_arr[k];
						auth_arr[k] = auth_arr[k + 1];
						auth_arr[k + 1] = temp;
					}
				}
			}
			return auth_arr;
		},
		//bytes -> MB 
		//precise : 10(소수점 첫째), 100(둘째), 1000(셋째), ...
		parseMegabytes: function (size, precise) {
			precise = precise ? precise : 1;
			var mb = Math.floor(size * precise / (1024 * 1024)) / precise;
			return mb.toFixed(1);
		},
		//bytes -> KB
		parseKilobytes: function (size) {
			return Math.ceil(size / (1024), 1);
		},
		bytesToSize: function (bytes) {
			var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
			if (bytes == 0)
				return '0 Byte';
			var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
			//console.log(Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]);
			return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
		},
		// 파일 확장자 체크
		isValidExtensionDefaultExt: function (file) {
			var extIdx = file.name.lastIndexOf(".");
			if (extIdx == -1) {
				return false;
			}
			var EXT_ARR = [];
			EXT_ARR.push('txt');
			EXT_ARR.push('png');
			EXT_ARR.push('jpg');
			EXT_ARR.push('bmp');
			EXT_ARR.push('hwp');
			EXT_ARR.push('pdf');
			EXT_ARR.push('xls');
			EXT_ARR.push('xlsx');
			EXT_ARR.push('csv');
			EXT_ARR.push('doc');
			EXT_ARR.push('docx');
			EXT_ARR.push('ppt');
			EXT_ARR.push('pptx');
			EXT_ARR.push('zip');

			var result = false;

			var ext = file.name.slice(extIdx + 1).toLowerCase();
			$.each(EXT_ARR, function (idx, item) {
				if (ext == item) {
					result = true;
				}
			});

			return result;
		},
		// 사고 관련 파일 다운로드 정보 설정
		resolveFileInfoOnly: function (data, field) {
			var field_split = field.split("-");
			var elementId = field + "_LIST";

			if (field_split.length > 1) {
				data = data[field_split[0]];
				field = field_split[1];
			}

			var fileName_array = data[field + "_NM"];
			var fileSize_array = data[field + "_SIZE"];
			var fileID_array = data[field + "_ID"];

			// 파일이 배열 형태로 저장되어 있지 않을 경우 임시로 배열 만들어주기
			var tempArray = [];
			if (!Array.isArray(fileName_array) && fileName_array) {
				tempArray.push(fileName_array);
				fileName_array = tempArray;

				tempArray = [];
				tempArray.push(fileSize_array);
				fileSize_array = tempArray;

				tempArray = [];
				tempArray.push(fileID_array);
				fileID_array = tempArray;
			}

			if (fileName_array) {
				for (var i = 0; i < fileName_array.length; i++) {
					var fileName = fileName_array[i];
					var fileSize = fileSize_array[i];
					var fileID = fileID_array[i];

					var setHTML = $("#" + elementId).html();
					setHTML += '<div id="' + elementId + '_' + i + '">';
					setHTML += '<a class="file" style="cursor:not-allowed;">' + fileName + '<span>(' + niUt.bytesToSize(fileSize) + ')</span></a>';
					setHTML += '</div>';
					$("#" + elementId).html(setHTML);
				}

				$("#" + elementId).show();
			}
		},
		resolveFileInfo: function (data, field, index) {
			var field_split = field.split("-");
			var elementId = field + "_LIST";

			if (field_split.length > 1) {
				data = data[field_split[0]];
				field = field_split[1];
			}

			var fileName_array = data[field + "_NM"];
			var fileSize_array = data[field + "_SIZE"];
			var fileID_array = data[field + "_ID"];
			var file_index = index;
			// 파일이 배열 형태로 저장되어 있지 않을 경우 임시로 배열 만들어주기
			var tempArray = [];
			if (!Array.isArray(fileName_array) && fileName_array) {
				tempArray.push(fileName_array);
				fileName_array = tempArray;

				tempArray = [];
				tempArray.push(fileSize_array);
				fileSize_array = tempArray;

				tempArray = [];
				tempArray.push(fileID_array);
				fileID_array = tempArray;
			}

			if (fileName_array) {
				for (var i = 0; i < fileName_array.length; i++) {
					var fileName = fileName_array[i];
					var fileSize = fileSize_array[i];
					var fileID = fileID_array[i];

					var setHTML = $("#" + elementId).html();
					setHTML += '<div id="' + elementId + '_' + i + '">';
					setHTML += '<a ng-click="downloadFile(\'' + fileID + '\',\'' + file_index + '\')" class="file">' + fileName + '<span>(' + niUt.bytesToSize(fileSize) + ')</span></a>';
					setHTML += '</div>';
					$("#" + elementId).html(setHTML);
				}

				$("#" + elementId).show();
			}
		}
	};
}));

(function (factory) {
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		//define('niChartUt', factory);
		niChartUt = factory();
	} else {
		niChartUt = factory();
	}
}(function () {
	return {
		pNumComma: /\B(?=(?:\d{3})+(?!\d))/g,
		nSize: 10,
		addCommas: function (numberString, fixed) {
			if (fixed) {
				numberString = Math.ceil(numberString * 2) / 2 + '';
			} else {
				numberString = numberString + '';
			}

			var x = numberString.split('.'),
					x1 = x[0],
					x2 = x.length > 1 ? '.' + x[1] : '',
					rgxp = /(\d+)(\d{3})/;

			while (rgxp.test(x1)) {
				x1 = x1.replace(rgxp, '$1' + ',' + '$2');
			}

			return x1 + x2;
		},
		GetYAxis: function (max, type) {
			var that = this;
			var text, dir;
			var ut_k, ut_m, ut_g;

			if (!type || type === 0) {
				type = 0;
				ut_k = NI_BV.unit_bk, ut_m = NI_BV.unit_bm, ut_g = NI_BV.unit_bg;
				text = "bps";
				dir = 1;
			} else if (type === 1) {
				ut_k = NI_BV.unit_pk, ut_m = NI_BV.unit_pm, ut_g = NI_BV.unit_pg;
				text = "pps";
				dir = 1;
			} else if (type === 2) {
				ut_k = NI_BV.unit_k, ut_m = NI_BV.unit_m, ut_g = NI_BV.unit_g;
				text = "session";
				dir = 0;
			} else if (type === 3) {
				ut_k = NI_BV.unit_k, ut_m = NI_BV.unit_m, ut_g = NI_BV.unit_g;
				text = "target IP";
				dir = 0;
			}

			var rt = {
				bw: 0,
				axl: dir ? '\u2190 in {' + text + '} out \u2192' : '{' + text + '} \u2192',
				tickFuc: function nwc(x) {
					return that.addCommas(x, 1);
				}
			};

			rt.bw = max + Math.round(max * 0.1);
			if (rt.bw == 0)
				rt.bw = 2;

			if (max < ut_k) {
				//rt.bw = Math.ceil(((max) + 1) * 0.1) * this.nSize;
			} else if (max < ut_m) {
				//rt.bw = Math.ceil(((max / ut_k) + 1) * 0.1) * this.nSize * ut_k;

				if (dir)
					rt.axl = '\u2190 in {K' + text + '} out \u2192';
				rt.tickFuc = function nwc(x) {
					x = (x / ut_k);
					return that.addCommas(x, 1) + "K";
				};
			} else if (max < ut_g) {
				//rt.bw = Math.ceil(((max / ut_m) + 1) * 0.1) * this.nSize * ut_m;

				if (dir)
					rt.axl = '\u2190 in {M' + text + '} out \u2192';
				rt.tickFuc = function nwc(x) {
					x = parseInt(x / ut_m);
					return that.addCommas(x, 1) + "M";
				};
			} else {
				//rt.bw = Math.ceil(((max / ut_g) + 1) * 0.1) * 4 * ut_g;
				//rt.bw = Math.round(max / ut_g) * ut_g;

				if (dir)
					rt.axl = '\u2190 in {G' + text + '} out \u2192';
				rt.tickFuc = function nwc(x) {
					x = (x / ut_g);
					x = x.toFixed(2);

					return that.addCommas(x) + "G";
				};
			}

			return  rt;
		},
		maxVal: function (prev, cur) {
			var value = {
				bps: 0,
				pps: 0,
				session: 0,
				target_ip: 0
			};

			if (cur !== undefined) {
				if (cur.in_bps > cur.out_bps) {
					value.bps = cur.in_bps;
				} else {
					value.bps = cur.out_bps;
				}

				if (cur.in_pps > cur.out_pps) {
					value.pps = cur.in_pps;
				} else {
					value.pps = cur.out_pps;
				}

				if (value.bps < prev.bps) {
					value.bps = prev.bps;
				}

				if (value.pps < prev.pps) {
					value.pps = prev.pps;
				}

				value.session = cur.session;
				if (value.session < prev.session) {
					value.session = prev.session;
				}

				value.target_ip = cur.target_ip;
				if (value.target_ip < prev.target_ip) {
					value.target_ip = prev.target_ip;
				}
			}

			return value;
		},
		maxVal_byte: function (prev, cur) {
			var value = {
				tot_bytes: 0
			};

			if (cur !== undefined) {
				value.tot_bytes = cur.tot_bytes;
				if (value.tot_bytes < prev.tot_bytes) {
					value.tot_bytes = prev.tot_bytes;
				}
			}

			return value;
		}
	};
}));

(function (factory) {
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		//define('niConvertUt', factory);
		niCvUt = factory();
	} else {
		niCvUt = factory();
	}
}(function () {
	return {
		pattern: /(-?[0-9]+)([0-9]{3})/,
		thousandsSeparator: function (value) { // 천단위 구분 컴마 찍기
			return (value).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
		},
		unit: function (value, type, unit, isUnit, isFixed) {
			var rt;
			var vAbs = Math.abs(value);
			var ut_k, ut_m, ut_g;

			if (!type || type === 0) {
				ut_k = NI_BV.unit_bk, ut_m = NI_BV.unit_bm, ut_g = NI_BV.unit_bg;
			} else if (type === 1) {
				ut_k = NI_BV.unit_pk, ut_m = NI_BV.unit_pm, ut_g = NI_BV.unit_pg;
			} else {
				ut_k = NI_BV.unit_k, ut_m = NI_BV.unit_m, ut_g = NI_BV.unit_g;
			}

			if (unit === undefined)
				unit = "";
			if (isUnit === undefined)
				isUnit = true;
			if (isFixed === undefined)
				isFixed = true;

			if (isUnit) {
				if (isFixed == 1) {
					if (vAbs >= ut_g) {
						rt = (vAbs / ut_g).toFixed(2) + "G" + unit;
					} else if (vAbs >= ut_m) {
						rt = (vAbs / ut_m).toFixed(2) + "M" + unit;
					} else if (vAbs >= ut_k) {
						rt = (vAbs / ut_k).toFixed(1) + "K" + unit;
					} else {
						rt = (vAbs) + unit;
					}
				} else if (isFixed == 2) {
					if (vAbs >= ut_g) {
						rt = (vAbs / ut_g).toFixed(1);
						if (rt % 1 == 0) {
							rt = (vAbs / ut_g).toFixed(0);
						}
						rt = rt + "G" + unit;
					} else if (vAbs >= ut_m) {
						rt = (vAbs / ut_m).toFixed(1);
						if (rt % 1 == 0) {
							rt = (vAbs / ut_m).toFixed(0);
						}
						rt = rt + "M" + unit;
					} else if (vAbs >= ut_k) {
						rt = (vAbs / ut_k).toFixed(1);
						if (rt % 1 == 0) {
							rt = (vAbs / ut_k).toFixed(0);
						}
						rt = rt + "K" + unit;
					} else {
						rt = (vAbs) + unit;
					}
				} else {
					if (vAbs >= ut_g) {
						rt = (vAbs / ut_g).toFixed(0) + "G" + unit;
					} else if (vAbs >= ut_m) {
						rt = (vAbs / ut_m).toFixed(0) + "M" + unit;
					} else if (vAbs >= ut_k) {
						rt = (vAbs / ut_k).toFixed(0) + "K" + unit;
					} else {
						rt = (vAbs) + unit;
					}
				}
			} else {
				vAbs += '';
				while (this.pattern.test(vAbs)) {
					vAbs = vAbs.replace(this.pattern, "$1,$2");
				}

				rt = vAbs + unit;//.format();
			}

			return rt;
		},
		v_sum: function (v, t) {
			v.bps += t.bps;
			v.in_bps += t.in_bps;
			v.out_bps += t.out_bps;
			v.pps += t.pps;
			v.in_pps += t.in_pps;
			v.out_pps += t.out_pps;
			v.dp_bps += t.dp_bps;
			v.dp_in_bps += t.dp_in_bps;
			v.dp_out_bps += t.dp_out_bps;
			v.cps += t.cps;
			v.mcc += t.mcc;
			v.session += t.session;
			v.target_ip += t.target_ip;
		},
		countUnit: function (v) { //총 갯수 요약해주기
			var count = v;
			var unit = '';
			var countUnit;
			var resultUnit;
			if (count > 1000000000000) { //1조 이상은 1조 밑 다 짜름
				unit = '조 개';
				countUnit = count.toString().slice(0, -12);
			} else if (count > 100000000) { //1억 이상은 1억 밑 다 짜름
				unit = '억 개';
				countUnit = count.toString().slice(0, -8);
			} else if (count > 10000) { //1만 이상은 1만 밑 다 짜름
				unit = '만 개';
				countUnit = count.toString().slice(0, -4);
				//예시) 받은 값이 123456이면 [12만]을 반환
			} else if (count <= 10000) { //1만 밑으로는 그대로 반환
				unit = '개';
				countUnit = count;
			}
			resultUnit = countUnit + unit;
			return resultUnit;
		},
		getHits: function (key, data) {
			var rtArr = [];
			if (data["data"] && data["data"][key] && data["data"][key].hits && data["data"][key].hits.hits) {
				var tmpArr = data["data"][key].hits.hits;
				for (var i in tmpArr) {
					rtArr.push(tmpArr[i]._source);
				}
			}
			return rtArr;
		},
		getMHits: function (key, data) {
			var rtArr = [];
			if (data && data.data && data.data[key].responses) {
				for (var i in data.data[key].responses) {
					if (data.data[key].responses[i].hits && data.data[key].responses[i].hits.hits) {
					
						var tmpArr = data.data[key].responses[i].hits.hits;
						for (var n in tmpArr) {
							rtArr.push(tmpArr[n]._source);
						}
					}
				}
			}
			return rtArr;
		},
		resDataResult: function (rs, rsDataSet) {
			var rsData = [];
			if (typeof rs["data"][rsDataSet] != 'undefined') {
				if (typeof rs["data"][rsDataSet]["hits"]["hits"] == 'undefined') {
					return rsData;
				}
				for (var i = 0; i < rs["data"][rsDataSet].hits.hits.length; i++) {
					rsData[i] = rs["data"][rsDataSet].hits.hits[i]._source;
					rsData[i]._id = rs["data"][rsDataSet].hits.hits[i]._id;
					rsData[i]._index = rs["data"][rsDataSet].hits.hits[i]._index;
				}
			} else if (typeof rs[rsDataSet] != 'undefined') {
				if (typeof rs[rsDataSet]["hits"]["hits"] == 'undefined') {
					return rsData;
				}
				for (var i = 0; i < rs[rsDataSet].hits.hits.length; i++) {
					rsData[i] = rs[rsDataSet].hits.hits[i]._source;
					rsData[i]._id = rs[rsDataSet].hits.hits[i]._id;
					rsData[i]._index = rs[rsDataSet].hits.hits[i]._index;
				}
			}
			return rsData;
		},
		resDataResultType: function (rs, rsDataSet, type) {
			var rsData = [];
			if (typeof rs["data"][rsDataSet] != 'undefined') {
				if (typeof rs["data"][rsDataSet]["hits"]["hits"] == 'undefined') {
					return rsData;
				}
				for (var i = 0; i < rs["data"][rsDataSet].hits.hits.length; i++) {
					rsData[i] = rs["data"][rsDataSet].hits.hits[i]._source[type];
					rsData[i]._id = rs["data"][rsDataSet].hits.hits[i]._id;
					rsData[i]._index = rs["data"][rsDataSet].hits.hits[i]._index;
				}
			} else if (typeof rs[rsDataSet] != 'undefined') {
				if (typeof rs[rsDataSet]["hits"]["hits"] == 'undefined') {
					return rsData;
				}
				for (var i = 0; i < rs[rsDataSet].hits.hits.length; i++) {
					rsData[i] = rs[rsDataSet].hits.hits[i]._source[type];
					rsData[i]._id = rs[rsDataSet].hits.hits[i]._id;
					rsData[i]._index = rs[rsDataSet].hits.hits[i]._index;
				}
			}
			return rsData;
		},
		resDataMultiResult: function (rs, rsDataSet, no) {
			var rsData = [];
			if (typeof rs["data"][rsDataSet]['responses'][no] != 'undefined') {
				if (typeof rs["data"][rsDataSet]['responses'][no]["hits"]["hits"] == 'undefined') {
					return rsData;
				}
				for (var i = 0; i < rs["data"][rsDataSet]['responses'][no].hits.hits.length; i++) {
					rsData[i] = rs["data"][rsDataSet]['responses'][no].hits.hits[i]._source;
					rsData[i]._id = rs["data"][rsDataSet]['responses'][no].hits.hits[i]._id;
					rsData[i]._index = rs["data"][rsDataSet]['responses'][no].hits.hits[i]._index;
				}
			} else if (typeof rs[rsDataSet]['responses'][no] != 'undefined') {
				if (typeof rs[rsDataSet]['responses'][no]["hits"]["hits"] == 'undefined') {
					return rsData;
				}
				for (var i = 0; i < rs[rsDataSet]['responses'][no].hits.hits.length; i++) {
					rsData[i] = rs[rsDataSet]['responses'][no].hits.hits[i]._source;
					rsData[i]._id = rs[rsDataSet]['responses'][no].hits.hits[i]._id;
					rsData[i]._index = rs[rsDataSet]['responses'][no].hits.hits[i]._index;
				}
			}

			return rsData;
		},
		resDataResultOneByNotRow: function (rs, rsDataSet) {
			var rsData = {};
			if (typeof rs["data"][rsDataSet] != 'undefined') {
				if (typeof rs["data"][rsDataSet]["hits"]["hits"] == 'undefined') {
					return rsData;
				}
				if (rs["data"][rsDataSet]["hits"]["hits"].length == 0) {
					return rsData;
				}
				rsData = rs["data"][rsDataSet].hits.hits[0]._source;
				rsData._id = rs["data"][rsDataSet].hits.hits[0]._id;
				rsData._index = rs["data"][rsDataSet].hits.hits[0]._index;
			} else if (typeof rs[rsDataSet] != 'undefined') {
				if (typeof rs[rsDataSet]["hits"]["hits"] == 'undefined') {
					return rsData;
				}
				if (rs[rsDataSet]["hits"]["hits"].length == 0) {
					return rsData;
				}
				rsData = rs[rsDataSet].hits.hits[0]._source;
				rsData._id = rs[rsDataSet].hits.hits[0]._id;
				rsData._index_id = rs[rsDataSet].hits.hits[0]._index;
			}

			return rsData;
		},
		resDataResultOne: function (rs, rsDataSet) {
			var rsData = [];

			rsData = rs.data[rsDataSet]._source;
			rsData._id = rs.data[rsDataSet]._id;

			return rsData;
		},
		resDataResultNum: function (rs, rsDataSet, table) {
			var rsData = [];
			if (typeof rs["data"][rsDataSet] != 'undefined') {
				if (typeof rs["data"][rsDataSet]["hits"]["hits"] == 'undefined') {
					return rsData;
				}
				for (var i = 0; i < rs["data"][rsDataSet].hits.hits.length; i++) {
					rsData[i] = rs["data"][rsDataSet].hits.hits[i]._source;
					rsData[i]._index = rs["data"][rsDataSet].hits.hits[i]._index;
					rsData[i]._id = rs["data"][rsDataSet].hits.hits[i]._id;
					rsData[i].num = rs.recordsFiltered - (table.page.info().start + i);
				}
			} else if (typeof rs[rsDataSet] != 'undefined') {
				if (typeof rs[rsDataSet]["hits"]["hits"] == 'undefined') {
					return rsData;
				}
				for (var i = 0; i < rs[rsDataSet].hits.hits.length; i++) {
					rsData[i] = rs[rsDataSet].hits.hits[i]._source;
					rsData[i]._index = rs[rsDataSet].hits.hits[i]._index;
					rsData[i]._id = rs[rsDataSet].hits.hits[i]._id;
					rsData[i].num = rs.recordsFiltered - (table.page.info().start + i);
				}
			}

			return rsData;

		},
		select_mk: function (list, select_id, el) {
			for (var i in list) {
				el.find(select_id).append("<option value='" + list[i].mDataProp + "'>" + list[i].korName + "</option>");
			}
		},
		//@@EXP 바이트 사이즈 변환 함수
		bytesToSize: function (bytes) {
			var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
			if (bytes == 0)
				return '0 Byte';
			var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
			return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
		},
		encodingTextArea: function (value) {
//			value = value.replace(/\\/g, '\\\\');
			//value = value.replace(/\n/g, "\\n");
			//value = value.replace(/\"/g, '\\"');
			return value;
		},
		decodingTextArea: function (value) {
			if (value == null) {
				return null;
			}
			//value = value.replace(/&quot;/, "\\");
			value = value.replace(/&lt;/g, "<");
			value = value.replace(/&gt;/g, ">");
			value = value.replace(/&amp;/g, "&");
			value = value.replace(/&quot;/g, "\"");

			return value;
		},
		base64Decoding: function (input) {
			if (input == null) {
				return input;
			}
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;

			input = input.replace(/[^A-Za-z0-9\+/=]/g, "");
			console.log(input);
			while (i < input.length) {
				enc1 = input.indexOf(input.charAt(i++));
				enc2 = input.indexOf(input.charAt(i++));
				enc3 = input.indexOf(input.charAt(i++));
				enc4 = input.indexOf(input.charAt(i++));

				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 % 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;

				output = output + String.fromCharCode(chr1);

				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
			}
			output = niCvUt.utf8_decode(output);
			console.log(output);
			return output;
		},
		utf8_decode: function (utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;

			while (i < utftext.length) {

				c = utftext.charCodeAt(i);

				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if ((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return string;
		},
		hex_to_string: function (hex) {	//hex -> string
			var str = '';
			hex = (hex.toLowerCase()).replace(/(\s*)/g, "");
			for (var i = 0; i < hex.length; i += 2) {
				var v = parseInt(hex.substr(i, 2), 16);
				if (v)
					str += String.fromCharCode(v);
			}
			return str;
		},
		string_to_hex: function (str) {		//eunsun: string -> hex
			var hex = "";
			for (var i = 0; i < str.length; i++) {
				hex += (str.charCodeAt(i)).toString(16);
			}
			return hex;
		},
		hexToString: function (hex) {
			var str = "";
//			for(var i=0; i<hex.split(" ").length; i++){
//				var v = parseInt(hex.split(" ")[i], 16);
//				if(v) str += String.fromCharCode(v);
//			}
			return str;
		}


	};
}));


(function (factory) {
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		niIpUt = factory();
	} else {
		niIpUt = factory();
	}
}(function () {
	return {
		pattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/,
		vaildIp: function (v) {// ip의 유효성 검사
			if (this.pattern.test(v)) {
				return false;
			}
			return true;
		},
		compareIp: function (v1, v2, comp) {// ipv4 & ipv6 의 크기 비교
			v1 = v1.toString();
			v2 = v2.toString();
			if ("gt" == comp) {
				if (niIpUt.fnFillZero(v1) > niIpUt.fnFillZero(v2)) {
					return true;
				}
			} else if ("lt" == comp) {
				if (niIpUt.fnFillZero(v1) < niIpUt.fnFillZero(v2)) {
					return true;
				}
			} else if ("gte" == comp) {
				if (niIpUt.fnFillZero(v1) >= niIpUt.fnFillZero(v2)) {
					return true;
				}
			} else if ("lte" == comp) {
				if (niIpUt.fnFillZero(v1) <= niIpUt.fnFillZero(v2)) {
					return true;
				}
			} else if ("eq" == comp) {
				if (niIpUt.fnFillZero(v1) == niIpUt.fnFillZero(v2)) {
					return true;
				}
			}

			return false;
			//comp
			//gt > gte >=
			//lt < lte <=
			//eq ==
		},
		long2ip: function (v) {// ipv4의 number 값을 ipv4 문자열 값으로 반환
			/*
			 with (Math)
			 {
			 var ip1 = floor(v/pow(256,3));
			 var ip2 = floor((v%pow(256,3))/pow(256,2));
			 var ip3 = floor(((v%pow(256,3))%pow(256,2))/pow(256,1));
			 var ip4 = floor((((v%pow(256,3))%pow(256,2))%pow(256,1))/pow(256,0));
			 }
			 return ip1 + '.' + ip2 + '.' + ip3 + '.' + ip4;
			 */
			if (!isFinite(v))
				return false;

			return [v >>> 24, v >>> 16 & 0xFF, v >>> 8 & 0xFF, v & 0xFF].join('.');
			//return [v >>> 24, v >>> 16 & 0xFF, v >>> 8 & 0xFF, v & 0xFF].join('.') +"__"+v;

		},
		ip2long: function (IP) {// ipv4의 ipv4 문자열 값을 number 값으로 반환
			//return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
			//
			// http://kevin.vanzonneveld.net
			// +   original by: Waldo Malqui Silva
			// +   improved by: Victor
			// +    revised by: fearphage (http://http/my.opera.com/fearphage/)
			// +    revised by: Theriault
			// *     example 1: ip2long('192.0.34.166');
			// *     returns 1: 3221234342
			// *     example 2: ip2long('0.0xABCDEF');
			// *     returns 2: 11259375
			// *     example 3: ip2long('255.255.255.256');
			// *     returns 3: false
			var i = 0;
			// PHP allows decimal, octal, and hexadecimal IP components.
			// PHP allows between 1 (e.g. 127) to 4 (e.g 127.0.0.1) components.
			IP = IP.match(/^([1-9]\d*|0[0-7]*|0x[\da-f]+)(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?$/i); // Verify IP format.
			if (!IP) {
				return false; // Invalid format.
			}
			// Reuse IP variable for component counter.
			IP[0] = 0;
			for (i = 1; i < 5; i += 1) {
				IP[0] += !!((IP[i] || '').length);
				IP[i] = parseInt(IP[i]) || 0;
			}
			// Continue to use IP for overflow values.
			// PHP does not allow any component to overflow.
			IP.push(256, 256, 256, 256);
			// Recalculate overflow of last component supplied to make up for missing components.
			IP[4 + IP[0]] *= Math.pow(256, 4 - IP[0]);
			if (IP[1] >= IP[5] || IP[2] >= IP[6] || IP[3] >= IP[7] || IP[4] >= IP[8]) {
				return false;
			}
			return IP[1] * (IP[0] === 1 || 16777216) + IP[2] * (IP[0] <= 2 || 65536) + IP[3] * (IP[0] <= 3 || 256) + IP[4] * 1;
		},
		focus: function (id, is_v6) {// 매개변수 id를 타겟으로 ipv4 & ipv6 포커스
			if (is_v6) {
				$(id).focus();
			} else {
				if ($(id + '_octet_1').val() == "") {
					$(id + '_octet_1').focus();
				} else if ($(id + '_octet_2').val() == "") {
					$(id + '_octet_2').focus();
				} else if ($(id + '_octet_3').val() == "") {
					$(id + '_octet_3').focus();
				} else if ($(id + '_octet_4').val() == "") {
					$(id + '_octet_4').focus();
				} else {
					$(id + '_octet_1').focus();
				}
			}
		},
		longToipv6: function (v, ori) {// ipv4 & ipv6의 문자열 값을 받으면 niIpUt.fnEmptyZero()를 요청, number 값을 받으면 문자열의 ipv4 값을 반환 <-- ipv6의 경우 niIpUt.fnFillZero()이 선행되어야 함
			if (!v) {
				return v;
			}
			if (!isFinite(v)) {
				if (v == "zzzzOthers") {
					v = niIpUt.fnEmptyZero(v, ori);
				} else if (v.split("\:").length > 2) {
					v = niIpUt.fnEmptyZero(v, ori);
				} else if (v.split("\:")[0].split(".").length == 4) {//(v.split("\:").length == 1){
					v = niIpUt.fnEmptyZero(v);
				} else {
//					return false;
				}

				return v;
			}
			return [v >>> 24, v >>> 16 & 0xFF, v >>> 8 & 0xFF, v & 0xFF].join('.');
		},
		ipv6Tolong: function (IP) {// ipv6의 문자열 ip 값을 number[] 값으로 반환, ipv4의 문자열 ip 값을 number 값으로 반환 <-- ipv6의 경우 niIpUt.fnFillZero()이 선행되어야 함
			var addArr = IP.split("\:");
			if (addArr.length > 1) {
				// ipv6 ==> 숫자
//				console.info("v6");
				return niIpUt.fnIpv6Tolong(IP);
			} else {
//				console.info("v4");
				return  [niIpUt.ip2long(IP)];
			}
		},
		fnFillZero: function (v) {// 문자열의 ipv4 & ipv6 값을 정렬이 가능한 문자열 값으로 반환
			if (v == "Others") {
				v = "zzzz" + v;
			} else if (v.split("\:").length > 2) {
				// ipv6

				if (v.split("\:").length < 8) {					// 축약형일때
					var chk = true;
					var num = 8 - v.split("\:").length;			// 빈자리 수
					var tempArr = v.split("\:\:");
					for (var i in tempArr) {
						if (chk) {
							for (var j = 0; j < num; j++) {
								tempArr[i] += ":";
								chk = false;
							}
						}
					}
					v = tempArr[0] + "::" + tempArr[1];
				}

				var ipArr = v.split("\:");
				v = "";
				for (var i = 0; i < ipArr.length; i++) {
					if (ipArr[i].length < 1) {			// 0개 일때
						ipArr[i] = "0000";
					} else if (ipArr[i].length < 2) {	// 1개 일때
						ipArr[i] = "000" + ipArr[i];
					} else if (ipArr[i].length < 3) {	// 2개 일때
						ipArr[i] = "00" + ipArr[i];
					} else if (ipArr[i].length < 4) {	// 3개 일때
						ipArr[i] = "0" + ipArr[i];
					}

					if (i == 0) {
						v += "ipv6_" + ipArr[i] + ":";
					} else if (i < 7) {
						v += ipArr[i] + ":";
					} else {
						v += ipArr[i];
					}
				}
			} else if (v.split("\:").length == 1) {
				// ipv4
				var ipArr = v.split(".");
				if (ipArr.length != 4)
					return v;
				v = "";
				for (var i = 0; i < ipArr.length; i++) {
					if (ipArr[i].length < 2) {	// 1개 일때
						ipArr[i] = "00" + ipArr[i];
					} else if (ipArr[i].length < 3) {	// 2개 일때
						ipArr[i] = "0" + ipArr[i];
					}

					if (i != 3) {
						v += ipArr[i] + ".";
					} else {
						v += ipArr[i];
					}
				}
			}
			return v;
		},
		fnEmptyZero: function (v, ori, abbr) {// 정렬하기 위해 채워진 ipv6 & ipv4의 값을 원래의 형태로 반환 <-- ipv6의 경우 niIpUt.fnFillZero()이 선행되어야 함
			if (abbr) {								// abbr에 값이 들어오게 되면 축약형 작업을 위해 fnFillZero()를 선행한다.
				v = this.fnFillZero(v);
			}
			var cnt = {tot: 0, now: 0, fix: false};
			if (v == "zzzzOthers") {  //전체 통계 - 내부IP
				v = v.replace("zzzz", "");
				return v;
			} else if (v.split("\:").length > 2) {	// ipv6이면
				// ipv6
				v = v.replace("ipv6_", "");				// fnFillZero에서 채운 문자열 제거

				var ipArr = v.split("\:");
				v = "";

				for (var i in ipArr) {
					if (ipArr[i] == 0)
						cnt.tot++;
				}

				for (var i = 0; i < ipArr.length; i++) {
					ipArr[i] = parseInt(ipArr[i], 16);
					ipArr[i] = ipArr[i].toString(16);

					if (i == 0) {
						if (ipArr[0] == 0 && ipArr[i + 1] == 0) {
							v += "::";
							cnt.now++;
						} else {
							v += ipArr[i] + ":";
						}
					} else if (i != 7) {
						if (ipArr[i] == 0 && !cnt.fix && (ipArr[i - 1] == 0 || ipArr[i + 1] == 0)) {
							v += ":";
							cnt.now++;
						} else {
							v += ipArr[i] + ":";
							if (cnt.now != 0 && (cnt.tot - cnt.now) != 0) {
								cnt.fix = true;
							}
						}
					} else {
						if (ipArr[i] == 0 && !cnt.fix && ipArr[i - 1] == 0) {
							v += ":";
							cnt.now++;
						} else {
							v += ipArr[i];
						}
					}
				}
				var parser = "";
				for (var i = 0; i < cnt.now; i++) {
					parser += ":";
				}
				if (v.split(parser).length == 2) {
					v = v.split(parser)[0] + ":" + v.split(parser)[1];
				} else if (v.split(parser).length > 2 && parser != ":" && parser != "") {
					v = v.split(parser)[0] + ":" + v.split(parser)[1];
				}

				if (abbr) {
					return v;
				}
				if (ori) {
					return ori;
				} else {
					return v;
				}

			} else if (v.split("\:").length == 1) {		// ipv4 일
				// ipv4
				var ipArr = v.split(".");
				if (ipArr.length != 4)
					return v;
				v = "";
				for (var i = 0; i < ipArr.length; i++) {
					ipArr[i] = parseInt(ipArr[i]) + "";

					if (i != 3) {
						v += ipArr[i] + ".";
					} else {
						v += ipArr[i];
					}
				}
				return v;
			}
		},
		fnIpCnvFrom6: function (str) {// ipv6 형태로 변환된 ipv4의 문자열 값을 ipv4 값으로 반환
			//init
			var ar = new Array;
			for (var i = 0; i < 8; i++)
				ar[i] = 0;
			//check for trivial IPs
			if (str == "::")
				return ar;
			//parse
			var sar = str.split(':');
			var slen = sar.length;
			if (slen > 8)
				slen = 8;
			var j = 0;
			for (var i = 0; i < slen; i++) {
				//this is a "::", switch to end-run mode
				if (i && sar[i] == "") {
					j = 9 - slen + i;
					continue;
				}
				ar[j] = parseInt("0x0" + sar[i]);
				j++;
			}

			var ip6 = ar;
			var ip4 = (ip6[6] >> 8) + "." + (ip6[6] & 0xff) + "." + (ip6[7] >> 8) + "." + (ip6[7] & 0xff);
			return ip4;
		},
		fnIpv6Tolong: function (ip6) {// ipv6의 문자열 값을 number[] 값으로 반환 <-- niIpUt.fnFillZero()이 선행되어야 함
			ip6 = this.fnFillZero(ip6);
			ip6 = ip6.replace("ipv6_", "");

			var ipArr = ip6.split(":");

			var num = new Array;
			for (var i = 0; i < ipArr.length; i++)
				num[i] = 0;

			for (var i = 0; i < ipArr.length; i++) {
				num[i] = parseInt(ipArr[i], 16);
			}
//			var long1 = num[0];
//			for (var i = 1;i < 4;i++) {
//				long1 = (long1 * Math.pow(2, 16)) + num[i];
//			}
//			var long2 = num[4];
//			for (var i = 5;i < 8;i++) {
//				long2 = (long2 * Math.pow(2, 16)) + num[i];
//			}

//			var longs = [long1, long2];
			var long1 = num[0] * Math.pow(2, 16) + num[1];
			var long2 = num[2] * Math.pow(2, 16) + num[3];
			var long3 = num[4] * Math.pow(2, 16) + num[5];
			var long4 = num[6] * Math.pow(2, 16) + num[7];

			var longs = [long1, long2, long3, long4];
			return longs;
		},
		fnLongToipv6: function (arr) {// ipv6의 number[] 값을 문자열 값으로 반환 <-- niIpUt.fnIpv6Tolong()이 선행되어야 함
			var ipv6 = "";
			for (var i in arr) {
				ipv6 += (arr[i] >> 16 & 0xffff).toString(16) + ":" + (arr[i] & 0xffff).toString(16);
				if (i != 3) {
					ipv6 += ":";
				}
			}
			return ipv6;
		}
	};
}));


(function (factory) {
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		//define('niDateUt', factory);
		niDateUt = factory();
	} else {
		niDateUt = factory();
	}
}(function () {
	return {
		rtDate: function (year, month, day, leapMonth) {
			return {'year': year, 'month': month, 'day': day, 'leapMonth': leapMonth};
		},
		holiDays: function () {
			return [
				{name: '신정', month: 1, day: 1, Lunar: 1},
				{name: '설날', month: 12, day: 0, Lunar: 2, type: true},
				{name: '설날', month: 1, day: 1, Lunar: 2},
				{name: '설날', month: 1, day: 2, Lunar: 2},
				{name: '3·1절', month: 3, day: 1, Lunar: 1},
				{name: '석가탄신일', month: 4, day: 8, Lunar: 2},
				{name: '어린이날', month: 5, day: 5, Lunar: 1},
				{name: '현충일', month: 6, day: 6, Lunar: 1},
				{name: '광복절', month: 8, day: 15, Lunar: 1},
				{name: '추석', month: 8, day: 14, Lunar: 2},
				{name: '추석', month: 8, day: 15, Lunar: 2},
				{name: '추석', month: 8, day: 16, Lunar: 2},
				{name: '개천절', month: 10, day: 3, Lunar: 1},
				{name: '한글날', month: 10, day: 9, Lunar: 1},
				{name: '성탄절', month: 12, day: 25, Lunar: 1}
			];
		},
		lunarTable: function () {
			return [
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
				[2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
				[2, 2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2], /* 2001 */
				[2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
				[2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1], /* 2011 */
				[2, 1, 2, 5, 2, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 2, 1, 2, 1, 4, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2],
				[2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1], /* 2021 */
				[2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
				[1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1], /* 2031 */
				[2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 5, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 4, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
				[2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
				[2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2], /* 2041 */
				[1, 5, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
				[2, 1, 2, 1, 1, 2, 3, 2, 1, 2, 2, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
				[2, 1, 2, 2, 4, 1, 2, 1, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1],
				[2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
				[1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2], /* 2051 */
				[1, 2, 1, 1, 2, 1, 1, 5, 2, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
				[1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[1, 2, 2, 1, 2, 4, 1, 1, 2, 1, 2, 1],
				[2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2, 1],
				[2, 1, 2, 4, 2, 1, 2, 1, 2, 2, 1, 1],
				[2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1],
				[2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 2, 1], /* 2061 */
				[2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
				[2, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2],
				[1, 2, 1, 5, 1, 2, 1, 2, 2, 2, 1, 2],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
				[2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2], /* 2071 */
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 5, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1],
				[2, 1, 2, 3, 2, 1, 2, 2, 2, 1, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[1, 2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2], /* 2081 */
				[1, 2, 2, 2, 1, 2, 3, 2, 1, 1, 2, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 1, 6, 1, 2, 2, 1, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 5, 1, 2, 1, 1, 2, 2, 2, 1],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 2, 1, 2, 1, 1, 5, 1, 2, 2, 1],
				[2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1], /* 2091 */
				[2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
				[1, 2, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 3, 2, 1, 1, 2, 2, 2, 1, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
				[2, 5, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
				[2, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2, 1]
			];
		},
		lunarCalc: function (year, month, day, type, leapmonth) {
			var solYear, solMonth, solDay;
			var lunYear, lunMonth, lunDay;
			var lunLeapMonth, lunMonthDay;
			var i, lunIndex;
			var solMonthDay = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

			if (year < 2000 || year > 2101)
				return;

			if (year >= 2080)
			{
				solYear = 2080;
				solMonth = 1;
				solDay = 1;
				lunYear = 2079;
				lunMonth = 12;
				lunDay = 10;
				lunLeapMonth = 0;
				solMonthDay[1] = 29;
				lunMonthDay = 30;
			} else if (year >= 2060)
			{
				solYear = 2060;
				solMonth = 1;
				solDay = 1;
				lunYear = 2059;
				lunMonth = 11;
				lunDay = 28;
				lunLeapMonth = 0;
				solMonthDay[1] = 29;
				lunMonthDay = 30;
			} else if (year >= 2040)
			{
				solYear = 2040;
				solMonth = 1;
				solDay = 1;
				lunYear = 2039;
				lunMonth = 11;
				lunDay = 17;
				lunLeapMonth = 0;
				solMonthDay[1] = 29;
				lunMonthDay = 29;
			} else if (year >= 2020)
			{
				solYear = 2020;
				solMonth = 1;
				solDay = 1;
				lunYear = 2019;
				lunMonth = 12;
				lunDay = 7;
				lunLeapMonth = 0;
				solMonthDay[1] = 29;
				lunMonthDay = 30;
			} else if (year >= 2000)
			{
				/* 기준일자 양력 2000년 1월 1일 (음력 1999년 11월 25일) */
				solYear = 2000;
				solMonth = 1;
				solDay = 1;
				lunYear = 1999;
				lunMonth = 11;
				lunDay = 25;
				lunLeapMonth = 0;
				solMonthDay[1] = 29; /* 2000 년 2월 28일 */
				lunMonthDay = 30; /* 1999년 11월 */
			}

			var lunarMonthTable = this.lunarTable();
			lunIndex = lunYear - 1999;

			while (true)
			{
				if (type == 1 &&
						year == solYear &&
						month == solMonth &&
						day == solDay)
				{
					return this.rtDate(lunYear, lunMonth, lunDay, lunLeapMonth);
				} else if (type == 2 &&
						year == lunYear &&
						month == lunMonth &&
						day == lunDay &&
						leapmonth == lunLeapMonth)
				{
					return this.rtDate(solYear, solMonth, solDay, 0);
				}
				/* add a day of solar calendar */
				if (solMonth == 12 && solDay == 31)
				{
					solYear++;
					solMonth = 1;
					solDay = 1;
					/* set monthDay of Feb */
					if (solYear % 400 == 0)
						solMonthDay[1] = 29;
					else if (solYear % 100 == 0)
						solMonthDay[1] = 28;
					else if (solYear % 4 == 0)
						solMonthDay[1] = 29;
					else
						solMonthDay[1] = 28;
				} else if (solMonthDay[solMonth - 1] == solDay)
				{
					solMonth++;
					solDay = 1;
				} else
					solDay++;
				/* add a day of lunar calendar */
				if (lunMonth == 12 &&
						((lunarMonthTable[lunIndex][lunMonth - 1] == 1 && lunDay == 29) ||
								(lunarMonthTable[lunIndex][lunMonth - 1] == 2 && lunDay == 30)))
				{
					lunYear++;
					lunMonth = 1;
					lunDay = 1;
					if (lunYear > 2101) {
						//alert("입력하신 날 또는 달은 없습니다. 다시 입력하시기 바랍니다.");
						break;
					}
					lunIndex = lunYear - 1999;
					if (lunarMonthTable[lunIndex][lunMonth - 1] == 1)
						lunMonthDay = 29;
					else if (lunarMonthTable[lunIndex][lunMonth - 1] == 2)
						lunMonthDay = 30;
				} else if (lunDay == lunMonthDay)
				{
					if (lunarMonthTable[lunIndex][lunMonth - 1] >= 3
							&& lunLeapMonth == 0)
					{
						lunDay = 1;
						lunLeapMonth = 1;
					} else
					{
						lunMonth++;
						lunDay = 1;
						lunLeapMonth = 0;
					}
					if (lunarMonthTable[lunIndex][lunMonth - 1] == 1)
						lunMonthDay = 29;
					else if (lunarMonthTable[lunIndex][lunMonth - 1] == 2)
						lunMonthDay = 30;
					else if (lunarMonthTable[lunIndex][lunMonth - 1] == 3)
						lunMonthDay = 29;
					else if (lunarMonthTable[lunIndex][lunMonth - 1] == 4 &&
							lunLeapMonth == 0)
						lunMonthDay = 29;
					else if (lunarMonthTable[lunIndex][lunMonth - 1] == 4 &&
							lunLeapMonth == 1)
						lunMonthDay = 30;
					else if (lunarMonthTable[lunIndex][lunMonth - 1] == 5 &&
							lunLeapMonth == 0)
						lunMonthDay = 30;
					else if (lunarMonthTable[lunIndex][lunMonth - 1] == 5 &&
							lunLeapMonth == 1)
						lunMonthDay = 29;
					else if (lunarMonthTable[lunIndex][lunMonth - 1] == 6)
						lunMonthDay = 30;
				} else
					lunDay++;
			}
		},
		holiDayCheck: function (year, month, day) {
			var d = new Date(year, month - 1, day);
			if (d.getDay() == 0 || d.getDay() == 6) {
				return true;
			}

			var i;
			var solarDate = this.rtDate(year, month, day);
			var lunarDate = this.lunarCalc(year, month, day, 1);

			var memorialDays = this.holiDays();
			var lunarMonthTable = this.lunarTable();

			if (lunarMonthTable[year - 1 - 1999][11] == 1)
				memorialDays[1].day = 29;
			else if (lunarMonthTable[year - 1 - 1999][11] == 2)
				memorialDays[1].day = 30;

			for (i = 0; i < memorialDays.length; i++) {
				if (memorialDays[i].month == solarDate.month &&
						memorialDays[i].day == solarDate.day && memorialDays[i].Lunar == 1)
					return memorialDays[i];
				//윤달의 공휴일 처리에 대한 예외처리

				if (lunarDate.leapMonth && lunarDate.month == 4 && lunarDate.day == 8) {
					return null;
				}
				if (lunarDate.leapMonth && lunarDate.month == 8 && lunarDate.day > 13 && lunarDate.day < 17) {
					return null;
				}

				if (memorialDays[i].month == lunarDate.month && memorialDays[i].day == lunarDate.day &&
						memorialDays[i].Lunar == 2 && !memorialDays[i].leapMonth)
					return memorialDays[i];
			}
			return null;
		},
		getWeekStartDate: function (dt) {
			var nt = new Date(dt);
			nt.setDate(dt.getDate() - dt.getDay());

			return nt;
		},
		getWeekly: function (dt, java) {
			var newYear = new Date(dt.getFullYear(), 0, 1);
			var day = newYear.getDay(); //the day of week the year begins on
			day = (day >= 0 ? day : day + 7);
			var daynum = Math.floor((dt.getTime() - newYear.getTime() -
					(dt.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
			var weeknum;
			//if the year starts before the middle of a week

			if (java) {
				weeknum = Math.floor((daynum + day - 1) / 7) + 1;
			} else {
				if (day < 4) {
					weeknum = Math.floor((daynum + day - 1) / 7) + 1;
					if (weeknum > 52) {
						var nYear = new Date(dt.getFullYear() + 1, 0, 1);
						var nday = nYear.getDay() - dt;
						nday = nday >= 0 ? nday : nday + 7;
						/*if the next year starts before the middle of
						 the week, it is week #1 of that year*/
						weeknum = nday < 4 ? 1 : 53;

					}
				} else {
					weeknum = Math.floor((daynum + day - 1) / 7);
				}
			}
			return weeknum;
		},
		getQuarterStartMonth: function (dt) {
			var nt = new Date();

			var cur = nt.getMonth();
			nt.setMonth(dt.getMonth() - (cur % 3));

			return nt;
		},
		addDays: function (date, days) {
			var result = new Date(date);
			result.setDate(result.getDate() + days);
			return result;
		}
	};
}));


(function (factory) {
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		//define('niConvertUt', factory);
		niValiUt = factory();
	} else {
		niValiUt = factory();
	}
}(function () {
	return {
		//@@EXP form태그안에 값들을 초기화 시켜주는 함수
		clearForm: function (form) {
			$(form).find('input:text').val('');
			$(form).find('input[type=file]').val('');
			$(form).find('textarea').val('');
			$(form).find('select').val('');
			$(form).find('input[type=hidden]').val('');
			$(form).find('input:checked').prop('checked', false);
		},
		chkIpValue: function (element) {
			if ($(element).val().trim().match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/)) {
				return false;
			} else {
				return true;
			}
		},
		chkIpCorrect: function (ip) {
			if (ip == "") {
				return false;
			}
			var ipTmp = ip.split(".");
			for (var i = 0; i < 4; i++) {
				if (ipTmp[i] == "") {
					return false;
				}
			}
			return true;
		},
		chkIpSearch: function (id) {
			var st = $('#' + id + '_sip').val();
			var end = $('#' + id + '_eip').val();
			if (end == "") {
				return false;
			}

			var srt = ["0", "0", "0", "0"];
			var ert = ["255", "255", "255", "255"];
			var stTmp = st.split(".");
			var endTmp = end.split(".");
			for (i = 0; i < 4; i++) {
				if (i == 0 && stTmp[i] == "") {
					if (stTmp.length > 1 && (stTmp[1] != "" || stTmp[2] != "" || stTmp[3] != "")) {
						alert("올바른 IP 형식이 아닙니다");
						$('#' + id + '_sip').val("");
						$('#' + id + '_eip').val("");
					}
					return false;
				}
				if (stTmp[i] == "" && endTmp[i] == "") {
					break;
				} else {
					srt[i] = stTmp[i];
					ert[i] = endTmp[i];
				}
			}
			for (i = 0; i < 4; i++) {
				if (ert[i] == "") {
					ert[i] = "255";
				}
			}
			for (var i = 0; i < srt.length; i++) {
				$('#' + id + '_sip_octet_' + (i + 1)).val(srt[i]);
				$('#' + id + '_eip_octet_' + (i + 1)).val(ert[i]);
			}
			$('#' + id + '_sip').val(srt.join("."));
			$('#' + id + '_eip').val(ert.join("."));

		},
		chkIpSearchRange: function (id, obj) {
			var st = $('#' + id).val();
			var end = $('#' + id + '_range').val();

			var srt = ["0", "0", "0", "0"];
			var ert = ["255", "255", "255", "255"];
			var stTmp = st.split(".");
			var endTmp = end.split(".");
			for (i = 0; i < 4; i++) {
				if (stTmp[i] == "" && endTmp[i] == "") {
					break;
				} else {
					srt[i] = stTmp[i];
					ert[i] = endTmp[i];
				}
			}
			for (i = 0; i < 4; i++) {
				if (ert[i] == "") {
					ert[i] = "255";
				}
			}
			for (var i = 0; i < srt.length; i++) {
				$('#' + id + '_octet_' + (i + 1)).val(srt[i]);
				$('#' + id + '_range_octet_' + (i + 1)).val(ert[i]);
			}
			$('#' + id).val(srt.join("."));
			$('#' + id + '_range').val(ert.join("."));
			obj.val = srt.join(".");
			obj.rang_val = ert.join(".");
		},
		chkEmpty: function (element) {
			if ($(element).val() == null) {
				return true;
			}
			if ($(element).val().trim() == '') {
				return true;
			} else {
				return false;
			}
		},
		chkScript: function (element) {
			if ($(element).val().match(/<script>/ig)) {
				return true;
			} else {
				return false;
			}
		},
		chkAlert: function (element) {
			if ($(element).val().match(/<alert>/ig)) {
				return true;
			} else {
				return false;
			}
		},
		chkEngNumChar: function (element) {
			if ($(element).val().trim().match(/^[a-z0-9]/)) {
				return false;
			} else {
				return true;
			}
		},
		chkEngNumCharMin5: function (element) {
			if ($(element).val().trim().match(/^[a-z0-9]{6,15}/)) {
				return false;
			} else {
				return true;
			}
		},
		chkEngKorMin1: function (element) {
			if ($(element).val().trim().match(/^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣]{1,10}/)) {
				return false;
			} else {
				return true;
			}
		},
		chkEngKorNumMin1: function (element) {
			if ($(element).val().trim().match(/^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]{1,30}/)) {
				return false;
			} else {
				return true;
			}
		},
		chkEngNumCharMin8: function (element) {
			if ($(element).val().trim().match(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{5,20}$/)) {
				return false;
			} else {
				return true;
			}
		},
		chkEmail: function (element) {
			if ($(element).val().trim().match(/^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[0-9a-zA-Z]{2,3}$/i)) {
				return false;
			} else {
				return true;
			}
		},
		chkPhone: function (element) {
//			if ($(element).val().trim().match(/^\d{3}-\d{3,4}-\d{4}$/)) {
			if ($(element).val() == null || $(element).val().trim() == '') {
				return false;
			}
			if ($(element).val().trim().match(/^(?:(010-\d{4})|(01[1|6|7|8|9]-\d{3,4}))-(\d{4})$/)) {
				return false;
			} else {
				return true;
			}
		},
		chkTel: function (element) {
//			if ($(element).val().trim().match(/^\d{2,3}-\d{3,4}-\d{4}$/)) {
			if ($(element).val().trim().match(/^(0(1[0]|2|3[1-3]|4[1-4]|5[1-5]|6[1-4]|7[0]))-(\d{3,4})-(\d{4})$/)) {
				return false;
			} else {
				return true;
			}
		},
		chkPort: function (element) {
			if ($(element).val().trim().match(/^\d*$/) && $(element).val().trim() <= 65535) {
				return false;
			} else {
				return true;
			}
		},
		chkNum: function (element) {
			if ($(element).val().trim().match(/^\d*$/)) {
				return false;
			} else {
				return true;
			}
		},
		chkUrl: function (element) {
			var reg = new RegExp('^(https?:\\/\\/)?((([a-z\d](([a-z\d-]*[a-z\d])|([ㄱ-힣]))*)\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$', 'i');
			if ($(element).val().trim().match(/^(https?:\/\/)?((([a-z\d](([a-z\d-]*[a-z\d])|([ㄱ-힣]))*)\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$/i)) {
				return false;
			} else {
				return true;
			}
		},
		chkTimeRange: function (element) {
			var elementVal = $(element).val();
			if (elementVal.match(/([0-9]|0[0-9]|1?[0-9]|2[0-3]):[0-5]?[0-9]\~([0-9]|0[0-9]|1?[0-9]|2[0-3]):[0-5]?[0-9]\//g)) {
				if (elementVal[elementVal.length - 1] != "/") {
					return true;
				}
				var elementSplitVal = elementVal.split('/');
				var cnt = 0;
				for (var i in elementSplitVal) {
					if (elementSplitVal[i] == '') {
						cnt++;
						if (cnt >= 2) {
							return true;
						}
					}
					if (elementSplitVal[i] != '' && !(elementSplitVal[i] + "/").match(/^([0-9]|0[0-9]|1?[0-9]|2[0-3]):[0-5][0-9]\~([0-9]|0[0-9]|1?[0-9]|2[0-3]):[0-5][0-9]\//g)) {
						return true;
					}
				}
				return false;
			} else {
				return true;
			}
		},
		chkLatitude: function (element) {
			if ($(element).val().trim().match(/^(\+|-)?(?:90(?:(?:\.0{1,8})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,8})?))$/g)) {
				return false;
			} else {
				return true;
			}
		},
		chkLongitude: function (element) {
			if ($(element).val().trim().match(/^(\+|-)?(?:180(?:(?:\.0{1,8})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,8})?))$/g)) {
				return false;
			} else {
				return true;
			}
		}
	};
}));

var DateFormat = {};
(function ($) {
	var daysInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var shortMonthsInYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var longMonthsInYear = ['January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'];
	var shortMonthsToNumber = {'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
		'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'};

	var YYYYMMDD_MATCHER = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.?\d{0,3}[Z\-+]?(\d{2}:?\d{2})?/;

	$.format = (function () {
		function numberToLongDay(value) {
			// 0 to Sunday
			// 1 to Monday
			return daysInWeek[parseInt(value, 10)] || value;
		}

		function numberToShortMonth(value) {
			// 1 to Jan
			// 2 to Feb
			var monthArrayIndex = parseInt(value, 10) - 1;
			return shortMonthsInYear[monthArrayIndex] || value;
		}

		function numberToLongMonth(value) {
			// 1 to January
			// 2 to February
			var monthArrayIndex = parseInt(value, 10) - 1;
			return longMonthsInYear[monthArrayIndex] || value;
		}

		function shortMonthToNumber(value) {
			// Jan to 01
			// Feb to 02
			return shortMonthsToNumber[value] || value;
		}

		function parseTime(value) {
			// 10:54:50.546
			// => hour: 10, minute: 54, second: 50, millis: 546
			// 10:54:50
			// => hour: 10, minute: 54, second: 50, millis: ''
			var time = value,
					values,
					subValues,
					hour,
					minute,
					second,
					millis = '',
					delimited,
					timeArray;

			if (time.indexOf('.') !== -1) {
				delimited = time.split('.');
				// split time and milliseconds
				time = delimited[0];
				millis = delimited[1];
			}

			timeArray = time.split(':');

			if (timeArray.length === 3) {
				hour = timeArray[0];
				minute = timeArray[1];
				// '20 GMT-0200 (BRST)'.replace(/\s.+/, '').replace(/[a-z]/gi, '');
				// => 20
				// '20Z'.replace(/\s.+/, '').replace(/[a-z]/gi, '');
				// => 20
				second = timeArray[2].replace(/\s.+/, '').replace(/[a-z]/gi, '');
				// '01:10:20 GMT-0200 (BRST)'.replace(/\s.+/, '').replace(/[a-z]/gi, '');
				// => 01:10:20
				// '01:10:20Z'.replace(/\s.+/, '').replace(/[a-z]/gi, '');
				// => 01:10:20
				time = time.replace(/\s.+/, '').replace(/[a-z]/gi, '');
				return {
					time: time,
					hour: hour,
					minute: minute,
					second: second,
					millis: millis
				};
			}

			return {time: '', hour: '', minute: '', second: '', millis: ''};
		}

		function padding(value, length) {
			var paddingCount = length - String(value).length;
			for (var i = 0; i < paddingCount; i++) {
				value = '0' + value;
			}
			return value;
		}

		return {
			parseDate: function (value) {
				var parsedDate = {
					date: null,
					year: null,
					month: null,
					dayOfMonth: null,
					dayOfWeek: null,
					time: null
				};

				if (typeof value == 'number') {
					return this.parseDate(new Date(value));
				} else if (typeof value.getFullYear == 'function') {
					parsedDate.year = String(value.getFullYear());
					// d = new Date(1900, 1, 1) // 1 for Feb instead of Jan.
					// => Thu Feb 01 1900 00:00:00
					parsedDate.month = String(value.getMonth() + 1);
					parsedDate.dayOfMonth = String(value.getDate());
					parsedDate.time = parseTime(value.toTimeString());
				} else if (value.search(YYYYMMDD_MATCHER) != -1) {
					/* 2009-04-19T16:11:05+02:00 || 2009-04-19T16:11:05Z */
					values = value.split(/[T\+-]/);
					parsedDate.year = values[0];
					parsedDate.month = values[1];
					parsedDate.dayOfMonth = values[2];
					parsedDate.time = parseTime(values[3].split('.')[0]);
				} else {
					values = value.split(' ');
					switch (values.length) {
						case 6:
							/* Wed Jan 13 10:43:41 CET 2010 */
							parsedDate.year = values[5];
							parsedDate.month = shortMonthToNumber(values[1]);
							parsedDate.dayOfMonth = values[2];
							parsedDate.time = parseTime(values[3]);
							break;
						case 2:
							/* 2009-12-18 10:54:50.546 */
							subValues = values[0].split('-');
							parsedDate.year = subValues[0];
							parsedDate.month = subValues[1];
							parsedDate.dayOfMonth = subValues[2];
							parsedDate.time = parseTime(values[1]);
							break;
						case 7:
						/* Tue Mar 01 2011 12:01:42 GMT-0800 (PST) */
						case 9:
						/* added by Larry, for Fri Apr 08 2011 00:00:00 GMT+0800 (China Standard Time) */
						case 10:
							/* added by Larry, for Fri Apr 08 2011 00:00:00 GMT+0200 (W. Europe Daylight Time) */
							parsedDate.year = values[3];
							parsedDate.month = shortMonthToNumber(values[1]);
							parsedDate.dayOfMonth = values[2];
							parsedDate.time = parseTime(values[4]);
							break;
						case 1:
							/* added by Jonny, for 2012-02-07CET00:00:00 (Doctrine Entity -> Json Serializer) */
							subValues = values[0].split('');
							parsedDate.year = subValues[0] + subValues[1] + subValues[2] + subValues[3];
							parsedDate.month = subValues[5] + subValues[6];
							parsedDate.dayOfMonth = subValues[8] + subValues[9];
							parsedDate.time = parseTime(subValues[13] + subValues[14] + subValues[15] + subValues[16] + subValues[17] + subValues[18] + subValues[19] + subValues[20]);
							break;
						default:
							return null;
					}
				}
				parsedDate.date = new Date(parsedDate.year, parsedDate.month - 1, parsedDate.dayOfMonth);
				parsedDate.dayOfWeek = String(parsedDate.date.getDay());

				return parsedDate;
			},
			date: function (value, format) {
				try {
					var parsedDate = this.parseDate(value);

					if (parsedDate === null) {
						return value;
					}

					var date = parsedDate.date,
							year = parsedDate.year,
							month = parsedDate.month,
							dayOfMonth = parsedDate.dayOfMonth,
							dayOfWeek = parsedDate.dayOfWeek,
							time = parsedDate.time;

					var pattern = '',
							retValue = '',
							unparsedRest = '',
							inQuote = false;

					/* Issue 1 - variable scope issue in format.date (Thanks jakemonO) */
					for (var i = 0; i < format.length; i++) {
						var currentPattern = format.charAt(i);
						// Look-Ahead Right (LALR)
						var nextRight = format.charAt(i + 1);

						if (inQuote) {
							if (currentPattern == "'") {
								retValue += (pattern === '') ? "'" : pattern;
								pattern = '';
								inQuote = false;
							} else {
								pattern += currentPattern;
							}
							continue;
						}
						pattern += currentPattern;
						unparsedRest = '';
						switch (pattern) {
							case 'ddd':
								retValue += numberToLongDay(dayOfWeek);
								pattern = '';
								break;
							case 'dd':
								if (nextRight === 'd') {
									break;
								}
								retValue += padding(dayOfMonth, 2);
								pattern = '';
								break;
							case 'd':
								if (nextRight === 'd') {
									break;
								}
								retValue += parseInt(dayOfMonth, 10);
								pattern = '';
								break;
							case 'D':
								if (dayOfMonth == 1 || dayOfMonth == 21 || dayOfMonth == 31) {
									dayOfMonth = parseInt(dayOfMonth, 10) + 'st';
								} else if (dayOfMonth == 2 || dayOfMonth == 22) {
									dayOfMonth = parseInt(dayOfMonth, 10) + 'nd';
								} else if (dayOfMonth == 3 || dayOfMonth == 23) {
									dayOfMonth = parseInt(dayOfMonth, 10) + 'rd';
								} else {
									dayOfMonth = parseInt(dayOfMonth, 10) + 'th';
								}
								retValue += dayOfMonth;
								pattern = '';
								break;
							case 'MMMM':
								retValue += numberToLongMonth(month);
								pattern = '';
								break;
							case 'MMM':
								if (nextRight === 'M') {
									break;
								}
								retValue += numberToShortMonth(month);
								pattern = '';
								break;
							case 'MM':
								if (nextRight === 'M') {
									break;
								}
								retValue += padding(month, 2);
								pattern = '';
								break;
							case 'M':
								if (nextRight === 'M') {
									break;
								}
								retValue += parseInt(month, 10);
								pattern = '';
								break;
							case 'y':
							case 'yyy':
								if (nextRight === 'y') {
									break;
								}
								retValue += pattern;
								pattern = '';
								break;
							case 'yy':
								if (nextRight === 'y') {
									break;
								}
								retValue += String(year).slice(-2);
								pattern = '';
								break;
							case 'yyyy':
								retValue += year;
								pattern = '';
								break;
							case 'HH':
								retValue += padding(time.hour, 2);
								pattern = '';
								break;
							case 'H':
								if (nextRight === 'H') {
									break;
								}
								retValue += parseInt(time.hour, 10);
								pattern = '';
								break;
							case 'hh':
								/* time.hour is '00' as string == is used instead of === */
								hour = (parseInt(time.hour, 10) === 0 ? 12 : time.hour < 13 ? time.hour
										: time.hour - 12);
								retValue += padding(hour, 2);
								pattern = '';
								break;
							case 'h':
								if (nextRight === 'h') {
									break;
								}
								hour = (parseInt(time.hour, 10) === 0 ? 12 : time.hour < 13 ? time.hour
										: time.hour - 12);
								retValue += parseInt(hour, 10);
								// Fixing issue https://github.com/phstc/jquery-dateFormat/issues/21
								// retValue = parseInt(retValue, 10);
								pattern = '';
								break;
							case 'mm':
								retValue += padding(time.minute, 2);
								pattern = '';
								break;
							case 'm':
								if (nextRight === 'm') {
									break;
								}
								retValue += time.minute;
								pattern = '';
								break;
							case 'ss':
								/* ensure only seconds are added to the return string */
								retValue += padding(time.second.substring(0, 2), 2);
								pattern = '';
								break;
							case 's':
								if (nextRight === 's') {
									break;
								}
								retValue += time.second;
								pattern = '';
								break;
							case 'S':
							case 'SS':
								if (nextRight === 'S') {
									break;
								}
								retValue += pattern;
								pattern = '';
								break;
							case 'SSS':
								retValue += time.millis.substring(0, 3);
								pattern = '';
								break;
							case 'a':
								retValue += time.hour >= 12 ? 'PM' : 'AM';
								pattern = '';
								break;
							case 'p':
								retValue += time.hour >= 12 ? 'p.m.' : 'a.m.';
								pattern = '';
								break;
							case "'":
								pattern = '';
								inQuote = true;
								break;
							default:
								retValue += currentPattern;
								pattern = '';
								break;
						}
					}
					retValue += unparsedRest;
					return retValue;
				} catch (e) {
					if (console && console.log) {
						console.log(e);
					}
					return value;
				}
			},
			/*
			 * JavaScript Pretty Date
			 * Copyright (c) 2011 John Resig (ejohn.org)
			 * Licensed under the MIT and GPL licenses.
			 *
			 * Takes an ISO time and returns a string representing how long ago the date
			 * represents
			 *
			 * ('2008-01-28T20:24:17Z') // => '2 hours ago'
			 * ('2008-01-27T22:24:17Z') // => 'Yesterday'
			 * ('2008-01-26T22:24:17Z') // => '2 days ago'
			 * ('2008-01-14T22:24:17Z') // => '2 weeks ago'
			 * ('2007-12-15T22:24:17Z') // => 'more than 5 weeks ago'
			 *
			 */
			prettyDate: function (time) {
				var date;
				var diff;
				var day_diff;

				if (typeof time === 'string' || typeof time === 'number') {
					date = new Date(time);
				}

				if (typeof time === 'object') {
					date = new Date(time.toString());
				}

				diff = (((new Date()).getTime() - date.getTime()) / 1000);

				day_diff = Math.floor(diff / 86400);

				if (isNaN(day_diff) || day_diff < 0) {
					return;
				}

				if (diff < 60) {
					return 'just now';
				} else if (diff < 120) {
					return '1 minute ago';
				} else if (diff < 3600) {
					return Math.floor(diff / 60) + ' minutes ago';
				} else if (diff < 7200) {
					return '1 hour ago';
				} else if (diff < 86400) {
					return Math.floor(diff / 3600) + ' hours ago';
				} else if (day_diff === 1) {
					return 'Yesterday';
				} else if (day_diff < 7) {
					return day_diff + ' days ago';
				} else if (day_diff < 31) {
					return Math.ceil(day_diff / 7) + ' weeks ago';
				} else if (day_diff >= 31) {
					return 'more than 5 weeks ago';
				}
			},
			toBrowserTimeZone: function (value, format) {
				return this.date(new Date(value), format || 'MM/dd/yyyy HH:mm:ss');
			},
			delUTCTimeZone: function(value) {
				if (value.includes("+")) {
					var UTCZonePosition = value.indexOf("+");
					return value.substring(0, UTCZonePosition);
				}
			},	
		};
	}());
}(DateFormat));
;// require dateFormat.js
// please check `dist/jquery.dateFormat.js` for a complete version
(function ($) {
	$.niformat = DateFormat.format;
}(jQuery));
