angular.module('myApp').controller('airBoardCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## airBoardCtrl.js ##")
		var el = $($element);
		var sAction = {

		};
		var gAction = {
			list: '../airboard/getBoardList', // wrongData List 가져오기
			row: '../airboard/getRowBoard', // wrongData Row 가져오기
		};

		var table;
		$scope.boardData = {}
		$scope.boardtype = "전체";
		//------------------- 테이블 리스트 -------------------		
		$scope.board_table = function() {
			table = el.find('#board_table').DataTable({
				order: [[1, 'asc']],
				retrieve: true,
				jQueryUI: false,
				lengthChange: false,
				deferRender: true,
				paging: true,
				processing: true,
				serverSide: false, // 
				stateSave: true,
				autoWidth: false,
				scrollX: false,
				scrollY: "500px",
				pageLength: 13,
				lengthMenu: [5, 10, 20, 50, 100],
				ajax: {
					url: gAction.list,
					type: "POST",
					data: function(param) {		
						param.boardType = $scope.boardtype;
						param.boardText = $scope.boardtext;
						console.log("@@ param : ",param)
					},
					dataSrc: function(json) {
						console.log("## resultNum: ", jsUt.resultNum(json, "data", table));
						return jsUt.resultNum(json, "data", table);
					},
				},
				columns: [
					{ data: 'num', name: "num" },
					{ data: 'stationName', name: "stationName" },
					{ data: 'khaiValue', name: "khaiValue" },
					{ data: 'khaiGrade', name: "khaiGrade	" },
					{ data: 'pm10Value', name: "pm10Value" },
					{ data: 'pm10Grade', name: "pm10Grade" },
					{ data: 'pm25Value', name: "pm25Value" },
					{ data: 'pm25Grade', name: "pm25Grade" },
					{ data: 'o3Value', name: "o3Value" },
					{ data: 'o3Grade', name: "o3Grade" },
					{ data: 'dataTime', name: "dataTime" }
				],
				columnDefs: [
					{ targets: [0], width: '5%', class: 'textCenter', visible: true, searchable: false },
					{
						targets: [1], width: '10%', class: 'textCenter', render: function(data, type, row) {
							let title = row.stationName || '';
							return `<a href="javascript:;" id="${row._id}" ng-click="board_view($event, 'upd')">${title}</a>`;
						}
					},
					{ targets: [2], width: '10%', class: 'textCenter', visible: true, searchable: false },
					{ targets: [3], width: '10%', class: 'textCenter', visible: true, searchable: false },
					{ targets: [4], width: '10%', class: 'textCenter', visible: true, searchable: false },
					{ targets: [5], width: '10%', class: 'textCenter', visible: true, searchable: false },
					{ targets: [6], width: '10%', class: 'textCenter', visible: true, searchable: false },
					{ targets: [7], width: '10%', class: 'textCenter', visible: true, searchable: false },
					{ targets: [8], width: '10%', class: 'textCenter', visible: true, searchable: false },
					{ targets: [9], width: '10%', class: 'textCenter', visible: true, searchable: false },
					{ targets: [10], width: '15%', class: 'textCenter', visible: true, searchable: false },

				],
				pagingType: "full_numbers",
				dom: 'z<"dt-toolbar"> t <"dt-toolbar-footer d-flex justify-content-center"p>',
				language: {
					zeroRecords: "데이터가 없습니다",
					paginate: { first: "◀◀", last: "▶▶", next: "▶", previous: "◀" }
				},
				createdRow: function(row, data) {
					$compile(row)($scope);
				},
				initComplete: function() {
				  setTimeout(function() {
				    table.columns.adjust().draw();
				  }, 100);  // 렌더링 이후 컬럼 재계산
				},
				drawCallback: function() {
				  //table.columns.adjust();
				}
			});

			table.columns.adjust();
		}
		//------------------- userList 가져오기 -------------------
		$scope.board_table()

//------------------- 보드 view -------------------
			$scope.board_view = function(e,type) {

				el.find('#data_list').hide();
				el.find('#data_view').show();

				$scope.pop_init();
				var id = e.target.id
				var param = { "_id": id};
				$http.post(gAction.row, param, $rootScope.http_config).then(async function(rs) {
					var row = jsUt.resultOne(rs, "row");
					console.log("row : ",row)

					if (row) {
						$scope.boardData = row

						
					}
					if (rs.data.sError)
						alert(rs.data.sError);
				}, function(rs) {});

			};
			
		//------------------- 입력값 초기화 -------------------				
		$scope.pop_init = function() {
			$scope.boardData = {}
			$scope.boardtype = "전체";
			$scope.boardText =""
		};			
			
		//------------------- 검색 -------------------		
		$scope.search_btn = function(parentId) {
			$scope.load_data();
		};			
		// 테이블 다시 그리기
			$scope.load_data = function() {
				setTimeout(() => {
			        if (table) {
			            console.log("🔁 table reload 시도");
			            table.columns.adjust().draw();
			            table.ajax.reload(null, false);
			        } else {
			            console.warn("❗ table is undefined");
			        }
			    }, 500);
			};			
		//------------------- 등록/편집창 닫기  -------------------						
		$scope.board_close = function() {
			$scope.pop_init();
			el.find('#data_list').show();
			el.find('#data_view').hide();
			
		};			

		//------------------- 검색 -------------------		
		$scope.sendMail = function() {
			alert("준비중인 기능입니다.")
		};			

			
		//------------------- 키보드 이벤트 -------------------				
		$(document).keydown(function(e) {
		  if (e.key === "Enter") {
		    e.preventDefault();
			$scope.search_btn()
		  }
		});			
		$(document).keydown(function(e) {
		  if (e.key === "Escape" || e.which === 27) {
		    e.preventDefault();  // 선택 사항: 기본 동작 막기
		    $scope.board_close();
		  }
		});			
			
			
			




	}]);

