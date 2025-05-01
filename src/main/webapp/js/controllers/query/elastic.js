angular.module('myApp').controller('editorElasticCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		var sAction = {
			save: '../query/elastic/setQuery'
		};
		
		var gAction = {
			state: '../query/elastic/getClusterState',
			idx:'../query/elastic/getIndexList',
			query:'../query/elastic/query',
			list: '../query/elastic/getListQuery',
			row: '../query/elastic/getRowQuery',
		};
		
		var el = $($element);
		var isSearch = false;
		var query_table;
		var indexList =[];
		var def = {
			"_source": '"_source" : {\n$0\t"includes": [],\n\t"excludes": []\n}',
			"shard_size": '"shard_size" : $0',
			"size": '"size" : $0',
			"aggs": '"aggs" : {\n\t$0\n}',
			"query_bool": '"query" : {\n\t"bool" : {\n\t\t$0\n\t}\n}',
			"bool": '"bool" : {\n\t$0\n}',
			"query": '"query" : {\n\t$0\n}',
		}
		var bool = {
			"should": '"should" : [\n\t$0\n]',
			"must_not": '"must_not" : [\n\t$0\n]',
			"must": '"must" : [\n\t$0\n]',
			"filter": '"filter" : [\n\t$0\n]',
			"exists": '"exists" : {\n\t"field":"$0"\n}',
			"range": '"range" : {\n\t"$0" : {\n\t\t"gte":"",\n\t\t"lte":""\n\t}\n}',
			"wildcard": '"wildcard" : {\n\t"$0":""\n}',
			"match_all": '"match_all" : {}',
			"match": '"match" : {\n\t"$0":""\n}',
			"term": '"term" : {\n\t"$0":""\n}',
		}
		var aggs = {
			"terms": ': {\n\t"field":"$0"\n}',
		}
		// 자동완성
		var defs = Object.keys(def);
		var bools = Object.keys(bool);
		var agges = Object.keys(aggs);
				
		$scope.method_type = "GET"
		$scope._id =""; // row id
		$scope.detail = {}  // row detail

		el.find("#editor1").resizable({
			handles: "e",
			minWidth: 300,
			resize: function() {
				editor.resize(),
					rt_view.resize()
			}
		});
		//@@EXP 화면 리사이즈시 실행되는 부분
		$(window).bind("resize", function() {
			var win_h = $(window).height();
			var win_w = $(window).width();
			var min_resizeable2 = win_w - 450;
			el.find("#editor1").resizable("option", "maxWidth", min_resizeable2);
			var result_h = win_h - 280;
			var org_width1 = el.find("#editor1").width();
			el.find("#editor2").width(win_w - 160 - org_width1);
			el.find("#query_editor,#rt_view").height(result_h);
		});
		var db;
		$scope.mode = "json";

		$(document).ready(function() {
			cluster_state();
		});		
		
		function cluster_state() {
			var color;
			$http.post(gAction.state).then(function(rs) {
				var status = rs.data.cc.status;
				switch (status) {
					case "green":
						color = "#25459c;";
						break;
					case "yellow":
						color = "#efe900;";
						break;
					case "red":
						color = "#ea0000;";
						break;
				}
				$("#elastic_sts").css("background-color", color);
			});
		};		
		$scope.btnSearch =  function(e){
			console.log("@@@@ search")
			if (isSearch) {
				alert("검색이 진행중입니다.");
				return;
			}

			var texts = editor.getSession().doc.$lines;
			var req = texts[1].split(' ');
			var data = '';
			var line_num = texts.length;

			for (var i = 2; i < line_num; i++) {
				if (texts[i].indexOf(" //") != -1) {	//주석일 경우
					data += texts[i].substring(0, texts[i].indexOf(" //")) + "\n";
				} else {
					data += texts[i] + "\n";
				}
			}
			data = data.replace(/"""/gi, "\"");
			data = data.replace(/\t/g, "");

			isSearch = true;
			
			rt_view.setValue("");
			insertData(texts);
			prev_list_load();
			
			sendQuery(req,data)
		}

		var sendQuery = function(req, data) {
			var method2= $scope.method_type;
			//쿼리 실행
			$http({method: 'POST', url: gAction.query, data: { method: method2, url: req[0], data: data }}).then(function(res) {
				if (res.data.error) {
					rt_view.setValue(JSON.stringify(res.data, null, '\t'));
					isSearch = false;
				} else {
					rt_view.setValue(JSON.stringify(res.data, null, '\t'));
					
					rt_view.session.selection.clearSelection(); //fromJSON({row: 0, column: 0});
					isSearch = false;
				}
			});
		};
// 초기화 버튼
		$scope.btnResetQuery =  function(e){
			if (confirm("작성한 쿼리를 초기화 하시겠습니까?")) {
				editor.setValue("## 2번째줄에 인덱스,  3번째줄에 쿼리를 입력해주세요. ( \"ctrl+ spaceBar\"로 자동완성 )\n", 1);
				$scope._id = ""
				$scope.detail={}; //row 초기화
			}
		}
// 저장 버튼		
		$scope.btnQuerySave =  function(){
		    var _id = $scope._id;
		    var userInput = "";
			console.log("detail : ",$scope.detail)
		    // 기존 쿼리 라인 추출
		    var texts = editor.getSession().doc.$lines;
		    var data = '';
		    var line_num = texts.length;
		    for (var i = 2; i < line_num; i++) {
		        data += texts[i] + (i == line_num - 1 ? "" : "\n");
		    }
		
		    // 정규식
		    const invalidPattern = /[<>\\{}[\]"']/;
		
		    // 업데이트 모드일 때
		    if (_id && _id !== "") {
		        const wantsToEdit = confirm("제목도 수정하시겠습니까?");
		        if (wantsToEdit) {
		            userInput = prompt("변경할 쿼리 제목을 입력하세요:");
		            if (!userInput || userInput.trim() === "") {
		                alert("입력이 취소되었거나 비어 있습니다.");
		                return;
		            }
		        } else {
		            userInput = $scope.detail.QUERY_TITLE || "";
		        }
		    } 
		    // 신규 등록일 때
		    else {
		        userInput = prompt("쿼리 제목을 입력하세요:");
		        if (!userInput || userInput.trim() === "") {
		            alert("입력이 취소되었거나 비어 있습니다.");
		            return;
		        }
		    }
		
		    // 특수문자 체크
		    if (invalidPattern.test(userInput)) {
		        alert("특수문자는 사용할 수 없습니다.");
		        return;
		    }
		
		    var param = {
		        query_title: userInput,
		        query_index: texts[1],
		        query_content: data,
		        query_method: $scope.method_type
		    };
		
		    if (_id && _id !== "") {
		        param.type = "upd";
		        param._id = _id;
		    } else {
		        param.type = "ins";
		    }
			console.log("@@ param : ",param)
		    // 🔹 전송
		    $http.post(sAction.save, param, $rootScope.http_config).then(function (rs) {
		        if (rs.data.sOk == "ok") {
		            alert(rs.data.sMeg);
		            $scope.load_data();
		        } else {
		            alert("처리 중 오류가 발생하였습니다. 다시 시도해주세요.");
		        }
		    }, function (rs) {
		        $scope.$emit('pageRD', [location.href, rs.status]);
		    });
		}
// 노드 상태 조회
		$scope.nodeStat =  function(e){
			if (confirm("node 상태를 조회하시겠습니까?")) {
				$scope.method_type = "GET"
				var query_title = "node 상태 조회";
				var query_index = "_nodes/stats/os";
				var query_content = "{}";
				editor.setValue("## " + query_title + "\n" + query_index + "\n" + query_content, 1);
				$scope.btnSearch()
			}
		}
// 노드 서치 조회
		$scope.nodeSearch =  function(e){
			if (confirm("node 서치를 조회하시겠습니까?")) {
				$scope.method_type = "GET"
				var query_title = "node 서치 조회";
				var query_index = "_nodes/stats/indices/search";
				var query_content = "{}";
				editor.setValue("## " + query_title + "\n" + query_index + "\n" + query_content, 1);
				$scope.btnSearch()
			}
		}
// 클러스터 셋팅 조회
		$scope.clusetSet =  function(e){
			if (confirm("클러스터 셋팅을 조회하시겠습니까?")) {
				$scope.method_type = "GET"
				var query_title = "클러스터 셋팅 조회";
				var query_index = "_cluster/settings";
				var query_content = "{}";
				editor.setValue("## " + query_title + "\n" + query_index + "\n" + query_content, 1);
				$scope.btnSearch()
			}
		}
// 로컬호스트 쿼리 저장용
		var createTable = function() {
			if (!db) {
				niUt.defLcst('q_editor', { query_data: [] })
			}
		}
		createTable();

		var insertData = function(texts) {
			db = niUt.lcst('q_editor');
			var mode = 'json';
			var query_title = texts[0]
			var query_index = texts[1]

			var data = '';
			var line_num = texts.length;
			for (var i = 2; i < line_num; i++) {
				if (i == line_num - 1) {
					data += texts[i]
				} else {
					data += texts[i] + "\n"
				}
			}
			var query_content = data;
			var query_mk_dt = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
			var search_query = { mode: mode, title: query_title, index: query_index, content: query_content, mk_dt: query_mk_dt }
			db.query_data.push(search_query)
			niUt.lcst('q_editor', db)

		}

		var prev_list_load = function() {
			var mode = $scope.mode
			el.find("#prev_list").html("");
			el.find("#prev_list").append('<option value="">최근 검색 쿼리</option>');
			var result = niUt.lcst("q_editor").query_data
			for (var i = 0; i < result.length; i++) {
				if (mode === result[i].mode) {
					el.find("#prev_list").append('<option value="' + i + '">' + "(" + result[i].mk_dt + ") " + result[i].index + '</option>')
				}
				el.find("#prev_list").multipleSelect({
					filter: true, single: true, selectAll: false, width: '490px', onClick: function(v) {
						if (v.value != "") {
							prev_load(v.value, mode);
						}
					}
				})
			}
		}

		var prev_load = function(rowid, mode) {
			var selected_mode = 'json';
			if (selected_mode === mode) {
				var row = niUt.lcst("q_editor").query_data
				var query_title = row[rowid].title
				var query_index = row[rowid].index
				var query_content = row[rowid].content
				editor.setValue(query_title + "\n" + query_index + "\n" + query_content, 1);
			}
		}
		prev_list_load()

// 인덱스명 배열 셋팅
		$http.get(gAction.idx).then(function(res) {
		  	indexList = res.data;  // 인덱스명 배열
		});
// 에이스 에디터 설정(쿼리 검색 에디터)		
		ace.require("ace/ext/language_tools");
		var editor = ace.edit("query_editor", {
			mode: "ace/mode/javascript",
			tabSize: 2,
			showPrintMargin: false,
			useWorker: false,
			enableBasicAutocompletion: true,
			enableSnippets: true,
			enableLiveAutocompletion: false
		});
// 에이스 자동완성		
		var queryAutoFormatting = function() {
			var text = editor.getSession().doc.$lines;
			var title = text[0];
			var head = text[1];
			var note = '';

			var content = "";
			for (var i = 2; i < text.length; i++) {
				if (text[i].indexOf("//") != -1) {
					content += text[i].substring(0, text[i].indexOf("//"));
					note += text[i].substring(text[i].indexOf("//"), text[i].length) + "\n";
				} else {
					content += text[i];
				}
			}
			content = content.replace(/"""/gi, "\"");
			content = content.replace(/\t/g, "");

			editor.setValue(title + "\n" + head + "\n" + JSON.stringify(JSON.parse(content), null, '\t') + "\n" + note);
			rt_view.session.selection.clearSelection();
		};
		editor.setTheme("ace/theme/monokai");
		editor.completers = [{
			getCompletions: function(editor, session, pos, prefix, callback) {
				var val = session.doc.$lines[1].replace(/[\r\n]/g, ' ').split(' ');
				var prevPhrase = val[val.length - 2]; //지금 입력 들어가기 전에 입력 들어간거

				if (pos.row == 1) {
					if (prevPhrase) {
						prevPhrase = prevPhrase.toLowerCase();
					}
					if (prevPhrase == undefined) {
						var idx = 0;
						callback(null, indexList.map(function(val) {
							return {
								caption: val, value: val, meta: "index", score: idx++
							};
						}));
					}
				} else if (pos.row >= 3) {
					var idx = 0;

					callback(null, agges.map(function(val) {
						return {
							caption: val, snippet: '"' + val + '" ' + aggs[val], meta: "aggs", score: idx++
						};
					}));
					callback(null, bools.map(function(val) {
						return {
							caption: val, snippet: bool[val], meta: "bool", score: idx++
						};
					}));
					callback(null, defs.map(function(val) {
						return {
							caption: val, snippet: def[val], meta: "def", score: idx++
						};
					}));
				}
				
			}
		}];
		editor.keyBinding.addKeyboardHandler({
			handleKeyboard: function(data, hash, ks, kc) {
				if (hash === 1 && kc === 13) {
					$scope.btnSearch()
				} else if (hash === 1 && kc === 75) {
					try {
						queryAutoFormatting();
					} catch (e) {
						console.error("error : " ,e);
					}
				} else if (kc === 13 || kc === 40) {
					var pos = data.editor.getCursorPosition();
					var text = data.editor.session.doc.$lines;
					if (pos.row === 1 && text[1].trim() === "") {
						alert("두번째줄에 인덱스를 선택후 진행해주세요.\n[ \"Ctrl+space\"로 인덱스목록 확인 가능 ]");
						return { command: "null", passEvent: false }; // 엔터 기본 동작 막기
					}
			
					if (pos.row == 1) {
						var text = data.editor.session.doc.$lines;

						if (kc === 13 && text.length === 2) {
							data.editor.session.insert({ row: 3, column: 0 }, "\n{\n}");
							data.editor.gotoLine(3, 1);
						}
					}
				}
			}
		});
