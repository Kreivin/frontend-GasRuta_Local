import api from "./api";

// =========================
// Estados disponibles
// =========================

export const ESTADOS_PEDIDO = [
  "pendiente",
  "confirmado",
  "en_preparacion",
  "en_camino",
  "entregado",
  "cancelado",
];

// =========================
// Cilindros disponibles
// =========================

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

// =========================
// Formatear fecha
// =========================

const formatearFecha = (valor) => {
  if (!valor) {
    return null;
  }

  // El backend normalmente devuelve texto ISO
  if (typeof valor === "string") {
    const fecha = new Date(valor);

    return Number.isNaN(fecha.getTime())
      ? valor
      : fecha.toLocaleString("es-NI");
  }

  // Compatibilidad con Timestamp serializado
  if (
    typeof valor === "object" &&
    valor._seconds !== undefined
  ) {
    const fecha = new Date(
      valor._seconds * 1000
    );

    return fecha.toLocaleString("es-NI");
  }

  // Compatibilidad temporal con Firestore directo
  if (typeof valor.toDate === "function") {
    return valor
      .toDate()
      .toLocaleString("es-NI");
  }

  return String(valor);
};

// =========================
// Normalizar pedido
// =========================

export function formatearPedidoDoc(pedido) {
  if (!pedido) {
    return null;
  }

  return {
    id: pedido.id,

    // El backend ya convierte la referencia en ID
    usuarioId:
      pedido.usuarioId ||
      pedido.Id_Usuario ||
      null,

    Id_Usuario:
      pedido.Id_Usuario ||
      pedido.usuarioId ||
      null,

    Producto:
      pedido.Producto ||
      pedido.producto ||
      null,

    Ubicacion:
      pedido.Ubicacion ||
      pedido.ubicacion ||
      null,

    cantidad:
      Number(pedido.cantidad) || 0,

    costoEnvio:
      Number(pedido.costoEnvio) || 0,

    subtotal:
      Number(pedido.subtotal) || 0,

    total:
      Number(pedido.total) || 0,

    estado:
      pedido.estado || "pendiente",

    fecha:
      pedido.fecha || null,

    fechaActualizacion:
      pedido.fechaActualizacion || null,

    fechaFormateada:
      formatearFecha(pedido.fecha),

    fechaActualizacionFormateada:
      formatearFecha(
        pedido.fechaActualizacion
      ),
  };
}

// =========================
// Crear pedido
// =========================

