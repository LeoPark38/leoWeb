// 버튼 클릭 시 메시지 변경
function changeMessage() {
    fetch('/sas/api/message')
        .then(response => {
            if (!response.ok) { // 200번대 응답만 처리
                throw new Error("Network response was not ok");
            }
            return response.json(); // JSON 형식 응답을 받기
        })
        .then(data => {
            console.log(data);
            alert(data.message);
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });
}

// 페이지가 로드되었을 때 실행되는 함수
document.addEventListener("DOMContentLoaded", function () {
    console.log("페이지가 로드되었습니다.");
        fetch('/sas/api/message')
        .then(response => {
            if (!response.ok) { // 200번대 응답만 처리
                throw new Error("Network response was not ok");
            }
            return response.json(); // JSON 형식 응답을 받기
        })
        .then(data => {
            console.log(data);
            alert(data.message);
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });
});
