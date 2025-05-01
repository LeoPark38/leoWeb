angular.module('myApp').controller('UserCtrl', [
	'$scope', '$http','$element', '$rootScope',  '$compile', '$filter', '$timeout', '$compile',
	 function($scope, $http, $element, $timeout, $compile, $rootScope) {
		console.log("##### UserCtrl in #####");
    	var el = $($element);
		var sAction = {
			save: '../user/saveUser',
			userExcelUpload: '../user/setUserExcelUpload',
		};
		var gAction = {
			list: '../user/getListUser', // user List 가져오기
			row: '../user/getRowUser', // user Row 가져오기
			idCheck: '../user/getRowIdCheck',
			excelDownUser: '../user/getExcelDownUser',
		};
		var table;
		var idChecked = false;
		$scope.save_mode = "ins";

		
//------------------- user 테이블 리스트 -------------------
		$scope.load_table = function() {
			var win_h = $(window).height();
			var head_h = $("#header").height();
			var mrg_h = (15 * 2) + (15 * 2) + (2 + 10) + (2 + 10);
			var list_h = win_h - (head_h + 1) - 30 - mrg_h;
			const scrollY = list_h - 185;

			table = el.find('#data_table').DataTable({
					order: [[1, 'asc']],
					retrieve: true,
					jQueryUI: false,
					lengthChange: false,
					deferRender: true,
					paging: true,
					processing: true,
					serverSide: false,
					stateSave: true,
					autoWidth: false,
					scrollX: false,
					colResize: {
						scrollY: scrollY,
						resizeable: true,
						resizeTable: true
					},
					colReorder: {
						enable: true,
						realtime: true
					},
			    ajax: {
			        url: gAction.list,
			        type: "POST",
			        dataSrc: function(json) {
						console.log("json: ",json)
		            	console.log("niCvUt.resDataResultNum : ", niCvUt.resDataResultNum(json, "data", table));
		            	return niCvUt.resDataResultNum(json, "data", table);
		            },
			    },
			    columns: [
					{ data: 'num' ,name: "num"},
			        { data: 'USER_ID' ,name: "USER_ID"},	//사용자 ID
			        { data: 'USER_NAME' ,name: "USER_NAME"},	//사용자
			        { data: 'USER_ID' ,name: "USER_ID"},	//권한
			        { data: 'USER_PHONE' ,name: "USER_PHONE"},	//전화번호
			        { data: 'USER_UPD_DT' ,name: "USER_UPD_DT"}	//생성일
			    ],
	    		columnDefs: [
	                { targets: [0], width: '5%', class: 'text-left', visible: true, sortable: false, searchable: false },
					{
						targets: [1], width: '10%', class: 'text-left', render: function(data, type, row) {
							return '<a href="javascript:;" id="' + row._id + '"ng-click="pop_edit($event, \'upd\')">' + row.USER_ID + '</a>';
						}
					},
	            ],
			    pageLength: 3,
			    pagingType: "custom_simple_numbers",
		        dom: 'z<"dt-toolbar" <"pull-left">> t <"dt-toolbar-footer" <"pull-right"p>>',
		        language: {
	                zeroRecords: "데이터가 없습니다",
	                paginate: { first: "First", last: "Last", next: ">", previous: "<" }
		        },
		        createdRow: function(row, data) {
					$compile(row)($scope);
				},
			});
			
			table.columns.adjust();
		}
//------------------- userList 가져오기 -------------------
		 $scope.load_table()

//------------------- 수정 -------------------
			$scope.pop_edit = function(e,type) {
				console.log("@@@@ pop_edit type : ",type)
				$scope.mode = type
				
				el.find('#data_list').hide();
				el.find('#data_edit').show();

				$scope.pop_init();
				
				el.find('#USER_PW').attr('placeholder', "영문+숫자+특수문자 포함 최소 8글자, 공백은 기존 비밀번호 유지");
				idChecked = true;
				el.find('#btn_delete').attr('disabled', false);
				el.find('#id_check').attr('disabled', true);

				var param = { "_id": e.target.id};
				console.log("@@ param : ",param)
				$http.post(gAction.row, param, $rootScope.http_config).then(function(rs) {
					el.find('#data_edit').show();
					var row = niCvUt.resDataResultOne(rs, "row");
					console.log("row : ",row)
					if (row) {
						el.find('#USER_ID').val(row.USER_ID).attr('disabled', true);
						//el.find('#passwd').val("");//존재하고있다고 명시해줘야됨 플래그값주고, 명시가 되있으면 공백으로 하여도 쿼리가 보내져야함
						el.find('#USER_NM').val(row.USER_NAME);
						if (row.USER_PHONE != null) {
							var user_tel = [];
							user_tel = row.USER_PHONE.split("-");
							el.find('#USER_TEL1').val(user_tel[0]);
							el.find('#USER_TEL2').val(user_tel[1]);
							el.find('#USER_TEL3').val(user_tel[2]);
						}
						if (row.IS_SIR_USE != null) {
							if (row.IS_SIR_USE == 'true' || row.IS_SIR_USE == true) {
								el.find('#IS_SIR_USE').prop('checked', true);
							}
						}
						if (row.IS_QUERY_USE != null) {
							if (row.IS_QUERY_USE == 'true' || row.IS_QUERY_USE == true) {
								el.find('#IS_QUERY_USE').prop('checked', true);
							}
						}
						if (row.IS_ETC_USE != null) {
							if (row.IS_ETC_USE == 'true' || row.IS_ETC_USE == true) {
								el.find('#IS_ETC_USE').prop('checked', true);
							}
						}
						if (row.IS_USE != null) {
							if (row.IS_USE == 'true' || row.IS_USE == true) {
								el.find('#IS_USE').prop('checked', true);
							}
						}						
						
						el.find('#_id').val(row._id);

					}
					if (rs.data.sError)
						alert(rs.data.sError);
				}, function(rs) {});
			};
			
//------------------- 등록 버튼 -------------------			
			$scope.pop_new = function() {
				$scope.pop_init();
				$scope.mode = 'ins';
				el.find('#USER_ID').attr('disabled', false);
				el.find('#id_check').attr('disabled', false);
				el.find('#btn_delete').attr('disabled', true);

				el.find('#data_list').hide();
				el.find('#data_edit').show();

				el.find('#USER_ID').focus();
			};	
//------------------- 등록/편집창 닫기  -------------------						
			$scope.pop_close = function() {
				$scope.pop_init();
				el.find('#data_edit').hide();
				el.find('#data_list').show();
			};		
				
//------------------- 입력값 초기화 -------------------				
			$scope.pop_init = function() {
				idChecked = false;
				el.find("form")[1].reset();
				niValiUt.clearForm('#data_edit');
				el.find('#USER_PW').attr('placeholder', "영문+숫자+특수문자 포함 최소 8글자");
			};			
//------------------- id 중복체크 -------------------		
			$scope.id_check = function() {
				if (el.find('#USER_ID').val() == '') {
					alert('사용자 ID를 입력한 후 눌러주세요');
					el.find('#USER_ID').focus();
					return;
				}
				if (niValiUt.chkEngNumCharMin5('#USER_ID')) {
					alert("영문, 숫자만 입력 가능합니다. 최소 5글자 최대 12글자");
					el.find('#USER_ID').focus();
					return;
				}
				var param = {
					"USER_ID": el.find('#USER_ID').val()
				};
				console.log("parma : ",param)
				$http.post(gAction.idCheck, param, $rootScope.http_config).then(function(rs) {
					var result = rs.data.result;
					console.log("@ result : ",result)
					if (result == 'N') {
						alert("이미 등록되어 있는 사용자ID 입니다.");
						el.find('#user_id').focus();
						return result;
					} else {
						idChecked = true;
						alert("사용할 수 있는 사용자ID 입니다.");
						return result;
					}
				});
			}			

//------------------- 등록 -------------------		
			$scope.pop_save = function() {
				if (!idChecked) {
					alert("중복확인을 해주세요.");
					return false;
				}
	
				el.find('#USER_TEL').val(el.find('#USER_TEL1').val() + "-" + el.find('#USER_TEL2').val() + "-" + el.find('#USER_TEL3').val());

				var pw1 = $('#USER_PW').val();//비밀번호
				var pw2 = $('#USER_PW_OK').val();//비밀번호확인
				var is_sir_use = $('#IS_SIR_USE').is(":checked");
				var is_query_use = $('#IS_QUERY_USE').is(":checked");
				var is_etc_use = $('#IS_ETC_USE').is(":checked");
				var is_use = $('#IS_USE').is(":checked");
				var tel = $('#USER_TEL').val();

				if (niValiUt.chkEngNumCharMin5('#USER_ID')) {
					alert("영문, 숫자만 입력 가능합니다. 최소 6글자 최대 15글자");
					el.find('#USER_ID').focus();
					return;
				}
				if (niValiUt.chkEmpty('#USER_PW') && $scope.mode === 'ins') {
					alert('비밀번호를 입력해주세요.');
					el.find('#USER_PW').focus();
					return;
				}
				if (pw1 != pw2) {
					alert('비밀번호가 일치하지 않습니다.');
					el.find('#USER_PW').focus();
					return;
				}
				if (!niValiUt.chkEmpty('#USER_PW')) {
					if (niValiUt.chkEngNumCharMin8('#USER_PW')) {
						alert('비밀번호는 영문,숫자,특수문자 포함 최소 5글자 최대 20글자 입니다.')
						el.find('#USER_PW').focus();
						return;
					}
				}
				if (niValiUt.chkEmpty('#USER_NM')) {
					alert("사용자명을 입력해주세요");
					el.find('#USER_NM').focus();
					return;
				}
				if (niValiUt.chkEngKorMin1('#USER_NM')) {
					alert("한글, 영문만 입력해주세요");
					el.find('#USER_NM').focus();
					return;
				}

				if (tel == '--') {
					alert("전화번호를 입력해주세요");
					el.find('#USER_TEL1').focus();
					return;
				} else {
					if (niValiUt.chkTel('#USER_TEL')) {
						alert('전화번호가 올바르지 않습니다');
						el.find('#USER_TEL1').focus();
						return;
					}
				}

				if (pw1 != '') {
					el.find('#passwd').val($('#USER_PW').val());
				}
				if (el.find('#USER_PW_HIDDEN').val() == '') {
					el.find('#USER_PW_HIDDEN').val("null");
				}

				var param = {
					_id: el.find('#_id').val(),
					USER_ID: el.find('#USER_ID').val().toLowerCase(),
					USER_PW: el.find('#passwd').val(),
					USER_NAME: el.find('#USER_NM').val(),
					USER_PHONE: el.find('#USER_TEL').val(),
					IS_SIR_USE: is_sir_use,
					IS_QUERY_USE: is_query_use,
					IS_ETC_USE: is_etc_use,
					IS_USE:is_use,
					mode: $scope.mode

				};
				console.log("param : ",param)
				if (confirm('저장하시겠습니까?')) {
					//niUt.startLoading('.panel-body');
					$http.post(sAction.save, param, $rootScope.http_config).then(function(rs) {
						if (rs.data.sOk == 'ok') {
							if ($scope.mode == 'ins') {
								$scope.pop_close();
								$scope.load_data();
							} else if ($scope.mode == 'upd') {
								$scope.pop_close();
								$scope.load_data();
							}
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
//------------------- 삭제 -------------------	
			$scope.pop_delete = function() {
				if (confirm('삭제하시겠습니까?')) {
					$scope.mode = 'del';
					var param = {
						mode: $scope.mode,
						_id: el.find('#_id').val()
					};

					$http.post(sAction.save,param, $rootScope.http_config).then(function(rs) {
						if (rs.data.sOk == 'ok') {
							$scope.pop_close();
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

			//@@EXP 사용자 엑셀 양식 다운로드
			$scope.user_csv_sample_download = function() {
				var inputs = '';
				if ($('#hiddenifr').length == 0) {
					$('<iframe id="hiddenifr" name="hiddenifr" style="display:none;"></iframe>').appendTo('body');
				}
				inputs += '<input type="hidden" name="mode" value="exp"\>';

				$('<form action="' + gAction.excelDownUser + '" method="post" target="hiddenifr">' + inputs + '</form>').appendTo('body').submit().remove();

			};
			//@@EXP 사용자 엑셀 다운로드
			$scope.user_excel_download = function() {
				var inputs = '';

				if ($('#hiddenifr').length == 0) {
					$('<iframe id="hiddenifr" name="hiddenifr" style="display:none;"></iframe>').appendTo('body');
				}
				inputs += '<input type="hidden" name="mode" value="list"\>';

				$('<form action="' + gAction.excelDownUser + '" method="post" target="hiddenifr">' + inputs + '</form>').appendTo('body').submit().remove();
			};

			angular.element(el).ready(function() {
				var formdata = new FormData();
				$scope.getTheFiles = function($files) {
					angular.forEach($files, function(value, key) {
						formdata.append('excelFile', value);
					});
				};
				$scope.userExcelUpload = function() {
					if ($('input[name="upfile_bak"]').val() == "") {
						alert("입력할 xls파일을 먼저 선택 해주세요!");
						return false;
					}
					if (confirm("-+-+- 주의 -+-+- \n\n선택하신 엑셀 파일로 사용자를 등록합니다. \n이전에 등록된 사용자는 모두 제거됩니다. \n정말 등록하시겠습니까? \n")) {
						$http.post(sAction.userExcelUpload, formdata, {
							transformRequest: function(data, headersGetterFunction) {
								return data;
							}, headers: { 'Content-Type': undefined }
						}).then(function(rs) {
							console.log("rs : ",rs.data)				
							window.location.reload();

							if (rs.data.sError){
								alert(rs.data.sError);
							}
							

						}, function(rs) {
						});
					} else {
						return false;
					}
				};


			});





















// 파일 업로드 text 관련
			el.on('change', '#upfile_bak', function () {
			    const fileInput = $(this);
			    const filePath = fileInput.val();
			    const fileName = filePath.split('\\').pop();
			    const validExt = /\.(xlsx|xls)$/i;
			
			    if (!validExt.test(fileName)) {
			        alert(".xlsx 또는 .xls 확장자 파일만 선택해주세요!");
			        fileInput.val(''); // 파일 선택 초기화
			        return;
			    }
			
			    // 텍스트 박스에 파일명 출력
			    const textInput = fileInput.closest('label').siblings('input[type="text"]');
			    if (textInput.length) {
			        textInput.val(fileName);
			    }
			});
					
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
			
			
// 키 입력 이벤트			
			document.addEventListener('keydown', function(event) {
				//ESC 이벤트
		        if (event.key === 'Escape') {
		            $scope.$apply(function() {
		                $scope.pop_close();
		            });
		        }
		    });
			
}]);
