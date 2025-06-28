angular.module('myApp').controller('editorElasticCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## editorElasticCtrl.js ##")
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
		// 로컬호스트 쿼리 저장용
		var createTable = function() {
			if (!localStorageDb) {jsUt.deflocalStorage('q_editor', { query_data: [] })}
		}
		createTable();		
		
		$scope.method_type = "GET"
		$scope._id =""; // row id
		$scope.detail = {}  // row detail

		el.find("#editor1").resizable({
			handles: "e",
			minWidth: 300,
			resize: function() {
				editor.resize(),
					query_editor2.resize()
			}
		});

		$(window).bind("resize", function() {
			var win_h = $(window).height();
			var win_w = $(window).width();
			var min_resizeable2 = win_w - 450;
			var $editor1 = el.find("#editor1");
			// resizable 초기화가 안 되어 있으면 초기화
			if (!$editor1.data("ui-resizable")) {
			    $editor1.resizable({
			        handles: "e, w"
			    });
			}
			$editor1.resizable("option", "maxWidth", min_resizeable2);
			var result_h = win_h - 320;
			el.find("#query_editor,#query_editor2").height(result_h);
		});
		var localStorageDb;

// 검색버튼
		$scope.btnSearch =  function(e){
			if (isSearch) {
				alert("검색이 진행중입니다.");
				return;
			}

  			const lines = editor.getSession().getDocument().getAllLines();
  			const requestPath = lines[1]?.trim().split(" ") || [];
  			const bodyLines = [];

			for (let i = 2; i < lines.length; i++) {
    			const line = lines[i];
    			if (line.includes(" //")) {
      				bodyLines.push(line.substring(0, line.indexOf(" //")));
    			} else {
      				bodyLines.push(line);
    			}
  			}
  			let data = bodyLines.join("\n").replace(/"""/gi, '"').replace(/\t/g, "");
  			
			isSearch = true;
			
			query_editor2.setValue("");
			insData(lines);
			get_recent_query();
			
			sendQuery(requestPath,data)
		}
// 쿼리보내기
		var sendQuery = function(req, data) {
			var method2= $scope.method_type;

			$http({method: 'POST', url: gAction.query, data: { method: method2, url: req[0], data: data }}).then(function(res) {
				if (res.data.error) {
					query_editor2.setValue(JSON.stringify(res.data, null, '\t'));
					isSearch = false;
				} else {
					query_editor2.setValue(JSON.stringify(res.data, null, '\t'));
					
					query_editor2.session.selection.clearSelection(); //fromJSON({row: 0, column: 0});
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

		    // 기존 쿼리 라인 추출
		    var lines = editor.getSession().getDocument().getAllLines();
		    var data = '';
		    var line_num = lines.length;
		    for (var i = 2; i < line_num; i++) {
		        data += lines[i] + (i == line_num - 1 ? "" : "\n");
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
		        query_index: lines[1],
		        query_content: data,
		        query_method: $scope.method_type
		    };
		
		    if (_id && _id !== "") {
		        param.type = "upd";
		        param._id = _id;
		    } else {
		        param.type = "ins";
		    }

		    // 🔹 전송
		    $http.post(sAction.save, param, $rootScope.http_config).then(function (rs) {
		        if (rs.data.sOk == "ok") {
		            alert(rs.data.sMeg);
		            $scope.load_data();
		        } else {
		            alert("처리 중 오류가 발생하였습니다. 다시 시도해주세요.");
		        }
		    });
		}


		
// 최근 검색쿼리 저장
		var insData = function(lines) {
			localStorageDb = jsUt.localStorage('q_editor');
			var q_title = lines[0]
			var q_index = lines[1]

			var data = '';
			var line_num = lines.length;
			for (var i = 2; i < line_num; i++) {
				if (i == line_num - 1) {
					data += lines[i]
				} else {
					data += lines[i] + "\n"
				}
			}
			var q_content = data;
			var query_mk_dt = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
			var search_query = { title: q_title, index: q_index, content: q_content, mk_dt: query_mk_dt }
			localStorageDb.query_data.push(search_query)
			jsUt.localStorage('q_editor', localStorageDb)

		}
// 최근 검색 쿼리
var get_recent_query = function() {
    const $select = el.find("#recent_query");
    $select.html("");
    $select.append('<option value="">최근 검색 쿼리</option>');

    const result = jsUt.localStorage("q_editor").query_data || [];

    // 가장 최근 것이 위로 오도록 역순 반복
    for (let i = result.length - 1; i >= 0; i--) {
        const item = result[i];
        $select.append(
            `<option value="${i}">(${item.mk_dt}) ${item.index}</option>`
        );
    }

    // multipleSelect 초기화 (반복문 밖!)
    $select.multipleSelect({
        filter: true,
        single: true,
        selectAll: false,
        width: '35%',
        onClick: function(v) {
            if (v.value !== "") get_recent(v.value);
        }
    });
}

var get_recent = function(rowid) {
    const rows = jsUt.localStorage("q_editor").query_data || [];
    const item = rows[rowid];
    if (!item) return;

    const q_title = item.title;
    const q_index = item.index;
    const q_content = item.content;

    editor.setValue(q_title + "\n" + q_index + "\n" + q_content, 1);
}
		get_recent_query()

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
		editor.setTheme("ace/theme/monokai");
		editor.completers = [{
  			getCompletions: function (editor, session, pos, prefix, callback) {
			    const lineIndex = 1;
			    const currentRow = pos.row;
			    const completions = [];
			    const lineText = session.getLine(lineIndex) || "";

    			if (currentRow === lineIndex) {
			    	const words = lineText.replace(/[\r\n]/g, " ").split(" ");
			      	const prevPhrase = words.length >= 2 ? words[words.length - 2].toLowerCase() : undefined;

			      	// 2번째 줄(인덱스 줄) 자동완성
			      	if (prevPhrase === undefined) {
			        	indexList.forEach((val, idx) => {
			          		completions.push({ caption: val, value: val, meta: "index", score: idx });
			        	});
			      	}
    			} else if (currentRow >= 3) {
      				let idx = 0;
      				agges.forEach(val => {
			        	completions.push({
				          	caption: val,
				          	snippet: `"${val}" ${aggs[val]}`,
				          	meta: "aggs",
				          	score: idx++
			        	});
      				});
      				bools.forEach(val => {
			        	completions.push({
				          	caption: val,
				          	snippet: bool[val],
				          	meta: "bool",
				         	score: idx++
			        	});
			      	});
      				defs.forEach(val => {
			        	completions.push({
			          		caption: val,
			          		snippet: def[val],
			          		meta: "def",
			          		score: idx++
			        	});
      				});
    			}

    			callback(null, completions);
  			}
		}];
		editor.keyBinding.addKeyboardHandler({
  			handleKeyboard: function (data, hash, keyString, keyCode) {
				let KEY_ENTER = 13;
				let KEY_P = 80;
				let LINE_INDEX = 1;
			    let editor = data.editor;
			    let pos = editor.getCursorPosition();
			    let session = editor.getSession();
			    let lines = session.getDocument().getAllLines();

			    // Ctrl+Enter → 검색 실행
			    if (hash === 1 && keyCode === KEY_ENTER) {
			      	$scope.btnSearch();
			      	return;
			    }

			    // Ctrl+P → 포맷 실행
			    if (hash === 1 && keyCode === KEY_P) {
			      	try {
			        	$scope.editorFormatting();
			      	} catch (e) {
			        	console.error("editorFormatting error:", e);
			      	}
			      	return;
			    }

			    // Enter 
			    if (keyCode === KEY_ENTER ) {
			      	const lineText = lines[LINE_INDEX] || "";
			
			      	// 두 번째 줄 비어있으면 경고
			      	if (pos.row === LINE_INDEX && lineText.trim() === "") {
			        	alert("두번째 줄에 인덱스를 입력하세요.\n[Ctrl + Space]로 인덱스 자동완성 가능합니다.");
			        	return { command: "null", passEvent: false };
			      	}
			
			      // 두 줄만 있을 경우 → {} 자동 삽입
			      	if (pos.row === LINE_INDEX && keyCode === KEY_ENTER && lines.length === 2) {
			        	session.insert({ row: 3, column: 0 }, "\n{\n}");
			        	editor.gotoLine(3, 1);
			        	return;
			      	}
			    }
  			}
		});
// 에이스 자동완성		
		$scope.editorFormatting = function() {
  			const lines = editor.getSession().getDocument().getAllLines();
  			const title = lines[0] || "";
  			const head = lines[1] || "";

		  	// 본문 줄 합치기 (2번째 줄 이후)
		  	let content = "";
		  	for (let i = 2; i < lines.length; i++) {
		   		content += lines[i];
		  	}

  			if (/\/\/.*/.test(content)) {
    			alert("JSON 내에 주석(//)이 포함되어 있습니다.\n자동 포맷팅을 위해 주석을 제거해주세요.");
    			return;
  			}

  			// 포맷팅 전 문자열 정리
  			content = content.replace(/"""/gi, '"').replace(/\t/g, "");

  			let formatted = "";
  			try {
    			formatted = JSON.stringify(JSON.parse(content), null, "\t");
  			} catch (e) {
    			alert("JSON 형식이 올바르지 않아 자동 포맷팅을 할 수 없습니다.");
    			return;
  			}

  			const result = [title, head, formatted].join("\n");
  			editor.setValue(result);
  			query_editor2.session.selection.clearSelection();
		};
// 에이스 에디터 셋팅(쿼리 결과 에디터)		
		var query_editor2 = ace.edit("query_editor2", {
			mode: "ace/mode/javascript",
			showPrintMargin: false,
			readOnly: true,
			tabSize: 2
		});
		el.find("#method_list").multipleSelect({filter: false, single: true, selectAll: false, width: '100px', onClick: function(v) {}});
		
		angular.element(el).ready(function() {
			editor.setValue("## 2번째줄에 인덱스,  3번째줄에 쿼리를 입력해주세요. ( \"ctrl+ spaceBar\"로 자동완성 )\n", 1);
			$(window).trigger("resize");
		});
		
// 노드 상태 조회
		$scope.nodeStat =  function(e){
			if (confirm("node 상태를 조회하시겠습니까?")) {
				$scope.method_type = "GET"
				var q_title = "node 상태 조회";
				var q_index = "_nodes/stats/os";
				var q_content = "{}";
				editor.setValue("## " + q_title + "\n" + q_index + "\n" + q_content, 1);
				$scope.btnSearch()
			}
		}
// 노드 서치 조회
		$scope.nodeSearch =  function(e){
			if (confirm("node 서치를 조회하시겠습니까?")) {
				$scope.method_type = "GET"
				var q_title = "node 서치 조회";
				var q_index = "_nodes/stats/indices/search";
				var q_content = "{}";
				editor.setValue("## " + q_title + "\n" + q_index + "\n" + q_content, 1);
				$scope.btnSearch()
			}
		}
// 클러스터 셋팅 조회
		$scope.clusetSet =  function(e){
			if (confirm("클러스터 셋팅을 조회하시겠습니까?")) {
				$scope.method_type = "GET"
				var q_title = "클러스터 셋팅 조회";
				var q_index = "_cluster/settings";
				var q_content = "{}";
				editor.setValue("## " + q_title + "\n" + q_index + "\n" + q_content, 1);
				$scope.btnSearch()
			}
		}		
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
						return jsUt.result(json, "data");
					},
					error: function(xhr) {

					}
				},
				pageLength: 4,
				pagingType: "custom_simple_numbers",
				scrollY: "225px",
				dom: 'z<"dt-toolbar"> t <"dt-toolbar-footer d-flex justify-content-center"p>',
				language: {
					zeroRecords: "데이터가 없습니다",
					lengthMenu: "<div class='pull-right'>_MENU_</div >",
					paginate: { first: "First", last: "Last", next: ">", previous: "<" }
				},
				columnDefs: [ 
					{ 
						targets: [0], width: '15%', class: 'textCenter',
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
						targets: [1], width: '35%', class: 'textCenter',
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
						targets: [2], width: '15%', class: 'textCenter',
						render: function(data, type, row) {
							let id = row.QUERY_USER_ID || "";
							if (id.length > 10) {
								return id.substring(0, 10) + "...";
							}
							return id;
						}
					},
					{
						targets: [3], width: '20%', class: 'textCenter',
						render: function(data, type, row) {
							let date = row.QUERY_MK_DT || "";
							return date.substring(0, 10); // "YYYY-MM-DD"
						}
					},
					{
						targets: [4], width: '15%', class: 'textCenter',
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
			var passData = jsUt.resultOne(rs, "data");
			if (!passData) {
	            console.warn("응답 데이터가 비어있습니다.", rs);
	            alert("해당 쿼리 정보를 불러오지 못했습니다.");
	            return;
       	 	}
       	 	$scope.detail = passData;
	        var q_index = passData.QUERY_INDEX || "";  // 인덱스셋팅
	        var q_content = passData.QUERY_CONTENT || ""; // 쿼리셋팅
	        $scope.method_type = passData.QUERY_METHOD || "GET"; // 메서드셋팅
	        const headerText = "## 2번째줄에 인덱스,  3번째줄에 쿼리를 입력해주세요. ( \"ctrl+ spaceBar\"로 자동완성 )\n";
			editor.setValue(headerText + q_index + "\n" + q_content, 1);
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
			
		$(document).ready(function() {
			cerebro_state();
		});
		
// 세레브로 상태
		function cerebro_state() {
			var color;
			$http.post(gAction.state).then(function(rs) {
				var status = rs.data.cc.status;
				switch (status) {
					case "green":
						color = "#1DDB16;";
						break;
					case "yellow":
						color = "#FFE400;";
						break;
					case "red":
						color = "#FF0000;";
						break;
				}
				$("#elastic_sts").css("background-color", color);
			});
		};			
				 
	 
	}]);