// Servicio CRUD para la entidad Usuario en Firestore
// Colección: "Usuario"
// Campos:
//   - Usuariokey (string, ej: "US0003")
//   - Nombre (string)
//   - Telefono (string)
//   - Correo (string)
//   - Contraseña (string)
//   - Rol (string: "Cliente" | "Repartidor" | "Admin")
//   - Direccion (string)

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebaseConfig.js";

const USUARIO_COLLECTION = "Usuario";

/**
 * Obtener todos los usuarios
 */
export async function obtenerUsuarios() {
  try {
    const querySnapshot = await getDocs(collection(db, USUARIO_COLLECTION));
    const usuarios = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      usuarios.push({
        id: docSnap.id,
        ...data,
      });
    });

    return usuarios;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
}

/**
 * Obtener usuario por ID
 */
export async function obtenerUsuario(id) {
  try {
    const docRef = doc(db, USUARIO_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    throw error;
  }
}

/**
 * Autenticar usuario por correo y contraseña
 */
export async function autenticarUsuario(correo, contrasena) {
  try {
    const q = query(
      collection(db, USUARIO_COLLECTION),
      where("Correo", "==", correo.trim())
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { exito: false, mensaje: "Usuario no encontrado" };
    }

    let usuarioEncontrado = null;
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.Contraseña === contrasena) {
        const { Contraseña, ...datosSeguros } = data;
        usuarioEncontrado = {
          id: docSnap.id,
          ...datosSeguros,
        };
      }
    });

    if (usuarioEncontrado) {
      return { exito: true, usuario: usuarioEncontrado };
    } else {
      return { exito: false, mensaje: "Contraseña incorrecta" };
    }
  } catch (error) {
    console.error("Error en autenticación:", error);
    throw error;
  }
}

/**
 * Crear un nuevo usuario
 */
export async function crearUsuario(datos) {
  try {
    const nuevoUsuario = {
      Usuariokey: datos.Usuariokey || `US${Date.now().toString().slice(-4)}`,
      Nombre: datos.Nombre || "",
      Telefono: datos.Telefono || "",
      Correo: datos.Correo || "",
      Contraseña: datos.Contraseña || "123456",
      Rol: datos.Rol || "Cliente",
      Direccion: datos.Direccion || "",
    };

    const docRef = await addDoc(collection(db, USUARIO_COLLECTION), nuevoUsuario);
    return { id: docRef.id, ...nuevoUsuario };
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
}

/**
 * Actualizar usuario por ID
 */
export async function actualizarUsuario(id, datos) {
  try {
    const docRef = doc(db, USUARIO_COLLECTION, id);
    await updateDoc(docRef, datos);
    return true;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
}

/**
 * Eliminar usuario por ID
 */
export async function eliminarUsuario(id) {
  try {
    const docRef = doc(db, USUARIO_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
}

/**
 * Escuchar cambios en tiempo real en la colección Usuario
 */
export function escucharUsuarios(callback) {
  const q = collection(db, USUARIO_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const usuarios = [];
    snapshot.forEach((docSnap) => {
      usuarios.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });
    callback(usuarios);
  });
}