export async function crearPedido(pedidoData) {
  try {
    const pesoKg = Number(
      pedidoData.pesoKg
    );

    const cantidad = Number(
      pedidoData.cantidad
    );

    const costoEnvio = Number(
      pedidoData.costoEnvio ?? 0
    );

    if (!pedidoData.usuarioId) {
      throw new Error(
        "No se encontró el usuario del pedido."
      );
    }

    if (
      !CILINDROS_DISPONIBLES[pesoKg]
    ) {
      throw new Error(
        "El peso seleccionado no está disponible."
      );
    }

    if (
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      throw new Error(
        "La cantidad debe ser mayor que cero."
      );
    }

    const datosBackend = {
      usuarioId: pedidoData.usuarioId,
      pesoKg,
      cantidad,

      direccion:
        pedidoData.direccion ||
        pedidoData.Ubicacion?.direccion ||
        "Juigalpa, Chontales",

      referencia:
        pedidoData.referencia ||
        pedidoData.Ubicacion?.referencia ||
        "",

      costoEnvio,
    };

    const respuesta = await api.post(
      "/pedidos",
      datosBackend
    );

    /*
     * El backend responde:
     * {
     *   mensaje,
     *   id,
     *   pedido
     * }
     */
    return formatearPedidoDoc({
      id: respuesta.data.id,
      ...respuesta.data.pedido,
    });
  } catch (error) {
    console.error(
      "Error al crear pedido:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

// =========================
// Obtener todos los pedidos
// =========================

export async function obtenerPedidos() {
  try {
    const respuesta = await api.get(
      "/pedidos"
    );

    const datos = Array.isArray(
      respuesta.data
    )
      ? respuesta.data
      : [];

    return datos.map(
      formatearPedidoDoc
    );
  } catch (error) {
    console.error(
      "Error al obtener pedidos:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

// Alias para compatibilidad
export const obtenerTodosLosPedidos =
  obtenerPedidos;

// =========================
// Obtener pedido por ID
// =========================

export async function obtenerPedido(id) {
  try {
    const respuesta = await api.get(
      `/pedidos/${id}`
    );

    return formatearPedidoDoc(
      respuesta.data
    );
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }

    console.error(
      "Error al obtener pedido:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

// =========================
// Obtener pedidos de usuario
// =========================

export async function obtenerPedidosUsuario(
  usuarioId
) {
  try {
    if (!usuarioId) {
      throw new Error(
        "El ID del usuario es obligatorio."
      );
    }

    const respuesta = await api.get(
      `/pedidos/usuario/${usuarioId}`
    );

    const datos = Array.isArray(
      respuesta.data
    )
      ? respuesta.data
      : [];

    return datos.map(
      formatearPedidoDoc
    );
  } catch (error) {
    console.error(
      "Error al obtener pedidos del usuario:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

// =========================
// Actualizar pedido completo
// =========================

export async function actualizarPedido(
  id,
  datosActualizados
) {
  try {
    const datosBackend = {};

    if (
      datosActualizados.pesoKg !== undefined
    ) {
      datosBackend.pesoKg = Number(
        datosActualizados.pesoKg
      );
    }

    if (
      datosActualizados.cantidad !== undefined
    ) {
      datosBackend.cantidad = Number(
        datosActualizados.cantidad
      );
    }

    if (
      datosActualizados.costoEnvio !==
      undefined
    ) {
      datosBackend.costoEnvio = Number(
        datosActualizados.costoEnvio
      );
    }

    if (
      datosActualizados.direccion !==
      undefined
    ) {
      datosBackend.direccion =
        datosActualizados.direccion;
    }

    if (
      datosActualizados.referencia !==
      undefined
    ) {
      datosBackend.referencia =
        datosActualizados.referencia;
    }

    const respuesta = await api.patch(
      `/pedidos/${id}`,
      datosBackend
    );

    return formatearPedidoDoc(
      respuesta.data.pedido
    );
  } catch (error) {
    console.error(
      "Error al actualizar pedido:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

// =========================
// Actualizar estado
// =========================

export async function actualizarEstadoPedido(
  id,
  nuevoEstado
) {
  try {
    if (
      !ESTADOS_PEDIDO.includes(
        nuevoEstado
      )
    ) {
      throw new Error(
        "El estado seleccionado no es válido."
      );
    }

    const respuesta = await api.patch(
      `/pedidos/${id}/estado`,
      {
        estado: nuevoEstado,
      }
    );

    return respuesta.data;
  } catch (error) {
    console.error(
      "Error al actualizar estado:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

// =========================
// Eliminar pedido
// =========================

export async function eliminarPedido(id) {
  try {
    const respuesta = await api.delete(
      `/pedidos/${id}`
    );

    return respuesta.data;
  } catch (error) {
    console.error(
      "Error al eliminar pedido:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

// =========================
// Compatibilidad temporal
// =========================

/*
 * Antes escucharPedidos utilizaba onSnapshot.
 * Ahora el frontend no se conecta directamente
 * a Firestore.
 *
 * Para no romper PedidoContext, esta función
 * realiza una consulta inicial y repite la
 * consulta cada 15 segundos.
 */
export function escucharPedidos(
  callback,
  callbackError
) {
  let activo = true;

  const cargar = async () => {
    try {
      const pedidos =
        await obtenerPedidos();

      if (activo) {
        callback(pedidos);
      }
    } catch (error) {
      if (
        activo &&
        typeof callbackError === "function"
      ) {
        callbackError(error);
      }
    }
  };

  cargar();

  const intervalo = setInterval(
    cargar,
    15000
  );

  // Función equivalente a unsubscribe
  return () => {
    activo = false;
    clearInterval(intervalo);
  };
}