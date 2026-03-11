// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔐 Firebase config (console-la irundhu copy pannadhu)
const firebaseConfig = {
  apiKey: "AIzaSyDsb87h_2f3qjj9G4sLZhyzwJcZoXI1C70",
  authDomain: "food-ordering-app-8f16c.firebaseapp.com",
  projectId: "food-ordering-app-8f16c",
  storageBucket: "food-ordering-app-8f16c.firebasestorage.app",
  messagingSenderId: "974206202725",
  appId: "1:974206202725:web:0f3da956b124fd9081e78c",
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔑 Exports
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
