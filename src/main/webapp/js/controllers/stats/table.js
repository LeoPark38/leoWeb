angular.module('myApp').controller('tableCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## tableCtrl.js ##")
		var el = $($element);
		var sAction = {

		};
		var gAction = {
			list: '../airboard/getBoardList', // wrongData List 가져오기
		};

		var table;
		$scope.boardtext =""
		$scope.boardtype ="전체"
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
				scrollX: true,
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
						//console.log("## DataTable: ", jsUt.resultNum(json, "data", table));
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
		$scope.board_table()

		// 리사이즈
		$scope.board_table_resize = function() {
  			if (table) {
    			setTimeout(() => {
      				table.columns.adjust().draw(false);
    			}, 100);  // 위젯 리사이즈 후 짧은 딜레이 후 강제 조정
  			}
		};

	}]);

