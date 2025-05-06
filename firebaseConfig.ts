// Import the functions you need from the SDKs you need
import { getStorage } from "@firebase/storage";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.DB_API_KEY,
  authDomain: "the-clubroom-9f94f.firebaseapp.com",
  projectId: process.env.DB_PROJECT_ID,
  storageBucket: process.env.DB_STORAGE_BUCKET,
  messagingSenderId: "471474574796",
  appId: process.env.DB_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const initFirebase = () => {
  return app;
};
export const database = getFirestore(app);
export const storage = getStorage(app, "gs://the-clubroom-9f94f.appspot.com");
