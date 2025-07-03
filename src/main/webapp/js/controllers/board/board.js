angular.module('myApp').controller('boardCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## board.js ##")
		var el = $($element);
		var sAction = {
			save: '../board/saveBoard',
			comment : '../board/saveComment', // 댓글 저장
			childcomment : '../board/saveChildComment', // 대댓글 저장 
			cnt : '../board/updateViewCnt',
			updateLike : '../board/updateLike',
			delecomment: '../board/deleteComment', // 댓글 삭제

		};
		var gAction = {
			list: '../board/getBoardList', // user List 가져오기
			row: '../board/getRowBoard', // user Row 가져오기
			comment: '../board/getComment', // 댓글 가져오기
			LikeCheck: '../board/LikeCheck', // 좋아요수 체크
			likedBoard : '../board/likedBoard', // 사용자가 좋아요 누른 보드id 가져오기

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
		$scope.boardtype = "전체";
		$scope.boardText =""
		$scope.commentCnt = 0; // 댓글수
		$scope.showLiked= false; 
		$scope.likedBoardList;
		$scope.likeBtnLock = false;


		//------------------- board 테이블 리스트 -------------------		
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
/*						param.text_filter = el.find('#text_filter').val();
						param.field_filter = el.find('#field_filter').val();
*/						
						param.boardType = $scope.boardtype;
						param.boardText = $scope.boardtext;
						if ($scope.showOnlyLiked) {
							param.userId = $rootScope.userInfo.user_id;
							param.likeOnly = true;
							param.likedBoardList = JSON.stringify($scope.likedBoardList)
						}else{
							if (!$rootScope.userInfo || !$rootScope.userInfo.user_id) {
							    console.warn("User 정보 없음. 테이블 초기화 중단.");
							    return false;
							}
							param.userId = $rootScope.userInfo.user_id;
							param.likeOnly = false;							
						}
					},
					dataSrc: function(json) {
						return jsUt.resultNum(json, "data", table);
					},
				},
				columns: [
					{ data: 'num', name: "num" },
					{ data: 'BOARD_TYPE', name: "BOARD_TYPE" },
					{ data: 'BOARD_TITLE', name: "BOARD_TITLE" },
					{ data: 'BOARD_USER_ID', name: "BOARD_USER_ID" },
					{ data: 'BOARD_MK_DT', name: "BOARD_MK_DT" },
					{ data: 'BOARD_STATUS', name: "BOARD_STATUS" },
					{ data: 'BOARD_LIKE_CNT', name: "BOARD_LIKE_CNT" },
					{ data: 'BOARD_VIEW_CNT', name: "BOARD_VIEW_CNT" }
				],
				columnDefs: [
					{ targets: [0], width: '5%', class: 'textCenter', visible: true, searchable: false },
					{ targets: [1], width: '10%', class: 'textCenter',render: function(data, type, row) {
						    if (type === 'sort' || type === 'type') {
      							return data;
    						}
						    let fireIcon = row.BOARD_VIEW_CNT >= 10 ? '🔥 ' : '';
    						return fireIcon + data;
						}
					},
					{
						targets: [2], width: '45%', class: 'textLeft', render: function(data, type, row) {
							let title = row.BOARD_TITLE || '';
							let commentCount = row.COMMENT_COUNT || 0;
							let commentHtml = commentCount > 0 ? ` <span style="background-color:#e9f5ff; color:#007bff; padding:2px 6px; border-radius:10px; font-size:0.8em;">  ${commentCount}</span>`: '';
							
							return `<a href="javascript:;" id="${row._id}" ng-click="board_view($event, 'upd')">${title}</a>${commentHtml}`;
						}
					},
					{ targets: [3], width: '10%', class: 'textLeft', visible: true, searchable: false },

					{
						targets: [4], width: '10%', class: 'textLeft', render: function(data, type, row) {
							let date = row.BOARD_MK_DT.split('+')[0];

							return date;
						}
					},

					{ targets: [5], width: '10%', class: 'textLeft', visible: true, searchable: false },
					
					{ targets: [6], width: '5%', class: 'textLeft', visible: true, searchable: false },
					
					{ targets: [7], width: '10%', class: 'textLeft', visible: true, searchable: false },

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
				  }, 500);  // 렌더링 이후 컬럼 재계산
				},
				drawCallback: function() {
				  //table.columns.adjust();
				}
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
			$scope.replyTargetId = null;  // 현재 열려 있는 대댓글 입력창의 댓글 ID
			$scope.replyContent = {};     // 각 댓글 ID에 대한 입력 내용
			$scope.boardtype = "전체";
			$scope.boardText =""
		};
		//------------------- 등록 -------------------		
		$scope.board_save = function() {
			let type = $scope.boardData.BOARD_TYPE
			let title = $scope.boardData.BOARD_TITLE;
			let content = $scope.boardData.BOARD_CONTENT;
			
			if(!type){ alert("항목을 입력해주세요"); return; }
			if(!title){ alert("제목을 입력해주세요"); return; }
			if(!content){ alert("내용을 입력해주세요"); return;
			}
			var param =  $scope.boardData

			if($scope.mode =="ins"){
				param.mode = "ins"
			}else{
				param.mode = "upd"
			}
			param.userId = $rootScope.userInfo.user_id
			console.log("param : ",param)
			if (confirm('저장하시겠습니까?')) {
				$http.post(sAction.save, param, $rootScope.http_config).then(function(rs) {
					if (rs.data.sOk == 'ok') {
						$scope.board_close();
						$scope.load_data();
						alert('저장 되었습니다.');
					}
					if (rs.data.sError)
						alert(rs.data.sError);
				});
			}

		};
