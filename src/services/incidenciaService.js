// Servicio CRUD para la entidad Incidencia en Firestore
// Colección: "Incidencia"
// Campos:
//   - id_usuario (referencia a documento en colección Usuario)
//   - id_pedido (referencia a documento en colección Pedido)
//   - id_ruta (referencia a documento en colección Ruta, opcional)
//   - tipo_incidente (string: "direccion_incorrecta" | "cliente_ausente" | "vehiculo_averiado" | "retraso_entrega" | "producto_danado" | "pedido_incorrecto" | "otro")
//   - descripcion (string)
//   - observaciones (string)
//   - estado (string: "pendiente" | "en_revision" | "resuelta" | "cancelada")
//   - fechaRegistro (timestamp)
//   - fechaResolucion (timestamp | null)
//   - historial_cambio (array de objetos)

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
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig.js";

const INCIDENCIA_COLLECTION = "Incidencia";

export const TIPOS_INCIDENCIA = [
  { id: "direccion_incorrecta", label: "Dirección incorrecta" },
  { id: "cliente_ausente", label: "Cliente ausente" },
  { id: "vehiculo_averiado", label: "Vehículo averiado" },
  { id: "retraso_entrega", label: "Retraso en entrega" },
  { id: "producto_danado", label: "Producto dañado" },
  { id: "pedido_incorrecto", label: "Pedido incorrecto" },
  { id: "otro", label: "Otro motivo" },
];

export const ESTADOS_INCIDENCIA = [
  "pendiente",
  "en_revision",
  "resuelta",
  "cancelada",
];

export function formatearIncidenciaDoc(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    usuarioId: data.id_usuario?.id || (typeof data.id_usuario === "string" ? data.id_usuario : null),
    pedidoId: data.id_pedido?.id || (typeof data.id_pedido === "string" ? data.id_pedido : null),
    rutaId: data.id_ruta?.id || (typeof data.id_ruta === "string" ? data.id_ruta : null),
    fechaRegistroFormateada: data.fechaRegistro?.toDate
      ? data.fechaRegistro.toDate().toLocaleString()
      : data.fechaRegistro,
    fechaResolucionFormateada: data.fechaResolucion?.toDate
      ? data.fechaResolucion.toDate().toLocaleString()
      : data.fechaResolucion,
  };
}

/**
 * Crear una nueva incidencia
 */
export async function crearIncidencia(datos) {
  try {
    const usuarioRef = doc(db, "Usuario", datos.usuarioId);
    const pedidoRef = doc(db, "Pedido", datos.pedidoId);
    const rutaRef = datos.rutaId ? doc(db, "Ruta", datos.rutaId) : null;

    const ahora = Timestamp.now();
    const nuevaIncidenciaDoc = {
      id_usuario: usuarioRef,
      id_pedido: pedidoRef,
      id_ruta: rutaRef,
      tipo_incidente: datos.tipoIncidente || "otro",
      descripcion: datos.descripcion || "",
      observaciones: datos.observaciones || "",
      estado: "pendiente",
      fechaRegistro: ahora,
      fechaResolucion: null,
      historial_cambio: [
        {
          estadoAnterior: null,
          estadoNuevo: "pendiente",
          fechaModificacion: ahora,
        },
      ],
      fechaActualizacion: ahora,
    };

    const docRef = await addDoc(collection(db, INCIDENCIA_COLLECTION), nuevaIncidenciaDoc);
    return { id: docRef.id, ...nuevaIncidenciaDoc };
  } catch (error) {
    console.error("Error al crear incidencia:", error);
    throw error;
  }
}

/**
 * Obtener todas las incidencias
 */
export async function obtenerIncidencias() {
  try {
    const querySnapshot = await getDocs(collection(db, INCIDENCIA_COLLECTION));
    const incidencias = [];
    querySnapshot.forEach((docSnap) => {
      incidencias.push(formatearIncidenciaDoc(docSnap));
    });
    return incidencias;
  } catch (error) {
    console.error("Error al obtener incidencias:", error);
    throw error;
  }
}

/**
 * Obtener incidencia por ID
 */
export async function obtenerIncidencia(id) {
  try {
    const docRef = doc(db, INCIDENCIA_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return formatearIncidenciaDoc(docSnap);
    }
    return null;
  } catch (error) {
    console.error("Error al obtener incidencia:", error);
    throw error;
  }
}

/**
 * Actualizar estado de una incidencia
 */
export async function actualizarEstadoIncidencia(id, nuevoEstado, observaciones = "") {
  try {
    const docRef = doc(db, INCIDENCIA_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Incidencia no encontrada");
    }

    const data = docSnap.data();
    const ahora = Timestamp.now();
    const historial = Array.isArray(data.historial_cambio) ? [...data.historial_cambio] : [];

    historial.push({
      estadoAnterior: data.estado || "pendiente",
      estadoNuevo: nuevoEstado,
      fechaModificacion: ahora,
    });

    const updatePayload = {
      estado: nuevoEstado,
      historial_cambio: historial,
      fechaActualizacion: ahora,
    };

    if (observaciones) {
      updatePayload.observaciones = observaciones;
    }

    if (nuevoEstado === "resuelta") {
      updatePayload.fechaResolucion = ahora;
    }

    await updateDoc(docRef, updatePayload);
    return true;
  } catch (error) {
    console.error("Error al actualizar incidencia:", error);
    throw error;
  }
}

/**
 * Eliminar una incidencia
 */
export async function eliminarIncidencia(id) {
  try {
    const docRef = doc(db, INCIDENCIA_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error al eliminar incidencia:", error);
    throw error;
  }
}

/**
 * Escuchar incidencias en tiempo real
 */
export function escucharIncidencias(callback) {
  const q = collection(db, INCIDENCIA_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const incidencias = [];
    snapshot.forEach((docSnap) => {
      incidencias.push(formatearIncidenciaDoc(docSnap));
    });
    callback(incidencias);
  });
}
