angular.module('myApp').controller('boardCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## board.js ##")
		var el = $($element);
		var sAction = {
			save: '../board/saveBoard',
			comment : '../board/saveComment', // 댓글 저장
			childcomment : '../board/saveChildComment' // 대댓글 저장 

		};
		var gAction = {
			list: '../board/getBoardList', // user List 가져오기
			row: '../board/getRowBoard', // user Row 가져오기
			comment: '../board/getComment', // 댓글 가져오기

		};
		var table;
		$scope.boardData = { // board넘길 데이터
			category: "",
			title: "",
			content: ""
		}
		$scope.commentData= "" // comment넘길 데이터
		$scope.mode = "ins" // mode
		$scope.commentList = []; // 댓글관련
		
		$scope.replyTargetId = null;  // 현재 열려 있는 대댓글 입력창의 댓글 ID
		$scope.replyContent = {};     // 각 댓글 ID에 대한 입력 내용


		//------------------- user 테이블 리스트 -------------------		
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
				autoWidth: true,
				scrollX: true,
				scrollY: "500px",
				pageLength: 10,
				lengthMenu: [5, 10, 20, 50, 100],
				colReorder: {
					enable: true,
					realtime: true
				},
				ajax: {
					url: gAction.list,
					type: "POST",
					dataSrc: function(json) {
						console.log("## DataTable: ", niCvUt.resDataResultNum(json, "data", table));
						return niCvUt.resDataResultNum(json, "data", table);
					},
				},
				columns: [
					{ data: 'num', name: "num" },
					{ data: 'BOARD_TYPE', name: "BOARD_TYPE" },
					{ data: 'BOARD_TITLE', name: "BOARD_TITLE" },
					{ data: 'BOARD_USER_ID', name: "BOARD_USER_ID" },
					{ data: 'BOARD_MK_DT', name: "BOARD_MK_DT" },
					{ data: 'BOARD_STATUS', name: "BOARD_STATUS" },
					{ data: 'BOARD_LIKE_CNT', name: "BOARD_LIKE_CNT" }
				],
				columnDefs: [
					{ targets: [0], width: '5%', class: 'text-center', visible: true, sortable: false, searchable: false },
					{ targets: [1], width: '10%', class: 'text-center', visible: true, sortable: false, searchable: false },
					{
						targets: [2], width: '40%', class: 'text-left', render: function(data, type, row) {
							return '<a href="javascript:;" id="' + row._id + '"ng-click="board_view($event, \'upd\')">' + row.BOARD_TITLE + '</a>';
						}
					},
					{ targets: [3], width: '10%', class: 'text-left', visible: true, sortable: false, searchable: false },

					{ targets: [4], width: '10%', class: 'text-left', visible: true, sortable: false, searchable: false },

					{ targets: [5], width: '10%', class: 'text-left', visible: true, sortable: false, searchable: false },

					{ targets: [6], width: '10%', class: 'text-left', visible: true, sortable: false, searchable: false },

				],
				pagingType: "full_numbers",
				dom: 'z<"dt-toolbar" <"pull-left">> t <"dt-toolbar-footer" <"pull-right"p>>',
				language: {
					zeroRecords: "데이터가 없습니다",
					paginate: { first: "◀◀", last: "▶▶", next: "▶", previous: "◀" }
				},
				createdRow: function(row, data) {
					$compile(row)($scope);
				},
			});

			table.columns.adjust();
		}
		//------------------- userList 가져오기 -------------------
		$scope.board_table()


		//------------------- 등록 버튼 -------------------			
		$scope.board_add = function() {
			$scope.pop_init();
			$scope.mode = 'ins';

			el.find('#data_list').hide();
			el.find('#data_edit').show();

		};
		//------------------- 등록/편집창 닫기  -------------------						
		$scope.board_close = function() {
			$scope.pop_init();
			el.find('#data_edit').hide();
			el.find('#data_view').hide();
			el.find('#data_list').show();
		};
		//------------------- 입력값 초기화 -------------------				
		$scope.pop_init = function() {
			$scope.boardData = {}
		};
		//------------------- 등록 -------------------		
		$scope.board_save = function() {
			var param = $scope.boardData
			
			if($scope.mode =="ins"){
				param.mode = "ins"
			}else{
				param.mode = "upd"
			}
			
			console.log("param : ",param)
			if (confirm('저장하시겠습니까?')) {
				//niUt.startLoading('.panel-body');
				$http.post(sAction.save, param, $rootScope.http_config).then(function(rs) {
					if (rs.data.sOk == 'ok') {
						$scope.board_close();
						$scope.load_data();
						alert('저장 되었습니다.');
					}
					if (rs.data.sError)
						alert(rs.data.sError);
					if (rs.status == 440)
						$scope.$emit('pageRD', [location.href, rs.status]);
				}, function(rs) {
					$scope.$emit('pageRD', [location.href, rs.status]);
				});
			}

		};
