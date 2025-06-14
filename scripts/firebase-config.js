// scripts/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";  // push 임포트

// Firebase 프로젝트 설정
const firebaseConfig = {
  apiKey: "AIzaSyD9UbprqVRI9VXFM-rF0SvncG-gSwxTvcc",
  authDomain: "parking-web-c42ee.firebaseapp.com",
  databaseURL: "https://parking-web-c42ee-default-rtdb.firebaseio.com/",
  projectId: "parking-web-c42ee",
  storageBucket: "parking-web-c42ee.firebasestorage.googleapis.com",
  messagingSenderId: "222504875617",
  appId: "1:222504875617:web:950e4a0932f8b58ff89c20",
  measurementId: "G-KNETLVRBCB"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);  // Firebase Database 초기화

export { auth, db };  // db 내보내기
