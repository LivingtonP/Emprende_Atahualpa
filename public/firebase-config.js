// firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC-PmCzqUDNWhnHITRhToOw4YoDnQJGiMA",
  authDomain: "tiendaonlineatahualpa.firebaseapp.com",
  projectId: "tiendaonlineatahualpa",
  storageBucket: "tiendaonlineatahualpa.firebasestorage.app",
  messagingSenderId: "650522644099",
  appId: "1:650522644099:web:7ec67efca49a69d60d95b6",
  measurementId: "G-JB9KQY6W8C"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Analytics (opcional)
export const analytics = getAnalytics(app);

export default app;