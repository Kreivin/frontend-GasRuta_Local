import api from "./api";

// =========================
// Formatear fecha
// =========================
const formatearFecha = (fecha) => {
  if (!fecha) {
    return "En proceso";
  }

  // Timestamp serializado desde Firebase Admin
  if (
    typeof fecha === "object" &&
    fecha._seconds !== undefined
  ) {
    const fechaConvertida = new Date(
      fecha._seconds * 1000
    );

    return fechaConvertida.toLocaleString(
      "es-NI"
    );
  }

  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return "Fecha no disponible";
  }

  return fechaConvertida.toLocaleString(
    "es-NI"
  );
};

// =========================
// Formatear registro
// =========================
export function formatearHistorial(item) {
  const descripcion =
    item.descripcion ||
    item.descripcio ||
    "";

  return {
    id: item.id,

    usuarioId:
      item.usuarioId ||
      item.id_usuario ||
      null,

    pedidoId:
      item.pedidoId ||
      item.id_pedido ||
      null,

    accion:
      item.accion ||
      "evento_general",

    estado:
      item.estado ||
      "registrado",

    descripcion,
    descripcio: descripcion,

    fecha_entrega:
      item.fecha_entrega ||
      item.fechaEntrega ||
      null,

    fechaActualizacion:
      item.fechaActualizacion ||
      null,

    fechaEntregaFormateada:
      formatearFecha(
        item.fecha_entrega ||
        item.fechaEntrega
      ),

    fechaActualizacionFormateada:
      formatearFecha(
        item.fechaActualizacion
      ),
  };
}

// =========================
// Crear historial
// POST /api/historial
// =========================
export async function crearHistorial(datos) {
  try {
    const respuesta = await api.post(
      "/historial",
      {
        usuarioId:
          datos.usuarioId || null,

        pedidoId:
          datos.pedidoId || null,

        accion:
          datos.accion ||
          "evento_general",

        estado:
          datos.estado ||
          "registrado",

        descripcion:
          datos.descripcion ||
          datos.descripcio ||
          "",

        fechaEntrega:
          datos.fechaEntrega ||
          datos.fecha_entrega ||
          null,
      }
    );

    const registro =
      respuesta.data.historial ||
      respuesta.data.registro ||
      respuesta.data;

    return formatearHistorial(registro);
  } catch (error) {
    console.error(
      "Error al registrar historial:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

// =========================
// Obtener historiales
// GET /api/historial
// =========================
export async function obtenerHistoriales() {
  try {
    const respuesta = await api.get(
      "/historial"
    );

    const lista = Array.isArray(
      respuesta.data
    )
      ? respuesta.data
      : respuesta.data.historiales ||
        respuesta.data.datos ||
        [];

    return lista.map(formatearHistorial);
  } catch (error) {
    console.error(
      "Error al obtener historial:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}