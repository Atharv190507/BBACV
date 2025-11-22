import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ---------------------------------------------------------
// IMPORTANT: PASTE YOUR FIREBASE CONFIGURATION HERE
// Get this from: Firebase Console -> Project Settings -> General -> Your Apps
// ---------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCPXtNBMV59Y9G_xy_UlgG_D1SSUElNk2E",
  authDomain: "bbacv-de636.firebaseapp.com",
  projectId: "bbacv-de636",
  storageBucket: "bbacv-de636.firebasestorage.app",
  messagingSenderId: "484097534664",
  appId: "1:484097534664:web:d2532524bb6ddc99e253fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };