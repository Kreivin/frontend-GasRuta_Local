// Servicio CRUD para la entidad Ruta en Firestore
// Colección: "Ruta"
// Campos:
//   - Pedido (referencia a documento en colección Pedido)
//   - distancia_estimada (string)
//   - fecha_final (timestamp)
//   - fecha_inicio (timestamp)
//   - ruta_asignada (string)
//   - tiempo_estimado (number)

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
import { db } from "./firebaseConfig.js";

const RUTA_COLLECTION = "Ruta";

/**
 * Crear una nueva ruta
 * @param {Object} rutaData - Datos de la ruta
 * @param {string} rutaData.pedidoId - ID del pedido asociado (referencia)
 * @param {string} rutaData.distancia_estimada - Distancia estimada (ej: "20km de distancia")
 * @param {Date|null} rutaData.fecha_inicio - Fecha de inicio de la ruta
 * @param {Date|null} rutaData.fecha_final - Fecha de finalización de la ruta
 * @param {string} rutaData.ruta_asignada - Descripción de la ruta asignada
 * @param {number} rutaData.tiempo_estimado - Tiempo estimado en minutos
 * @returns {Promise<string>} ID del documento creado
 */
export async function crearRuta(rutaData) {
  try {
    const rutaDoc = {
      Pedido: doc(db, "Pedido", rutaData.pedidoId),
      distancia_estimada: rutaData.distancia_estimada || "",
      fecha_inicio: rutaData.fecha_inicio
        ? Timestamp.fromDate(new Date(rutaData.fecha_inicio))
        : Timestamp.now(),
      fecha_final: rutaData.fecha_final
        ? Timestamp.fromDate(new Date(rutaData.fecha_final))
        : null,
      ruta_asignada: rutaData.ruta_asignada || "",
      tiempo_estimado: rutaData.tiempo_estimado || 0,
    };

    const docRef = await addDoc(collection(db, RUTA_COLLECTION), rutaDoc);
    console.log("Ruta creada con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear ruta:", error);
    throw error;
  }
}

/**
 * Obtener una ruta por su ID
 * @param {string} rutaId - ID del documento de ruta
 * @returns {Promise<Object|null>} Datos de la ruta o null si no existe
 */
export async function obtenerRuta(rutaId) {
  try {
    const docRef = doc(db, RUTA_COLLECTION, rutaId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        pedidoId: data.Pedido?.id || null,
        pedidoPath: data.Pedido?.path || null,
        distancia_estimada: data.distancia_estimada,
        fecha_inicio: data.fecha_inicio?.toDate() || null,
        fecha_final: data.fecha_final?.toDate() || null,
        ruta_asignada: data.ruta_asignada,
        tiempo_estimado: data.tiempo_estimado,
        estado: data.estado || "asignada",
      };
    }

    return null;
  } catch (error) {
    console.error("Error al obtener ruta:", error);
    throw error;
  }
}

/**
 * Obtener todas las rutas
 * @returns {Promise<Array>} Lista de rutas
 */
export async function obtenerTodasLasRutas() {
  try {
    const querySnapshot = await getDocs(collection(db, RUTA_COLLECTION));
    const rutas = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      rutas.push({
        id: docSnap.id,
        pedidoId: data.Pedido?.id || null,
        pedidoPath: data.Pedido?.path || null,
        distancia_estimada: data.distancia_estimada,
        fecha_inicio: data.fecha_inicio?.toDate() || null,
        fecha_final: data.fecha_final?.toDate() || null,
        ruta_asignada: data.ruta_asignada,
        tiempo_estimado: data.tiempo_estimado,
        estado: data.estado || "asignada",
      });
    });

    return rutas;
  } catch (error) {
    console.error("Error al obtener rutas:", error);
    throw error;
  }
}

/**
 * Obtener rutas por pedido ID
 * @param {string} pedidoId - ID del pedido
 * @returns {Promise<Array>} Lista de rutas asociadas al pedido
 */
