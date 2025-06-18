angular.module('myApp').controller('lineCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## lineCtrl.js ##")
		var el = $($element);
		var sAction = {

		};
		var gAction = {
			lineData: '../stats/getLineData', // 오늘 하루 각구별 대기질 
		};
		
		let lineChart;
		$scope.seletType = "KDA"
		
        // 초기 날짜 값
        $scope.selectedDate = new Date();
		const today = new Date();
        // Pikaday 초기화 (달력 붙이기)
		$timeout(function () {
			const picker = new Pikaday({
		    	field: document.getElementById('datepicker_line'),
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
		      		$scope.lineChart();
		      		$scope.$apply();
		    	}
		  });
		  picker.setDate($scope.selectedDate);
		});

		$scope.lineSelectTypeChange = function() {
			$scope.lineChart();
		};
//------------------- Chart -------------------	
		$scope.lineChart = function(){
			let param ={
				type: $scope.seletType,
				days: jsUt.formatDateWithOffset($scope.selectedDate)
			}
			$http.post(gAction.lineData, param, $rootScope.http_config).then(async function(rs) {
				let passData = jsUt.result(rs.data, "data")
				$scope.makelineChart(passData);
			}, function(rs) {});
		}
		
		

		$scope.makelineChart = function(passData){
			const chartDom = document.getElementById('lineChart');
			lineChart = echarts.init(chartDom);
			const timeLabels = passData.map(item => item.dataTime.slice(11, 16)); // "HH:mm"
			const pm10Arr = [];
			const pm25Arr = [];
			const o3Arr = [];
			passData.forEach(item => {
  				pm10Arr.push({
				    value: item.pm10Grade === "-" ? 0 : parseInt(item.pm10Grade),
				    realValue: item.pm10Value === "-" ? 0 : parseInt(item.pm10Value)
  				});
  				pm25Arr.push({
				    value: item.pm25Grade === "-" ? 0 : parseInt(item.pm25Grade),
				    realValue: item.pm25Value === "-" ? 0 : parseInt(item.pm25Value)
  				});
  				o3Arr.push({
				    value: item.o3Grade === "-" ? 0 : parseInt(item.o3Grade),
				    realValue: item.o3Value === "-" ? 0 : parseFloat(item.o3Value)
  				});
			});

			const option = {
				title: {
    				text: '['+jsUt.getDistrictLabel($scope.seletType)+'] 대기 상태값',
    				left: 'center'
  				},
				tooltip: {
  					trigger: 'item',  // ✅ 핵심!
  					formatter: function (params) {
					    const label = params.seriesName;
					    const time = params.name;
					    const val = params.data.realValue ?? params.value;
					    return `${label}(value)<br/>${time} : ${val}`;
  					}
				},
  				legend: {
    				left: 'left'
  				},
  				xAxis: {
    				type: 'category',
    				name: '시간',
    				splitLine: { show: false },
    				data: timeLabels
  				},
  				grid: {
    				left: '3%',
    				right: '4%',
    				bottom: '3%',
    				containLabel: true
  				},
  				yAxis: {
    				type: 'value',
    				min:0,
    				max:5,
    				name: '값',
    				minorSplitLine: { show: true }
  				},
  				series: [
    				{
				      name: '미세먼지',
				      type: 'line',
				      data: pm10Arr
				    },
        			{
				      name: '초미세먼지',
				      type: 'line',
				      data: pm25Arr
				    },
    				{
				      name: '오존',
				      type: 'line',
				      data: o3Arr
				    }
  				]
			};
			lineChart.setOption(option);
		}


	}]);

