// AngularJS 애플리케이션 모듈 정의
var app = angular.module('myApp', ['ui.router']); 

console.log("========== app.js IN ==========")
	app.controller('main_ctrl', function($scope, $rootScope, $http, $interval, $element, $filter, $location, $compile) {
		$http.post("../login/getSession",{}, $rootScope.http_config).then(function(rs) {
			if (rs.data) {
				$rootScope.userInfo = rs.data
				console.log("@ $rootScope.userInfo : ",$rootScope.userInfo)
			}
		}, function(rs) {});
		
	});
app.config(function($stateProvider, $urlRouterProvider) {
    var url_path = '/sas/views';
	$urlRouterProvider.when('/search/editor', '/search/editor/elastic');
    $stateProvider
        /*검색*/
    	.state('search', {
			url: '/search',
			template: '<div ui-view></div>',
			abstract: true
		})
    	.state("search.editor", {
			url: "/editor",
			templateUrl: url_path + '/query/editor.html',
			controller: 'editorCtrl'
		})	
		.state("search.editor.mySql", {
			url: "/mySql",
			templateUrl: url_path + '/query/mySql.html',
			controller: 'editorSqlCtrl'
		})	
		.state("search.editor.elastic", {
			url: "/elastic",
			templateUrl: url_path + '/query/elastic.html',
			controller: 'editorElasticCtrl'
		})	
       /* air 관련 템플릿 */
		.state('air', {
			url: '/air',
			template: '<div ui-view></div>',
			abstract: true
		})       
		.state('air.airManage', {
			url: '/airManage',
			templateUrl: url_path+'/air/airManage.html',
			controller: 'airManageCtrl'
		})
		.state('air.airMonitoring', {
			url: '/airMonitoring',
			templateUrl: url_path+'/air/airMonitoring.html',
			controller: 'airMonitoringCtrl'
		})
		.state('air.airBoard', {
			url: '/airBoard',
			templateUrl: url_path+'/air/airBoard.html',
			controller: 'airBoardCtrl'
		})
		/*게시판 관련*/
		.state('board', {
			url: '/board',
			template: '<div ui-view></div>',
			abstract: true
		})
		.state('board.hub', {
			url: '/board',
			templateUrl: url_path + '/board/board.html',
			controller: 'boardCtrl'
		})

		/*사용자 관련*/
		.state('user', {
			url: '/user',
			template: '<div ui-view></div>',
			abstract: true
		})
		.state('user.user', {
			url: '/user',
			templateUrl: url_path + '/user/user.html',
			controller: 'UserCtrl'
		})
		/*통계*/
		.state('stats', {
			url: '/stats',
			template: '<div ui-view></div>',
			abstract: true
		})
		.state("stats.dash", {
			url: "/dash",
			templateUrl: url_path + '/stats/dash.html',
			controller: 'dashCtrl'
		})	
		.state('stats.widget', {
			url: '/widgetCtrl',
			templateUrl: url_path + '/stats/widget.html',
			controller: 'widgetCtrl'
		})		
		
});
app.directive('ngFiles', ['$parse', function($parse) {
		function fn_link(scope, element, attrs) {
			var onChange = $parse(attrs.ngFiles);
			element.on('change', function(event) {
				onChange(scope, { $files: event.target.files });
			});
		}
		;
		return {
			link: fn_link
		}
	}]);

