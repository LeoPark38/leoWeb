angular.module('myApp').controller('radarCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## radarCtrl.js ##")
		var el = $($element);
		var sAction = {

		};
		var gAction = {
			radarData:'../stats/getRadarData',
		};

		let radarChart;

        // 초기 날짜 값
        $scope.selectedDate = new Date();
		const today = new Date();
        // Pikaday 초기화 (달력 붙이기)
		$timeout(function () {
			const picker = new Pikaday({
		    	field: document.getElementById('datepicker_radar'),
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
		      		$scope.radarChart();
		      		$scope.$apply();
		    	}
		  });
		  picker.setDate($scope.selectedDate);
		});










		$scope.refresh = function () {
		  alert('데이터 새로고침!');
		};
		
		$scope.radarSelectTypeChange = function() {
			$scope.radarChart();
		};
		
//------------------- Chart -------------------	
		$scope.radarChart = function(){
			let param ={
				days: jsUt.formatDateWithOffset($scope.selectedDate)
			}
			$http.post(gAction.radarData, param, $rootScope.http_config).then(async function(rs) {
				let passData = jsUt.result(rs.data, "data")
				
				const districts = ['강남구', '강동구', '강북구', '강서구', '노원구', '도봉구', '서초구', '송파구', '영등포구', '종로구', '중구'];
				const grouped = {}; 
				
				passData.forEach(item => {
  					const station = item.stationName;
  					if (!grouped[station]) grouped[station] = [];
  					grouped[station].push(item);
				});
				// 3. 평균 계산 함수
				const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
				const avgMap = {}; 

				for (const station in grouped) {
  					const records = grouped[station];

  					const pm10Grades = records.map(i => i.pm10Grade === "-" ? 0 : parseInt(i.pm10Grade));
  					const pm25Grades = records.map(i => i.pm25Grade === "-" ? 0 : parseInt(i.pm25Grade));
  					const o3Grades   = records.map(i => i.o3Grade   === "-" ? 0 : parseInt(i.o3Grade));

  					avgMap[station] = {
    					pm10: parseFloat(avg(pm10Grades).toFixed(2)),
    					pm25: parseFloat(avg(pm25Grades).toFixed(2)),
    					o3:   parseFloat(avg(o3Grades).toFixed(2))
  					};
				}				
				
				const radarIndicators = districts.map(name => ({ name, max: 5 }));
				
				const pm10Values = districts.map(name => avgMap[name]?.pm10 ?? 0);
				const pm25Values = districts.map(name => avgMap[name]?.pm25 ?? 0);
				const o3Values   = districts.map(name => avgMap[name]?.o3   ?? 0);				
				const radarData = [
					{ name: '미세먼지', value: pm10Values },
				  	{ name: '초미세먼지', value: pm25Values },
				  	{ name: '오존', value: o3Values }
				];

				$scope.makeRadarChart(radarIndicators,radarData);
				if (rs.data.sError)
					alert(rs.data.sError);
			}, function(rs) {});
		}

		$scope.makeRadarChart = function(radarIndicators,radarData){
			const chartDom = document.getElementById('radarChart');
			radarChart = echarts.init(chartDom);
			

			const option = {
  				title: {
    				text: '서울 구별 대기등급 비교'
  				},
  				tooltip: {
	  				trigger: 'item',
	  				formatter: function (params) {
					    const indicators = ['강남구', '강동구', '강북구', '강서구', '노원구', '도봉구', '서초구', '송파구', '영등포구', '종로구', '중구'];
					    const values = params.value;
					    const name = params.name;
	
					    let tooltipText = `<strong>${name}</strong><br/><table>`;
					    for (let i = 0; i < indicators.length; i += 2) {
					    	const left = indicators[i];
					      	const leftVal = values[i] ?? '-';
					      	const right = indicators[i + 1];
					      	const rightVal = values[i + 1] ?? '-';
					
					      	tooltipText += `<tr>
					        	<td style="padding-right: 10px;">${left} : ${leftVal}</td>
					        	<td>${right ? `${right} : ${rightVal}` : ''}</td>
					      	</tr>`;
					    }
	    				tooltipText += `</table>`;
	    				return tooltipText;
	  				}
				},
  				legend: {
    				data: ['강남구', '강동구', '강북구', '강서구', '노원구', '도봉구', '서초구', '송파구', '영등포구', '종로구', '중구']
  				},
  				radar: {
    				indicator: radarIndicators
  				},
  				series: [
    				{
      					name: 'Budget vs spending',
      					type: 'radar',
      					data: radarData
    				}
  				]
			};

			radarChart.setOption(option);
		}









	}]);

