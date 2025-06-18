angular.module('myApp').controller('widgetCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## widgetCtrl.js ##")
		var el = $($element);
		var sAction = {

		};
		var gAction = {

		};

		$scope.refresh = function () {
		  alert('데이터 새로고침!');
		};














	}]);