//------------------- 보드 view -------------------
			$scope.board_view = function(e,type) {
				$scope.mode = type
				
				el.find('#data_list').hide();
				el.find('#data_view').show();
				el.find('#data_edit').hide();

				$scope.pop_init();
				var id = e.target.id
				var param = { "_id": id};
				$http.post(gAction.row, param, $rootScope.http_config).then(async function(rs) {
					var row = jsUt.resultOne(rs, "row");
					if (row.BOARD_CONTENT) {
				        row.BOARD_CONTENT = jsUt.unescapeBoardContent(row.BOARD_CONTENT);
				    }
					if (row) {
						$scope.boardData = row
						$scope.boardData.BOARD_MK_DT = $scope.boardData.BOARD_MK_DT.split('+')[0];
						el.find('#_id').val(row._id)
						
						$scope.comment_loard(); //  댓글정보 가져오기 
						
						$scope.updateViewCnt(id) // 조회수 올리기 
						
						$scope.checkLike(); // 좋아요 체크
						
					}
					if (rs.data.sError)
						alert(rs.data.sError);
				}, function(rs) {});

			};	

//------------------- 조회수 Up  -------------------			
			$scope.updateViewCnt = function(id) {
				var param = { "_id": id};
				
				$http.post(sAction.cnt, param, $rootScope.http_config).then(function(rs) {
					//아래 로직확인 추가 해야함
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
					});
					
				}
			};
//------------------- 댓글 저장 -------------------	
		$scope.comment_save = function() {
				var param ={
					comment : $scope.commentData,
					_id : el.find('#_id').val(),
					userId : $rootScope.userInfo.user_id,
				}
				$http.post(sAction.comment,param, $rootScope.http_config).then(function(rs) {
						if (rs.data.sOk == 'ok') {
							alert("등록되었습니다.");
							$scope.commentData = ""
							setTimeout(function () {
								$scope.comment_loard();
							}, 500);
						}
						if (rs.data.sError)
							alert(rs.data.sError);
					});
		}
//------------------- 댓글 삭제 -------------------	
		$scope.delete_save = function(v) {
			if (confirm("삭제 하시겠습니까?")) {
				var param ={
					_id : v
				}
				$http.post(sAction.delecomment,param, $rootScope.http_config).then(function(rs) {
					console.log("rs :  ",rs)
					if (rs.data.sOk == 'ok') {
						setTimeout(function () {
							$scope.comment_loard();
						}, 1000);
					}
					if (rs.data.sError) alert(rs.data.sError);
				});
			}

		}
