
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC-PmCzqUDNWhnHITRhToOw4YoDnQJGiMA",
  authDomain: "tiendaonlineatahualpa.firebaseapp.com",
  projectId: "tiendaonlineatahualpa",
  storageBucket: "tiendaonlineatahualpa.firebasestorage.app",
  messagingSenderId: "650522644099",
  appId: "1:650522644099:web:7ec67efca49a69d60d95b6",
  measurementId: "G-JB9KQY6W8C"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;