import api from "./api";

// =========================
// Convertir fecha
// =========================

const convertirFecha = (fecha) => {
  if (!fecha) {
    return null;
  }

  // Timestamp serializado por Firebase Admin
  if (
    typeof fecha === "object" &&
    fecha._seconds !== undefined
  ) {
    return new Date(
      fecha._seconds * 1000
    );
  }

  // Otra representación posible de Timestamp
  if (
    typeof fecha === "object" &&
    fecha.seconds !== undefined
  ) {
    return new Date(
      fecha.seconds * 1000
    );
  }

  const fechaConvertida =
    fecha instanceof Date
      ? fecha
      : new Date(fecha);

  if (
    Number.isNaN(
      fechaConvertida.getTime()
    )
  ) {
    return null;
  }

  return fechaConvertida;
};

// =========================
// Normalizar reseña
// =========================

export const formatearResena = (
  resena
) => {
  if (!resena) {
    return null;
  }

  const fechaResena =
    convertirFecha(
      resena.fechaResena ||
        resena.fecha_resena
    );

  return {
    id: resena.id,

    clienteId:
      resena.clienteId ||
      resena.Id_Cliente ||
      null,

    pedidoId:
      resena.pedidoId ||
      resena.Id_Pedido ||
      null,

    repartidorId:
      resena.repartidorId ||
      resena.id_repartidor ||
      null,

    calificacion:
      Number(resena.calificacion) || 0,

    comentario:
      resena.comentario || "",

    fechaResena,

    fechaResenaFormateada:
      fechaResena
        ? fechaResena.toLocaleString(
            "es-NI"
          )
        : "Fecha no disponible",
  };
};

// =========================
// Crear reseña
// POST /api/resenas
// =========================

export async function crearResena(
  resenaData
) {
  try {
    const calificacion = Number(
      resenaData.calificacion
    );

    if (!resenaData.clienteId) {
      throw new Error(
        "El ID del cliente es obligatorio."
      );
    }

    if (!resenaData.pedidoId) {
      throw new Error(
        "El ID del pedido es obligatorio."
      );
    }

    if (
      !Number.isInteger(calificacion) ||
      calificacion < 1 ||
      calificacion > 5
    ) {
      throw new Error(
        "La calificación debe estar entre 1 y 5."
      );
    }

    if (
      !resenaData.comentario?.trim()
    ) {
      throw new Error(
        "El comentario es obligatorio."
      );
    }

    const cuerpo = {
      clienteId:
        resenaData.clienteId,

      pedidoId:
        resenaData.pedidoId,

      calificacion,

      comentario:
        resenaData.comentario.trim(),
    };

    /*
     * El repartidor puede ser opcional si el
     * pedido todavía no tiene uno asignado.
     */
    if (resenaData.repartidorId) {
      cuerpo.repartidorId =
        resenaData.repartidorId;
    }

    console.log(
      "POST /resenas:",
      cuerpo
    );

    const respuesta = await api.post(
      "/resenas",
      cuerpo
    );

    console.log(
      "Respuesta al crear reseña:",
      respuesta.data
    );

    const datosResena =
      respuesta.data.resena || {};

    return formatearResena({
      id:
        respuesta.data.id ||
        datosResena.id,

      ...cuerpo,
      ...datosResena,
    });
  } catch (error) {
    console.log(
      "Error creando reseña:",
      {
        mensaje:
          error.response?.data
            ?.mensaje ||
          error.response?.data?.error ||
          error.message,

        estado:
          error.response?.status,

        datos:
          error.response?.data,
      }
    );

    throw error;
  }
}

// =========================
// Obtener todas las reseñas
// GET /api/resenas
// =========================

export async function obtenerTodasLasResenas() {
  try {
    const respuesta = await api.get(
      "/resenas"
    );

    const lista = Array.isArray(
      respuesta.data
    )
      ? respuesta.data
      : respuesta.data.resenas || [];

    return lista
      .map(formatearResena)
      .filter(Boolean);
  } catch (error) {
    console.log(
      "Error obteniendo reseñas:",
      {
        mensaje:
          error.response?.data
            ?.mensaje ||
          error.response?.data?.error ||
          error.message,

        estado:
          error.response?.status,

        datos:
          error.response?.data,
      }
    );

    throw error;
  }
}

// Alias de compatibilidad
export const obtenerResenas =
  obtenerTodasLasResenas;

// =========================
// Obtener una reseña
// GET /api/resenas/:id
// =========================

export async function obtenerResena(
  resenaId
) {
  try {
    const respuesta = await api.get(
      `/resenas/${resenaId}`
    );

    return formatearResena(
      respuesta.data.resena ||
        respuesta.data
    );
  } catch (error) {
    if (
      error.response?.status === 404
    ) {
      return null;
    }

    console.log(
      "Error obteniendo reseña:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

// =========================
// Obtener reseñas por pedido
// GET /api/resenas/pedido/:pedidoId
// =========================

export async function obtenerResenasPorPedido(
  pedidoId
) {
  try {
    if (!pedidoId) {
      throw new Error(
        "El ID del pedido es obligatorio."
      );
    }

    const respuesta = await api.get(
      `/resenas/pedido/${pedidoId}`
    );

    const lista = Array.isArray(
      respuesta.data
    )
      ? respuesta.data
      : respuesta.data.resenas || [];

    return lista
      .map(formatearResena)
      .filter(Boolean);
  } catch (error) {
    console.log(
      "Error obteniendo reseñas del pedido:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

// =========================
// Actualizar reseña
// PATCH /api/resenas/:id
// =========================

export async function actualizarResena(
  resenaId,
  datosActualizados
) {
  try {
    const cuerpo = {};

    if (
      datosActualizados.calificacion !==
      undefined
    ) {
      const calificacion = Number(
        datosActualizados.calificacion
      );

      if (
        !Number.isInteger(
          calificacion
        ) ||
        calificacion < 1 ||
        calificacion > 5
      ) {
        throw new Error(
          "La calificación debe estar entre 1 y 5."
        );
      }

      cuerpo.calificacion =
        calificacion;
    }

    if (
      datosActualizados.comentario !==
      undefined
    ) {
      cuerpo.comentario =
        datosActualizados.comentario.trim();
    }

    const respuesta = await api.patch(
      `/resenas/${resenaId}`,
      cuerpo
    );

    return formatearResena(
      respuesta.data.resena || {
        id: resenaId,
        ...datosActualizados,
        ...cuerpo,
      }
    );
  } catch (error) {
    console.log(
      "Error actualizando reseña:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

// =========================
// Eliminar reseña
// DELETE /api/resenas/:id
// =========================

export async function eliminarResena(
  resenaId
) {
  try {
    const respuesta = await api.delete(
      `/resenas/${resenaId}`
    );

    return respuesta.data;
  } catch (error) {
    console.log(
      "Error eliminando reseña:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}