(function ($) {
	$.extend({
		websocket: function (pid, url, protocol, option) {
			var ws;
			if (protocol) {
				ws = window['MozWebSocket'] ? new MozWebSocket(url, protocol) : window['WebSocket'] ? new WebSocket(url, protocol) :
						{
							send: function (m) {
								return false;
							},
							close: function () {
							}
						};
			} else {
				ws = window['MozWebSocket'] ? new MozWebSocket(url) : window['WebSocket'] ? new WebSocket(url) :
						{
							send: function (m) {
								return false;
							},
							close: function () {
							}
						};
			}

			var settings = {
				open: function () {
				},
				close: function () {
				},
				message: function () {
				},
				options: {},
				events: {}
			};

			ws.pid = pid;
			$.extend(settings, $.websocketSettings, option);
			$(ws)
					.bind('open', settings.open)
					.bind('close', settings.close)
					.bind('message', function (e) {
						if (e.originalEvent.data instanceof Blob) {
							settings.message.call(this, e.originalEvent.data, true);
						} else {
							//console.info(e.originalEvent.data)
							var m = JSON.parse(e.originalEvent.data);
							settings.message.call(this, m);
						}
					});

			ws.state = function () {
				return ws.readyState;
			};

			ws._send = ws.send;
			ws.send = function (type, id, data) {
				if (ws.readyState === 3) {
					ws = null;
					ws = $.websocket(this.pid, url, protocol, option);
					return false;
				} else if (ws.readyState === 1) {
					var m = {
						proto: type,
						pageId: parseInt(id),
						param: data
					};

					//m = $.extend(true, m, $.extend(true, {}, settings.options, m));
					//if (data) m['param'] = data;
					return ws._send($.toJSON(m));
				} else {
					return false;
				}
			};

			ws.send_t = function (type, id, data) {
				if (ws.readyState === 3) {
					ws = null;
					ws = $.websocket(this.pid, url, protocol, option);
					return false;
				} else if (ws.readyState === 1) {
					var m = {
						proto: type,
						pageId: parseInt(id),
						param: data
					};

					//m = $.extend(true, m, $.extend(true, {}, settings.options, m));
					//if (data) m['param'] = data;
					return ws._send($.toJSON(m));
				} else {
					return false;
				}
			};

			$(window).unload(function () {
				ws.close();
				ws = null;
			});

			return ws;
		},
		websocket2: function (url, option) {
			var ws;

			ws = window['MozWebSocket'] ? new MozWebSocket(url) : window['WebSocket'] ? new WebSocket(url) :
					{
						send: function (m) {
							return false;
						},
						close: function () {
						}
					};

			var settings = {
				open: function () {
				},
				close: function () {
				},
				message: function () {
				},
				options: {},
				events: {}
			};

			//ws.pid = pid;
			$.extend(settings, $.websocketSettings, option);
			$(ws)
					.bind('open', settings.open)
					.bind('close', settings.close)
					.bind('message', function (e) {
						//settings.message.call(this, e.originalEvent.data, true);					
						settings.message.call(this, e.originalEvent.data);
					});

			ws.state = function () {
				return ws.readyState;
			};

			ws._send = ws.send;
			ws.send = function (data) {
				if (ws.readyState === 3) {
					ws = null;
					ws = $.websocket2(url, option);
					return false;
				} else if (ws.readyState === 1) {
					return ws._send($.toJSON(data));
				} else {
					return false;
				}
			};
			
			ws._close = ws.close;
			$(window).unload(function () {
				ws.close();
				ws = null;
			});

			return ws;
		}
	});
})(jQuery);