// 에이스 에디터 셋팅(쿼리 결과 에디터)		
		var rt_view = ace.edit("rt_view", {
			mode: "ace/mode/javascript",
			showPrintMargin: false,
			readOnly: true,
			tabSize: 2
		});
		el.find("#method_list").multipleSelect({filter: true, single: true, selectAll: false, width: '120px', onClick: function(v) {}});
		
		angular.element(el).ready(function() {
			$(window).trigger("resize");
			editor.setValue("## 2번째줄에 인덱스,  3번째줄에 쿼리를 입력해주세요. ( \"ctrl+ spaceBar\"로 자동완성 )\n", 1);											
		});
		
// 저장된 쿼리 모달	열기 버튼
		$scope.queryMange = function(){
			let css ={
				'paddingTop': '10px',
				'paddingRight': '10px',
				'paddingBottom': '10px',
				'paddingLeft': '10px'
			}
			$scope._id = "" // 아이디 초기화
			$scope.detail={}; //row 초기화
			openModal('queryModal',css);
			// 쿼리테이블 만들기
			queryTable()
		}	
// 저장된 쿼리 모달	닫기 버튼		
		$scope.queryModal_close = function(){
			el.find('#queryModal').trigger('reveal:close');	
		}	
				
		function openModal(id,css){
			// 모달창 관련 옵션
			el.find('#'+id).width(750);
			el.find('#'+id).height(425);
			el.find('#'+id).css('margin-left', -(650 / 2));
			el.find('#'+id+' .panel-body').css(css)//--> css 는 {} 로
			el.find('#'+id).css('top', 196);
			el.find('#'+id).css('border', "solid");
			el.find('#'+id).css('z-index', 10);
			el.find('#'+id).reveal({
				animation: 'none',
				closeonbackgroundclick: true
			});	
		}
