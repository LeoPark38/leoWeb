/* global niIpUt, niIpUt */

'use strict';
define(['../_module', 'crypto'], function(controllers) {
	controllers.controller('UserCtrl', function($scope, $rootScope, $http, $element, $compile, $filter, cfpLoadingBar, SearchHistoryService) {

			$(window).unbind("resize");
			var unconn_edit_stat = null;
			var el = $($element);
			el.find('.nBig_mode').hide();
			var sAction = {
				save: '../system/setUser',
				userExcelUpload: '../system/setUserExcelUpload',
				sendUnconnMail: '../system/setSendUnconnMail',
				unconnday: '../system/setUpdateUnconnDay'
			};
			var gAction = {
				list: '../system/getListUser',
				unconnlist: '../system/getListUnConnUser',
				row: '../system/getRowUser',
				idCheck: '../system/getRowIdCheck',
				relateUserList: '../system/getListRelateUser',
				mailTempleteRow: '../mail/getRowMailTemplate',
				instlist: '../system/getListSearchInst',
				excelDownUser: '../system/getExcelDownUser',
				excelDownUnConnUser: '../system/getExcelDownUnConnUser',
				fileDown: '../common/getFileDownload'
			};

			var table;
			var table2;
			var inst_table;
			var dataList = [];
			var nextPageStart = 0;
			var pageInfo;
			var prevPage;
			var pageInfo_unconn;
			var prevPage_unconn;
			var user_auth_list;
			var table_h = '';
			var isChecked = false;

			//@@EXP 접근제한 필터 파라미터값
			var limit_filter = 0;

			$scope.mailInfo = { _id: "", _index: "" };
			var sas_auth_value = [];
			var passwd_use = true;
			//@@EXP화면 리사이즈시 실행되는 부분
			$(window).bind("resize", function() {
				var win_h = $(window).height();
				var head_h = $("#header").height();
				var mrg_h = (15 * 2) + (15 * 2) + (2 + 10) + (2 + 10);
				var list_h = win_h - (head_h + 1) - 30 - mrg_h;
				table_h = list_h - 185;
				el.find("#data_table_wrapper .dataTables_scroll .dataTables_scrollBody").height(table_h);
				el.find("#data_table_unconnect_wrapper .dataTables_scroll .dataTables_scrollBody").height(table_h - 100);
				var table_row_h = 26; // row 1개 높이
				var show = table_h / table_row_h;

			});


			$scope.load_table();
			//@@EXP 사용자 리스트 테이블
			$scope.load_table = function() {
				var win_h = $(window).height();
				var head_h = $("#header").height();
				var mrg_h = (15 * 2) + (15 * 2) + (2 + 10) + (2 + 10);
				var list_h = win_h - (head_h + 1) - 30 - mrg_h;
				const scrollY = list_h - 185;

				table = el.find('#data_table').DataTable({
					// TODO 원래 유저생성일시가 정렬조건이었는데...
					order: [[1, 'asc']],
					retrieve: true,
					jQueryUI: false,
					lengthChange: false,
					deferRender: true,
					paging: true,
					processing: true,
					serverSide: true,
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
						data: function(param) {
							var info = $('#data_table').DataTable().page.info();
							var thisPageStart = nextPageStart; // 인포를 뽑아와서 전에 저장해놓은 0을 넣어줌    다음페이지누를경우 0 디스페이지 (즉 전페이지)
							nextPageStart = info.start; // 넥스트에 스타트를 0 을 넣어줌                 이건 현재패이지의 스타트 번호 (즉 현재페이지)

							if (info.start >= 10000) {
								if (nextPageStart >= thisPageStart) {
									//앞으로감
								} else {
									//뒤로감
									dataList.splice(-2, 2);
								}
							} else {
								dataList = [];
							}

							if (dataList.length != 0) { //마지막 놈이 올라가는데
								param.data1 = dataList[dataList.length - 1].data1;
								param.data2 = dataList[dataList.length - 1].data2;
							}
							param.limit_filter = limit_filter;
							param.text_filter = el.find('#text_filter').val();
							param.field_filter = el.find('#field_filter').val();

							param.columns[8] = { name: 'USER_MK_DT' };
							param.columns[8] = { name: 'IS_DIRECTOR_REP' };

							SearchHistoryService.set({
								text_filter: param.text_filter,
								field_filter: param.field_filter
							});
						},
						dataSrc: function(json) {
							pageInfo = json.recordsTotal;
							unconn_user_day = json.unconn_user_day.CFG_VAL;
							unconn_user_day_id = json.unconn_user_day._id;

							if (json.search_after == true) {
								dataList.push({ data1: json.search_after1, data2: json.search_after2 });
							}
							return niCvUt.resDataResultNum(json, "data", table);

						},
						error: function(xhr) {
							if ("error" == xhr.statusText || xhr.readyState == 4)
								$scope.$emit('pageRD', [location.href, xhr.status]);
						}
					},
					pageLength: 25,
					pagingType: "custom_simple_numbers",
					dom: 'z<"dt-toolbar" <"pull-left">> t <"dt-toolbar-footer" <"pull-right"p>>',
					language: {
						zeroRecords: "데이터가 없습니다",
						paginate: { first: "First", last: "Last", next: ">", previous: "<" }
					},
					columnDefs: [
						{ targets: [0], width: '5%', class: 'text-right', visible: true, sortable: false, searchable: false },
						{
							targets: [1], width: '10%', class: 'text-left', render: function(data, type, row) {
								return '<a href="javascript:;" id="' + row._id + '"ng-click="pop_edit($event)">' + row.USER_ID + '</a>';
							}
						},
						{
							targets: [2], width: '10%', class: 'text-left', render: function(data, type, row) {
								if (row.IS_DIRECTOR_REP == 'true' || row.IS_DIRECTOR_REP == true) {
									return data + "*";
								} else {
									return data;
								}
							}
						},
						{ targets: [3], width: '20%', class: 'text-left' },
						{
							targets: [4], width: '20%', class: 'text-left', render: function(data, type, row) {
								var auth_text = '';
								for (var i = 0; i < user_auth_list.length; i++) {
									if (row.USER_AUTH == user_auth_list[i].CC_CODE) {
										auth_text = user_auth_list[i].CC_NM;
									}
								}
								return auth_text;
							}
						},
						{ targets: [5], width: '15%', class: 'text-left', sortable: false, searchable: false },
						{
							targets: [6], width: '10%', class: 'text-left', sortable: false, render: function(data, type, row) {
								var sign_text = '미등록';
								if (row.USER_SIGN_DN != null) {
									sign_text = '등록';
									return sign_text;
								} else {
									return sign_text;
								}
							}
						},
						{
							targets: [7], width: '10%', class: 'text-left', sortable: false, render: function(data, type, row) {
								var limit_text = 'N';
								switch (row.IS_SAS_USE) {
									case 'false':
										limit_text = 'Y';
										break;
									case false:
										limit_text = 'Y';
										break;
									case 'true':
										limit_text = 'N';
										break;
									case true:
										limit_text = 'N';
										break;
								}
								return limit_text;
							}
						},
						//						{ targets: [8], width: '150px', class: 'text-center', visible: false, sortable: true },
						//						{ targets: [9], width: '150px', class: 'text-center', visible: false, searchable: false },
						//						{ targets: [10], width: '150px', class: 'text-center', visible: false, searchable: false }
					],
					columns: [
						{ data: "num", name: "num" },
						{ data: "USER_ID", name: "USER_ID" },
						{ data: "USER_NM", name: "USER_NM" },
						{ data: "INST_NM", name: "INST_NM" },
						{ data: "USER_AUTH", name: "USER_AUTH" },
						{ data: "USER_TEL", name: "USER_TEL" },
						{ data: "USER_SIGN_DN", name: "USER_SIGN_DN" },
						{ data: "IS_SAS_USE", name: "IS_SAS_USE" },
						//						{ data: "USER_MK_DT", name: "USER_MK_DT" },
						//						{ data: "_id", name: "_id" },
						//						{ data: "IS_DIRECTOR_REP", name: "IS_DIRECTOR_REP" }
					],
					createdRow: function(row, data) {
						$compile(row)($scope);
					},
					fnServerParams: function(data) {
						data['order'].forEach(function(items, index) {
							data['order'][index]['column'] = data['columns'][items.column]['name'];
						});
					}, drawCallback: function() {
						$('#data_table_previous', this.api().table().container())
							.on('click', function() {
								nextPageStart = table.page.info().start;
							});

						$('#data_table_first', this.api().table().container())
							.on('click', function() {
								dataList = [];
							});
					},
					stateSaveCallback: function(settings, data) {
						const name = $rootScope.$state.current.name;
						const columnHistory = $.lcst('columnHistory');

						columnHistory[name] = JSON.stringify(data);
						$.lcst('columnHistory', columnHistory);
					},
					stateLoadCallback: function(settings, data) {
						SearchHistoryService.get();

						const name = $rootScope.$state.current.name;
						const columnHistory = $.lcst('columnHistory');

						if (columnHistory[name] === undefined) {
							return data;
						}

						return JSON.parse(columnHistory[name]);
					},
					initComplete: function() {
						el.find('#search_btn').on('click', function() {
							$scope.load_data();
						});
						$('#text_filter').keyup(function(key) {
							if (key.keyCode == 13) {
								el.find('#search_btn').click();
							}
						});
					}
				});
				table.on('column-reorder', function(e) {
					$compile(e.target)($scope);
				});
			}
			$('.ip_box').ipaddress({ cidr: false });
			$('#sip_1').ipaddress({ copy_ip: 'eip_1' });
			$('#sip_2').ipaddress({ copy_ip: 'eip_2' });
			$('#sip_3').ipaddress({ copy_ip: 'eip_3' });

			$scope.pop_init = function() {
				isChecked = false;
				el.find("form")[1].reset();
				niValiUt.clearForm('#data_edit');
				el.find('.password').show();
				el.find('#USER_PW').attr('placeholder', "영문+숫자+특수문자 포함 최소 8글자");
				el.find('#USER_AUTH').multipleSelect("setSelects", ["1"]);
				el.find("#USER_AUTH").multipleSelect("refresh");
			};
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
					USER_ID: el.find('#USER_ID').val()
				};
				$http.post(gAction.idCheck, $.param(param), $rootScope.http_config).then(function(rs) {
					var result = rs.data.result;
					if (result == 'N') {
						alert("이미 등록되어 있는 사용자ID 입니다.");
						el.find('#user_id').focus();
						return result;
					} else {
						isChecked = true;
						alert("사용할 수 있는 사용자ID 입니다.");
						return result;
					}
				});
			};
			$scope.pop_new = function() {
				$scope.pop_init();
				$scope.save_mode = 'ins';
				POP_STAT = 'new';
				el.find('#USER_ID').attr('disabled', false);
				el.find('#id_check').attr('disabled', false);
				el.find('#btn_delete').attr('disabled', true);

				el.find('#unconn_list').hide();
				el.find('#data_list').hide();
				el.find('#data_edit').show();

				el.find('#USER_ID').focus();
			};
			
			$scope.pop_edit = function(e) {
				if (unconn_edit_stat != 'unconn') {
					prevPage = table.page.info().page;
				} else {
					prevPage_unconn = table2.page.info().page;
				}
				$scope.pop_init();
				POP_STAT = 'edit';
				el.find('#USER_PW').attr('placeholder', "영문+숫자+특수문자 포함 최소 8글자, 공백은 기존 비밀번호 유지");
				$scope.save_mode = 'upd';
				isChecked = true;
				el.find('#btn_delete').attr('disabled', false);
				el.find('#id_check').attr('disabled', true);

				el.find('#unconn_list').hide();
				el.find('#data_list').hide();

				var param = $.param({
					_id: e.target.id
				});
				$http.post(gAction.row, param, $rootScope.http_config).then(function(rs) {
					el.find('#data_edit').show();
					var row = niCvUt.resDataResultOne(rs, "row");
					if (row) {
						el.find('#USER_ID').val(row.USER_ID).attr('disabled', true);
						el.find('#passwd').val("");//존재하고있다고 명시해줘야됨 플래그값주고, 명시가 되있으면 공백으로 하여도 쿼리가 보내져야함
						el.find('#USER_NM').val(row.USER_NM);
						el.find('#USER_AUTH').multipleSelect("setSelects", [row.USER_AUTH]);
						if (~sas_auth_value.indexOf(row.USER_AUTH)) {
							el.find('.password').show();
						} else {
							el.find('.password').hide();
						}
						el.find('#USER_DIRECTOR').val(row.USER_DIRECTOR);
						el.find('#IS_DIRECTOR_REP').val(row.IS_DIRECTOR_REP);
						el.find('#INST_CODE').val(row.INST_CODE);
						el.find('#INST_NM').val(row.INST_NM);
						el.find('#INST_HIGH_CODE').val(row.INST_HIGH_CODE);
						el.find('#INST_HIGH_NM').val(row.INST_HIGH_NM);
						el.find('#INST_TYPE_CODE').val(row.INST_TYPE_CODE);
						el.find('#INST_TYPE_NM').val(row.INST_TYPE_NM);
						el.find('#INST_TYPE_DETAIL_CODE').val(row.INST_TYPE_DETAIL_CODE);
						el.find('#INST_TYPE_DETAIL_NM').val(row.INST_TYPE_DETAIL_NM);
						el.find('#USER_DEPT_NM').val(row.USER_DEPT_NM);
						el.find('#USER_PW_HIDDEN').val(row.USER_PW);

						if (row.USER_EMAIL != null) {
							var user_email = [];
							user_email = row.USER_EMAIL.split("@");
							el.find('#USER_EMAIL1').val(user_email[0]);
							el.find('#USER_EMAIL2').val(user_email[1]);
						}
						if (row.USER_TEL != null) {
							var user_tel = [];
							user_tel = row.USER_TEL.split("-");
							el.find('#USER_TEL1').val(user_tel[0]);
							el.find('#USER_TEL2').val(user_tel[1]);
							el.find('#USER_TEL3').val(user_tel[2]);
						}
						if (row.USER_HP != null) {
							var user_hp = [];
							user_hp = row.USER_HP.split("-");
							el.find('#USER_HP1').val(user_hp[0]);
							el.find('#USER_HP2').val(user_hp[1]);
							el.find('#USER_HP3').val(user_hp[2]);
						}
						if (row.IS_SAS_USE != null) {
							if (row.IS_SAS_USE == 'false' || row.IS_SAS_USE == false) {
								el.find('#IS_SAS_USE').prop('checked', true);
							}
						}
						if (row.IS_CYBER_USE != null) {
							if (row.IS_CYBER_USE == 'false' || row.IS_CYBER_USE == false) {
								el.find('#IS_CYBER_USE').prop('checked', true);
							}
						}
						if (row.IS_SESSION != null) {
							if (row.IS_SESSION == 'true' || row.IS_SESSION == true) {
								el.find('#IS_SESSION').prop('checked', true);
							}
						}

						if (row.IS_FC_MAIL_RECEIVE !== null) {
							if (row.IS_FC_MAIL_RECEIVE === 'true' || row.IS_FC_MAIL_RECEIVE === true) {
								el.find('#IS_FC_MAIL_RECEIVE').prop('checked', true);
							}
						}

						if (row.IS_ADV_MAIL_RECEIVE !== null) {
							if (row.IS_ADV_MAIL_RECEIVE === 'true' || row.IS_ADV_MAIL_RECEIVE === true) {
								el.find('#IS_ADV_MAIL_RECEIVE').prop('checked', true);
							}
						}

						if (row.IS_NEWS_MAIL_RECEIVE !== null) {
							if (row.IS_NEWS_MAIL_RECEIVE === 'true' || row.IS_NEWS_MAIL_RECEIVE === true) {
								el.find('#IS_NEWS_MAIL_RECEIVE').prop('checked', true);
							}
						}


						if (row.USER_LOGIN_ALW_IP1 != null) {
							el.find('#sip_1').val(row.USER_LOGIN_ALW_IP1.gte);
							el.find('#eip_1').val(row.USER_LOGIN_ALW_IP1.lte);
						}
						if (row.USER_LOGIN_ALW_IP2 != null) {
							el.find('#sip_2').val(row.USER_LOGIN_ALW_IP2.gte);
							el.find('#eip_2').val(row.USER_LOGIN_ALW_IP2.lte);
						}
						if (row.USER_LOGIN_ALW_IP3 != null) {
							el.find('#sip_3').val(row.USER_LOGIN_ALW_IP3.gte);
							el.find('#eip_3').val(row.USER_LOGIN_ALW_IP3.lte);
						}
						el.find('#_id').val(row._id);

						$('.ip_box').ipaddress({ cidr: false });
					}
					if (rs.data.sError)
						alert(rs.data.sError);
					if (rs.status == 440)
						$scope.$emit('pageRD', [location.href, rs.status]);
				}, function(rs) {
					$scope.$emit('pageRD', [location.href, rs.status]);
				});
			};

			$scope.pop_delete = function() {
				if (confirm('삭제하시겠습니까?')) {
					$scope.save_mode = 'del';
					var param = {
						mode: $scope.save_mode,
						_id: el.find('#_id').val()
					};
					niUt.startLoading('.panel-body');
					if ($scope.save_mode == 'del') {
						$http.post(sAction.save, $.param(param), $rootScope.http_config).then(function(rs) {
							if (rs.data.sOk == 'ok') {
								if (unconn_edit_stat != 'unconn') {
									search_reset();
									$scope.pop_close();
									$scope.load_data();
								} else {
									search_unconn_reset();
									$scope.pop_close();
									$scope.load_unconn_data();
								}
								alert("삭제되었습니다.");
							}
							if (rs.data.sError)
								alert(rs.data.sError);
							if (rs.status == 440)
								$scope.$emit('pageRD', [location.href, rs.status]);
							niUt.endLoading('.panel-body');
						}, function(rs) {
							$scope.$emit('pageRD', [location.href, rs.status]);
						});
					}
				}
			};
			$scope.pop_save = function() {
				if (!isChecked) {
					alert("중복확인을 해주세요.");
					return false;
				}

				el.find('#USER_EMAIL').val(el.find('#USER_EMAIL1').val() + "@" + el.find('#USER_EMAIL2').val());
				el.find('#USER_TEL').val(el.find('#USER_TEL1').val() + "-" + el.find('#USER_TEL2').val() + "-" + el.find('#USER_TEL3').val());
				el.find('#USER_HP').val(el.find('#USER_HP1').val() + "-" + el.find('#USER_HP2').val() + "-" + el.find('#USER_HP3').val());


				var alw_sip1 = '';
				var alw_eip1 = '';
				var alw_sip2 = '';
				var alw_eip2 = '';
				var alw_sip3 = '';
				var alw_eip3 = '';
				var pw1 = $('#USER_PW').val();//비밀번호
				var pw2 = $('#USER_PW_OK').val();//비밀번호확인
				var is_sas_use = $('#IS_SAS_USE').is(":checked");
				if (is_sas_use == true) {
					is_sas_use = false;
				} else {
					is_sas_use = true;
				}
				var is_cyber_use = $('#IS_CYBER_USE').is(":checked");
				if (is_cyber_use == true) {
					is_cyber_use = false;
				} else {
					is_cyber_use = true;
				}
				var is_session = $('#IS_SESSION').is(":checked");

				//메일수신여부.
				var is_fc_mail_receive = $('#IS_FC_MAIL_RECEIVE').is(":checked");
				var is_adv_mail_receive = $('#IS_ADV_MAIL_RECEIVE').is(":checked");
				var is_news_mail_receive = $('#IS_NEWS_MAIL_RECEIVE').is(":checked");

				var email = $('#USER_EMAIL').val();
				var phone = $('#USER_HP').val();
				var tel = $('#USER_TEL').val();
				var user_login_dt = el.find('#USER_LOGIN_DT_HIDDEN').val();

				if (niValiUt.chkIpCorrect(el.find('#sip_1').val()) && niValiUt.chkIpCorrect(el.find('#eip_1').val())) {
					alw_sip1 = "\"" + el.find('#sip_1').val() + "\"";
					alw_eip1 = "\"" + el.find('#eip_1').val() + "\"";
				} else {
					alw_sip1 = "null";
					alw_eip1 = "null";
				}
				if (niValiUt.chkIpCorrect(el.find('#sip_2').val()) && niValiUt.chkIpCorrect(el.find('#eip_2').val())) {
					alw_sip2 = "\"" + el.find('#sip_2').val() + "\"";
					alw_eip2 = "\"" + el.find('#eip_2').val() + "\"";
				} else {
					alw_sip2 = "null";
					alw_eip2 = "null";
				}
				if (niValiUt.chkIpCorrect(el.find('#sip_3').val()) && niValiUt.chkIpCorrect(el.find('#eip_3').val())) {
					alw_sip3 = "\"" + el.find('#sip_3').val() + "\"";
					alw_eip3 = "\"" + el.find('#eip_3').val() + "\"";
				} else {
					alw_sip3 = "null";
					alw_eip3 = "null";
				}

				if (niValiUt.chkEngNumCharMin5('#USER_ID')) {
					alert("영문, 숫자만 입력 가능합니다. 최소 5글자 최대 12글자");
					el.find('#USER_ID').focus();
					return;
				}
				if (passwd_use && (niValiUt.chkEmpty('#USER_PW') && $scope.save_mode === 'ins')) {
					alert('비밀번호를 입력해주세요.');
					el.find('#USER_PW').focus();
					return;
				}
				if (passwd_use && (pw1 != pw2)) {
					alert('비밀번호가 일치하지 않습니다.');
					el.find('#USER_PW').focus();
					return;
				}
				if (passwd_use && !niValiUt.chkEmpty('#USER_PW')) {
					if (niValiUt.chkEngNumCharMin8('#USER_PW')) {
						alert('비밀번호는 영문,숫자,특수문자 포함 최소 8글자 입니다.')
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
				if (niValiUt.chkEmpty('#USER_AUTH')) {
					alert("사용자 권한을 선택해주세요");
					el.find('#USER_AUTH').focus();
					return;
				}
				if (niValiUt.chkEmpty('#INST_CODE')) {
					alert("기관을 입력해주세요");
					el.find('#INST_NM').focus();
					return;
				}
				if (niValiUt.chkEmpty('#INST_NM')) {
					alert("기관을 입력해주세요");
					el.find('#INST_NM').focus();
					return;
				}

				if (niValiUt.chkEmpty('#USER_DEPT_NM')) {
					alert("부서명을 입력해주세요");
					el.find('#USER_DEPT_NM').focus();
					return;
				}
				if (niValiUt.chkEngKorNumMin1('#USER_DEPT_NM')) {
					alert("한글, 영문, 숫자만 입력해주세요");
					el.find('#USER_DEPT_NM').focus();
					return;
				}
				if (email == '@') {
					alert("전자우편을 입력해주세요");
					el.find('#USER_EMAIL1').focus();
					return;
				} else {
					if (niValiUt.chkEmail('#USER_EMAIL')) {
						alert('전자우편이 올바르지 않습니다');
						el.find('#USER_EMAIL1').focus();
						return;
					}
				}
				if (phone == '--') {
					alert("휴대폰번호를 입력해주세요");
					el.find('#USER_HP1').focus();
					return;
				} else {
					if (niValiUt.chkPhone('#USER_HP')) {
						alert('휴대폰번호가 올바르지 않습니다');
						el.find('#USER_HP1').focus();
						return;
					}
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




				for (var j = 1; j <= 3; j++) { //시작
					if (niIpUt.ip2long($('#sip_' + j).val()) > niIpUt.ip2long($('#eip_' + j).val())) {
						if (el.find('#sip_1').val() == '') {
						} else if (el.find('#sip_2').val() == '') {
						} else if (el.find('#sip_3').val() == '') {
						} else {
							alert("Start IP는 End IP보다 클 수 없습니다.");
							return;
						}
					}
				}

				if (pw1 != '') {
					el.find('#passwd').val($('#USER_PW').val());
				}


				if (user_login_dt == "") {
					user_login_dt = 'null';
				}
				el.find('#USER_DIRECTOR').val("");
				if (el.find("#USER_AUTH").val() == 11) { //정보보안 담당관
					el.find('#USER_DIRECTOR').val("0");
				}
				if (el.find("#USER_AUTH").val() == 12) { //기관 담당자 대표
					el.find('#USER_DIRECTOR').val("1"); //뉴스클리핑 영향줌
					el.find('#IS_DIRECTOR_REP').val("true");
				} else {
					el.find('#IS_DIRECTOR_REP').val("false");
				}

				if (el.find('#USER_PW_HIDDEN').val() == '') {
					el.find('#USER_PW_HIDDEN').val("null");
				}

				var param = {
					mode: $scope.save_mode,
					_id: el.find('#_id').val(),
					USER_ID: el.find('#USER_ID').val().toLowerCase(),
					USER_PW: el.find('#passwd').val(),
					USER_NM: el.find('#USER_NM').val(),
					USER_DIRECTOR: el.find('#USER_DIRECTOR').val(),
					USER_AUTH: el.find('#USER_AUTH').val(),
					INST_CODE: el.find('#INST_CODE').val(),
					INST_NM: el.find('#INST_NM').val(),
					INST_HIGH_CODE: el.find('#INST_HIGH_CODE').val(),
					INST_HIGH_NM: el.find('#INST_HIGH_NM').val(),
					INST_TYPE_CODE: el.find('#INST_TYPE_CODE').val(),
					INST_TYPE_NM: el.find('#INST_TYPE_NM').val(),
					INST_TYPE_DETAIL_CODE: el.find('#INST_TYPE_DETAIL_CODE').val(),
					INST_TYPE_DETAIL_NM: el.find('#INST_TYPE_DETAIL_NM').val(),
					USER_DEPT_NM: el.find('#USER_DEPT_NM').val(),
					USER_EMAIL: el.find('#USER_EMAIL').val(),
					USER_TEL: el.find('#USER_TEL').val(),
					USER_HP: el.find('#USER_HP').val(),
					USER_LOGIN_ALW_IP1: "{\"gte\":" + alw_sip1 + ", \"lte\":" + alw_eip1 + "}",
					USER_LOGIN_ALW_IP2: "{\"gte\":" + alw_sip2 + ", \"lte\":" + alw_eip2 + "}",
					USER_LOGIN_ALW_IP3: "{\"gte\":" + alw_sip3 + ", \"lte\":" + alw_eip3 + "}",
					IS_SAS_USE: is_sas_use,
					IS_CYBER_USE: is_cyber_use,
					IS_SESSION: is_session,
					IS_DIRECTOR_REP: el.find('#IS_DIRECTOR_REP').val(),
					USER_PW_HIDDEN: el.find('#USER_PW_HIDDEN').val(),
					IS_FC_MAIL_RECEIVE: is_fc_mail_receive,
					IS_ADV_MAIL_RECEIVE: is_adv_mail_receive,
					IS_NEWS_MAIL_RECEIVE: is_news_mail_receive
				};
				if (confirm('저장하시겠습니까?')) {
					niUt.startLoading('.panel-body');
					$http.post(sAction.save, $.param(param), $rootScope.http_config).then(function(rs) {
						if (rs.data.sOk == 'ok') {
							if ($scope.save_mode == 'ins') {
								search_reset();
								$scope.pop_close();
								$scope.load_data();
							} else if ($scope.save_mode == 'upd') {
								if (unconn_edit_stat != 'unconn') {
									$scope.pop_close();
									$scope.page_stay_table();
								} else {
									$scope.pop_close();
									$scope.page_stay_unconn_table();
								}
							}
							alert('저장 되었습니다.');
						}
						if (rs.data.sError)
							alert(rs.data.sError);
						if (rs.status == 440)
							$scope.$emit('pageRD', [location.href, rs.status]);
						niUt.endLoading('.panel-body');
					}, function(rs) {
						$scope.$emit('pageRD', [location.href, rs.status]);
					});
				}

			};
			var search_reset = function() {
				el.find('#text_filter').val("");
				text_filter = "";
				el.find('#field_filter').find('option:first').attr('selected', 'selected');
			};


			$scope.load_data = function() {
				table.columns.adjust();
				table.draw();
			}

			$scope.page_stay_table = function() {
				table.draw().columns.adjust();
				var prevPageInfo = pageInfo;
				setTimeout(function() {
					if (pageInfo != prevPageInfo) {
						table.draw().columns.adjust();
					} else {
						table.page(prevPage).draw('page').columns.adjust();
					}
				}, 1);
			};
			$scope.page_stay_unconn_table = function() {
				table2.draw().columns.adjust();
				var prevPageInfo = pageInfo_unconn;
				setTimeout(function() {
					if (pageInfo_unconn != prevPageInfo) {
						table2.draw().columns.adjust();
					} else {
						table2.page(prevPage_unconn).draw('page').columns.adjust();
					}
				}, 1);
			};

			$scope.pop_close = function() {
				if (unconn_edit_stat == 'unconn') {
					POP_STAT = "unconn";
					el.find('.panel-title').html('<i class="wd15 fas fa-user-cog mrgR5"></i>미접속자 조회');
					el.find('#data_edit').hide();
					el.find('#data_list').hide();
					el.find('#unconn_list').show();
					table2.columns.adjust(); //@@EXP 두번해야 스크롤까지 정렬됌
					table2.columns.adjust();
				} else {
					POP_STAT = null;
					el.find('#unconn_list').hide();
					el.find('.panel-title').html('<i class="wd15 fas fa-user-cog mrgR5"></i>사용자 관리');
					el.find('#data_edit').hide();
					el.find('#data_list').show();
					table.columns.adjust(); //@@EXP 두번해야 스크롤까지 정렬됌
					table.columns.adjust();
				}
			};

			$scope.add_inst = function(code, name, high_code, high_nm, type_code, type_nm, type_detail_code, type_detail_nm) {
				el.find("#INST_CODE").val(code);
				el.find("#INST_NM").val(name);
				el.find("#INST_HIGH_CODE").val(high_code);
				el.find("#INST_HIGH_NM").val(high_nm);
				el.find("#INST_TYPE_CODE").val(type_code);
				el.find("#INST_TYPE_NM").val(type_nm);
				el.find("#INST_TYPE_DETAIL_CODE").val(type_detail_code);
				el.find("#INST_TYPE_DETAIL_NM").val(type_detail_nm);
				$scope.search_close();
			};
			$scope.search_close = function() {
				inst_table.search("").draw();
				el.find("#inst_list_pop").trigger('reveal:close');
			};
			el.on("click", "#inst_list_pop-bg", function() {
				$scope.search_close();
			});
			//@@EXP 파일 첨부시 파일 확장자 체크
			el.on('change', '#upfile_bak', function() {
				var IMG_FORMAT = "\.(xls)$";
				if ((new RegExp(IMG_FORMAT, "i")).test($(this).val())) {//파일 확장자가 xls일 때
					var input = $(this),
						numFiles = input.get(0).files ? input.get(0).files.length : 1,
						label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
					input.trigger('fileselect', [numFiles, label]);
					return true;
				} else if ($(this).val() == "") {//파일이 없을때	
					var input = $(this).parents('.btn_fr').find(':text'),
						log = numFiles > 1 ? numFiles + ' files selected' : label;
					input.val("");
					return false;
				} else {//파일 확장자가 xls 아니일 때	
					alert(".xls 확장자 파일만 선택해주세요!");
					var input = $(this).parents('.btn_fr').find(':text'),
						log = numFiles > 1 ? numFiles + ' files selected' : label;
					input.val("");
					return false;
				}
			});
			//@@EXP 첨부한 파일명 input text에 뿌려주기
			$(':file').on('fileselect', function(event, numFiles, label) {
				var input = $(this).parents('.btn_fr').find(':text'),
					log = numFiles > 1 ? numFiles + ' files selected' : label;
				if (input.length) {
					input.val(log);
				} else {
					if (log)
						alert(log);
				}
			});
			//@@EXP 사용자 엑셀 다운로드
			$scope.user_excel_download = function() {
				var inputs = '';

				if ($('#hiddenifr').length == 0) {
					$('<iframe id="hiddenifr" name="hiddenifr" style="display:none;"></iframe>').appendTo('body');
				}
				inputs += '<input type="hidden" name="mode" value="list"\>';

				$('<form action="' + gAction.excelDownUser + '" method="post" target="hiddenifr">' + inputs + '</form>').appendTo('body').submit().remove();
			};
			//@@EXP 사용자 엑셀파일 양식 다운로드
			$scope.user_csv_sample_download = function() {
				var inputs = '';
				console.log('sadsaddasdsa')
				if ($('#hiddenifr').length == 0) {
					$('<iframe id="hiddenifr" name="hiddenifr" style="display:none;"></iframe>').appendTo('body');
				}
				inputs += '<input type="hidden" name="mode" value="exp"\>';

				$('<form action="' + gAction.excelDownUser + '" method="post" target="hiddenifr">' + inputs + '</form>').appendTo('body').submit().remove();

			};
			//@@EXP 미접속자 조회 리스트 다운로드


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
							//					
							window.location.reload();

							if (rs.data.sError)
								alert(rs.data.sError);
							if (rs.status == 440)
								$scope.$emit('pageRD', [location.href, rs.status]);
						}, function(rs) {
							$scope.$emit('pageRD', [location.href, rs.status]);
						});
					} else {
						return false;
					}
				};


				$(window).trigger("resize");

				$('#access_limit').append('<div class="checkbox3 checkbox-sm checkbox-inline checkbox-check checkbox-light"><input type="checkbox" class="threat" id="access_chk" value="monitoring"><label for="access_chk" style="padding-bottom: 0px;padding-top: 19px;"></label></div>');
				$('#access_chk').click(function() {
					if ($('#access_chk').is(":checked")) {
						limit_filter = 1;
					} else {
						limit_filter = 0;
					}
					table.draw();
				});


			});


			setTimeout(function() {
				$(window).trigger("resize");
			}, 300);
	
		// --------------------------------------------------------------- 단축키 및 Enter 모음 --------------------------------------------------------------- //

		//ESC : 닫기
		$rootScope.key_close = function() {
			if (POP_STAT == 'new' || POP_STAT == 'edit') {//등록, 수정 및 미접속자 조회 창 닫기
				el.find("button[ng-click='pop_close()']").click();
				return;
			}
			if (POP_STAT == 'unconn') {
				el.find("button[ng-click='pop_unconn_close()']").click();
				return;
			}
			if (POP_STAT == 'inst_list_pop') {							//등록 및 수정 시 기관검색 창 닫기
				el.find("button[ng-click='search_close()']").click();
				return;
			}
			if (POP_STAT == 'mail_send_pop') {							//미접속자 메일통보 창 닫기
				el.find("button[ng-click='mail_send_close()']").click();
				return;
			}
			if (POP_STAT == 'unconn_user_day_pop') {						//미접속자 조회 기간 설정 창 닫기
				el.find("button[ng-click='pop_unconn_user_day_close()']").click();
				return;
			}
		};

		el.find("#USER_ID").keydown(function(e) {							//등록 시 사용자ID 중복체크
			if (e.which == 13) {
				$scope.id_check();
			}
		});

	});
});
