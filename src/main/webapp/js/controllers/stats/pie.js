angular.module('myApp').controller('pieCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## pieCtrl.js ##")
		var el = $($element);
		var sAction = {

		};
		var gAction = {
			pieData: '../stats/getPieData',
		};
		let pieChart;
		$scope.seletType = "KDA"

        // 초기 날짜 값
        $scope.selectedDate = new Date();
		const today = new Date();
        // Pikaday 초기화 (달력 붙이기)
		$timeout(function () {
			const picker = new Pikaday({
		    	field: document.getElementById('datepicker_pie'),
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
		      		$scope.pieChart();
		      		$scope.$apply();
		    	}
		  });
		  picker.setDate($scope.selectedDate);
		});

		$scope.pieSelectTypeChange = function() {
			$scope.pieChart();
		};


//------------------- Chart -------------------	
		$scope.pieChart = function(){
			//avgKhaiValue
			let param ={
				type: $scope.seletType,
				days: jsUt.formatDateWithOffset($scope.selectedDate)
			}
			
			$http.post(gAction.pieData, param, $rootScope.http_config).then(async function(rs) {
				let passData = jsUt.result(rs.data, "data")
				makeData(passData)

			}, function(rs) {});
		}
		
		function makeData(passData) {
			const allGrades = ["1", "2", "3", "4","-"];
			let gradeCounts = {};
			passData.forEach(item => {
				const grade = item.khaiGrade;
				if (grade) {
				    	gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
				}
			});
			// 누락된 등급 0으로 채우기
			allGrades.forEach(g => {
  				if (!gradeCounts[g]) {
    				gradeCounts[g] = 0;
  				}
			});
			$scope.makepieChart(gradeCounts);
		}
		
		$scope.makepieChart = function(val){
			const chartDom = document.getElementById('pieChart');
			pieChart = echarts.init(chartDom);
			const option = {
  				title: {
    				text: '['+jsUt.getDistrictLabel($scope.seletType)+'] 대기 등급 분포',
    				subtext: '',
    				left: 'center',
    				 bottom: 40
  				},
  				tooltip: {
    				trigger: 'item'
  				},
  				legend: {
    				orient: 'vertical',
    				left: 'left'
  				},
  				series: [
    				{
				    	name: 'Access From',
				      	type: 'pie',
				      	radius: '50%',
      					data: [
        					{ value: val[1], name: '좋음' },
        					{ value: val[2], name: '보통' },
        					{ value: val[3], name: '나쁨' },
        					{ value: val[4], name: '매우 나쁨' },
        					{ value: val["-"], name: '통신 장애' }
      					],
      					emphasis: {
        					itemStyle: {
          						shadowBlur: 10,
          						shadowOffsetX: 10,
          						shadowColor: 'rgba(0, 0, 0, 0.7)'
        					}
      					}
    				}
  				]
			};

			pieChart.setOption(option);
		}








	}]);

