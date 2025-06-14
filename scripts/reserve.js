// URL에서 정보 가져오기
const params = new URLSearchParams(window.location.search);

document.getElementById("parking-name").textContent = params.get("name");
document.getElementById("parking-address").textContent = params.get("address");
document.getElementById("parking-spaces").textContent = params.get("spaces");

// 예약 버튼 처리
document.getElementById("reserve-btn").addEventListener("click", () => {
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (!date || !time) {
    alert("날짜와 시간을 선택하세요.");
    return;
  }

  // 추후: Firebase에 예약 데이터 저장 가능
  alert(`예약 완료: ${params.get("name")} - ${date} ${time}`);
});
