// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3oriM0JAkCZpo84o0RrhfwXNyARDvhuQ",
  authDomain: "onyx-parser-457801-t6.firebaseapp.com",
  projectId: "onyx-parser-457801-t6",
  storageBucket: "onyx-parser-457801-t6.firebasestorage.app",
  messagingSenderId: "513152540706",
  appId: "1:513152540706:web:b866bc0421c056fdfdaa7b",
  measurementId: "G-2Z6N3RZ4BE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Analytics (optional)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;