angular.module('myApp').controller('HomeController', ['$scope', '$http', function($scope, $http) {
    $scope.message = "Welcome to the Home Page!";
    console.log("HomeController in");

    // 서버 API 호출
    $http.get("../a/api/message").then(function(response) {
        console.log("서버 응답:", response.data);
        $scope.serverMessage = response.data;  // 서버에서 받은 데이터를 변수에 저장
    }).catch(function(error) {
        console.error("API 호출 실패:", error);
    });

    $http.get("../sir/test").then(function(response) {
        console.log("서버 응답!:", response.data);
        $scope.serverMessage = response.data;  // 서버에서 받은 데이터를 변수에 저장
    }).catch(function(error) {
        console.error("API 호출 실패!:", error);
    });

}]);
