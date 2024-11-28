import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-xTTIXp0m1MPWafNE7-P1I4BGm9P_8fQ",
  authDomain: "mern-stack-apps-69cd4.firebaseapp.com",
  projectId: "mern-stack-apps-69cd4",
  storageBucket: "mern-stack-apps-69cd4.appspot.com",
  messagingSenderId: "858456487607",
  appId: "1:858456487607:web:ca7f65312323c4282f3f32",
};

// Initialize Firebase
export const fireBaseApp = initializeApp(firebaseConfig);
export const database = getFirestore(fireBaseApp);
