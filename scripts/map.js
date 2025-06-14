import { db } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

window.onload = async function () {
  const reserveButton = document.getElementById("reserve-button");
  const container = document.getElementById('map');
  const options = {
    center: new kakao.maps.LatLng(36.32, 127.43), // 대전 중심 좌표
    level: 6
  };
  const map = new kakao.maps.Map(container, options);

  let clickCount = 0;  // 클릭 횟수 추적
  let clickedLot = null; // 클릭한 주차장 저장

  try {
    const snapshot = await get(ref(db)); // Firebase에서 주차장 정보 가져오기
    const data = snapshot.val();

    if (data) {
      Object.values(data).forEach(lot => {
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(lot["위도"], lot["경도"]),
          map: map
        });

        const content = `
          <div style="padding:8px; font-size:13px;">
            <strong>${lot["주차장_명"]}</strong><br>
            📍 ${lot["소재지"]}<br>
            🅿️ 주차면: ${lot["주차면_수"]}면<br>
            📅 운영: ${lot["운영개시_일"]}
          </div>
        `;
        const infowindow = new kakao.maps.InfoWindow({ content });

        kakao.maps.event.addListener(marker, 'click', () => {
          clickCount++;
          clickedLot = lot;

          infowindow.open(map, marker); // 정보창 열기

          // 첫 번째 클릭 시 정보만 보여주고
          if (clickCount === 1) {
            setTimeout(() => {
              clickCount = 0; // 클릭 횟수 리셋
            }, 500); // 0.5초 동안 기다린 후 클릭 횟수 초기화
          }

          // 두 번째 클릭 시 예약 화면으로 이동
          if (clickCount === 2) {
            const query = `name=${encodeURIComponent(lot["주차장_명"])}&address=${encodeURIComponent(lot["소재지"])}&spaces=${lot["주차면_수"]}&start=${encodeURIComponent(lot["운영개시_일"])}`;
            window.location.href = `reserve.html?${query}`;
            clickCount = 0;  // 예약 화면으로 넘어간 후 클릭 횟수 리셋
          }
        });
      });
    } else {
      alert("주차장 데이터를 불러오지 못했습니다.");
    }
  } catch (err) {
    console.error("주차장 데이터 로드 오류:", err);
    alert("데이터를 불러오는 중 오류가 발생했습니다.");
  }

  // 예약 목록 보기 버튼 클릭 시 예약 목록을 표시
  reserveButton.addEventListener('click', async function () {
    // 예약 목록 표시용 HTML 추가
    const reservationListContainer = document.createElement("div");
    reservationListContainer.innerHTML = `
      <h3 class="text-xl font-bold mb-4">예약 목록</h3>
      <div id="reservation-list"></div>
    `;
    document.body.appendChild(reservationListContainer);

    // 주차장 이름 파라미터 가져오기
    const params = new URLSearchParams(window.location.search);
    const lotName = params.get('name');  // 주차장 이름 가져오기

    if (lotName) {
      try {
        const reservationsRef = ref(db, `reservations/${lotName}`);
        const snapshot = await get(reservationsRef);

        const reservations = snapshot.val();
        const reservationList = reservations ? Object.values(reservations).map(reservation => `
          <div>
            <p><strong>이름:</strong> ${reservation.name}</p>
            <p><strong>예약 날짜:</strong> ${reservation.date}</p>
            <p><strong>예약 시간:</strong> ${reservation.time}</p>
            <hr />
          </div>
        `).join("") : "예약된 항목이 없습니다.";

        // 예약 목록을 표시하는 영역에 데이터 삽입
        document.getElementById('reservation-list').innerHTML = reservationList;

      } catch (err) {
        console.error("예약 목록 로드 오류:", err);
        alert("예약 목록을 불러오는 중 오류가 발생했습니다.");
      }
    } else {
      alert("예약 목록을 불러올 주차장 이름을 확인할 수 없습니다.");
    }
  });
};
