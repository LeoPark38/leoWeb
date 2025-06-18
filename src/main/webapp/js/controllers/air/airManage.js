angular.module('myApp').controller('airManageCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		var el = $($element);

		var param = {}; // save시 파람
		var savedNode = [] // 저장할 Node 
		var x6Data = {}
		$scope.testAtt = "";

		$scope.cell = []; // 보여줄 그래프 data 저장
		$scope.airId = ""; // 해당 airID
		$scope.airtitle = "" // 해당 airTitle 

		$scope.state = "ins"; // 현재 상태


		//현재 노드
		$scope.thisNode = "";
		$scope.thisView = "";
		$scope.advancedOption = false;
		$scope.fontFamily = "Arial, helvetica, sans-serif";
		$scope.tools = [{ name: 'vertices', args: { attrs: { fill: '#666' } } }]
		$scope.tableList = []
		$scope.ooec_name = '서울시'
		//현재 엣지
		$scope.thisEdge = "";
		$scope.markerFamily = "";
		$scope.defaultCells = [] // 존재하던 모든 Cell ( node + edge )
		$scope.flowLine = "" // Y = red /  N = blue

		$scope.isPanningMode = false; // panning <--> selection 옵션 스위칭	

		//data div 관련 변수
		$scope.d_type = "mySql"

		$scope.isDisabled = true; // airSelect박스 disabled 처리

		$scope.x6_type = 'airData' // x6 타입

		var gAction = {
			checkX6: '../x6/checkX6', // x6 중복체크
			getAirList: '../x6/getAirList', // Air 데이터리스트 가져오기
			getDetail: '../x6/getDetail', // 선택한 Air 데이터리스트 가져오기
			getAirdata: '../air/manage/getAirdata', // 해당 drule_nm 으로 데이터 가져오기
		};
		var sAction = {
			save: '../x6/setAir', // Air 저장
		};

		angular.element(el).ready(function() {
			console.log("##### AirManage #####")

			$timeout(() => {

			}, 1);


			//기타 관리 모달창 탭 관련
			el.find('#a1').addClass("selected");
			el.find('#t1').addClass("on");
			$('ul.idtab li').click(function() {
				var tab_id = $(this).attr('data-tab');
				$('ul.tabs li').removeClass('current');
				$('.tab-content').removeClass('current');

				$(this).addClass('current');
				$("#" + tab_id).addClass('current');
			})

		}); // end of ready


		// -------------------------------------------------------------------------------------------------			

		// 데이터를 가져와서 리스트를 업데이트하는 함수
		$scope.updateList = function() {
			let param = {}
			$http.post(gAction.getAirList, param, $rootScope.json_config).then(function(rs) {
				if (rs.data.sOk === 'ok') {
					x6Data = jsUt.result(rs, "data");
					// 기존 리스트 초기화
					const fileTree = document.getElementById('fileTree');
					fileTree.innerHTML = ''; // 기존 리스트를 모두 제거

					const groupedData = {};

					// 데이터를 DRULE_ATT_TYPE_NM2 별로 그룹화
					x6Data.forEach(function(item) {
						const groupName = item.X6_TYPE;
						if (!groupedData[groupName]) {
							groupedData[groupName] = [];
						}
						groupedData[groupName].push(item);
					});

					// 그룹화된 데이터를 바탕으로 DOM에 리스트 추가
					Object.keys(groupedData).forEach(function(groupName) {
						//console.log("@@ groupCode : ",groupCode)
						// <span> 생성
						const span = document.createElement('span');
						span.className = 'listSpan';
						span.id = groupName;
						span.textContent = groupName;

						// <ul> 생성
						const ul = document.createElement('ul');
						ul.className = 'nested';

						// <li> 생성
						groupedData[groupName].forEach(function(airItem) {
							// 길이를 최대 35로 만들어준다.
							let slicedDrule_nm = "";
							if (airItem.X6_NM.length > 36) {
								slicedDrule_nm = airItem.X6_NM.substring(0, 32);
								slicedDrule_nm += "...";
							} else {
								slicedDrule_nm = airItem.X6_NM
							}

							// <li> 요소 생성 및 ng-click 추가
							let addClass2 = JSON.parse(airItem.IS_USE) ? "file-item item-true" : "file-item item-false";
							const li = document.createElement('li');
							li.className = addClass2
							li.id = airItem.X6_NM;
							//li.textContent = airItem.DRULE_NM;
							li.textContent = slicedDrule_nm;
							// ng-click 추가
							li.setAttribute('ng-click', `getDetail('${airItem._id}')`);

							// li 요소를 AngularJS로 컴파일
							const compiledLi = $compile(li)($scope);
							ul.appendChild(compiledLi[0]);
						});

						// <span>과 <ul>을 컨테이너에 추가
						fileTree.appendChild(span);
						fileTree.appendChild(ul);
					});
					// 리스트 토글 이벤트
					var toggler = document.getElementsByClassName("listSpan");
					for (var i = 0; i < toggler.length; i++) {
						toggler[i].addEventListener("click", function() {
							var nestedList = this.nextElementSibling;
							if (nestedList && nestedList.classList.contains('nested')) {
								nestedList.classList.toggle("active");
								this.classList.toggle("listSpan-down");
							}
						});
					}
				}
			}).catch(function(error) {
				console.error('API 호출 중 오류 발생:', error);
			});
		};

		// 초기 호출
		$scope.updateList();


		preWork()

		const graph = new X6.Graph({
			container: document.getElementById('graph-container'),
			background: {
				/*color: '#F2F7FA'*/
				color: 'white'
			},
			//width: '100%',
			//height: '100%',
			grid: $scope.localStorage,
			grid: {
				visible: true,
				type: 'mesh',
				args: {
					color: '#a0a0a0', // dot color  
					thickness: 1, // dot size  
				},
			},
			mousewheel: {
				enabled: true,
				zoomAtMousePosition: true,
				modifiers: 'ctrl',
				minScale: 0.5,
				maxScale: 3,
				guard(e) {
					if (e.altKey) {
						// Ignore all scroll events when the alt key is pressed
						return false
					}
					return true
				}
			},
			panning: { // 해당 타입으로 그래프 이동가능.
				enabled: false,
				eventTypes: ["leftMouseDown", "mouserWheel"]
			},
			connecting: {
				router: 'manhattan', // 엣지 경로 타입 설정  manhattan , orth, metro, er, oneSide, normal
				connector: {
					name: 'rounded',
					args: {
						radius: 5,
					},
				},
				anchor: 'center',
				connectionPoint: 'anchor',
				allowBlank: false, // 공백에 edge 사용 가능여부
				allowLoop: true,
				snap: { // node에 edge 연결시 자동 흡착
					radius: 20,
				},
				highlight: true,
				createEdge() {
					// edge 아이디 시.분.초.밀리 로 지정
					const now = new Date();
					const hours = now.getHours(); // 시 (0 - 23)
					const minutes = now.getMinutes(); // 분 (0 - 59)
					const seconds = now.getSeconds(); // 초 (0 - 59)
					const milliseconds = now.getMilliseconds(); // 밀리초 (0 - 999)
					const id = hours + "." + minutes + "." + seconds + "." + milliseconds;
					return new X6.Shape.Edge({
						id: id,
						shape: 'edge',
						labels: "",
						allowEdge: true,
						router: "manhattan",
						attrs: {
							line: {
								stroke: '#454a51',
								strokeWidth: 2,
								targetMarker: {
									name: 'classic',
									width: 12,
									height: 6,
								},
								//cursor:'move',
								/*								점선 에니메이션
																strokeDasharray:5,
																style:{
																	animation: 'ant-line 30s infinite linear'
																}*/
							},
						},
						data: {
							flowLine: "NONE"
						},
						connector: {
							name: "rounded", // 엣지끼리 통과할때 건너가게끔 표현
							args: {
								type: "gap",  // args 를 추가함으로써 건너가는게아님 밑으로 통과하게끔 표현
								radius: 5,
							}
						},
						tools: [{ name: 'vertices', args: {} }],
						/*				
						router:{  // 엣지 종류 --> dag-edge / metro
							name:"metro" 
						},
						connerctor:{
							name: 'jumpover',
							args:{
								type:'gap'
							}
						},
						*/

						zIndex: 0,
					})
				},

				validateConnection({ targetMagnet }) {
					//return targetMagnet.getAttribute('port-group') !== 'in'
					return !!targetMagnet
				},
			},
			highlighting: { // 포트 연결시 포트 하이라이팅
				magnetAdsorbed: {
					name: 'stroke',
					args: {
						attrs: {
							fill: '#5F95FF',
							stroke: '#5F95FF',
						},
					},
				},
			},
			embedding: {
				enabled: true,
				findParent({ node }) {
					const bbox = node.getBBox();
					return this.getNodes().filter((node) => {
						if (node.shape === "group-node") {
							const targetBBox = node.getBBox();
							return bbox.isIntersectWithRect(targetBBox);
						}
						return false;
					});
				},
			},
			selecting: { // 마우스로 다중 cell 선택
				enabled: false,
				rubberband: false,
				showNodeSelectionBox: false,
			},
			keyboard: {
				enabled: true
			}
		})

		const ports = { // 포트설정 
			groups: {
				top: { // port 위치 
					//position: 'top', // 위치 
					// 
					position: {
						name: 'absolute',
						args: { x: '50%', y: '-2%' }
					},
					attrs: {
						circle: {
							r: 6, // 원의 반지름
							magnet: true, // 연결선 자석 효과
							stroke: '#5F95FF', // 외곽선 색
							strokeWidth: 1, // 외곽선 두께
							fill: '#fff', // port 내부 색
							style: {
								visibility: 'hidden',
							},
						},
					},
				},
				right: {
					//position: 'right',
					position: {
						name: 'absolute',
						args: { x: '102%', y: '50%' }
					},
					attrs: {
						circle: {
							r: 6,
							magnet: true,
							stroke: '#5F95FF',
							strokeWidth: 1,
							fill: '#fff',
							style: {
								visibility: 'hidden',
							},
						},
					},
				},
				bottom: {
					//position: 'bottom',
					position: {
						name: 'absolute',
						args: { x: '50%', y: '102%' }
					},
					attrs: {
						circle: {
							r: 6,
							magnet: true,
							stroke: '#5F95FF',
							strokeWidth: 1,
							fill: '#fff',
							style: {
								visibility: 'hidden',
							},
						},
					},
				},
				left: {
					//position: 'left',
					position: {
						name: 'absolute',
						args: { x: '-2%', y: '50%' }
					},
					attrs: {
						circle: {
							r: 6,
							magnet: true,
							stroke: '#5F95FF',
							strokeWidth: 1,
							fill: '#fff',
							style: {
								visibility: 'hidden',
							},
						},
						/*						text:{   // 텍스트 추가
													text:"dddd"
												}*/
					},
				},
			},
			items: [ // id는 각 port의 id
				{
					group: 'top',
					id: 'top'
				},
				{
					group: 'right',
					id: "right"
				},
				{
					group: 'bottom',
					id: "bottom"
				},
				{
					group: 'left',
					id: "left"
				},
			],
		}
		const selection = new X6PluginSelection.Selection({
			enabled: true,
			multiple: true,
			rubberband: true,
			showNodeSelectionBox: true,
		})
		graph.use(selection)
		graph.use(  //-- > 에러 잡아야한다.  기능 : 노드 확대 회전
			new X6PluginTransform.Transform({
				resizing: {
					enabled: true,
					//	directions:['nw','ne','sw','se'],
					orthogonal: false, // 비대칭 크기 조절 허용
					restrictedDirections: ['top-left', 'top-right', 'bottom-left', 'bottom-right'], // 4방향으로 제한
				},
				rotating: true,
			})
		)
			.use(new X6PluginSnapline.Snapline())     // 그래프그리는데 방해되는거 같아서 주석처리.
			.use(new X6PluginKeyboard.Keyboard())
			.use(new X6PluginClipboard.Clipboard())
			.use(new X6PluginHistory.History())

		const showPorts = (ports, show) => {
			for (let i = 0, len = ports.length; i < len; i += 1) {
				ports[i].style.visibility = show ? 'visible' : 'hidden';
			}
		};

		X6.Graph.registerNode(
			'custom-circle',
			{
				inherit: 'circle',
				ports: { ...ports },
				data: {}
			},
			true,
		)
		X6.Graph.registerNode(
			'syslog-rect',
			{
				angle: 0,
				inherit: 'rect',
				ports: { ...ports },
			},
			true,
		)
		X6.Graph.registerNode(
			'custom-polygon',
			{
				angle: 0,
				inherit: 'polygon',
				ports: {
					groups: ports.groups,
					items: [
						{
							id: "port-top",
							group: "top",
						},
						{
							id: "port-bottom",
							group: "bottom",
						},
					],

				},
			},
			true,
		)
		X6.Graph.registerNode(
			'custom-rect',
			{
				angle: 0,
				inherit: 'rect',
				ports: { ...ports },
			},
			true,
		)

		X6.Graph.registerNode(
			'path',
			{
				inherit: 'path',
				ports: { ...ports },
				data: {}
			},
			true,
		)

		X6.Graph.registerNode(
			'image',
			{
				inherit: 'image',
				ports: { ...ports },
				data: {}
			},
			true,
		)

		X6.Graph.registerNode(
			"group-node",
			{
				inherit: "rect",
				ports: {
					groups: ports.groups,
					items: [
						{
							id: "port-top",
							group: "top",
						},
						{
							id: "port-bottom",
							group: "bottom",
						},
					],
				},
				data: {}

			},
			true
		);

		X6.Graph.registerNode(
			'air-node',
			{
				label: "",
				inherit: 'rect',
				markup: [ /* markup 으로 node에 text/body / image 등 svg를 만들수있다. */
					/*			      {
										tagName: "rect",
										selector: "border"
									  },*/
					{
						tagName: "rect",
						selector: "body"
					},
					{
						tagName: "text",
						selector: "text"
					},
					{
						tagName: "text",
						selector: "desc"
					},

				],
				attrs: {},
				data: {},
				ports: { ...ports }
			},
			true
		)

		const stencil = new X6PluginStencil.Stencil({
			title: "[ 전체 노드 ]",
			target: graph,
			stencilGraphWidth: 180,  // 스탠실 캔버스 넓이
			stencilGraphHeight: 150, // 스탠실 캔버스 높이
			collapsable: true, // All 그룹 펼치기  
			groups: [
				{
					title: '연결 노드',
					name: 'group8',
					graphHeight: 380,  // 그룹 캔버스 높이
					layoutOptions: {
						columns: 1,
						rowHeight: 60, // 스탠스 각 행의 높이
						columnWidth: 160
					},
					collapsable: true,
					collapsed: true
				},
				{
					title: '기타 노드',
					name: 'group3',
					graphHeight: 90,  // 그룹 캔버스 높이
					layoutOptions: {
						rowHeight: 70, // 스탠스 각 행의 높이
					},
					collapsable: true,
					collapsed: true
				},
			],
			layoutOptions: {
				columns: 2,
				columnWidth: 80, // auto,compact,num
				rowHeight: 55,
				center: true,
			},
		})
		const stencilEl = document.getElementById('stencil');
		if (stencilEl) {
			stencilEl.appendChild(stencil.container)
		}
		/* 
		* Stencil 
		* 추후에 stenctl을 추가하고싶은면 json 파일 수정
		*/
		fetch('../js/controllers/air/antvSetting.json')
			.then((response) => response.json())
			.then((data) => {
				//Stencil 에 label 추가
				const textArray = []
				const firewallArray = []
				const dataManageArray = []
				const cloudArray = []
				const dnsArray = []
				const indexArray = []
				data.forEach((item, index) => {
					if (item.type == "textNode") { // 그룹추가
						textArray.push(graph.createNode(item))
					}
					//------------------------- 하위는 테스트용 이미지 추가 ----------------------------------- 
					if (item.type == "firewall") { // 그룹추가
						firewallArray.push(graph.createNode(item))
					}
					if (item.type == "dataManage") { // 그룹추가
						dataManageArray.push(graph.createNode(item))
					}
					if (item.type == "cloud") { // 그룹추가
						cloudArray.push(graph.createNode(item))
					}
					if (item.type == "dns") { // 그룹추가
						dnsArray.push(graph.createNode(item))
					}
					if (item.type == "indexType") {
						indexArray.push(graph.createNode(item))
					}
				});
				/*	---> 사용안함 혹시 모르니 그냥 주석처리
					//Stencil 에 image 추가
					const imageNodes = data.filter(item => item.type === "image").map((item) =>
						graph.createNode({
							shape: 'custom-image',
							label: item.label,
							attrs: {
								image: {
									'xlink:href': item.image,
								},
							},
						}),
					)
				*/
				// 스탠실에 등록
				stencil.load(indexArray, 'group8')
				stencil.load(textArray, 'group3')
			});

		function preWork() {
			const container = document.getElementById('container')
			const stencilContainer = document.createElement('div')
			stencilContainer.id = 'stencil'
			const graphContainer = document.createElement('div')
			graphContainer.id = 'graph-container'
			container.appendChild(stencilContainer)
			container.appendChild(graphContainer)
		}

		//  default id="first"인 node
		var firstNode = function(x, y) {
			// 40, 40
			// -440,-280
			const path = graph.addNode({
				shape: 'custom-rect',
				id: "first",
				x: x,
				y: y,
				width: 80,
				height: 70,
				attrs: {
					body: {
						fill: '#454a51',
						stroke: "#337ab7",
						strokeWidth: 3,
						rx: 10,
						ry: 10
					},
					text: {
						fontSize: 14,
						fill: "#FFFFFF",
						text: "Air",
						fontFamily: "Arial",
						fontWeight: 800
					}
				},
				data: {
					d_type: "air"
				}
			})
		}
		firstNode(44, 36);

		// ------------------------------------------------------ 버튼 이벤트 ----------------------------------------------------		


		function openTheDetail(state) {
			// upd -> 접힘	ins -> 펼침	del -> 접힘
			const toolbarDetail = $("#toolbarDetail");
			if (state == "ins") {
				toolbarDetail.slideDown(500);  // 펼침
			} else if (state == "upd") {
				toolbarDetail.slideUp(500);  // 접힘
			} else if (state == "del") {
				toolbarDetail.slideUp(500);  // 접힘
			} else if (state == "close") {
				toolbarDetail.slideUp(500);  // 접힘
			}


		}
		function openTogle() {
			const toolbarDetail = $("#toolbarDetail");

			if (toolbarDetail.is(":visible")) {
				toolbarDetail.slideUp(500);  // 접힘
			} else {
				toolbarDetail.slideDown(500);  // 펼침
			}
		}

		// 펼치기 버튼
		$scope.openDetail = function() {
			//상세보기 열기
			//openTheDetail("open")
			openTogle()
		}

		// 추가 버튼
		$scope.airDataDetailOpen = function() {
			if ($scope.state == "upd") {
				reset("all");
			} else {
				reset();
			}
			// state 변경
			$scope.state = "ins"
			//상세보기 열기
			openTheDetail("ins")


		}
		// 닫기 버튼
		$scope.toolbarDetailClose = function() {
			//상세보기 닫기
			openTogle()

		}

		// 데이터 보기
		$scope.loadG = function() {
			const cells = graph.getCells();
			const nodes = graph.getNodes();
		}


		// 저장 버튼
		$scope.savePopAdd = function() {
			// 상세보기,노드옵션,엣지옵션 닫기

			//$scope.state = "ins"
			if (confirm("저장 하시겠습니까?")) {
				saveAir();
			}

		}

		// 삭제 버튼
		$scope.deletePopAdd = function() {
			if (confirm("삭제 하시겠습니까?")) {
				// 상세보기 닫기
				openTheDetail("close")

				$scope.state = "del"
				saveAir();
			}
		}

		// 상세보기 초기화
		var reset = function(type) {
			console.log("reset : ", type)
			el.find("#x6_name").val(""); //이름 초기화
			$scope.x6_type = 'airData'// 타읿 셀렉트 초기화
			el.find("#x6_desc").val(""); // 설명 초기화
			el.find('#isUseDiv').css('background-color', '#8C8C8C');// 상테값 초기화
			el.find('#airDataTile').html("")
			// 그래프 초기화
			if (type == "all") {
				$scope.cell = []
				graph.resetCells($scope.cell);
				graph.zoomToFit({ padding: 10, maxScale: 1 });

				firstNode(40, 40);//defaultNode 추가				
			}


		}


		// 저장
		var saveAir = function() {
			//중복 체크
			let check = true;

			//오늘날짜 셋팅
			var set_dt = $filter('date')(new Date(), "yyyy-MM-ddTHH:mm:ss.sssZ");
			// is_use값 셋팅
			var selectedUse = document.querySelector('input[name="isUse"]:checked').value;
			// alert String
			var alert_String = "";
			// saveGraph 데이터 셋팅
			makeSaveGraph()

			param.state = $scope.state
			param.IS_USE = selectedUse; // X6 사용여부
			let desc = (el.find('#x6_desc').val()).replace(/\\/g, ""); //역슬레시 제거

			desc.replace(/\"/g, '"'); //복원 설명
			param.GRAPH = JSON.stringify(savedNode) // X6 그래프
			$scope.airId = $('#x6_name').val()

			//삭제일시
			if ($scope.state == "ins") {
				param.id = $scope.airId;
			} else if ($scope.state == "upd") {
				param.id = $scope.airId;
			} else if ($scope.state == "del") {
				param.id = $scope.airId;
			}
			console.log("@@ param : ", param)
			if ($scope.state == 'ins') {
				// 저장하려는 것 중복체크
				$http.post(gAction.checkX6, param, $rootScope.json_config).then(function(rs) {
					if (rs.data.data == "Y") {
						check = true; // 중복 X
						param.DESC = desc;  // X6 설명
						param.X6_NM = $scope.airId // X6 이름
						param.TYPE = $scope.x6_type
					} else {
						alert_String = "중복되는 아이디 입니다.";
						check = false; // 중복 O
					}

					executeSave(param, check, alert_String);
				});
			}
			if ($scope.state == 'upd') {
				check = true;
				param.id = $scope.airId;
				param.change = "true"
				executeSave(param, check, alert_String);
			}
			if ($scope.state == 'del') {
				executeSave(param, check, alert_String);
			}
		};

		function executeSave(param, check, alert_String) {
			var selectedUse = param.IS_USE

			if (check) {
				//save 액션
				$http.post(sAction.save, param, $rootScope.json_config).then(function(rs) {
					console.log("~~~~ rs : ", rs)
					if (rs.data.sOk === 'ok') {
						$timeout(() => {
							// 리스트를 새로그림  --> timeout을 안걸어둘시에 list가 갱신이 안됨.
							//$scope.updateList();
						}, 1000);
						// 기입된 정보 초기회
						reset();

						// title 셋팅
						/*							if ($scope.state == "del") {
														$scope.airtitle = ""
														el.find('#airDataTile').html("")
														el.find('#airtitle').html("")
													} else {
														$scope.airtitle = title
													}*/
						// saved node 초기화
						savedNode = []

						if (selectedUse == "true") {
							el.find('#isUseDiv').css('background-color', '#337ab7');
						} else {
							el.find('#isUseDiv').css('background-color', '#e82828');
						}

						//삭제시 완료 alert
						if ($scope.state == "del") {
							el.find('#isUseDiv').css('background-color', '#8C8C8C');
							// 그래프 초기화
							$scope.cell = [];
							graph.resetCells($scope.cell);
							// default Node 생성
							firstNode(-440, -280);

							alert("삭제 완료 되었습니다.")
						}
						// param 값넘긴후에 다시 초기화.
						param = {};

						openTheDetail("close")
						$('#optionDiv').hide()
						$('#edgeDiv').hide()
					}

					if (rs.data.sError)
						alert(rs.data.sError);
					if (rs.status == 500)
						$scope.$emit('pageRD', [location.href, rs.status]);
				}, function(rs) { });
			} else {
				console.log("??")
				alert(alert_String)
			}
		}

		//리스트 클릭
		$scope.getDetail = function(id) {
			const param = {
				id: id
			}
			let x6_data;
			// update 상태
			$scope.state = "upd"

			// btn text변경
			//button.innerHTML = '<i class="fa fa-times"></i>수정';
			$http.post(gAction.getDetail, param, $rootScope.json_config).then(function(rs) {
				console.log("@@@@@ rs : ", rs)
				if (rs.data.sOk === 'ok') {
					x6_data = rs.data.data._source
					console.log("[getDetail] x6_data : ", x6_data)

					openTheDetail("upd")
					$('#optionDiv').hide()
					$('#edgeDiv').hide()

					var id = rs.data.data._id;
					$scope.airId = id

					var x6_id = x6_data.X6_ID != null ? x6_data.X6_ID : "";
					var x6_name = x6_data.X6_NM != null ? x6_data.X6_NM : "";
					var x6_user_id = x6_data.X6_USER_ID != null ? x6_data.X6_USER_ID : "";
					var x6_structure = x6_data.X6_STRUCTURE != null ? x6_data.X6_STRUCTURE : "";
					var x6_type = x6_data.X6_TYPE != null ? x6_data.X6_TYPE : "";
					var x6_desc = x6_data.X6_DESC != null ? x6_data.X6_DESC : "";
					var x6_mk_dt = x6_data.X6_MK_DT != null ? x6_data.X6_MK_DT : "";
					var x6_upd_dt = x6_data.X6_UPD_DT != null ? x6_data.X6_UPD_DT : "";
					var x6_is_use = x6_data.IS_USE != null ? JSON.parse(x6_data.IS_USE) : false;

					// 사용여부셋팅
					let isUse = x6_is_use ? "true" : "false";
					el.find(`input[name="isUse"][value="${isUse}"]`).prop('checked', true);
					// X6 명 셋팅
					el.find("#x6_name").val(x6_name);
					// 타입셋팅
					$scope.x6_type = x6_type
					// 설명 셋팅1
					el.find("#x6_desc").val(x6_desc.replace(/\\"/g, '"'));
					// 설명 셋팅2
					$scope.airtitle = x6_name;
					el.find('#airDataTile').html($scope.airtitle)
					// 생성일 셋팅	
					el.find("#x6_mk_dt").html(x6_mk_dt)
					// 수정일 셋팅
					el.find("#x6_upd_dt").html(x6_upd_dt)

					//  toolbar에 상태 색상 설정
					if (isUse == "true") {
						el.find('#isUseDiv').css('background-color', '#337ab7');
					} else {
						el.find('#isUseDiv').css('background-color', '#e82828');
					}

					savedData(x6_structure);

					// update를위한 cell 의 갯수
					let nodes = graph.getNodes();
					let filterdNodes = nodes.filter(node => node.store.data.shape !== "custom-rect");
					nodesCnt = filterdNodes.length + 1; // +1 의 이유는 기존 default(first 노드)의 값을 위에서 filter처리하여서 그대로 추가함.

				}
			});
		}

		// air 저장할 그래프 데이터 만들기
		var makeSaveGraph = function() {
			const cells = graph.getCells();
			console.log("[makeSaveGraph] cells : ", cells)
			cells.forEach((cell) => {
				const type = cell.store.data.shape
				//console.log('## cell : ', cell)

				if (type == "edge") {// 엣지 일때
					// 속성 셋팅
					//const attrs = { line: { stroke: "#A2B1C3", strokeDasharray:10, strokeWidth: 2, targetMarker: { name: "classic", width: 12, height: 8 },style:{ animation:"ant-line 30s infinite linear"} } }
					//console.log("@@@ cell : ",cell)
					const param = {
						id: cell.id,
						shape: type,
						source: cell.store.data.source,
						target: cell.store.data.target,
						parent: cell.store.data.parent,
						_parent: cell._parent, // 외부속성
						zIndex: cell.store.data.zIndex,
						data: cell.store.data.data
					}
					let attrs = "";
					if (cell.store.data.type == "noArrow") {  // syslogd node의 하위 edge일때
						attrs = { line: { stroke: "#A2B1C3", strokeDasharray: 10, strokeWidth: 2, targetMarker: null, style: { animation: "ant-line 30s infinite linear" } } }
						param["attr"] = attrs
						param["type"] = "noArrow"
					} else { // 추가한 edge 일때
						attrs = { line: { stroke: "#A2B1C3", strokeWidth: 2, targetMarker: { name: "classic", width: 12, height: 8 }, style: { animation: "ant-line 30s infinite linear" } } }
						param["attr"] = cell.store.data.attrs
						param["router"] = { name: "manhattan" }
						param["connector"] = cell.store.data.connector
						if (cell.store.data.vertices) {
							param["vertices"] = cell.store.data.vertices
						}
						param["data"] = cell.store.data.data
					}

					savedNode.push(param)
				} else if (type == "custom-image") { // 이미지 일때
					// 속성 셋팅
					const attrs = cell.store.data.attrs.image;
					const param = {
						id: cell.id,
						shape: type,
						label: cell.store.data.attrs.text.text,
						position: cell.position(),
						attr: attrs
					}
					savedNode.push(param)
				} else if (type == "group-node") { // group일때
					//const attrs = { body: { rx: cell.store.data.attrs.body.rx, ry: cell.store.data.attrs.body.ry } }
					const param = {
						id: cell.id,
						shape: type,
						label: cell.store.data.attrs.text.text,
						position: cell.position(),
						data: cell.store.data,
						angle: cell.store.data.angle,
						attr: cell.attrs,
						markup: cell.markup,
						size: cell.store.data.size,
						children: cell.store.data.children,
						_children: cell._children, // 외부속성
						zIndex: cell.store.data.zIndex
					}
					savedNode.push(param)
				} else { // 평범한 노드일때
					//const attrs = { body: { rx: cell.store.data.attrs.body.rx, ry: cell.store.data.attrs.body.ry } }
					//console.log("@@@@@ zindex : ",cell.getZIndex());
					const param = {
						id: cell.id,
						shape: type,
						label: cell.store.data.attrs.text.text,
						position: cell.position(),
						data: cell.store.data.data,
						angle: cell.store.data.angle,
						attr: cell.attrs,
						markup: cell.markup,
						size: cell.store.data.size,
						parent: cell.store.data.parent,
						_parent: cell._parent, // 외부속성
						zIndex: cell.getZIndex()
						/*	size:{
								height:cell.store.size,
								width:100
							}*/
					}

					savedNode.push(param)
				}
			})
		}

		// 저장된 그래프 데이터 불러오기
		var savedData = function(rs) {
			var setData = [];

			setData = JSON.parse(rs)

			//console.log("@@ passData : ",rs)
			for (var i in setData) {
				if (setData[i].shape == "edge") {
					var edgeNode = {
						id: setData[i].id,
						shape: "edge",
						source: setData[i].source,
						target: setData[i].target,
						attrs: setData[i].attr,
						connector: setData[i].connector,
						router: setData[i].router,
						zIndex: 0,
						parent: setData[i].parent,
					}
					if (setData[i].type) {
						edgeNode["type"] = setData[i].type
					}
					if (setData[i].vertices) {
						edgeNode["vertices"] = setData[i].vertices
					}
					if (setData[i].data) {
						edgeNode["data"] = setData[i].data
					}

					$scope.cell.push(graph.addEdge(edgeNode))
				} else if (setData[i].shape == "custom-image") {
					// 속성 셋팅
					var imageNode =
					{
						"id": setData[i].id,
						"shape": setData[i].shape,
						"label": setData[i].label,
						"position": {
							"x": setData[i].position.x,
							"y": setData[i].position.y
						},
						"data": setData[i].data,
						"attrs": {
							"image": setData[i].attr
						}
					}
					$scope.cell.push(graph.addNode(imageNode))
				} else { // air-node
					var airNode =
					{
						"id": setData[i].id,
						"shape": setData[i].shape,
						"label": setData[i].label,
						"position": {
							"x": setData[i].position.x,
							"y": setData[i].position.y
						},
						"data": setData[i].data,
						"angle": setData[i].angle,
						"attrs": setData[i].attr,
						"markup": setData[i].markup,
						"size": setData[i].size,
						"parent": setData[i].parent,
						"zIndex": setData[i].zIndex,
					}
					var childePass2 = graph.addNode(airNode);
					childePass2._parent = setData[i]._parent,
						$scope.cell.push(graph.addNode(childePass2))
				}

			}

			graph.resetCells($scope.cell);
			graph.zoomToFit({ padding: 10, maxScale: 1 });
			$scope.cell = []; // 다시 초기화
		}









		// panning <--> selection
		$scope.dragSwitch = function() {
			console.log("--- dragSwitch --- ")
			$scope.isPanningMode = !$scope.isPanningMode; // panning <--> selection 스위칭 true false 값
			var img = document.getElementById("dragImg");

			if ($scope.isPanningMode) {
				console.log("@@ $scope.isPanningMode if : ", $scope.isPanningMode)
				// panning 활성화
				graph.enablePanning();
				// selection 비활성화
				selection.options.enabled = false
				// hand 이미지로 변경
				img.src = "../icon/soar/hand.png";
			} else {
				console.log("@@ $scope.isPanningMode else : ", $scope.isPanningMode)
				// panning 비활성화
				graph.disablePanning();
				// selection 활성화
				selection.options.enabled = true
				// click 이미지로 변경
				img.src = "../icon/soar/click01.png";
			}



		}
		//삭제		
		$scope.deleteNode = function() {
			if (confirm('해당 노드를 삭제하시겠습니까?')) {
				if ($scope.thisNode.id.length > 35) {
					$scope.thisView.cell.remove();
					$scope.closeOption();
					alert("삭제되었습니다.");
				} else {
					alert("해당 노드는 삭제 할 수 없습니다.");
				}
			}
		}

		// 옵션 저장
		$scope.saveOption = function() {
			var node = $scope.thisNode;
			var shape = node.store.data.shape;
			var bodyColor = document.getElementById("nodeColor") // 폰트 색상
			var newLabel = document.getElementById("label").value; // 라벨
			var newFont = document.getElementById("font").value; // 폰트 크기
			var fontColor = document.getElementById("fontColor") // 폰트 색상
			var strokeColor = document.getElementById("strokeColor") // 테두리 색상
			var strokeWidth = document.getElementById("strokeWidth").value; // 테두리 크기
			var nodeOpacity = $('#opacityValue').text() // 노드 opacity
			var blur = document.getElementById("blur").value	// blur
			var dx = document.getElementById("dx").value	// blur
			var dy = document.getElementById("dy").value	// blur
			var getZindex = document.getElementById("zIndex").value; // zIndex 크기
			var newZindex = Number(getZindex)

			//var testCheck = $('#testCheck').is(':checked'); // 체크박스 유무 확인.
			var textArea = document.getElementById("node_content").value // textArea

			/*			var dataType = document.getElementById("data_type").value; // data_type
						var dataQuery = document.getElementById("data_query").value; // data_query
						// 적용여부 0:No(미적용) 1:Yes(적용)
						var apply =  el.find('input[type=radio][name=ADV_TYPE]:checked').val();
						
						var outPutType = document.getElementById("outPutType").value*/

			// node_data 관련 
			var d_type = document.getElementById("d_type").value;
			var d_index_nm = document.getElementById("d_index_nm").value;
			var d_query = document.getElementById("d_query").value;

			let nodeData = node.getData() || {};
			node.setData(nodeData)

			//-------------------------------------------------------------------------- 옵션 관련	
			/*
			* (hex값->rgb값 )+ opacity
			*/
			var rgbColor = bodyColor.value.replace(/^#/, '');
			var bigint = parseInt(rgbColor, 16);
			var r = (bigint >> 16) & 255;
			var g = (bigint >> 8) & 255;
			var b = bigint & 255;
			var nodeColor = "";

			// 고급옵션 활성시에 투명도 지정
			if ($scope.advancedOption) {
				nodeColor = 'rgba(' + r + ',' + g + ',' + b + ',' + nodeOpacity + ')'
			} else {
				nodeColor = 'rgba(' + r + ',' + g + ',' + b + ')'
			}
			//노드 색상 변경
			node.attr('body/fill', nodeColor);

			//라벨 변경
			//if(newLabel !=""){  --24.07.22 공백허용
			//if (shape != "custom-image" && shape != "syslog-rect") { // 이미지 노드/ syslog 노드는 제외
			node.attr('text/text', newLabel);
			//}
			//}

			//폰트 변경
			if (newFont != "") {
				if (!emptyValidate("font", newFont)) {
					return
				} else {
					node.attr('text/fontSize', newFont);
				}
			}

			//폰트 색상 변경
			node.attr('text/fill', fontColor.value);

			// 폰트 형식 변경
			node.attr('text/fontFamily', $scope.fontFamily);

			// 고급옵션이 활성화 되어 있을때
			if ($scope.advancedOption) {
				var p = {
					name: 'dropShadow',
					args: {
						blur: parseInt(blur, 10),
						dx: parseInt(dx, 10),
						dy: parseInt(dy, 10),
					}
				}
				node.attr('body/filter', p);
			} else {
				node.attr('body/filter', "");
			}
			// stroke 색상
			node.attr('body/stroke', strokeColor.value);
			// stroke 굵기
			node.attr('body/strokeWidth', strokeWidth);
			// zindex 설정
			//node.store.data.zIndex = parseInt(newZindex,10)
			node.setZIndex(newZindex);

			// text 설정 --> memo가 있을시에 아이콘 추가
			//let nodeData = node.getData() || {};

			nodeData.memo = textArea;
			if (textArea != "") {
				node.attr('image/xlink:href', "../s/icon/soar/message01.png")
			} else {
				node.attr('image/xlink:href', "")
			}
			//-------------------------------------------------------------------------- nodeData 관련		
			nodeData.d_type = d_type
			nodeData.d_index_nm = d_index_nm
			nodeData.d_query = d_query

			//-------------------------------------------------------------------------- 팝업 관련			
			/*			//data_type 설정
						nodeData.data_type = dataType
						//data_query 설정
						nodeData.data_query = dataQuery
						//data_query 설정   적용여부 0:No(미적용) 1:Yes(적용)
						nodeData.apply = apply
						// outputType 설정
						nodeData.out_put_type = outPutType*/

			// Data 추가					
			node.setData(nodeData);
			console.log("@@ saved node : ", node)

			// check 해제  ---> 추후에 옵션 닫기함수불러올예정 
			$('#moreOption').prop('checked', false);
			$scope.advancedOption = false;
			$('#optionDiv').hide()

			// node name/ip 숨김 checkbox
			//if(testCheck){
			//	isShowNodeName(node, "show");
			//}else{
			//}

		}

		// 옵션 닫기
		$scope.testBtn = function() {
			let t = el.find('input[type=radio][name=ADV_TYPE]:checked').val()
			console.log("@@@@ t : ", t)
		}

		// 옵션 닫기
		$scope.closeOption = function() {
			// 고급 옵션 check 해제
			$('#moreOption').prop('checked', false);
			$scope.advancedOption = false;

			// 라벨 분리 옵션 check 해제
			//$('#testCheck').prop('checked', false);


			//tab 원위치
			$('#optionDiv').hide()
		}

		// edge 옵션 저장 버튼
		$scope.saveEdgeOption = function() {
			var edge = $scope.thisEdge;
			var strokeWidth = document.getElementById("strokeWidth_edge").value;
			var targetWidth = document.getElementById("targetWidth_edge").value;
			var targetName = document.getElementById("markerFamily").value;
			//var edgeColor = document.getElementById("edgeColor").value; 
			var testInput = document.getElementById("flowLine").value;

			edge.removeProp('attrs/line/targetMarker')
			let targetParam = {
				name: targetName
			}
			if (targetName == "circle") {
				targetParam.r = targetWidth * 1.0
			} else {
				targetParam.height = targetWidth
				targetParam.width = targetWidth * 1.5
			}

			//targetParam.add ="test";

			//테두리색깔 설정
			if (testInput == "N") {
				edge.attr('line/stroke', "#B41F1F");
			} else if (testInput == "Y") {
				edge.attr('line/stroke', "#337ab7");
			} else {
				edge.attr('line/stroke', "#454a51");
			}


			//테두리크기 설정
			edge.attr('line/strokeWidth', strokeWidth);
			//화살표 설정
			edge.attr('line/targetMarker', targetParam);

			/*			let temp ={
							stateColor : "col",
							highLightColor : "high"
						}
						edge.attr('line/temp',temp);
						console.log("@@@@@@@@ temp : ",edge.attr('line/temp'))
						console.log("@@@ save : ",edge)*/

			// 추가한 input 테스트
			//edge.store.data = {"val":"test"};

			let edgeData = edge.getData() || {};
			edgeData.flowLine = testInput;
			edge.setData(edgeData);

			$('#edgeDiv').hide()

		}

		// edge 삭제 버튼
		$scope.deleteEdge = function() {
			if (confirm('해당 라인을 삭제하시겠습니까?')) {
				$scope.thisView.cell.remove();
				$scope.closeOption();
				alert("삭제되었습니다.");
			}
		}

		// edge 옵션 닫기
		$scope.closeEdgeOption = function() {
			// check 해제
			// thisEdge / thisView 초기화
			$scope.thisEdge = "";
			$scope.thisView = "";
			// div 숨기기
			$('#edgeDiv').hide()
		}

		// edge 옵션 닫기
		$scope.modalTest = function() {
			console.log("@@@@@@@ modal")
		}


		// Grid settings
		$scope.settings = [
			{
				title: '그리드 타입',
				label: 'Grid Type',
				type: 'select',
				value: 'dot',
				//options: ['dot', 'fixedDot', 'mesh', 'doubleMesh'],
				options: ['dot', 'fixedDot', 'mesh'],
			},
			{
				title: '그리드 사이즈',
				label: 'Grid Size',
				type: 'slider',
				value: 10,
				min: 1,
				max: 20,
				step: 1,
			},
			{
				title: '그리드 색상',
				label: 'Primary Color',
				type: 'color',
				value: '#aaaaaa',
			},
			{
				title: '그리드 두께',
				label: 'Primary Thickness',
				type: 'slider',
				value: 1,
				min: 1,
				max: 10,
				step: 1,
			},
		];

		$scope.notifyChange = function() {
			const settings = $scope.settings.reduce((acc, setting) => {
				acc[setting.label.replace(/\s+/g, '').toLowerCase()] = setting.value;
				return acc;
			}, {});
			console.log("@@@ settings : ", settings)
			// 그리드 설정 변경에 대한 로직 처리
			if (settings.gridtype === 'doubleMesh') {
				graph.drawGrid({
					type: settings.gridtype,
					args: [
						{
							color: settings.primarycolor,
							thickness: settings.primarythickness,
						},
						{
							color: settings.secondarycolor,
							thickness: settings.secondarythickness,
							factor: settings.scalefactor,
						},
					],
				});
			} else {
				graph.drawGrid({
					type: settings.gridtype,
					args: [
						{
							color: settings.primarycolor,
							thickness: settings.primarythickness,
						},
					],
				});
			}
			$timeout(() => {
				$scope.$apply();
			});

		};

		$scope.$watch('settings[1].value', function(newValue) {
			graph.setGridSize(newValue);
		});

		//----------------------------------------- 고급 옵션 체인지 이벤트 ---------------------------------------------------
		$scope.changeOpacity = function() {
			var test = document.getElementById("opacity")
			var newPosition = test.value * 148
			opacityValue.style.left = `calc(84% + (${newPosition}px))`;
			$('#opacityValue').text(test.value)
		}
		$scope.changeBlur = function() {
			var blur = document.getElementById("blur")
			var newPosition = blur.value * 7.4
			blurValue.style.left = `calc(84% + (${newPosition}px))`;
			$('#blurValue').text(blur.value)
		}
		$scope.changeDx = function() {
			var dx = document.getElementById("dx")
			var newPosition = dx.value * 7.4
			dxValue.style.left = `calc(84% + (${newPosition}px))`;
			$('#dxValue').text(dx.value)
		}
		$scope.changeDy = function() {
			var dy = document.getElementById("dy")
			var newPosition = dy.value * 7.4
			dyValue.style.left = `calc(84% + (${newPosition}px))`;
			$('#dyValue').text(dy.value)
		}
		//-----------------------------------------------------------------------------------------------------------------	

		// 고읍옵션 사용여부
		$('#moreOption').change(function() {
			$scope.advancedOption = this.checked
			if (this.checked) {
				$('#tr_opa').show()
				$('#tr_blur').show()
				$('#tr_dx').show()
				$('#tr_dy').show()
				$('#tr_index').show()
			} else {
				$('#tr_opa').hide()
				$('#tr_blur').hide()
				$('#tr_dx').hide()
				$('#tr_dy').hide()
				$('#tr_index').hide()
			}
		})
		// 검증식
		var emptyValidate = function(type, param) {
			var p = param
			var font_reg = /^(?:[1-9]|[1-9][0-9])?$/;
			if (type == "font") {
				if (!font_reg.test(p)) {
					alert(' Font 크기를 확인해주세요');
					return;
				}
			}
			return true;
		}

		//--------------------------------------------------------------------------------  edge 마우스 Action
		// isNew = true -> 새로운 엣지
		// isNew = false -> 기존 엣지
		graph.on('edge:connected', ({ edge, isNew }) => {
			const sourceNode = edge.getSourceNode();
			const targetNode = edge.getTargetNode();

			$('#edgeDiv').show()
			graph.trigger('edge:dblclick', { edge, view: graph.findViewByCell(edge) });

		});
		graph.on('edge:mouseenter', ({ cell, e }) => {
			// edge 하이라이트 추가
			let target = cell.attr('line/targetMarker')
			let targetMarker = {
				name: target.name,
			}
			if (target.name == "circle") {
				targetMarker.r = target.r
			} else {
				targetMarker.width = target.height * 1.5
				targetMarker.height = target.height
			}

			cell.attr({
				line: {
					stroke: "#5F95FF",
					strokeWidth: cell.attr('line/strokeWidth'),
					targetMarker: targetMarker
				}
			})

			if (e.ctrlKey) {
				cell.addTools({
					name: 'vertices',
					args: {
						attrs: {
							fill: '#8f8f8f'
						}
					}
				})
			}

		})
		graph.on('edge:mouseleave', ({ edge, cell }) => {
			// edge 하이라이트 제거
			let target = cell.attr('line/targetMarker')
			let targetMarker = {
				name: target.name,
			}
			if (target.name == "circle") {
				targetMarker.r = target.r
			} else {
				targetMarker.width = target.height * 1.5
				targetMarker.height = target.height
			}

			const edgeData = cell.getData()
			let changeStroke = ""
			if (edgeData && edgeData.flowLine != undefined) {
				if (edgeData.flowLine == "Y") {
					changeStroke = "#337ab7"
				} else if (edgeData.flowLine == "N") {
					changeStroke = "#B41F1F"
				} else {
					changeStroke = "#454a51"
				}
			} else {
				changeStroke = "#A2B1C3"
			}

			cell.attr({
				line: {
					stroke: changeStroke,
					strokeWidth: cell.attr('line/strokeWidth'),
					targetMarker: targetMarker
				},
			})

			cell.removeTools()
		})
		// 그룹 노드 추가시 zindex 변경 작업  
		graph.on('cell:added', ({ cell }) => {

		});

		graph.on('edge:dblclick', ({ edge, view, e }) => {
			console.log("=== edge:dblclick === : ", edge)
			$scope.thisEdge = edge
			$scope.thisView = view

			var targerMark = edge.attr('line/targetMarker')

			// 테두리 색상
			//var edgeColor = document.getElementById("edgeColor")
			//edgeColor.value = edge.attr('line/stroke')

			// 테두리 크기
			var newStrokeWidth = document.getElementById("strokeWidth_edge")
			newStrokeWidth.value = edge.attr('line/strokeWidth')

			// 화살표 크기
			var newStrokeWidth = document.getElementById("targetWidth_edge")
			if (targerMark.name == "circle") {
				newStrokeWidth.value = targerMark.r
			} else {
				newStrokeWidth.value = targerMark.height
			}

			// 화살표 모양
			$scope.markerFamily = targerMark.name
			var newTarketMarkName = document.getElementById("markerFamily")
			newTarketMarkName.value = targerMark.name

			// inputTest 
			var flowLine = document.getElementById("flowLine")
			console.log("@@@@ edge.store.data.data : ", edge.store.data.data)
			if (edge.store.data.data) {
				$scope.flowLine = edge.store.data.data.flowLine
			} else {
				$scope.flowLine = "NONE"
			}

			$('#optionDiv').hide()
			$('#edgeDiv').show()
			$('#minimap').hide()

			// edge애니메이션
			//edgeAnimateEdge(edge)
		})

		function edgeAnimateEdge(edge) {
			// strokeDasharray 설정
			edge.attr('line/strokeDasharray', '5 5');
			console.log("@@ edgeid : ", edge.id)
			let dashOffset = 0;
			const animate = () => {
				dashOffset -= 1;
				edge.attr('line/strokeDashoffset', dashOffset);
				requestAnimationFrame(animate);
			};
			animate();
		}
		//--------------------------------------------------------------------------------  Node 마우스 Action
		var isPorts = false;
		var lastClickedPorts = null;

		graph.on('node:click', ({ node }) => {
			const container = document.getElementById('graph-container');
			const eachPorts = container.querySelectorAll(`g[data-cell-id='${node.id}'] .x6-port-body`); // 해당 node의 port의 값만 얻음
			const nodeId = node.id;

			// 이전에 클릭된 포트 숨기기
			if (lastClickedPorts && lastClickedPorts !== eachPorts) {
				showPorts(lastClickedPorts, false);
				isPorts = false;
			}

			if (nodeId.endsWith('_ip') || nodeId.endsWith('_equip')) { // 장비의 장비명node 와 아이피node는 port제외
				isPorts = false;
			} else {
				isPorts = !isPorts;
				showPorts(eachPorts, isPorts);
			}

			// 현재 클릭된 포트를 저장
			lastClickedPorts = eachPorts;
		});

		// 그래프의 빈 영역을 클릭했을 때 포트 숨기기
		graph.on('blank:click', () => {
			if (lastClickedPorts) {
				showPorts(lastClickedPorts, false);
				lastClickedPorts = null;
				isPorts = false;
			}
		});

		// node reize 옵션
		graph.on('node:resized', ({ node }) => {
			// syslog-rect 에서만 memo-image 위치 조절
			if (node.shape == "syslog-rect") {
				const image = node.attr('image')
				const width = node.store.data.size.width
				const height = node.store.data.size.height
				// default syslog-rect : 102/66  // default sys-rect image : width: 20, height: 20, x: 85, y: 2,

				node.attr('image/x', width - 17)
			}
		});
		//  ----> 진행중인 노드 테스트
		/*		graph.on('node:dblclick', ({ node ,view}) => {
					console.log("@@ node 1 : ",node)
					node.attr('border/class', 'animate-border');
					console.log("@@ node 2: ",node)
				});*/

		// 테스트를 위해ㅔ  임시 주석 
		graph.on('node:dblclick', ({ node, view }) => {
			console.log("[node:dblclick] : ", node)
			//console.log("@@ zIndex : ",node.getZIndex())
			//console.log("[",node.getZIndex(),"] : ",node)

			// 장비명,장비IP,메모는 수집장비에만 보이게끔.
			const nodeMemo = document.getElementById("nodeMemo");
			if (node.store.data.shape == "custom-rect" || node.store.data.shape == "group-node" || node.store.data.shape == "path") {
				nodeMemo.style.display = 'none'
			} else {
				nodeMemo.style.display = ''
			}

			if (node.store.data.shape == "syslog-rect" || node.store.data.shape == "custom-rect" || node.store.data.shape == "group-node" || node.store.data.shape == "path" || node.store.data.shape == "air-node") {

				$scope.thisNode = node
				$scope.thisView = view
				// 노드 클릭후 다음 노드 바로 클릭시 고급옵션 해제를 위해 
				$('#moreOption').prop('checked', false);
				$scope.advancedOption = false;

				let data = node.getData();
				// 고급옵션 관련 filter
				var filter = node.attr('body/filter')

				var blur = document.getElementById("blur")
				var dx = document.getElementById("dx")
				var dy = document.getElementById("dy")
				if (filter == undefined || filter == "") { // --> 옵션으로 인해 재구성되면 고급옵션을 넣지않아도 filter ="" 로 재구성된다.
					$('#blurValue').text("0")
					blur.value = 0
					$('#dxValue').text("0")
					dx.value = 0
					$('#dyValue').text("0")
					dy.value = 0
				} else {
					$('#blurValue').text(filter.args.blur)
					blur.value = filter.args.blur
					$('#dxValue').text(filter.args.dx)
					dx.value = filter.args.dx
					$('#dyValue').text(filter.args.dy)
					dy.value = filter.args.dy
				}

				// 바디 색상 셋팅
				var bodyColor = document.getElementById("nodeColor") // colorpicker
				var opacity = document.getElementById("opacity")
				var color = node.attr('body/fill')

				if (color.includes('#')) { // hex값일때
					bodyColor.value = node.attr('body/fill')
					$('#opacityValue').text("1")
					opacity.value = 1
				} else { // rgb값 일때
					// rgb -> hex
					function rgbToHex(r, g, b) {
						// 각 구성 요소를 16진수로 변환 후 조합
						const componentToHex = component => {
							const hex = component.toString(16);
							return hex.length === 1 ? '0' + hex : hex;
						};
						return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
					}
					// rgb값 추출
					function extractRgbaValues(rgbaString) {
						// 정규식을 사용하여 숫자를 추출
						const matches = rgbaString.match(/(\d+(\.\d+)?)/g);
						// opacity 값 셋팅
						if (matches[3] == undefined) {
							$('#opacityValue').text("1")
							opacity.value = 1
						} else {
							$('#opacityValue').text(matches[3])
							opacity.value = matches[3]
						}
						// 색상 셍팅을 위한 RGB값 반환
						return {
							r: parseInt(matches[0]),
							g: parseInt(matches[1]),
							b: parseInt(matches[2]),
						};
					}
					var makeRgb = extractRgbaValues(color)
					var makeHex = "";
					if (makeRgb != "") {
						makeHex = rgbToHex(makeRgb.r, makeRgb.g, makeRgb.b)
					}
					bodyColor.value = makeHex
				}

				var shape = node.store.data.shape;
				var doc = document.getElementById("label")
				var del = document.getElementById("del_btn")
				if (shape != "custom-image" && shape != "syslog-rect") { // 이미지 노드/ syslog 노드는 delete 제외
					//doc.disabled = false
					del.disabled = false
				} else {
					//doc.disabled = true
					del.disabled = true
				}
				// 라벨
				var newLabel = document.getElementById("label");
				newLabel.value = node.attr('text/text') != undefined ? node.attr('text/text') : ""
				// 폰트 색상
				var fontColor = document.getElementById("fontColor")
				fontColor.value = node.attr('text/fill')
				// 폰트 크기
				var newFont = document.getElementById("font");
				newFont.value = node.attr('text/fontSize')
				// 폰트 유형
				$scope.fontFamily = node.attr('text/fontFamily')
				// 테두리 크기
				var newStrokeWidth = document.getElementById("strokeWidth");
				newStrokeWidth.value = node.attr('body/strokeWidth') != undefined ? node.attr('body/strokeWidth') : ""
				// 테두리 색상
				var newStrokeColor = document.getElementById("strokeColor")
				newStrokeColor.value = node.attr('body/stroke')
				var newZindex = document.getElementById("zIndex")
				newZindex.value = node.store.data.zIndex
				// 메모
				var node_content = document.getElementById("node_content")
				node_content.value = data.memo != undefined ? data.memo : ""
				// zIndex  
				var z_index = document.getElementById("zIndex")
				z_index.value = node.getZIndex();

				//              node 데이터
				var d_type = document.getElementById("d_type");
				d_type.value = data.d_type != undefined ? data.d_type : ""
				var d_index_nm = document.getElementById("d_index_nm");
				d_index_nm.value = data.d_index_nm != undefined ? data.d_index_nm : ""
				var d_query = document.getElementById("d_query");
				d_query.value = data.d_query != undefined ? data.d_query : ""

				if ($scope.advancedOption) {
					$('#tr_opa').show()
					$('#tr_blur').show()
					$('#tr_dx').show()
					$('#tr_dy').show()
					$('#tr_index').show()
				} else {
					$('#tr_opa').hide()
					$('#tr_blur').hide()
					$('#tr_dx').hide()
					$('#tr_dy').hide()
					$('#tr_index').hide()
				}

				$('#optionDiv').show()
				$('#edgeDiv').hide()
			}
		});
		//-------------------------------------------  Node 키보드 Action  ------------------------------------------------------		
		graph.bindKey(['meta+s', 'ctrl+s'], () => {
			$scope.saveG()
			return false
		})
		// panning <--> selecting 변경
		graph.bindKey(['meta+q', 'ctrl+q'], () => {
			$scope.dragSwitch();
			return false
		})
		// 복사         
		graph.bindKey(['meta+c', 'ctrl+c'], () => {
			const cells = graph.getSelectedCells()
			if (cells.length) {
				graph.copy(cells)
			}
			return false
		})
		// 잘라내기
		graph.bindKey(['meta+x', 'ctrl+x'], () => {
			const cells = graph.getSelectedCells()
			if (cells.length) {
				graph.cut(cells)
			}
			return false
		})
		// 붙여넣기
		graph.bindKey(['meta+v', 'ctrl+v'], () => {
			if (!graph.isClipboardEmpty()) {
				const cells = graph.paste({ offset: 32 })
				graph.cleanSelection()
				graph.select(cells)
			}
			return false
		})

		// 전 작업으로 돌아가기
		graph.bindKey(['meta+z', 'ctrl+z'], () => {
			if (graph.canUndo()) {
				graph.undo()
			}
			return false
		})
		// 앞 작업으로 돌아가기 
		graph.bindKey(['meta+y', 'ctrl+y'], () => {
			if (graph.canRedo()) {
				graph.redo()
			}
			return false
		})

		// 전체 선택
		graph.bindKey(['meta+a', 'ctrl+a'], () => {
			const nodes = graph.getNodes()
			if (nodes) {
				graph.select(nodes)
			}
		})

		// 삭제
		graph.bindKey('delete', () => {
			const cells = graph.getSelectedCells()
			/*			if (cells.length) {
							if (confirm('해당 노드를 삭제하시겠습니까?')) {
								if (cells[0].id.length > 35) {
									graph.removeCells(cells)
									alert("삭제되었습니다.");
								}else{
									alert("해당 노드는 삭제 할 수 없습니다.");
								}
							}
			
						}*/
			graph.removeCells(cells)
		})

		// 확대
		graph.bindKey(['shift+=', 'meta+1'], () => {
			const zoom = graph.zoom()
			if (zoom < 1.5) {
				graph.zoom(0.1)
			}
		})

		// 축소
		graph.bindKey(['shift+-', 'meta+2'], () => {
			const zoom = graph.zoom()
			if (zoom > 0.5) {
				graph.zoom(-0.1)
			}
		})

		// 키보드 좌측 
		graph.bindKey(['left'], () => {
			const selectedCells = graph.getSelectedCells();
			selectedCells.forEach((cell) => {
				if (cell.isNode()) {
					const { x, y } = cell.position();
					cell.position(x - 1, y); // 왼쪽으로 1px 이동
				}
			});
		});

		// 키보드 우측 
		graph.bindKey(['right'], () => {
			const selectedCells = graph.getSelectedCells();
			selectedCells.forEach((cell) => {
				if (cell.isNode()) {
					const { x, y } = cell.position();
					cell.position(x + 1, y); // 오른쪽으로 1px 이동
				}
			});
		});

		// 키보드 위
		graph.bindKey(['up'], () => {
			const selectedCells = graph.getSelectedCells();
			selectedCells.forEach((cell) => {
				if (cell.isNode()) {
					const { x, y } = cell.position();
					cell.position(x, y - 1); // 위로 1px 이동
				}
			});
		});

		// 키보드 아래
		graph.bindKey(['down'], () => {
			const selectedCells = graph.getSelectedCells();
			selectedCells.forEach((cell) => {
				if (cell.isNode()) {
					const { x, y } = cell.position();
					cell.position(x, y + 1); // 아래로 1px 이동
				}
			});
		});
		//-------------------------------------------  windowSize  ------------------------------------------------------
		// grid 관련
		/*		function firstWindow(){
					var windowHeight = $(window).height();
					el.find("#stencil").height(windowHeight-200);
				}
				firstWindow()
				$(window).bind('resize', function() {
					el.find("#stencil").height(resizeScroll());
						
				})
				function resizeScroll() {
					var windowHeight = $(window).height();
					return windowHeight - 200;
				}*/
		// toolbarDetail 관련
		window.addEventListener('resize', function() {
			// 형제 요소의 너비 가져오기
			const siblingWidth = document.getElementById('toolbar').offsetWidth;

			// absolute-box 요소의 너비를 형제 요소와 맞추기
			document.getElementById('toolbarDetail').style.width = siblingWidth + 'px';
		});

		// 초기 로드 시 너비 설정
		window.dispatchEvent(new Event('resize'));

		// 달력관련 함수
		function judgeType(sel, type, opt, term) {
			if (type == "date") {
				el.find('#' + sel).datetimepicker("destroy");
				if (opt != 'range') {
					el.find('#' + sel).datetimepicker({
						mask: '9999-19-39 29:59:59',
						format: 'Y-m-d H:i:s',
						step: 5,
						onShow: function(ct) { }
					});
					var dt_start = new Date();
					el.find('#' + sel).val($filter('date')(dt_start, 'yyyy-MM-dd HH:mm:59'));
				} else {
					el.find('#' + sel).datetimepicker({
						mask: '9999-19-39 29:59:59',
						format: 'Y-m-d H:i:s',
						step: 5,
						onShow: function(ct) {
							changeDate(this, 0, '#' + sel, '#' + sel + '_range');
						},
						onSelectDate: function() {
							changeDate(this, 0, '#' + sel, '#' + sel + '_range');
						}
					});
					el.find('#' + sel + '_range').datetimepicker({
						mask: '9999-19-39 29:59:59',
						format: 'Y-m-d H:i:s',
						step: 5,
						onShow: function(ct) {
							changeDate(this, 1, '#' + sel, '#' + sel + '_range');
						},
						onSelectDate: function() {
							changeDate(this, 1, '#' + sel, '#' + sel + '_range');
						}
					});

					var today = new Date();
					el.find('#' + sel).val($filter('date')(today, 'yyyy-MM-dd HH:mm:59'));
					el.find('#' + sel + '_range').val($filter('date')(today, 'yyyy-MM-dd HH:mm:59'));
				}
			}
		};

		// 날짜 변경
		var changeDate = function(that, mode, start, end, isGrp) {
			var dt = new Date();
			var s_date = el.find(start).val().split(' ')[0].replace(/-/g, '/');
			var e_date = el.find(end).val().split(' ')[0].replace(/-/g, '/');
			var s_time = el.find(start).val().split(' ')[1].substring(0, 5);
			var now = $filter('date')(dt, 'yyyy/MM/dd HH:mm:ss');
			var now_day = now.split(' ')[0];
			var now_time = now.split(' ')[1];

			if (mode == 1) {
				if (s_date != now_day) {
					if (s_date != e_date) {
						that.setOptions({ minTime: '00:00', maxTime: '24:00' });
					} else {
						that.setOptions({ minTime: s_time, maxTime: '24:00' });
					}
				}
				if (e_date == now_day) {
					if (s_date != e_date) {
						that.setOptions({ minTime: '00:00', maxTime: '24:00' });
					} else {
						that.setOptions({ minTime: s_time, maxTime: '24:00' });
					}
				}
				that.setOptions({ minDate: s_date, maxDate: now_day });
			} else {
				if (s_date != now_day) {
					now_time = '24:00';
				}
				if (s_date != e_date) {
					now_time = '24:00';
				}
				that.setOptions({ maxDate: now_day, maxTime: now_time });
			}
		};

		// 모달창열기
		function openModal(id, w, h, top, css) {
			console.log("## openModal")
			// 모달창 관련 옵션
			el.find('#' + id).width(w);
			el.find('#' + id).height(h);
			el.find('#' + id).css('margin-left', -(w / 2));
			el.find('#' + id + ' .panel-body').css(css)//--> css 는 {} 로
			// el.find('#setSavePeriodModal .panel-body').height(200);
			el.find('#' + id).css('top', top);
			el.find('#' + id).css('border', "solid");
			el.find('#' + id).css('z-index', 10);
			el.find('#' + id).reveal({
				animation: 'none',
				closeonbackgroundclick: true
			});
		}






	}]);
