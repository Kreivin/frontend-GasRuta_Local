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
  serverTimestamp,
} from "firebase/firestore";
import * as Location from "expo-location";
import { Linking, Platform } from "react-native";
import { db } from "./firebaseConfig.js";

const RUTA_COLLECTION = "Ruta";

/**
 * Formatear documento de Firestore a objeto Ruta uniforme
 */
export const formatearRutaDoc = (docSnap) => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    pedidoId: data.Pedido?.id || null,
    pedidoPath: data.Pedido?.path || null,
    distancia_estimada: data.distancia_estimada,
    fecha_inicio: data.fecha_inicio?.toDate ? data.fecha_inicio.toDate() : null,
    fecha_final: data.fecha_final?.toDate ? data.fecha_final.toDate() : null,
    ruta_asignada: data.ruta_asignada,
    tiempo_estimado: data.tiempo_estimado,
    estado: data.estado || "asignada",
    ubicacion_actual: data.ubicacion_actual
      ? {
          latitud: data.ubicacion_actual.latitud,
          longitud: data.ubicacion_actual.longitud,
          rumbo: data.ubicacion_actual.rumbo || 0,
          velocidad: data.ubicacion_actual.velocidad || 0,
          ultima_actualizacion: data.ubicacion_actual.ultima_actualizacion?.toDate
            ? data.ubicacion_actual.ultima_actualizacion.toDate()
            : data.ubicacion_actual.ultima_actualizacion || null,
        }
      : null,
  };
};

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
      return formatearRutaDoc(docSnap);
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
    return querySnapshot.docs.map(formatearRutaDoc);
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
    return querySnapshot.docs.map(formatearRutaDoc);
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

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const rutas = querySnapshot.docs.map(formatearRutaDoc);
      callback(rutas);
    },
    (error) => {
      console.error("Error al escuchar rutas:", error);
    }
  );

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

/**
 * Actualizar la ubicación en tiempo real del repartidor para una ruta
 * @param {string} rutaId - ID del documento de ruta
 * @param {Object} coords - Coordenadas del GPS
 * @param {number} coords.latitud
 * @param {number} coords.longitud
 * @param {number} [coords.rumbo]
 * @param {number} [coords.velocidad]
 */
export async function actualizarUbicacionRuta(
  rutaId,
  { latitud, longitud, rumbo = 0, velocidad = 0 }
) {
  try {
    const docRef = doc(db, RUTA_COLLECTION, rutaId);
    await updateDoc(docRef, {
      "ubicacion_actual.latitud": Number(latitud),
      "ubicacion_actual.longitud": Number(longitud),
      "ubicacion_actual.rumbo": Number(rumbo) || 0,
      "ubicacion_actual.velocidad": Number(velocidad) || 0,
      "ubicacion_actual.ultima_actualizacion": serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al actualizar ubicación de la ruta:", error);
    throw error;
  }
}

/**
 * Escuchar en tiempo real los cambios de una ruta específica (incluyendo su GPS)
 * @param {string} rutaId - ID de la ruta
 * @param {Function} callback - Callback al recibir cambios
 * @returns {Function} Función para desuscribirse
 */
export function escucharUbicacionRuta(rutaId, callback) {
  const docRef = doc(db, RUTA_COLLECTION, rutaId);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(formatearRutaDoc(docSnap));
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error al escuchar ubicación de ruta:", error);
    }
  );
}

/**
 * Inicia la transmisión continua de ubicación GPS del repartidor para una ruta activa
 * @param {string} rutaId - ID de la ruta
 * @param {Function} [onUpdate] - Callback opcional en cada punto
 * @returns {Promise<Object>} Objeto de suscripción con método remove()
 */
export async function iniciarRastreoRepartidor(rutaId, onUpdate) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error(
      "No se otorgaron permisos para acceder a la ubicación del dispositivo."
    );
  }

  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // cada 5 segundos
      distanceInterval: 10, // o cada 10 metros
    },
    async (location) => {
      try {
        const { latitude, longitude, heading, speed } = location.coords;
        await actualizarUbicacionRuta(rutaId, {
          latitud: latitude,
          longitud: longitude,
          rumbo: heading || 0,
          velocidad: speed || 0,
        });

        if (onUpdate) {
          onUpdate({
            latitude,
            longitude,
            heading: heading || 0,
            speed: speed || 0,
            timestamp: location.timestamp,
          });
        }
      } catch (err) {
        console.warn("Error enviando coordenada a Firestore:", err.message);
      }
    }
  );

  return subscription;
}

/**
 * Abrir aplicación de Google Maps con navegación guiada paso a paso
 * @param {number} latitud - Latitud destino
 * @param {number} longitud - Longitud destino
 */
export function abrirNavegacionGoogleMaps(latitud, longitud) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}&travelmode=driving`;
  Linking.openURL(url).catch((err) =>
    console.error("No se pudo abrir Google Maps:", err)
  );
}

/**
 * Abrir Google Maps para ver una ubicación fija o en vivo
 * @param {number} latitud
 * @param {number} longitud
 */
export function abrirEnGoogleMaps(latitud, longitud) {
  const url = `https://www.google.com/maps?q=${latitud},${longitud}`;
  Linking.openURL(url).catch((err) =>
    console.error("No se pudo abrir enlace de mapa:", err)
  );
}

/**
 * Compartir ubicación del repartidor por WhatsApp
 * @param {Object} params
 * @param {number} params.latitud
 * @param {number} params.longitud
 * @param {string} [params.pedidoId]
 */
export function compartirUbicacionWhatsApp({
  latitud,
  longitud,
  pedidoId = "",
}) {
  const mapsUrl = `https://www.google.com/maps?q=${latitud},${longitud}`;
  const mensaje = encodeURIComponent(
    `🛵 *GasRuta - Ubicación en tiempo real*\n¡Hola! El repartidor de GasRuta va en camino con tu cilindro de gas${
      pedidoId ? ` (Pedido #${pedidoId.slice(0, 6)})` : ""
    }.\nPuedes ver su ubicación en Google Maps aquí:\n${mapsUrl}`
  );
  const appUrl = `whatsapp://send?text=${mensaje}`;
  const webUrl = `https://wa.me/?text=${mensaje}`;

  Linking.canOpenURL(appUrl)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(appUrl);
      } else {
        return Linking.openURL(webUrl);
      }
    })
    .catch((err) => {
      console.warn("Abriendo enlace web de WhatsApp:", err.message);
      Linking.openURL(webUrl);
    });
}
