// Servicio para la entidad Historial en Firestore
// Colección: "Historial"
// Campos:
//   - id_usuario (referencia a documento en colección Usuario)
//   - id_pedido (referencia a documento en colección Pedido)
//   - accion (string: ej: "pedido_creado", "pedido_entregado", "ruta_iniciada")
//   - estado (string: "pendiente", "entregado", etc.)
//   - descripcio / descripcion (string)
//   - fecha_entrega (timestamp | null)
//   - fechaActualizacion (timestamp)

import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig.js";

const HISTORIAL_COLLECTION = "Historial";

export function formatearHistorialDoc(docSnap) {
  const data = docSnap.data();
  const desc = data.descripcio || data.descripcion || "";
  return {
    id: docSnap.id,
    ...data,
    descripcion: desc,
    descripcio: desc,
    usuarioId: data.id_usuario?.id || (typeof data.id_usuario === "string" ? data.id_usuario : null),
    pedidoId: data.id_pedido?.id || (typeof data.id_pedido === "string" ? data.id_pedido : null),
    fechaEntregaFormateada: data.fecha_entrega?.toDate
      ? data.fecha_entrega.toDate().toLocaleString()
      : (data.fecha_entrega || "En proceso"),
  };
}

/**
 * Crear un nuevo registro en el historial
 */
export async function crearHistorial(datos) {
  try {
    const usuarioRef = datos.usuarioId ? doc(db, "Usuario", datos.usuarioId) : null;
    const pedidoRef = datos.pedidoId ? doc(db, "Pedido", datos.pedidoId) : null;

    const nuevoRegistro = {
      id_usuario: usuarioRef,
      id_pedido: pedidoRef,
      accion: datos.accion || "evento_general",
      estado: datos.estado || "registrado",
      descripcio: datos.descripcion || datos.descripcio || "",
      descripcion: datos.descripcion || datos.descripcio || "",
      fecha_entrega: datos.fecha_entrega ? Timestamp.fromDate(new Date(datos.fecha_entrega)) : null,
      fechaActualizacion: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, HISTORIAL_COLLECTION), nuevoRegistro);
    return { id: docRef.id, ...nuevoRegistro };
  } catch (error) {
    console.error("Error al registrar historial:", error);
    throw error;
  }
}

/**
 * Obtener todos los registros del historial
 */
export async function obtenerHistoriales() {
  try {
    const querySnapshot = await getDocs(collection(db, HISTORIAL_COLLECTION));
    const items = [];
    querySnapshot.forEach((docSnap) => {
      items.push(formatearHistorialDoc(docSnap));
    });
    return items;
  } catch (error) {
    console.error("Error al obtener historial:", error);
    throw error;
  }
}

/**
 * Escuchar historial en tiempo real
 */
export function escucharHistorial(callback) {
  const q = collection(db, HISTORIAL_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const items = [];
    snapshot.forEach((docSnap) => {
      items.push(formatearHistorialDoc(docSnap));
    });
    callback(items);
  });
}
