// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwespNKizK3egdGzrV3SBzFS4hFpC7sqk",
  authDomain: "the-clubroom-9f94f.firebaseapp.com",
  projectId: "the-clubroom-9f94f",
  storageBucket: "the-clubroom-9f94f.appspot.com",
  messagingSenderId: "471474574796",
  appId: "1:471474574796:web:6ed33de8f599da222eb969",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const initFirebase = () => {
  return app;
};
export const database = getFirestore(app);
