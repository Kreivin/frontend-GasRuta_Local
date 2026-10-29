// Configuración del cliente Firebase para GasRuta Local

import {
  initializeApp,
  getApps,
} from "firebase/app";

import {
  getAuth,
} from "firebase/auth";

// Firestore se conserva por compatibilidad temporal.
// Las consultas nuevas deben pasar por el backend.
import {
  getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,

  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,

  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,

  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    process.env
      .EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Evitar inicializar Firebase más de una vez
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

// Firebase Authentication para iniciar sesión
const auth = getAuth(app);

// Compatibilidad temporal con código antiguo.
// La base tiene el ID "default", sin paréntesis.
const db = getFirestore(app, "default");

export {
  app,
  auth,
  db,
};

export default app;