//------------------- 보드 view -------------------
			$scope.board_view = function(e,type) {
				console.log("## board_detail type : ",type)
				$scope.mode = type
				
				el.find('#data_list').hide();
				el.find('#data_view').show();
				el.find('#data_edit').hide();

				$scope.pop_init();
				
				var param = { "_id": e.target.id};
				$http.post(gAction.row, param, $rootScope.http_config).then(function(rs) {
					var row = niCvUt.resDataResultOne(rs, "row");
					if (row.BOARD_CONTENT) {
				        row.BOARD_CONTENT = row.BOARD_CONTENT.replace(/\\n/g, '\n');
				    }
					if (row) {
						$scope.boardData = row
						el.find('#_id').val(row._id)
						$scope.comment_loard(); //댓글정보 가져오기 
					}
					if (rs.data.sError)
						alert(rs.data.sError);
				}, function(rs) {});

			};		
//------------------- 수정 -------------------
			$scope.board_edit = function(e,type) {
				console.log("@@@@ board_edit type : ",type)
				el.find('#data_list').hide();
				el.find('#data_view').hide();
				el.find('#data_edit').show();

			};
//------------------- 삭제 -------------------	
			$scope.board_delete = function() {
				if (confirm('삭제하시겠습니까?')) {
					$scope.mode = 'del';
					var param = {
						mode: $scope.mode,
						_id: el.find('#_id').val()
					};

					$http.post(sAction.save,param, $rootScope.http_config).then(function(rs) {
						if (rs.data.sOk == 'ok') {
							$scope.board_close();
							$scope.load_data();
							
							alert("삭제되었습니다.");
						}
						if (rs.data.sError)
							alert(rs.data.sError);
						if (rs.status == 440)
							$scope.$emit('pageRD', [location.href, rs.status]);
					}, function(rs) {
						$scope.$emit('pageRD', [location.href, rs.status]);
					});
					
				}
			};
//------------------- 댓글 저장 -------------------	
		$scope.comment_save = function() {
				var param ={
					comment : $scope.commentData,
					_id : el.find('#_id').val()
				}
				console.log("@@@ param : ",param)
				$http.post(sAction.comment,param, $rootScope.http_config).then(function(rs) {
						if (rs.data.sOk == 'ok') {
							alert("등록되었습니다.");
							$scope.commentData = ""
							setTimeout(function () {
								$scope.comment_loard();
							}, 100);
						}
						if (rs.data.sError)
							alert(rs.data.sError);
						if (rs.status == 440)
							$scope.$emit('pageRD', [location.href, rs.status]);
					}, function(rs) {
						$scope.$emit('pageRD', [location.href, rs.status]);
					});
		}
		
//------------------- 댓글 불러오기 -------------------
		$scope.comment_loard = function() {
			console.log("@@@ $scope.comment_loard @@@@")
			var param ={
				_id : el.find('#_id').val()
			}
			$http.post(gAction.comment,param, $rootScope.http_config).then(function(rs) {
				var comentData = niCvUt.resDataResult(rs,"row")
				if (rs.data.sOk == 'ok') {
					$scope.commentList = [];
					var commentMap = {};
					comentData.forEach(function(item) {
						if (item.COMMENT_CONTENT && typeof item.COMMENT_CONTENT === 'string') {
					        item.COMMENT_CONTENT = item.COMMENT_CONTENT.replace(/\\n/g, '\n');
					    }
					    item.CHILD_COMENTS = []; // 대댓글 배열 초기화
					    commentMap[item.COMMENT_ID] = item;
					});

					// 댓글,대댓글 관계 정리
					comentData.forEach(function(item) {
					    if (!item.COMMENT_PARENT_ID || item.COMMENT_PARENT_ID === "") { // 최상위 댓글
					        $scope.commentList.push(item);
					    } else { // 대댓글이 기존의 댓글에 추가
					        if (commentMap[item.COMMENT_PARENT_ID]) {
					            commentMap[item.COMMENT_PARENT_ID].CHILD_COMENTS.push(item);
					        }
					    }
					});
				}
				if (rs.data.sError)
					alert(rs.data.sError);
				if (rs.status == 440)
					$scope.$emit('pageRD', [location.href, rs.status]);
			}, function(rs) {
				$scope.$emit('pageRD', [location.href, rs.status]);
			});
		}
//------------------- 대댓글 작성란 -------------------
		$scope.replyComment = function(comment) {
			if ($scope.replyTargetId === comment.COMMENT_ID) {
		    	$scope.replyTargetId = null;  // 다시 누르면 닫기
		  	} else {
		    	$scope.replyTargetId = comment.COMMENT_ID;  // 해당 댓글 아래 입력창 열기
		  	}
		};
//------------------- 대댓글 저장 -------------------		
		$scope.saveReply = function(parentId) {
			var content = $scope.replyContent[parentId];
			if (!content || content.trim() === "") {
			  alert("내용을 입력하세요");
			  return;
			}
			
			var param = {
			  comment: content,
			  parentId: parentId,
			  _id: el.find('#_id').val()  // 해당 게시물 ID
			};
		  	$http.post(sAction.childcomment, param, $rootScope.http_config).then(function(rs) {
				console.log("rs : ",rs)
			    if (rs.data.sOk === 'ok') {
			    	alert("등록되었습니다.");
			      	$scope.replyTargetId = null;
			      	$scope.replyContent[parentId] = "";
      				setTimeout(function () {
						$scope.comment_loard();
					}, 100);
			      
			    } else if (rs.data.sError) {
			      alert(rs.data.sError);
			    }
		  	});
		  
		  
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
			    }, 1000);
			};






































	}]);

