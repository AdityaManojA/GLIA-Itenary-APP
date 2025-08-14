
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBc7mEMvFCS0ugnhmKZaxt1XP0Haf3spko",
  authDomain: "glia-app-a6d84.firebaseapp.com",
  projectId: "glia-app-a6d84",
  storageBucket: "glia-app-a6d84.firebasestorage.app",
  messagingSenderId: "228317645715",
  appId: "1:228317645715:web:a0e13287c76621ff27b666"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);