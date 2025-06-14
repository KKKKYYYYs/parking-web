import { db } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

// URL 파라미터로 주차장 이름을 가져옵니다.
const params = new URLSearchParams(window.location.search);
const lotName = params.get('name');

// 주차장 이름이 없으면 경고 메시지 표시
if (!lotName) {
  alert("잘못된 접근입니다. 주차장을 먼저 선택해주세요.");
  window.location.href = "index.html"; // 잘못된 접근시 메인 페이지로 이동
}

document.getElementById("lot-info").innerHTML = `<h3>${lotName}의 예약 목록</h3>`;

// 예약 목록을 불러옵니다.
const fetchReservations = async () => {
  try {
    const snapshot = await get(ref(db, `reservations/${lotName}`));
    const reservations = snapshot.val();

    if (reservations) {
      const reservationList = document.getElementById("reservation-list");
      Object.values(reservations).forEach(reservation => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
          ${reservation.name} - ${reservation.date} ${reservation.time}
        `;
        reservationList.appendChild(listItem);
      });
    } else {
      alert("예약 목록이 없습니다.");
    }
  } catch (error) {
    console.error("예약 목록을 불러오지 못했습니다.", error);
    alert("예약 목록을 불러오지 못했습니다.");
  }
};

// 페이지가 로드되면 예약 목록을 불러옵니다.
window.onload = fetchReservations;
