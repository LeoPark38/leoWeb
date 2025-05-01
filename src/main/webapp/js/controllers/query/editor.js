angular.module('myApp').controller('editorCtrl', [
	'$scope', '$element', '$rootScope', '$http', '$compile', '$filter', '$timeout',
	function($scope, $element, $rootScope, $http, $compile, $filter, $timeout) {
		var el = $($element);

			$scope.tabs = [
					{key:"search.editor.elastic", href:"/query/editor/elastic", value:"Elastic", id:"elastic"},
					{key:"search.editor.trino", href:"/query/editor/trino", value:"Trino", id:"trino"}
			];
			$scope.tabs.forEach((tab) =>{
				if(window.location.href.includes('elastic')){
					if(tab.id === 'elastic'){
						tab.isSelected = "selected";
					}
				}else if(window.location.href.includes('trino')){
					if(tab.id === 'trino'){
						tab.isSelected = "selected";
					}				
				}else{
					if(tab.id === 'elastic'){
						tab.isSelected = "selected";
					}				
				}
			});			

		
		
		el.on('click', '.tab', function() {
			$(this).children().addClass('selected');
			$(this).siblings().children().removeClass('selected');
		});
	}]);
