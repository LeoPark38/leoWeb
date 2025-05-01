// AngularJS 애플리케이션 모듈 정의
var app = angular.module('myApp', ['ui.router']); 

console.log("========== app.js IN ==========")
app.config(function($stateProvider, $urlRouterProvider) {
    var url_path = '/sas/views';

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
		.state("search.editor.trino", {
			url: "/trino",
			templateUrl: url_path + '/query/trino.html',
			controller: 'sirManageCtrl'
		})	
		.state("search.editor.elastic", {
			url: "/elastic",
			templateUrl: url_path + '/query/elastic.html',
			controller: 'editorElasticCtrl'
		})	
       /* sir 관련 템플릿 */
		.state('sir', {
			url: '/sir',
			template: '<div ui-view></div>',
			abstract: true
		})       
		.state('sir.sirManage', {
			url: '/sirManage',
			templateUrl: url_path+'/sir/sirManage.html',
			controller: 'sirManageCtrl'
		})
		.state('sir.sirMonitoring', {
			url: '/sirMonitoring',
			templateUrl: url_path+'/sir/sirMonitoring.html',
			controller: 'sirManageCtrl'
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
		.state('user.userAuth', {
			url: '/userAuth',
			templateUrl: url_path + '/user/userAuth.html',
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
			controller: 'sirManageCtrl'
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

