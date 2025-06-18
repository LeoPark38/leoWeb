angular.module('myApp').controller('barCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## barCtrl.js ##")
		var el = $($element);
		var sAction = {

		};
		var gAction = {
			barData:'../stats/getBarData',
		};

		$scope.refresh = function () {
		  alert('데이터 새로고침!');
		};

        // 초기 날짜 값
        $scope.selectedDate = new Date();
		const today = new Date();
        // Pikaday 초기화 (달력 붙이기)
		$timeout(function () {
			const picker = new Pikaday({
		    	field: document.getElementById('datepicker_bar'),
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
		      		$scope.barChart();
		      		$scope.$apply();
		    	}
		  });
		  picker.setDate($scope.selectedDate);
		});
//------------------- BarChart -------------------	
		$scope.barChart = function(){
			let param ={
				days: jsUt.formatDateWithOffset($scope.selectedDate)
			}
			
			$http.post(gAction.barData, param, $rootScope.http_config).then(async function(rs) {
				let passData = jsUt.result(rs.data, "data")
				const grouped = {};

				// 1. 그룹화
				passData.forEach(item => {
					const station = item.stationName;
				  	if (!grouped[station]) {
				    	grouped[station] = [];
				  	}
				  	grouped[station].push(item);
				});
				const source = [['product', '미세먼지', '초미세먼지', '오존']];

				for (const [station, records] of Object.entries(grouped)) {
					const pm10Grades = records.map(i => i.pm10Grade === "-" ? 0 : parseInt(i.pm10Grade));
					const pm25Grades = records.map(i => i.pm25Grade === "-" ? 0 : parseInt(i.pm25Grade));
					const o3Grades   = records.map(i => i.o3Grade === "-" ? 0 : parseInt(i.o3Grade));

  					const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  					source.push([
    					station,
    					parseFloat(avg(pm10Grades).toFixed(2)),
    					parseFloat(avg(pm25Grades).toFixed(2)),
    					parseFloat(avg(o3Grades).toFixed(2))
  					]);
				}

				$scope.makeBarChart(source);
				if (rs.data.sError)
					alert(rs.data.sError);
			}, function(rs) {});
		}
		
		

		$scope.makeBarChart = function(source){
			const chartDom = document.getElementById('barChart');
			const barChart = echarts.init(chartDom);

			const option = {
				title: {
			    	text: '서울 구별 대기 등급 표',
			    	left: 'center',
			    	bottom: 10
			  	},
			  	grid:{},
  				legend: {},
  				tooltip: {},
  				dataset: {
    				source: source
  				},
  				xAxis: { type: 'category' },
  				yAxis: { max: 5},
  				series: [{ type: 'bar' }, { type: 'bar' }, { type: 'bar' }]
			};

			barChart.setOption(option);
		}



	}]);

