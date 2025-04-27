// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvPWPNW-rIw2lNhLcH3G7sbelESRfWIIU",
  authDomain: "akatsuki-1.firebaseapp.com",
  databaseURL: "https://akatsuki-1-default-rtdb.firebaseio.com",
  projectId: "akatsuki-1",
  storageBucket: "akatsuki-1.firebasestorage.app",
  messagingSenderId: "4786939581",
  appId: "1:4786939581:web:4f400575a28a33dcd2f9d4",
  measurementId: "G-7BRXQVWRNP"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);