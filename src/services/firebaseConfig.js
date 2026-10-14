// Configuración de Firebase para el proyecto GasRuta
// Documentación: https://docs.expo.dev/guides/using-firebase/
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Reemplaza estos valores con los de tu proyecto en Firebase Console
// Ve a: Firebase Console → Configuración del proyecto → Apps → Configuración SDK
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROYECTO.firebasestorage.app",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export default app;
