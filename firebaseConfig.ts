// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.DB_API_KEY,
  authDomain: "the-clubroom-9f94f.firebaseapp.com",
  projectId: process.env.DB_PROJECT_ID,
  storageBucket: "the-clubroom-9f94f.appspot.com",
  messagingSenderId: "471474574796",
  appId: process.env.DB_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const initFirebase = () => {
  return app;
};
export const database = getFirestore(app);
