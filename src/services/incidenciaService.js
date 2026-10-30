import api from "./api";

export const TIPOS_INCIDENCIA = [
  {
    id: "direccion_incorrecta",
    label: "Dirección incorrecta",
  },
  {
    id: "cliente_ausente",
    label: "Cliente ausente",
  },
  {
    id: "vehiculo_averiado",
    label: "Vehículo averiado",
  },
  {
    id: "retraso_entrega",
    label: "Retraso en entrega",
  },
  {
    id: "producto_danado",
    label: "Producto dañado",
  },
  {
    id: "pedido_incorrecto",
    label: "Pedido incorrecto",
  },
  {
    id: "otro",
    label: "Otro motivo",
  },
];

export const ESTADOS_INCIDENCIA = [
  "pendiente",
  "en_revision",
  "resuelta",
  "cancelada",
];

// =========================
// Convertir fecha
// =========================

const formatearFecha = (fecha) => {
  if (!fecha) {
    return null;
  }

  if (
    typeof fecha === "object" &&
    fecha._seconds !== undefined
  ) {
    return new Date(
      fecha._seconds * 1000
    ).toLocaleString("es-NI");
  }

  if (
    typeof fecha === "object" &&
    fecha.seconds !== undefined
  ) {
    return new Date(
      fecha.seconds * 1000
    ).toLocaleString("es-NI");
  }

  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return "Fecha no disponible";
  }

  return fechaConvertida.toLocaleString("es-NI");
};

// =========================
// Normalizar incidencia
// =========================

export const formatearIncidencia = (
  incidencia
) => {
  return {
    id: incidencia.id,

    usuarioId:
      incidencia.usuarioId ||
      incidencia.id_usuario ||
      null,

    pedidoId:
      incidencia.pedidoId ||
      incidencia.id_pedido ||
      null,

    rutaId:
      incidencia.rutaId ||
      incidencia.id_ruta ||
      null,

    tipoIncidente:
      incidencia.tipoIncidente ||
      incidencia.tipo_incidente ||
      "otro",

    // Compatibilidad con la pantalla antigua
    tipo_incidente:
      incidencia.tipoIncidente ||
      incidencia.tipo_incidente ||
      "otro",

    descripcion:
      incidencia.descripcion || "",

    observaciones:
      incidencia.observaciones || "",

    estado:
      incidencia.estado || "pendiente",

    fechaRegistro:
      incidencia.fechaRegistro || null,

    fechaResolucion:
      incidencia.fechaResolucion || null,

    fechaActualizacion:
      incidencia.fechaActualizacion || null,

    historialCambio:
      incidencia.historialCambio ||
      incidencia.historial_cambio ||
      [],

    fechaRegistroFormateada:
      formatearFecha(
        incidencia.fechaRegistro
      ) || "Reciente",

    fechaResolucionFormateada:
      formatearFecha(
        incidencia.fechaResolucion
      ) || "Sin resolver",
  };
};

// =========================
// Crear incidencia
// =========================

export const crearIncidencia = async (
  datos
) => {
  try {
    const cuerpo = {
      usuarioId: datos.usuarioId,
      pedidoId: datos.pedidoId,

      tipoIncidente:
        datos.tipoIncidente ||
        datos.tipo_incidente ||
        "otro",

      descripcion:
        datos.descripcion?.trim() || "",

      observaciones:
        datos.observaciones?.trim() || "",
    };

    // rutaId es opcional
    if (datos.rutaId?.trim()) {
      cuerpo.rutaId = datos.rutaId.trim();
    }

    console.log(
      "POST /incidencias:",
      cuerpo
    );

    const respuesta = await api.post(
      "/incidencias",
      cuerpo
    );

    console.log(
      "Respuesta incidencia:",
      respuesta.data
    );

    return formatearIncidencia({
      id: respuesta.data.id,
      ...cuerpo,
      ...(respuesta.data.incidencia || {}),
    });
  } catch (error) {
    console.error(
      "Error creando incidencia:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// =========================
// Obtener todas
// =========================

export const obtenerIncidencias = async () => {
  try {
    const respuesta = await api.get(
      "/incidencias"
    );

    const lista = Array.isArray(respuesta.data)
      ? respuesta.data
      : respuesta.data.incidencias || [];

    return lista.map(formatearIncidencia);
  } catch (error) {
    console.error(
      "Error obteniendo incidencias:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// =========================
// Obtener por ID
// =========================

export const obtenerIncidencia = async (
  id
) => {
  try {
    const respuesta = await api.get(
      `/incidencias/${id}`
    );

    return formatearIncidencia(
      respuesta.data
    );
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

// =========================
// Actualizar información
// =========================

export const actualizarIncidencia = async (
  id,
  datos
) => {
  try {
    const cuerpo = {};

    if (datos.tipoIncidente !== undefined) {
      cuerpo.tipoIncidente =
        datos.tipoIncidente;
    }

    if (datos.descripcion !== undefined) {
      cuerpo.descripcion =
        datos.descripcion.trim();
    }

    if (datos.observaciones !== undefined) {
      cuerpo.observaciones =
        datos.observaciones.trim();
    }

    const respuesta = await api.patch(
      `/incidencias/${id}`,
      cuerpo
    );

    return formatearIncidencia(
      respuesta.data.incidencia ||
        respuesta.data
    );
  } catch (error) {
    console.error(
      "Error actualizando incidencia:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// =========================
// Actualizar estado
// =========================

export const actualizarEstadoIncidencia =
  async (
    id,
    nuevoEstado,
    observaciones = ""
  ) => {
    try {
      const respuesta = await api.patch(
        `/incidencias/${id}/estado`,
        {
          estado: nuevoEstado,
          observaciones:
            observaciones.trim(),
        }
      );

      return formatearIncidencia(
        respuesta.data.incidencia ||
          respuesta.data
      );
    } catch (error) {
      console.error(
        "Error actualizando estado:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };

// =========================
// Eliminar incidencia
// =========================

export const eliminarIncidencia = async (
  id
) => {
  try {
    const respuesta = await api.delete(
      `/incidencias/${id}`
    );

    return respuesta.data;
  } catch (error) {
    console.error(
      "Error eliminando incidencia:",
      error.response?.data || error.message
    );

    throw error;
  }
};