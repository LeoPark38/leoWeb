angular.module('myApp').controller('dashCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## dashCtrl.js ##")
		var el = $($element);
		var sAction = {
			saveWidget : '../stats/saveWidget',
			deleteWidget: '../stats/deleteWidget',
		};
		var gAction = {
			savedWidget : '../stats/savedWidget',
		};
		//widget 변수 설정
		$scope.grid;
		//저장된 widget 목록
		var widgetList = [];
		
		// grid init
		$timeout(function() {
			// 그리드 생성
			$scope.grid = GridStack.init({
				float: true,
				cellHeight: 120
			}, '#widgetGrid');
			
			// 위젯 호출
  			loadUserWidgets();
  
			// 리사이즈 관련
			$scope.grid.on('resizestop dragstop', function (event, el) {
				// chart 리사이즈용
				const chartDom = el.querySelector(`#${el.getAttribute('gsid')}`);
				//const box = chartDom.getBoundingClientRect();
				if (chartDom) {
				    const chartInstance = echarts.getInstanceByDom(chartDom);
				    if (chartInstance) {
				      chartInstance.resize();
				    }
				}
				// table리사이즈용
  				const tableEl = el.querySelector('#board_table');
  				if (tableEl) {
    				const scope = angular.element(tableEl).scope();
    				if (scope && scope.board_table_resize) {
      					scope.board_table_resize();
    				}
  				}
				$timeout(function() {
					saveWidget();
				}, 100);
			});
			
		}, 0); // DOM 그려지고 나서 실행

		// grid 추가 버튼
		$scope.addWidget = function () {
			if (confirm("추가 하시겠습니까?")) {
				const wcode = $("#widgetType").val();
			  	const wtitle = $("#widgetTitle").val();
	
			  	const newWidget = {
			  		I: `${wcode}`,
			  	  	TITLE: wtitle || `${wcode} 차트`,
			 	  	TYPE: wcode,
			 	  	X: 0, Y: 0, W: 3, H: 2,
			 	  	OPTIONS: {} // 추후 옵션 확장
			 	};
			 	console.log("@@ widgetList : ",widgetList)
				if (widgetList.some(w => w.I === newWidget.I)) {
				  alert("이미 추가된 위젯입니다.");
				  return;
				}else{
				 	widgetList.push(newWidget);
				 	makeWidget(newWidget);
				 	$("#widgetModal").hide();		
				 	$("#widgetTitle").val("");		
				 	saveWidget();
				}
			}
		};

		// grid 불러오기
		$scope.loadLayout = function(layout) {
			$scope.grid.removeAll(); // 기존 위젯 제거
			$scope.grid.load(layout); // JSON 형식 레이아웃 로드
		};
		// grid 추가 
		function makeWidget(widgetData) {
			//console.log("==[makeWidget]== : ",widgetData)
			const widgetDatas = {
			    I: widgetData.I,
			    TITLE: widgetData.TITLE,
			    TYPE: widgetData.TYPE,
			    X: widgetData.X,
			    Y: widgetData.Y,
			    W: widgetData.W,
			    H: widgetData.H,
			    OPTIONS: widgetData.OPTIONS || {}
			};
		  	grid = GridStack.getInstance ? GridStack.getInstance() : $scope.grid;
		  	// 고유 ID 생성
		  	const widgetId = `widget-${widgetDatas.I}`;
		
		  	// 껍데기 DOM 만들기
		  	const html = `
			    <div class="grid-stack-item" gs-w="${widgetDatas.W || 3}" gs-h="${widgetDatas.H || 2}" gs-x="${widgetDatas.X || 0}" gs-y="${widgetDatas.Y || 0}" gsid="${widgetDatas.I}">
			    	<div class="grid-stack-item-content" id="${widgetId}">
			    	</div>
			    </div>`;
		  	const el = angular.element(html);
		  	grid.addWidget(el[0]);
		  	// 템플릿 로딩
		  	$http.get(`../views/stats/${widgetDatas.I}.html`).then(function (res) {
		    	const content = res.data;
		    	const container = el.find(`#${widgetId}`);
		
		    	const widgetScope = $scope.$new(true);
		   	 	widgetScope.widgetData = widgetDatas;
		    	widgetScope.refresh = function () {
		    	  alert(`🔄 ${WIDGET_TYPE} 위젯 리프레시`);
		    	};
				widgetScope.removeWidget = $scope.removeWidget;
				
		   	 	container.html(content);
		    	$compile(container.contents())(widgetScope);
		    	$scope.widgetModal_close();
		  });
		
		}

		// 위젯 저장
		function saveWidget() {
			const widgetData = collectWidgetLayout();

			let param ={
				userId : $rootScope.userInfo.user_id,
				data :widgetData
			}

			$http.post(sAction.saveWidget, param, $rootScope.http_config).then(async function(rs) {}, function(rs) {});
		}
		
		// 위젯 정보 저장
		function collectWidgetLayout() {
			const widgets = $scope.grid .getGridItems();
		  	const result = [];
		  	widgets.forEach(item => {
			    const node = item.gridstackNode;
			    const $content = $(item).find('.grid-stack-item-content');
				
			    // 각 위젯마다 TYPE이나 TITLE 등을 추적해야 함
			    const id = item.getAttribute("gsid");
			    const widget = widgetList.find(w => w.I === id);
			
			    if (widget) {
			      result.push({
			        I: widget.I,
			        TITLE: widget.TITLE,
			        TYPE: widget.TYPE,
			        X: node.x,
			        Y: node.y,
			        W: node.w,
			        H: node.h,
			        OPTIONS: widget.OPTIONS || {}
			      });
			    }
		  	});
		  return result;
		}

		// 위젯 삭제
		$scope.removeWidget = function(widgetId) {
			grid = GridStack.getInstance ? GridStack.getInstance() : $scope.grid;
			
		  	// 위젯 DOM 찾기
		  	const targetEl = $(`.grid-stack-item[gsid="${widgetId}"]`)[0];
		  	if (!targetEl) {
		    	console.warn("삭제할 위젯을 찾을 수 없습니다:", widgetId);
		    	return;
		  	}
		
			let param ={
				userId : $rootScope.userInfo.user_id,
				widgetId:widgetId,
			}
			$http.post(sAction.deleteWidget, param, $rootScope.http_config).then(async function(rs) {
			  	// 그리드에서 제거
			  	grid.removeWidget(targetEl);
			
			  	// widgetList에서도 제거
			  	widgetList = widgetList.filter(w => w.I !== widgetId);
			  	console.log("✅ 삭제 완료:", widgetId);
			}, function(rs) {});
		};
		
		function loadUserWidgets() {
			let param ={
				userId : $rootScope.userInfo.user_id,
			}
			$http.post(gAction.savedWidget, param, $rootScope.http_config).then(async function(rs) {
				const datas = jsUt.result(rs.data,"data");
				const widgets2 = datas.map(w => ({
					I: w.WIDGET_ID,
				  	TITLE: w.WIDGET_TITLE,
				  	TYPE: w.WIDGET_TYPE,
				  	X: w.X,
				  	Y: w.Y,
				  	W: w.W,
				  	H: w.H,
				  	OPTIONS: w.OPTIONS || {}
				}));

				widgetList = widgets2; // 저장
				widgets2.forEach(widget => makeWidget(widget));

			}, function(rs) {});
		}
		
		// 저장된  위젯 불러오기
		function loadUserWidgets() {
			let param ={
				userId : $rootScope.userInfo.user_id,
			}
			$http.post(gAction.savedWidget, param, $rootScope.http_config).then(async function(rs) {
				const datas = jsUt.result(rs.data,"data");
				const widgets2 = datas.map(w => ({
					I: w.WIDGET_ID,
				  	TITLE: w.WIDGET_TITLE,
				  	TYPE: w.WIDGET_TYPE,
				  	X: w.X,
				  	Y: w.Y,
				  	W: w.W,
				  	H: w.H,
				  	OPTIONS: w.OPTIONS || {}
				}));

				widgetList = widgets2; // 저장
				widgets2.forEach(widget => makeWidget(widget));

			}, function(rs) {});
		}


















		// modal 열기
		$scope.widgetMange = function(){
			let css ={
				'paddingTop': '10px',
				'paddingRight': '10px',
				'paddingBottom': '10px',
				'paddingLeft': '10px'
			}
			$scope._id = "" // 아이디 초기화
			$scope.detail={}; //row 초기화
			openModal('widgetModal',css);
			// 쿼리테이블 만들기
		}	
		// 저장된 쿼리 모달	닫기 버튼		
		$scope.widgetModal_close = function(){
			el.find('#widgetModal').trigger('reveal:close');	
		}	
		function openModal(id,css){
			// 모달창 관련 옵션
			el.find('#'+id).width(550);
			el.find('#'+id).height(275);
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








	}]);

