// Servicio CRUD para la entidad Pedido en Firestore
// Colección: "Pedido"
// Campos:
//   - Id_Usuario (referencia a documento en colección Usuario)
//   - Producto (map: { nombre, presentacion, pesoKg, precio })
//   - Ubicacion (map: { direccion, referencia })
//   - cantidad (number)
//   - costoEnvio (number)
//   - subtotal (number)
//   - total (number)
//   - estado (string: "pendiente" | "confirmado" | "en_preparacion" | "en_camino" | "entregado" | "cancelado")
//   - fecha (timestamp)
//   - fechaActualizacion (timestamp)

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

const PEDIDO_COLLECTION = "Pedido";
const HISTORIAL_COLLECTION = "Historial";

export const ESTADOS_PEDIDO = [
  "pendiente",
  "confirmado",
  "en_preparacion",
  "en_camino",
  "entregado",
  "cancelado",
];

export const CILINDROS_DISPONIBLES = {
  5: {
    nombre: "Cilindro de gas",
    presentacion: "Pequeño",
    pesoKg: 5,
    precio: 200,
  },
  10: {
    nombre: "Cilindro de gas",
    presentacion: "Mediano",
    pesoKg: 10,
    precio: 480,
  },
  15: {
    nombre: "Cilindro de gas",
    presentacion: "Grande",
    pesoKg: 15,
    precio: 700,
  },
  45: {
    nombre: "Cilindro de gas",
    presentacion: "Industrial",
    pesoKg: 45,
    precio: 2100,
  },
};

/**
 * Formatea un documento Firestore de pedido a un objeto amigable para la app
 */
export function formatearPedidoDoc(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    usuarioId: data.Id_Usuario?.id || (typeof data.Id_Usuario === "string" ? data.Id_Usuario : null),
    fechaFormateada: data.fecha?.toDate ? data.fecha.toDate().toLocaleString() : data.fecha,
    fechaActualizacionFormateada: data.fechaActualizacion?.toDate
      ? data.fechaActualizacion.toDate().toLocaleString()
      : data.fechaActualizacion,
  };
}

/**
 * Crear un nuevo pedido
 */
export async function crearPedido(pedidoData) {
  try {
    const usuarioRef = doc(db, "Usuario", pedidoData.usuarioId);
    const pesoKg = Number(pedidoData.pesoKg) || 10;
    const cantidad = Number(pedidoData.cantidad) || 1;
    const costoEnvio = Number(pedidoData.costoEnvio) || 50;

    const productoInfo = pedidoData.producto || CILINDROS_DISPONIBLES[pesoKg] || {
      nombre: "Cilindro de gas",
      presentacion: `${pesoKg} kg`,
      pesoKg,
      precio: 480,
    };

    const subtotal = pedidoData.subtotal !== undefined ? Number(pedidoData.subtotal) : productoInfo.precio * cantidad;
    const total = subtotal + costoEnvio;

    const nuevoPedidoDoc = {
      Id_Usuario: usuarioRef,
      Producto: {
        nombre: productoInfo.nombre,
        presentacion: productoInfo.presentacion,
        pesoKg: productoInfo.pesoKg,
        precio: productoInfo.precio,
      },
      Ubicacion: {
        direccion: pedidoData.direccion || "Juigalpa, Chontales",
        referencia: pedidoData.referencia || "",
      },
      cantidad,
      costoEnvio,
      subtotal,
      total,
      estado: "pendiente",
      fecha: Timestamp.now(),
      fechaActualizacion: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, PEDIDO_COLLECTION), nuevoPedidoDoc);

    // Registro automático en Historial
    try {
      await addDoc(collection(db, HISTORIAL_COLLECTION), {
        id_usuario: usuarioRef,
        id_pedido: docRef,
        accion: "pedido_creado",
        estado: "pendiente",
        descripcio: `Nuevo pedido de cilindro ${productoInfo.presentacion} (${pesoKg}kg) registrado.`,
        fecha_entrega: null,
        fechaActualizacion: Timestamp.now(),
      });
    } catch (hErr) {
      console.warn("No se pudo registrar historial automático:", hErr.message);
    }

    return { id: docRef.id, ...nuevoPedidoDoc };
  } catch (error) {
    console.error("Error al crear pedido:", error);
    throw error;
  }
}

/**
 * Obtener todos los pedidos
 */
export async function obtenerPedidos() {
  try {
    const querySnapshot = await getDocs(collection(db, PEDIDO_COLLECTION));
    const pedidos = [];
    querySnapshot.forEach((docSnap) => {
      pedidos.push(formatearPedidoDoc(docSnap));
    });
    return pedidos;
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    throw error;
  }
}

/**
 * Obtener pedido por ID
 */
export async function obtenerPedido(id) {
  try {
    const docRef = doc(db, PEDIDO_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return formatearPedidoDoc(docSnap);
    }
    return null;
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    throw error;
  }
}

/**
 * Obtener pedidos de un usuario específico
 */
export async function obtenerPedidosUsuario(usuarioId) {
  try {
    const usuarioRef = doc(db, "Usuario", usuarioId);
    const q = query(
      collection(db, PEDIDO_COLLECTION),
      where("Id_Usuario", "==", usuarioRef)
    );
    const querySnapshot = await getDocs(q);
    const pedidos = [];
    querySnapshot.forEach((docSnap) => {
      pedidos.push(formatearPedidoDoc(docSnap));
    });
    return pedidos;
  } catch (error) {
    console.error("Error al obtener pedidos del usuario:", error);
    throw error;
  }
}

/**
 * Actualizar el estado de un pedido
 */
export async function actualizarEstadoPedido(id, nuevoEstado, usuarioId = null) {
  try {
    const pedidoRef = doc(db, PEDIDO_COLLECTION, id);
    await updateDoc(pedidoRef, {
      estado: nuevoEstado,
      fechaActualizacion: Timestamp.now(),
    });

    // Registrar cambio en Historial
    try {
      const uRef = usuarioId ? doc(db, "Usuario", usuarioId) : null;
      await addDoc(collection(db, HISTORIAL_COLLECTION), {
        id_usuario: uRef,
        id_pedido: pedidoRef,
        accion: `estado_${nuevoEstado}`,
        estado: nuevoEstado,
        descripcio: `El pedido cambió a estado: ${nuevoEstado}`,
        fecha_entrega: nuevoEstado === "entregado" ? Timestamp.now() : null,
        fechaActualizacion: Timestamp.now(),
      });
    } catch (hErr) {
      console.warn("No se pudo registrar cambio en historial:", hErr.message);
    }

    return true;
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    throw error;
  }
}

/**
 * Eliminar un pedido
 */
export async function eliminarPedido(id) {
  try {
    const docRef = doc(db, PEDIDO_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    throw error;
  }
}

/**
 * Escuchar cambios en tiempo real de todos los pedidos
 */
export function escucharPedidos(callback) {
  const q = collection(db, PEDIDO_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const pedidos = [];
    snapshot.forEach((docSnap) => {
      pedidos.push(formatearPedidoDoc(docSnap));
    });
    callback(pedidos);
  });
}