export async function obtenerRutasPorPedido(pedidoId) {
  try {
    const pedidoRef = doc(db, "Pedido", pedidoId);
    const q = query(
      collection(db, RUTA_COLLECTION),
      where("Pedido", "==", pedidoRef)
    );
    const querySnapshot = await getDocs(q);
    const rutas = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      rutas.push({
        id: docSnap.id,
        pedidoId: data.Pedido?.id || null,
        pedidoPath: data.Pedido?.path || null,
        distancia_estimada: data.distancia_estimada,
        fecha_inicio: data.fecha_inicio?.toDate() || null,
        fecha_final: data.fecha_final?.toDate() || null,
        ruta_asignada: data.ruta_asignada,
        tiempo_estimado: data.tiempo_estimado,
        estado: data.estado || "asignada",
      });
    });

    return rutas;
  } catch (error) {
    console.error("Error al obtener rutas por pedido:", error);
    throw error;
  }
}

/**
 * Escuchar cambios en tiempo real de todas las rutas
 * @param {Function} callback - Función que recibe la lista de rutas actualizada
 * @returns {Function} Función para cancelar la suscripción (unsubscribe)
 */
export function escucharRutas(callback) {
  const q = collection(db, RUTA_COLLECTION);

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const rutas = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      rutas.push({
        id: docSnap.id,
        pedidoId: data.Pedido?.id || null,
        pedidoPath: data.Pedido?.path || null,
        distancia_estimada: data.distancia_estimada,
        fecha_inicio: data.fecha_inicio?.toDate() || null,
        fecha_final: data.fecha_final?.toDate() || null,
        ruta_asignada: data.ruta_asignada,
        tiempo_estimado: data.tiempo_estimado,
        estado: data.estado || "asignada",
      });
    });

    callback(rutas);
  }, (error) => {
    console.error("Error al escuchar rutas:", error);
  });

  return unsubscribe;
}

/**
 * Actualizar una ruta existente
 * @param {string} rutaId - ID del documento de ruta
 * @param {Object} datosActualizados - Campos a actualizar
 * @returns {Promise<void>}
 */
export async function actualizarRuta(rutaId, datosActualizados) {
  try {
    const docRef = doc(db, RUTA_COLLECTION, rutaId);
    const updateData = {};

    if (datosActualizados.pedidoId !== undefined) {
      updateData.Pedido = doc(db, "Pedido", datosActualizados.pedidoId);
    }
    if (datosActualizados.distancia_estimada !== undefined) {
      updateData.distancia_estimada = datosActualizados.distancia_estimada;
    }
    if (datosActualizados.fecha_inicio !== undefined) {
      updateData.fecha_inicio = datosActualizados.fecha_inicio
        ? Timestamp.fromDate(new Date(datosActualizados.fecha_inicio))
        : null;
    }
    if (datosActualizados.fecha_final !== undefined) {
      updateData.fecha_final = datosActualizados.fecha_final
        ? Timestamp.fromDate(new Date(datosActualizados.fecha_final))
        : null;
    }
    if (datosActualizados.ruta_asignada !== undefined) {
      updateData.ruta_asignada = datosActualizados.ruta_asignada;
    }
    if (datosActualizados.tiempo_estimado !== undefined) {
      updateData.tiempo_estimado = datosActualizados.tiempo_estimado;
    }

    await updateDoc(docRef, updateData);
    console.log("Ruta actualizada:", rutaId);
  } catch (error) {
    console.error("Error al actualizar ruta:", error);
    throw error;
  }
}

/**
 * Eliminar una ruta
 * @param {string} rutaId - ID del documento de ruta
 * @returns {Promise<void>}
 */
export async function eliminarRuta(rutaId) {
  try {
    await deleteDoc(doc(db, RUTA_COLLECTION, rutaId));
    console.log("Ruta eliminada:", rutaId);
  } catch (error) {
    console.error("Error al eliminar ruta:", error);
    throw error;
  }
}
