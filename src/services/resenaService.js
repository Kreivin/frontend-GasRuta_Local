// Servicio CRUD para la entidad Resena en Firestore
// Colección: "Resena"
// Campos:
//   - Id_Cliente (referencia a documento en colección Usuario)
//   - Id_Pedido (referencia a documento en colección Pedido)
//   - calificacion (int64 — 1 a 5)
//   - comentario (string)
//   - fechaResena (timestamp)
//   - id_repartidor (referencia a documento en colección Usuario)

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
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const RESENA_COLLECTION = "Resena";

/**
 * Crear una nueva reseña
 * @param {Object} resenaData
 * @param {string} resenaData.clienteId - ID del usuario cliente
 * @param {string} resenaData.pedidoId - ID del pedido
 * @param {number} resenaData.calificacion - Calificación 1-5
 * @param {string} resenaData.comentario - Comentario del usuario
 * @param {string} resenaData.repartidorId - ID del repartidor
 * @returns {Promise<string>} ID del documento creado
 */
export async function crearResena(resenaData) {
  try {
    const resenaDoc = {
      Id_Cliente: doc(db, "Usuario", resenaData.clienteId),
      Id_Pedido: doc(db, "Pedido", resenaData.pedidoId),
      calificacion: resenaData.calificacion || 5,
      comentario: resenaData.comentario || "",
      fechaResena: Timestamp.now(),
      id_repartidor: doc(db, "Usuario", resenaData.repartidorId),
    };

    const docRef = await addDoc(collection(db, RESENA_COLLECTION), resenaDoc);
    console.log("Reseña creada con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear reseña:", error);
    throw error;
  }
}

/**
 * Obtener una reseña por su ID
 * @param {string} resenaId
 * @returns {Promise<Object|null>}
 */
export async function obtenerResena(resenaId) {
  try {
    const docRef = doc(db, RESENA_COLLECTION, resenaId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        clienteId: data.Id_Cliente?.id || null,
        pedidoId: data.Id_Pedido?.id || null,
        calificacion: data.calificacion,
        comentario: data.comentario,
        fechaResena: data.fechaResena?.toDate() || null,
        repartidorId: data.id_repartidor?.id || null,
      };
    }

    return null;
  } catch (error) {
    console.error("Error al obtener reseña:", error);
    throw error;
  }
}

/**
 * Obtener todas las reseñas
 * @returns {Promise<Array>}
 */
export async function obtenerTodasLasResenas() {
  try {
    const querySnapshot = await getDocs(collection(db, RESENA_COLLECTION));
    const resenas = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      resenas.push({
        id: docSnap.id,
        clienteId: data.Id_Cliente?.id || null,
        pedidoId: data.Id_Pedido?.id || null,
        calificacion: data.calificacion,
        comentario: data.comentario,
        fechaResena: data.fechaResena?.toDate() || null,
        repartidorId: data.id_repartidor?.id || null,
      });
    });

    return resenas;
  } catch (error) {
    console.error("Error al obtener reseñas:", error);
    throw error;
  }
}

/**
 * Obtener reseñas por pedido
 * @param {string} pedidoId
 * @returns {Promise<Array>}
 */
export async function obtenerResenasPorPedido(pedidoId) {
  try {
    const pedidoRef = doc(db, "Pedido", pedidoId);
    const q = query(
      collection(db, RESENA_COLLECTION),
      where("Id_Pedido", "==", pedidoRef)
    );
    const querySnapshot = await getDocs(q);
    const resenas = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      resenas.push({
        id: docSnap.id,
        clienteId: data.Id_Cliente?.id || null,
        pedidoId: data.Id_Pedido?.id || null,
        calificacion: data.calificacion,
        comentario: data.comentario,
        fechaResena: data.fechaResena?.toDate() || null,
        repartidorId: data.id_repartidor?.id || null,
      });
    });

    return resenas;
  } catch (error) {
    console.error("Error al obtener reseñas por pedido:", error);
    throw error;
  }
}

/**
 * Escuchar cambios en tiempo real de todas las reseñas
 * @param {Function} callback
 * @returns {Function} unsubscribe
 */
export function escucharResenas(callback) {
  const q = collection(db, RESENA_COLLECTION);

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const resenas = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        resenas.push({
          id: docSnap.id,
          clienteId: data.Id_Cliente?.id || null,
          pedidoId: data.Id_Pedido?.id || null,
          calificacion: data.calificacion,
          comentario: data.comentario,
          fechaResena: data.fechaResena?.toDate() || null,
          repartidorId: data.id_repartidor?.id || null,
        });
      });

      callback(resenas);
    },
    (error) => {
      console.error("Error al escuchar reseñas:", error);
    }
  );

  return unsubscribe;
}

/**
 * Actualizar una reseña
 * @param {string} resenaId
 * @param {Object} datosActualizados
 * @returns {Promise<void>}
 */
export async function actualizarResena(resenaId, datosActualizados) {
  try {
    const docRef = doc(db, RESENA_COLLECTION, resenaId);
    const updateData = {};

    if (datosActualizados.clienteId !== undefined) {
      updateData.Id_Cliente = doc(db, "Usuario", datosActualizados.clienteId);
    }
    if (datosActualizados.pedidoId !== undefined) {
      updateData.Id_Pedido = doc(db, "Pedido", datosActualizados.pedidoId);
    }
    if (datosActualizados.calificacion !== undefined) {
      updateData.calificacion = datosActualizados.calificacion;
    }
    if (datosActualizados.comentario !== undefined) {
      updateData.comentario = datosActualizados.comentario;
    }
    if (datosActualizados.repartidorId !== undefined) {
      updateData.id_repartidor = doc(db, "Usuario", datosActualizados.repartidorId);
    }

    await updateDoc(docRef, updateData);
    console.log("Reseña actualizada:", resenaId);
  } catch (error) {
    console.error("Error al actualizar reseña:", error);
    throw error;
  }
}

/**
 * Eliminar una reseña
 * @param {string} resenaId
 * @returns {Promise<void>}
 */
export async function eliminarResena(resenaId) {
  try {
    await deleteDoc(doc(db, RESENA_COLLECTION, resenaId));
    console.log("Reseña eliminada:", resenaId);
  } catch (error) {
    console.error("Error al eliminar reseña:", error);
    throw error;
  }
}
