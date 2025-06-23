angular.module('myApp').controller('airMonitoringCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## airMonitoringCtrl.js ##")
		var el = $($element);
		var sAction = {
			saveWrongData: '../monitoring/saveWrongData', // 이상데이터 저장
		};
		var gAction = {
			list: '../monitoring/getAirList', // Air List 가져오기
			row: '../monitoring/getAirRow', // 
			avgKhaiValue: '../monitoring/avgKhaiValue', // 오늘 하루 각구별 대기질 
			avgKhaiGrade: '../monitoring/avgKhaiGrade', // 오늘 하루 등급별 비율
			x6Data: '../monitoring/x6Data',
		};
		var table;
		$scope.airData ={}
		$scope.cell=[]; // 현재 셀

		//------------------- board 테이블 리스트 -------------------		
		$scope.air_table = function() {
			table = el.find('#air_table').DataTable({
				order: [[1, 'asc']],
				retrieve: true,
				jQueryUI: false,
				lengthChange: false,
				deferRender: true,
				paging: false,
				processing: true,
				serverSide: false, // 
				stateSave: true,
				autoWidth: false,
				scrollX: false,
				scrollY: "600px",
				scrollCollapse: true,    // 내용이 적으면 자동 축소
				pageLength: 13,
				lengthMenu: [5, 10, 20, 50, 100],
				ajax: {
					url: gAction.list,
					type: "POST",
					data: function(param) {

						console.log("@@ param : ", param)
					},
					dataSrc: function(json) {
						//console.log("## DataTable: ", jsUt.resultNum(json, "data", table));
						return jsUt.resultNum(json, "data", table);
					},
				},
				columns: [
					{ data: 'stationName', name: "stationName" },
					/*{ data: 'khaiValue', name: "khaiValue" },*/
					{ data: 'khaiGrade', name: "khaiGrade" },
					/*{ data: 'pm10Value', name: "pm10Value" },*/
					{ data: 'pm10Grade', name: "pm10Grade" },
					/*{ data: 'pm25Value', name: "pm25Value" },*/
					{ data: 'pm25Grade', name: "pm25Grade" },
					/*{ data: 'o3Value', name: "o3Value" },*/
					{ data: 'o3Grade', name: "o3Grade" },
					{ data: 'dataTime', name: "dataTime" }
				],
				columnDefs: [
					{ targets: [0], width: '5%', class: 'textCenter',render: function(data, type, row) {
							let stationName = row.stationName || '';
							return `<a href="javascript:;" id="${row._id}" ng-click="air_data_view($event, 'upd')">${stationName}</a>`;
						}
					},
					/*{ targets: [1], width: '5%', class: 'textCenter',visible: true, searchable: false},*/
					{ targets: [1], width: '5%', class: 'textCenter',render: function(data, type, row){
							return gradeRender(row.khaiGrade);
						} 
					},
					/*{ targets: [3], width: '5%', class: 'textCenter', visible: true, searchable: false },*/
					{ targets: [2], width: '5%', class: 'textCenter',render: function(data, type, row){
							return gradeRender(row.pm10Grade);
						} 
					},
					/*{ targets: [5], width: '5%', class: 'textLeft', visible: true, searchable: false },*/
					{ targets: [3], width: '5%', class: 'textCenter',render: function(data, type, row){
							return gradeRender(row.pm25Grade);
						} 
					},
					/*{ targets: [7], width: '5%', class: 'textLeft', visible: true, searchable: false },*/
					{ targets: [4], width: '5%', class: 'textCenter',render: function(data, type, row){
							return gradeRender(row.o3Grade);
						} 
					},
					{ targets: [5], width: '10%', class: 'textCenter',render: function(data, type, row){
						    if (!row.dataTime) return '-';
    						return row.dataTime.substring(0, 16); // "2025-05-18 06:00"

						} 
					},

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
		$scope.air_table()

//------------------- 보드 view -------------------
			$scope.air_data_view = function(e,type) {
			
				el.find('#chart').hide();
				el.find('#detail-pane').show();
				console.log("ee : ",e.target.innerText)
				$scope.pop_init();
				var id = e.target.id
				var param = { "_id": id};

				$http.post(gAction.row, param, $rootScope.http_config).then(async function(rs) {
					var row = jsUt.resultOne(rs, "row");

					$scope.airData = row
					el.find('#_id').val(row._id);
					
					// 개별 플래그
					let pm10 = row.pm10Flag;
					let pm25 = row.pm25Flag;
					let o3   = row.o3Flag;

					let descParts = [];
					
					if (pm10 && pm10 !== '-') descParts.push('[PM10] ' + pm10);
					if (pm25 && pm25 !== '-') descParts.push('[PM2.5] ' + pm25);
					if (o3 && o3 !== '-')     descParts.push('[O3] ' + o3);
					
					  // 결과 조합
					if (descParts.length > 0) {
					  $scope.airData.desc = descParts.join(' ');
					} else {
					  $scope.airData.desc = '통신정상';
					}
					param.area = e.target.innerText
					$http.post(gAction.x6Data, param, $rootScope.http_config).then(async function(rs) {
						if(rs.data.sError){
							alert(rs.data.sError)
						}else{
							var row = jsUt.resultOne(rs, "row");
							console.log("row : ",row)
							var graph= row.X6_STRUCTURE
							setX6Data(graph)
							$timeout(()=>{ 
								flowAirData()
							},1000)
							
						}
						

					}, function(rs) {});
					
					
					
					if (rs.data.sError)
						alert(rs.data.sError);
				}, function(rs) {});

			};	









//------------------- BarChart -------------------	
		$scope.barChart = function(){
			//avgKhaiValue
			
			$http.post(gAction.avgKhaiValue, {}, $rootScope.http_config).then(async function(rs) {
				var buckets  = rs.data.data.data.aggregations.by_station.buckets
	
				$scope.makeBarChart(buckets);
				if (rs.data.sError)
					alert(rs.data.sError);
			}, function(rs) {});
		}
		
		$scope.barChart();

		$scope.makeBarChart = function(buckets){
			const xData = buckets.map(b => b.key);
			const yData = buckets.map(b => Number(b.avg_khai.value.toFixed(1)));
			
			const chartDom = document.getElementById('myChart');
			const myChart = echarts.init(chartDom);

			const option = {
				title: {
					text: '오늘 하루 구별 평균 대기환경지수(khaiValue)',
					left: 'center',
					top: 'bottom'
				},
				tooltip: {
					trigger: 'axis'
				},
				xAxis: {
					type: 'category',
					data: xData
				},
				yAxis: {
					type: 'value',
					min: 0,
					max: 150,
					name: 'KHAI',
					axisLabel: {
						formatter: '{value}'
					}
				},
				series: [{
					name: '평균 KHAI',
					type: 'bar',
					data: yData,
					itemStyle: {
						color: function(params) {
							const val = params.data;
							if (val <= 50) return 'green';
							else if (val <= 100) return 'blue';
							else if (val <= 150) return 'orange';
							else return 'red';
						}
					}
				}]
			};

			myChart.setOption(option);
		}
		
//------------------- PieChart -------------------	
		// 오늘 하루 대기질 분포
		$scope.pie = function(){
			//avgKhaiValue
			$http.post(gAction.avgKhaiGrade, {}, $rootScope.http_config).then(async function(rs) {

				var buckets  = rs.data.data.data.aggregations.grade_dist.buckets
				$scope.makePieChart(buckets)
				if (rs.data.sError)
					alert(rs.data.sError);
			}, function(rs) {});
		}		
		$scope.pie()	
		
		$scope.makePieChart = function(buckets){
			const chartDom = document.getElementById('pieChart');
			const myChart = echarts.init(chartDom);
			const labelMap = {
			  '1': '좋음',
			  '2': '보통',
			  '3': '나쁨',
			  '4': '매우 나쁨',
			  '-': '통신장애'
			};
			
			const colorMap = {
			  '1': 'green',
			  '2': 'blue',
			  '3': 'orange',
			  '4': 'red'
			};
			const pieData = buckets.map(b => ({
			  value: b.doc_count,
			  name: labelMap[b.key] || b.key,
			  itemStyle: { color: colorMap[b.key] || 'gray' }
			}));
			const option = {
				title: {
    				text: '오늘 하루 등급별 대기질(khaiGrade) 분포',
				    left: 'center',
				    top: 'bottom',
				    textStyle: {
					    fontSize: 16,
					    fontWeight: 'bold',
					    margin: [10, 0, 0, 0] // [top, right, bottom, left]
					}
				  },
		  		tooltip: {
				    trigger: 'item',
				    formatter: '{b}: {c}건 ({d}%)'
				  },
  				legend: {
				    top: '5%',
				    left: 'center'
				  },
  				series: [
				    {
				      name: '등급 분포',
				      type: 'pie',
				      radius: ['40%', '70%'],
				      avoidLabelOverlap: false,
				      itemStyle: {
				        borderRadius: 10,
				        borderColor: '#fff',
				        borderWidth: 2
				      },
				      label: {
				        show: false,
				        position: 'center'
				      },
				      emphasis: {
				        label: {
				          show: true,
				          fontSize: 24,
				          fontWeight: 'bold',
				          formatter: '{b}\n{d}%'  // 강조 시 등급명과 퍼센트 표시
				        }
				      },
				      labelLine: {
				        show: false
				      },
				      data: pieData
				    }
  				]
			};


			myChart.setOption(option);
		}
		
			
//------------------- 입력값 초기화 -------------------				
		$scope.pop_init = function() {
			$scope.airData = {}
			el.find('#_id').val("")
		};
		
// ------------------- air Data 지수/등급 렌더링	 -------------------			
		function gradeRender(grade) {
			let color = '';
		  	let label = '';
		
		  	switch (grade) {
			    case '1': case 1:
			      color = 'green';
			      label = '좋음';
			      break;
			    case '2': case 2:
			      color = 'blue';
			      label = '보통';
			      break;
			    case '3': case 3:
			      color = 'orange';
			      label = '나쁨';
			      break;
			    case '4': case 4:
			      color = 'red';
			      label = '매우 나쁨';
			      break;
			    default:
			      color = 'gray';
			      label = '정보 없음';
			      break;
		  	}
		
		  	return `<span title="${label}" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${color}"></span>`;
		}

		$timeout(function() {
			Split(['#table-pane', '#chart-pane'], {
				sizes: [50, 50],
				minSize: 300,
				gutterSize: 8,
				cursor: 'col-resize', 
				onDrag: function() {
					$('#air_table').DataTable().columns.adjust();
				},
				onDragEnd: function() {
					//$('#air_table').DataTable().columns.adjust().draw();
				},
				gutter: function(index, direction) {
					const gutter = document.createElement('div');
					gutter.className = `gutter gutter-${direction}`;
					// 안에 핸들 추가
					const handle = document.createElement('div');
					handle.className = 'gutter-handle';
					gutter.appendChild(handle);

					return gutter;
				}
			});
		});
		
		// 이상 대기 등록
		$scope.wrong_air_save = function() {
			if (confirm("이상 대기 등록 하시겠습니까?")) {
				let param = $scope.airData
				$http.post(sAction.saveWrongData, param, $rootScope.http_config).then(async function(rs) {
	
					if (rs.data.sError)
						alert(rs.data.sError);
				}, function(rs) {});
			}

		};



// ------------------------------ 아래에는 길고 복잡한 X6관련 메서드만 넣을 예정 ------------------------------
// ------------------------------ 아래에는 길고 복잡한 X6관련 메서드만 넣을 예정 ------------------------------
// ------------------------------ 아래에는 길고 복잡한 X6관련 메서드만 넣을 예정 ------------------------------

		preWork()
		const graph = new X6.Graph({
			container: document.getElementById('graph-container'),
			autoResize:true,
			background: {
				color: '#F2F7FA'
			
			},
			grid: {
			    size: 10,
			    visible: true,
			    type: 'mesh', // 'dot' | 'fixedDot' | 'mesh'
			    args: { 
			      color: '#a0a0a0',
			      thickness: 1,    
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
						return false
					}
					return true
				}
			},
			panning: { // 해당 타입으로 그래프 이동가능.
				enabled: true,
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
				highlight:true,
				createEdge() {
					return new X6.Shape.Edge({
						shape: 'edge',
						labels:"",
						allowEdge:true,
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
							},
						},
						data:{
							v_check:"NONE"
						},
						connector:{
							name:"rounded", // 엣지끼리 통과할때 건너가게끔 표현
							args:{
								type:"gap",  // args 를 추가함으로써 건너가는게아님 밑으로 통과하게끔 표현
								radius: 5,
							}
						},
						tools :   [{name : 'vertices' ,args : {}}],
						zIndex: 0,
					})
				},

				validateConnection({ targetMagnet }) {
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
			keyboard:{
				enabled: true
			}
		})

		graph.use(new X6PluginSnapline.Snapline())
			 .use(new X6PluginClipboard.Clipboard())

		function preWork() {
			const container = document.getElementById('container')
			const graphContainer = document.createElement('div')
			graphContainer.id = 'graph-container'

			container.appendChild(graphContainer)
			/*container.appendChild(testContainer)*/
		}	

		const ports = { // 포트설정 
			groups: {
				top: { // port 위치 
					//position: 'top', // 위치 
					// 
					position:{
						name:'absolute',
						args:{ x:'50%',y:'-2%'}
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
					position:{
						name:'absolute',
						args:{ x:'102%',y:'50%'}
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
					position:{
						name:'absolute',
						args:{ x:'50%',y:'102%'}
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
					position:{
						name:'absolute',
						args:{ x:'-2%',y:'50%'}
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

		X6.Graph.registerNode(
			'custom-rect',
			{
				angle: 0,
				inherit: 'rect',
				ports: { ...ports },
			},
			true,
		)

/*		X6.Graph.registerNode(
			'path',
			{
				inherit: 'path',
				ports: { ...ports },
				data: {}
			},
			true,
		)
		*/
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
			'air-node',
			{
				label:"",
				inherit: 'rect',
			    markup: [ /* markup 으로 node에 text/body / image 등 svg를 만들수있다. */
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
			      }
			    ],
			    attrs: {},
			 	data:{},
				ports: { ...ports }
			  },
			true
		)		


				// 저장된 그래프 데이터 불러오기
		var setX6Data = function(rs) {
			var setData = [];
			return new Promise((resolve,reject)=>{
				try{
					setData = JSON.parse(rs)

					for (var i in setData) {
						if (setData[i].shape == "edge") {
							var edgeNode = {
								id: setData[i].id,
								shape: "edge",
								source: setData[i].source,
								target: setData[i].target,
								attrs: setData[i].attr,
								connector :  setData[i].connector,
								router : setData[i].router,
								zIndex: 0,
								parent: setData[i].parent,
							}
							if (setData[i].type) {
								edgeNode["type"] = setData[i].type
							}
							if(setData[i].vertices){
								edgeNode["vertices"] = setData[i].vertices
							}
							if(setData[i].data){
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

					console.log("[cell] : ",$scope.cell)

					$timeout(()=>{ // 시간을 지연시켜줘야 그래프 위치 설정가능
						graph.resetCells($scope.cell);
						
						graph.zoomToFit({ padding: 30, maxScale: 0.4 })
						graph.centerContent();
						$scope.cell=[]; // 다시 초기화
					},1000)

					resolve(); // 완료
				}catch(error){
					reject(error); // 실패
				}
			})

		}


		function flowAirData(){
			// 노드의 모든 아이디
			let getNodes = graph.getNodes() // 모든 node 찾기
			let allofNode=[]; // node id들의 배열
			for(let a in getNodes){
				allofNode.push(getNodes[a].id)
			}
			for(let i in allofNode){
				nodeFade(allofNode[i])
			}
			//console.log("@@ getNodes : ",getNodes)
			console.log("@@ allofNode : ",allofNode)
			// 엣지 하이라이트 관련
			let edges = graph.getEdges();
			for(let e in edges){
				edgeFade(edges[e]);
			}
			let firstEdge = edges[0];
			let strokeWidth = firstEdge.attr('line/strokeWidth');
			
			firstEdge.attr('line/strokeWidth', strokeWidth * 2);// 기존 두께의 2배로 설정
			firstEdge.attr('line/class','edge-highlight'); // CSS 클래스를 추가하여 애니메이션 적용
			

			console.log("@ $scope.airData : ",$scope.airData)
			
			let thisNode = graph.getCellById('first');
			let outEdges = graph.getOutgoingEdges(thisNode);
			console.log("@ outEdges : ",outEdges)
			
			// 1. 추적할 타입만 정의
			const validTypes = ['pm10', 'pm25', 'o3'];

			// 2. 그래프 내 모든 셀 중 노드만 필터링
			let allNodes = graph.getNodes();

			// 3. 타입 필터링 및 순서 정렬
			let checkOrder = allNodes
			  .map(node => node.getData().airType)
			  .filter(type => validTypes.includes(type)); 

			let flowState = {
			  pm10: getFlowLine($scope.airData.pm10Grade, $scope.airData.pm10Flag),
			  pm25: getFlowLine($scope.airData.pm25Grade, $scope.airData.pm25Flag),
			  o3: getFlowLine($scope.airData.o3Grade, $scope.airData.o3Flag),
			  desc: $scope.airData.desc === '통신정상' ? 'Y' : 'N'
			};
			
			// 하이라이트 시작 노드 ( 첫노드 )
			let currentNode = graph.getCellById('first');
			let isBroken = false; // 정상적으로 다 도는지 체크용
			
			const firstNode = graph.getCellById("first");
			nodeHighlight(firstNode);
			
			for (let key of checkOrder) {
				let flowValue = flowState[key]; // 'Y' or 'N'
			  	let outgoingEdges = graph.getOutgoingEdges(currentNode);
			  	let nextEdge = outgoingEdges.find(edge => edge.getData().flowLine === flowValue);
				
				// 엣지 하이라이트
				edgeHighlight(nextEdge)
				// 경로없을시 탈출
			  	if (!nextEdge) {
					isBroken = true;
					break;
				}
			  	let targetNodeId = nextEdge.getTargetCellId();
			  	let targetNode = graph.getCellById(targetNodeId);
			
			  	console.log(`✅ 노드 이동 [${flowValue}]: ${currentNode.id} → ${targetNode.id}` ,",  airType:: ", targetNode.getData().airType);
				
			  	currentNode = targetNode;
				nodeHighlight(currentNode)
				
				// 비정상 데이터일경우 통신에러로 변경
				if (flowValue =="N"){
					lastNodePrc(currentNode,"err")
					isBroken = true;
					break; // N이면 스탑
				} 
			  	// 도착 노드가 통신에러 or 정상통신이면 종료
			  	if (currentNode.id === '통신에러' || currentNode.id === '정상통신') break;
			}
			
			// 모든 데이터가 정상일경우 
			if (!isBroken) {
			  	console.log("✅ 루프 정상 종료 : ",currentNode);
				lastNodePrc(currentNode,"success")
			}
		}
		
		// airData 이후 노드 처리
		function lastNodePrc(node,rs){
			if(rs =="success"){
			  	let outgoingEdges = graph.getOutgoingEdges(node);
			  	let nextEdge = outgoingEdges.find(edge => edge.getData().flowLine === "Y");
			  
			  	let strokeWidth = nextEdge.attr('line/strokeWidth');
				nextEdge.attr('line/strokeWidth', strokeWidth * 2);// 기존 두께의 2배로 설정
				nextEdge.attr('line/class','edge-highlight'); // CSS 클래스를 추가하여 애니메이션 적용
				
				let targetNodeId = nextEdge.getTargetCellId();
			  	let targetNode = graph.getCellById(targetNodeId);
				nodeHighlight(targetNode)

				//el.find('#wrongAirSave').hide();
				el.find('#wrongAirSave').show();
			}else if(rs =="err"){
				errorNodeEdgeHighLight(node);
				nodeHighlight(node);	
				
				let outgoingEdges = graph.getOutgoingEdges(node);
			  	let nextEdge = outgoingEdges.find(edge => edge.getData().flowLine === "Y");
			  	let targetNodeId = nextEdge.getTargetCellId();
			  	let targetNode = graph.getCellById(targetNodeId);	
			  	nodeHighlight(targetNode);	
				
				el.find('#wrongAirSave').show();
			}
		}
		
		// node 하이라이트
		function nodeHighlight(node) {
			console.log("node : ",node)
			const airType = node.getData().airType
		    switch (airType) {
				case "air": //air
		         	node.attr('body/class', 'strokeAir');
		         	return;
		      	case "pm10": //pm10
		         	node.attr('body/class', 'strokePm10');
		         	return;
		       	case "pm25": //pm25
		         	node.attr('body/class', 'strokePm25');
		         	return;
		       	case "o3": //o3
		       	 	node.attr('body/class', 'strokeO3');
		         	return;
		       	case "Success": //Success
		         	node.attr('body/class', 'strokeSuccess');
		         	return;
		       	case "Error": //Error
		         	node.attr('body/class', 'strokeError');
		         	return;
		       	case "Register": 
		        	node.attr('body/class', 'strokeRegister');
		         	return;
		       	default:
					node.attr('body/class', 'strokeEtc');
					return;
		      }

		}
		
		// type노드 후 edge처리
		function errorNodeEdgeHighLight(currentNode) {
			let outgoingEdges = graph.getOutgoingEdges(currentNode);
			let nextEdge = outgoingEdges.find(edge => edge.getData().flowLine === "Y");
			
			let strokeWidth = nextEdge.attr('line/strokeWidth');
			nextEdge.attr('line/strokeWidth', strokeWidth * 2);// 기존 두께의 2배로 설정
			nextEdge.attr('line/class','edge-highlight'); // CSS 클래스를 추가하여 애니메이션 적용
		}
						
		// 노드 Fade 처리
		function nodeFade(id) {
			const node = graph.getCellById(id);
			node.attr('body/class', 'fade-and-darken');		
		}	
		
		// 엣지 하이라이트
		function edgeHighlight(edge) {
				let strokeWidth = edge.attr('line/strokeWidth');
				edge.attr('line/strokeWidth', strokeWidth * 2);// 기존 두께의 2배로 설정
				edge.attr('line/class','edge-highlight'); // CSS 클래스를 추가하여 애니메이션 적용
		}
				
		// 엣지 Fade 처리
		function edgeFade(edge) {
			edge.attr('line/strokeWidth', 1)
			edge.attr('line/opacity', 0.8)
		}


		function getFlowLine(grade, flag) {
			const val = parseInt(grade);
			return flag === '-' && !isNaN(val) && val < 3 ? 'Y' : 'N';
		}






	}]);