//------------------- 댓글 불러오기 -------------------
		$scope.comment_loard = function() {
			var param ={
				_id : el.find('#_id').val()
			}
			$http.post(gAction.comment,param, $rootScope.http_config).then(function(rs) {
				var comentData = jsUt.result(rs,"row")
				console.log("@ comentData : ",comentData)
				if (rs.data.sOk == 'ok') {
					$scope.commentCnt = comentData.length
					$scope.commentList = [];
					var commentMap = {};
					comentData.forEach(function(item) {
						if (item.COMMENT_CONTENT && typeof item.COMMENT_CONTENT === 'string') {
							item.COMMENT_CONTENT  = jsUt.unescapeBoardContent(item.COMMENT_CONTENT);
					        //item.COMMENT_CONTENT = item.COMMENT_CONTENT.replace(/\\n/g, '\n');
					    }
					    item.COMMENT_MK_DT = item.COMMENT_MK_DT.split('+')[0];
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
			  _id: el.find('#_id').val(),  // 해당 게시물 ID
			  userId : $rootScope.userInfo.user_id,
			};
		  	$http.post(sAction.childcomment, param, $rootScope.http_config).then(function(rs) {
			    if (rs.data.sOk === 'ok') {
			    	alert("등록되었습니다.");
			      	$scope.replyTargetId = null;
			      	$scope.replyContent[parentId] = "";
      				setTimeout(function () {
						$scope.comment_loard();
					}, 500);
			      
			    } else if (rs.data.sError) {
			      alert(rs.data.sError);
			    }
		  	});
		};
//------------------- 검색 -------------------		
		$scope.search_btn = function(parentId) {
			$scope.load_data();
		};

//------------------- 좋아요 중복 체크  -------------------		
		$scope.checkLike = async function() {
			var param = {
				_id : el.find('#_id').val(),
				userId : $rootScope.userInfo.user_id,
			};

			$http.post(gAction.LikeCheck, param, $rootScope.http_config).then(function(rs) {
					if (rs.data.cnt == 0) {
						$('#likeBtn').removeClass('btn-primary').addClass('btn-default');
					} else {
						$('#likeBtn').removeClass('btn-default').addClass('btn-primary');
					}
		  	});	

		};	
//------------------- 좋아요 버튼  -------------------		
		$scope.likeBoard = async function() {
			if ($scope.likeBtnLock) return;  // 중복 방지
			$scope.likeBtnLock = true;
			try {
				var param = {
					_id: el.find('#_id').val(),
					userId: $rootScope.userInfo.user_id
				};
				$http.post(gAction.LikeCheck, param, $rootScope.http_config).then(function(rs) {
					if (rs.data) {
						if (rs.data.cnt == 0) {
							param.type = "up";
							$scope.likeBoardPrc(param);
							$('#likeBtn').removeClass('btn-default').addClass('btn-primary');
							$scope.boardData.BOARD_LIKE_CNT = ($scope.boardData.BOARD_LIKE_CNT || 0) + 1; // 값 증가  
							
							// 종아요 버튼 누를시 하트 에니메이션
							const effect = document.getElementById('likeEffect');
							effect.classList.remove('active');
							void effect.offsetWidth; // reflow for restart
							effect.classList.add('active');
							// 애니메이션 끝나면 자동 제거
							effect.addEventListener('animationend', function handler() {
							  effect.classList.remove('active');
							  effect.removeEventListener('animationend', handler); // 한 번만 실행되게
							});
						} else {
							Swal.fire({
							  title: '좋아요를 취소할까요?',
							  text: "취소 후 좋아요를 다시 누를수 있습니다.",
							  icon: 'warning',
							  showCancelButton: true,
							  confirmButtonText: '네',
							  cancelButtonText: '아니오',
							    customClass: {
							    popup: 'my-swal-popup',
							    title: 'my-swal-title',
							    confirmButton: 'my-swal-confirm',
							    cancelButton: 'my-swal-cancel'
							    }
							}).then((result) => {
							  if (result.isConfirmed) {
								param.type = "down";
								$scope.likeBoardPrc(param);
								$('#likeBtn').removeClass('btn-primary').addClass('btn-default');
								$scope.boardData.BOARD_LIKE_CNT = Math.max(0, $scope.boardData.BOARD_LIKE_CNT - 1); // 값 감소

							  }
							});
						}
					}
			  	});	
			} catch (error) {
				console.error("좋아요 처리 중 에러:", error);
			}finally {
				$scope.likeBtnLock = false;
			}
		};

//------------------- 좋아요 처리 함수  -------------------		
		$scope.likeBoardPrc = function(param) {
		  	$http.post(sAction.updateLike, param, $rootScope.http_config).then(function(rs) {
				//$scope.$applyAsync()
				
		  	});			
		};
//------------------- 좋아요 글 보기 버튼  -------------------		
		$scope.showLikeBoard = function() {
		    $scope.showLiked = !$scope.showLiked;
		    $scope.filterBoardData();
		};

		$scope.filterBoardData = function() {
			$scope.showOnlyLiked = !$scope.showOnlyLiked;
			let param ={
				userId: $rootScope.userInfo.user_id
			}
			$http.post(gAction.likedBoard, param, $rootScope.http_config).then(function(rs) {
				$scope.likedBoardList = rs.data.data._source.USER_LIKE_BOARD // 사용자  좋아요 리스트 셋팅
		  	});	
			$scope.load_data(); // DataTable 리로드
		};



/*		document.getElementById('likeBtn').addEventListener('click', function (e) {
		  const burst = document.getElementById('likeEffect');
		  const x = e.clientX;
		  const y = e.clientY;
		
		  burst.style.left = `${x}px`;
		  burst.style.top = `${y}px`;
		  burst.classList.remove('like-burst'); // reset
		  void burst.offsetWidth; // reflow to restart animation
		  burst.classList.add('like-burst');
		});
*/




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
			
// 키 입력 이벤트			
			document.addEventListener('keydown', function(event) {
				//ESC 이벤트
		        if (event.key === 'Escape') {
		            $scope.$apply(function() {
		                $scope.board_close();
		                $scope.load_data();
		            });
		        }
		    });





































	}]);