// 저장된 쿼리 테이블		
		function queryTable() {
			query_table = el.find("#query_table").DataTable({
				order: [[2, 'desc']],
				// orderFixed: { post: [0, 'asc'] },
				retrieve: true,
				jQueryUI: false,
				autoWidth: true,
				lengthChange: false,
				deferRender: true,
				paging: true,
				processing: true,
				serverSide: false,
				searching: false, // 검색 비활성화
				info: false,
				ajax: {
					url: gAction.list,
					type: "POST",
					data: function(param) {
					},
					dataSrc: function(json) {
						return niCvUt.resDataResult(json, "data");
					},
					error: function(xhr) {
						console.log("@@ xhr : ",xhr)
						if ("error" == xhr.statusText || xhr.readyState == 4)
							$scope.$emit('pageRD', [location.href, xhr.status]);
					}
				},
				pageLength: 3,
				pagingType: "custom_simple_numbers",
				// scrollY: "365px",
				// dom: 'z<"dt-toolbar" <"pull-left"f>> t <"dt-toolbar-footer" <"pull-left"> <"pull-right"p>>',
				language: {
					zeroRecords: "데이터가 없습니다",
					lengthMenu: "<div class='pull-right'>_MENU_</div >",
					paginate: { first: "First", last: "Last", next: ">", previous: "<" }
				},
				columnDefs: [ 
					{ 
						targets: [0], width: '15%', class: 'text-center',
						render: function(data, type, row) {
							let method = row.QUERY_METHOD.toUpperCase();
							let color = "";
					
							switch (method) {
								case "GET":
									color = "red"; break;
								case "POST":
									color = "orange"; break;
								case "PUT":
									color = "green"; break;
								default:
									color = "gray"; break;
							}
					
							return `<span style="color: ${color}; font-weight: bold;">${method}</span>`;
						}
					},
					{
						targets: [1], width: '35%', class: 'text-center',
						render: function(data, type, row) {
							let title = row.QUERY_TITLE || "";
							if (title.length > 20) {
								title = title.substring(0, 20) + "...";
							}
							var html = '<div style="display: flex; align-items: center;">';
							html += '<a href="javascript:;" ng-click="queryDetail($event)" style="margin-right: auto; margin-left: auto;" id=' + row._id + ' >' + title+ '</a>';

							return html;
						}
					},
					{
						targets: [2], width: '15%', class: 'text-center',
						render: function(data, type, row) {
							let id = row.QUERY_USER_ID || "";
							if (id.length > 10) {
								return id.substring(0, 10) + "...";
							}
							return id;
						}
					},
					{
						targets: [3], width: '20%', class: 'text-center',
						render: function(data, type, row) {
							let date = row.QUERY_MK_DT || "";
							return date.substring(0, 10); // "YYYY-MM-DD"
						}
					},
					{
						targets: [4], width: '15%', class: 'text-center',
						render: function(data, type, row) {
							let str = '<button class="btn btn-xs btn-danger del_row" ng-click="queryDelete(\'' + row._id + '\')" style="margin:3px 0 0 0;">';
							str += '<span class="glyphicon glyphicon-trash"></span></button>';
							return str;
						}
					},
				],
				columns: [
					{ data: "QUERY_METHOD", name: "QUERY_METHOD" },
					{ data: "QUERY_TITLE", name: "QUERY_TITLE" },
					{ data: "QUERY_USER_ID", name: "QUERY_USER_ID" },
					{ data: "QUERY_MK_DT", name: "QUERY_MK_DT" },
					{ data: "_id", name: "_id" },
				],
				createdRow: function(row, data) {
					$compile(row)($scope);
				}
			});
			query_table.columns.adjust();
		}
