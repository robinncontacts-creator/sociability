/* ================================================
   firebase.js — Configuration Firebase
   Sociability App

   ⚠️  INSTRUCTIONS DE CONFIGURATION :
   1. Va sur https://console.firebase.google.com
   2. Crée un projet "sociability"
   3. Ajoute une app Web (icône </>)
   4. Active Firestore Database (mode production)
   5. Active Authentication → méthode "Anonyme"
   6. Copie ta config Firebase ci-dessous
   ================================================ */

// 🔧 REMPLACE CES VALEURS PAR TA CONFIG FIREBASE
const FIREBASE_CONFIG = {
  apiKey:            "REMPLACE_PAR_TA_API_KEY",
  authDomain:        "REMPLACE.firebaseapp.com",
  projectId:         "REMPLACE_PAR_TON_PROJECT_ID",
  storageBucket:     "REMPLACE.appspot.com",
  messagingSenderId: "REMPLACE",
  appId:             "REMPLACE_PAR_TON_APP_ID",
};

/* ---- Imports Firebase (CDN modulaire) ---- */
import { initializeApp }                        from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, query, orderBy, limit,
  serverTimestamp, onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ---- Init ---- */
const app  = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db   = getFirestore(app);

/* ---- Exports globaux (utilisés dans les autres modules) ---- */
window.FirebaseApp = {
  auth, db,
  // Auth helpers
  signInAnonymously,
  onAuthStateChanged,
  // Firestore helpers
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, query, orderBy, limit,
  serverTimestamp, onSnapshot,
};

console.log("Firebase initialisé ✓");
