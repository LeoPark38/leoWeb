angular.module('myApp').controller('gageCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## gageCtrl.js ##")
		var el = $($element);
		var sAction = {

		};
		var gAction = {
			gageData:'../stats/getGageData',
		};

		let gageChart;
		$scope.seletType = "KDA"

        // 초기 날짜 값
        $scope.selectedDate = new Date();
		const today = new Date();
        // Pikaday 초기화 (달력 붙이기)
		$timeout(function () {
			const picker = new Pikaday({
		    	field: document.getElementById('datepicker_gage'),
		    	format: 'YYYY-MM-DD',
		    	maxDate: today,
		    	toString(date) {
		      		return date.toLocaleDateString('ko-KR', {
		        		year: 'numeric',
		       	 		month: '2-digit',
		        		day: '2-digit',
		        		weekday: 'short'
		      		});
		    	},
		    	parse(dateString) {
		      		return new Date(dateString);
		    	},
		    	onSelect: function(date) {
		      		$scope.selectedDate = date;
		      		$scope.gageChart();
		      		$scope.$apply();
		    	}
		  });
		  picker.setDate($scope.selectedDate);
		});










		$scope.refresh = function () {
		  alert('데이터 새로고침!');
		};
		
		$scope.gageSelectTypeChange = function() {
			$scope.gageChart();
		};
		
//------------------- Chart -------------------	
		$scope.gageChart = function(){
			let param ={
				type: $scope.seletType,
				days: jsUt.formatDateWithOffset($scope.selectedDate)
			}
			$http.post(gAction.gageData, param, $rootScope.http_config).then(async function(rs) {
				var value  = rs.data.data.data.aggregations.avg_khaiValue
	
				$scope.makeGageChart(value);
				if (rs.data.sError)
					alert(rs.data.sError);
			}, function(rs) {});
		}

		$scope.makeGageChart = function(val){
			const chartDom = document.getElementById('gageChart');
			gageChart = echarts.init(chartDom);
			
			let value = val.value;
			const option = {
				series: [
					{
				    	type: 'gauge',
				      	startAngle: 180,
				      	endAngle: 0,
				      	center: ['50%', '75%'],
				      	radius: '90%',
				      	min: 0,
				      	max: 200,
				      	splitNumber: 8,
						axisLine: {
							lineStyle: {
								width: 6,
								color: [
									[50 / 200, '#7CFFB2'],   // 좋음
									[100 / 200, '#58D9F9'],  // 보통
									[150 / 200, '#FDDD60'],  // 나쁨
									[1, '#FF6E76']           // 매우 나쁨
								]
							}
						},
	      				pointer: {
	        				icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
	        				length: '12%',
	        				width: 20,
	        				offsetCenter: [0, '-60%'],
	        				itemStyle: {
	          					olor: 'auto'
	        				}
	      				},
	      				axisTick: {
	        				length: 12,
	        				lineStyle: {
	          					color: 'auto',
	          					width: 2
	        				}
	      				},
	      				splitLine: {
	        				length: 20,
	        				lineStyle: {
	          					color: 'auto',
	          					width: 5
	        				}
	      				},
	      				axisLabel: {
	        				color: '#464646',
	       	 				fontSize: 20,
	        				distance: -60,
	        				rotate: 'tangential',
							formatter: function (v) {
								if (v === 25) return '좋음';
								if (v === 75) return '보통';
								if (v === 125) return '나쁨';
								if (v === 175) return '매우 나쁨';
								return '';
							}
	      				},
	      				title: {
	        				offsetCenter: [0, '20%'],
	        				fontSize: 20
	      				},
	      				detail: {
	        				fontSize: 30,
	       	 				offsetCenter: [0, '-10%'],
	        				valueAnimation: true,
	        				formatter: function (value) {
	          					return Math.round(value) + '점';
	        				},
	        				color: 'inherit'
	      				},
	      				data: [
	        				{
	          					value: value,
	          					name: '['+jsUt.getDistrictLabel($scope.seletType)+'] 하루 평균 대기등급'
	        				}
	      				]
    				}
  				]
			};

			gageChart.setOption(option);
		}









	}]);

