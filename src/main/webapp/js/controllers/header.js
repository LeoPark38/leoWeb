angular.module('myApp').controller('headerCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		console.log("## headerCtrl.js ##")
		var el = $($element);
		var sAction = {

		};
		var gAction = {

		};

		$scope.logout = function(){
			console.log("logout")
			$http.post("../login/logout",{}, $rootScope.http_config).then(function(rs) {
				window.location.reload();
			}, function(rs) {});
		}












	}]);

