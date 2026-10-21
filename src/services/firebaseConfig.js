// Configuración de Firebase para el proyecto GasRuta
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Credenciales del proyecto Firebase del usuario: gasruta-local-b7acb
const firebaseConfig = {
  apiKey: "AIzaSyABG5P0wXki2H4uC6wsw39kguh5qmF6I4g",
  authDomain: "gasruta-local-b7acb.firebaseapp.com",
  projectId: "gasruta-local-b7acb",
  storageBucket: "gasruta-local-b7acb.firebasestorage.app",
  messagingSenderId: "545489309357",
  appId: "1:545489309357:web:cd29a826ee358de8708024",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Importante: La base de datos creada en este proyecto tiene ID 'default' (sin paréntesis)
const db = getFirestore(app, "default");

export { db, app };
export default app;