// 저장된 쿼리 가져오기
	$scope.queryDetail =function(e){
		var id = e?.target?.id || "";
		if (!id) {
	        console.warn("선택된 쿼리의 ID가 없습니다.");
	        alert("선택한 쿼리에 문제가 있습니다.");
	        return;
	    }

		var param = {
			_id: id
		}
		$http.post(gAction.row, param, $rootScope.http_config).then(function(rs) {
			var passData = niCvUt.resDataResultOne(rs, "data");
			if (!passData) {
	            console.warn("응답 데이터가 비어있습니다.", rs);
	            alert("해당 쿼리 정보를 불러오지 못했습니다.");
	            return;
       	 	}
       	 	$scope.detail = passData;
	        var query_index = passData.QUERY_INDEX || "";  // 인덱스셋팅
	        var query_content = passData.QUERY_CONTENT || ""; // 쿼리셋팅
	        $scope.method_type = passData.QUERY_METHOD || "GET"; // 메서드셋팅
	        const headerText = "## 2번째줄에 인덱스,  3번째줄에 쿼리를 입력해주세요. ( \"ctrl+ spaceBar\"로 자동완성 )\n";
			editor.setValue(headerText + query_index + "\n" + query_content, 1);
			$scope._id = passData._id;
			$scope.queryModal_close(); // 모달 닫아주기
		}, function(err) {
			console.error("쿼리 상세 조회 실패:", err);
       	 	alert("서버와 통신 중 오류가 발생했습니다.");
		});
	}	
// 저장된 쿼리 삭제
	$scope.queryDelete =function(_id){
		var id = _id
		if (!id) {
	        console.warn("선택된 쿼리의 ID가 없습니다.");
	        alert("선택한 쿼리에 문제가 있습니다.");
	        return;
	    }
	    
		if (confirm("저장된 쿼리를 삭제 하시겠습니까?")) {
			var param = {
				mode: "del",
				_id: id
			}
			$http.post(sAction.save,param, $rootScope.http_config).then(function(rs) {
				if (rs.data.sOk == "ok") {
					alert(rs.data.sMeg);
		            $scope.load_data();
				} else {
					alert("삭제 중 오류가 발생하였습니다. 다시 시도해주세요");
				}
			}, function(rs) {
				$scope.$emit('pageRD', [location.href, rs.status]);
			});
		}	    	

	}		
// 테이블 다시 그리기
			$scope.load_data = function() {
				setTimeout(() => {
			        if (query_table) {
			            query_table.columns.adjust().draw();
			            query_table.ajax.reload(null, false);
			        } else {
			            console.warn("table is undefined");
			        }
			    }, 1000);
			};		 
	 
	}]);