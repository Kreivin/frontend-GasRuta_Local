import * as Location from "expo-location";

import {
  Linking,
} from "react-native";

import api from "./api";

// =========================
// Convertir fecha
// =========================

const convertirFecha = (fecha) => {
  if (!fecha) {
    return null;
  }

  if (
    typeof fecha === "object" &&
    fecha._seconds !== undefined
  ) {
    return new Date(
      fecha._seconds * 1000
    );
  }

  if (
    typeof fecha === "object" &&
    fecha.seconds !== undefined
  ) {
    return new Date(
      fecha.seconds * 1000
    );
  }

  const fechaConvertida = new Date(fecha);

  if (
    Number.isNaN(fechaConvertida.getTime())
  ) {
    return null;
  }

  return fechaConvertida;
};

// =========================
// Normalizar ruta
// =========================

export const formatearRuta = (ruta) => {
  if (!ruta) {
    return null;
  }

  const ubicacion =
    ruta.ubicacion_actual ||
    ruta.ubicacionActual ||
    null;

  return {
    id: ruta.id,

    pedidoId:
      ruta.pedidoId ||
      ruta.Pedido ||
      null,

    ruta_asignada:
      ruta.ruta_asignada ||
      ruta.rutaAsignada ||
      "",

    distancia_estimada:
      ruta.distancia_estimada ??
      ruta.distanciaEstimada ??
      null,

    tiempo_estimado:
      ruta.tiempo_estimado ??
      ruta.tiempoEstimado ??
      null,

    fecha_inicio: convertirFecha(
      ruta.fecha_inicio ||
      ruta.fechaInicio
    ),

    fecha_final: convertirFecha(
      ruta.fecha_final ||
      ruta.fechaFinal
    ),

    fechaActualizacion: convertirFecha(
      ruta.fechaActualizacion
    ),

    estado:
      ruta.estado ||
      "asignada",

    ubicacion_actual: ubicacion
      ? {
          latitud: Number(
            ubicacion.latitud
          ),

          longitud: Number(
            ubicacion.longitud
          ),

          rumbo: Number(
            ubicacion.rumbo || 0
          ),

          velocidad: Number(
            ubicacion.velocidad || 0
          ),

          ultima_actualizacion:
            convertirFecha(
              ubicacion.ultima_actualizacion ||
              ubicacion.ultimaActualizacion
            ),
        }
      : null,
  };
};

// =========================
// Crear ruta
// POST /api/rutas
// =========================

export async function crearRuta(rutaData) {
  try {
    const datos = {
      pedidoId: rutaData.pedidoId,

      rutaAsignada:
        rutaData.rutaAsignada ||
        rutaData.ruta_asignada,

      distanciaEstimada: Number(
        rutaData.distanciaEstimada ??
        rutaData.distancia_estimada
      ),

      tiempoEstimado: Number(
        rutaData.tiempoEstimado ??
        rutaData.tiempo_estimado
      ),
    };

    console.log(
      "Creando ruta:",
      datos
    );

    const respuesta = await api.post(
      "/rutas",
      datos
    );

    console.log(
      "Ruta creada:",
      respuesta.data
    );

    return {
      id: respuesta.data.id,

      ...formatearRuta({
        id: respuesta.data.id,
        ...datos,
        ...(respuesta.data.ruta || {}),
      }),
    };
  } catch (error) {
    console.log(
      "Error al crear ruta:",
      {
        mensaje:
          error.response?.data?.mensaje ||
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
// Obtener todas las rutas
// GET /api/rutas
// =========================

export async function obtenerTodasLasRutas() {
  try {
    const respuesta = await api.get(
      "/rutas"
    );

    const lista = Array.isArray(
      respuesta.data
    )
      ? respuesta.data
      : respuesta.data.rutas || [];

    return lista.map(formatearRuta);
  } catch (error) {
    console.log(
      "Error al obtener rutas:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
}

// =========================
// Obtener ruta por ID
// GET /api/rutas/:id
// =========================

export async function obtenerRuta(rutaId) {
  try {
    const respuesta = await api.get(
      `/rutas/${rutaId}`
    );

    return formatearRuta(
      respuesta.data
    );
  } catch (error) {
    if (
      error.response?.status === 404
    ) {
      return null;
    }

    console.log(
      "Error al obtener ruta:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
}

// =========================
// Obtener ruta por pedido
// GET /api/rutas/pedido/:pedidoId
// =========================

export async function obtenerRutaPorPedido(
  pedidoId
) {
  try {
    const respuesta = await api.get(
      `/rutas/pedido/${pedidoId}`
    );

    return formatearRuta(
      respuesta.data
    );
  } catch (error) {
    if (
      error.response?.status === 404
    ) {
      return null;
    }

    console.log(
      "Error al obtener ruta del pedido:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
}

// Compatibilidad con el nombre antiguo
export async function obtenerRutasPorPedido(
  pedidoId
) {
  const ruta =
    await obtenerRutaPorPedido(
      pedidoId
    );

  return ruta ? [ruta] : [];
}

// =========================
// Actualizar ruta
// PATCH /api/rutas/:id
// =========================

export async function actualizarRuta(
  rutaId,
  datosActualizados
) {
  try {
    const datos = {};

    if (
      datosActualizados.rutaAsignada !==
        undefined ||
      datosActualizados.ruta_asignada !==
        undefined
    ) {
      datos.rutaAsignada =
        datosActualizados.rutaAsignada ??
        datosActualizados.ruta_asignada;
    }

    if (
      datosActualizados.distanciaEstimada !==
        undefined ||
      datosActualizados.distancia_estimada !==
        undefined
    ) {
      datos.distanciaEstimada = Number(
        datosActualizados.distanciaEstimada ??
        datosActualizados.distancia_estimada
      );
    }

    if (
      datosActualizados.tiempoEstimado !==
        undefined ||
      datosActualizados.tiempo_estimado !==
        undefined
    ) {
      datos.tiempoEstimado = Number(
        datosActualizados.tiempoEstimado ??
        datosActualizados.tiempo_estimado
      );
    }

    const respuesta = await api.patch(
      `/rutas/${rutaId}`,
      datos
    );

    return formatearRuta(
      respuesta.data.ruta ||
      respuesta.data
    );
  } catch (error) {
    console.log(
      "Error al actualizar ruta:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
}

// =========================
// Iniciar ruta
// PATCH /api/rutas/:id/iniciar
// =========================

export async function iniciarRuta(
  rutaId
) {
  try {
    const respuesta = await api.patch(
      `/rutas/${rutaId}/iniciar`,
      {}
    );

    return formatearRuta(
      respuesta.data.ruta ||
      respuesta.data
    );
  } catch (error) {
    console.log(
      "Error al iniciar ruta:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
}

// =========================
// Finalizar ruta
// PATCH /api/rutas/:id/finalizar
// =========================

export async function finalizarRuta(
  rutaId
) {
  try {
    const respuesta = await api.patch(
      `/rutas/${rutaId}/finalizar`,
      {}
    );

    return formatearRuta(
      respuesta.data.ruta ||
      respuesta.data
    );
  } catch (error) {
    console.log(
      "Error al finalizar ruta:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
}

// =========================
// Eliminar ruta
// DELETE /api/rutas/:id
// =========================

export async function eliminarRuta(
  rutaId
) {
  try {
    const respuesta = await api.delete(
      `/rutas/${rutaId}`
    );

    return respuesta.data;
  } catch (error) {
    console.log(
      "Error al eliminar ruta:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
}

// =========================
// Actualizar ubicación
//
// Esta ruta debe existir en el backend:
// PATCH /api/rutas/:id/ubicacion
// =========================

export async function actualizarUbicacionRuta(
  rutaId,
  {
    latitud,
    longitud,
    rumbo = 0,
    velocidad = 0,
  }
) {
  try {
    const respuesta = await api.patch(
      `/rutas/${rutaId}/ubicacion`,
      {
        latitud: Number(latitud),
        longitud: Number(longitud),
        rumbo: Number(rumbo) || 0,
        velocidad:
          Number(velocidad) || 0,
      }
    );

    return formatearRuta(
      respuesta.data.ruta ||
      respuesta.data
    );
  } catch (error) {
    console.log(
      "Error actualizando ubicación:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
}

// =========================
// Consultar ubicación mediante polling
// =========================

export function escucharUbicacionRuta(
  rutaId,
  callback,
  intervaloMs = 5000
) {
  let activo = true;

  const consultar = async () => {
    try {
      const ruta =
        await obtenerRuta(rutaId);

      if (activo && callback) {
        callback(ruta);
      }
    } catch (error) {
      console.log(
        "Error consultando ubicación:",
        error.message
      );
    }
  };

  consultar();

  const intervalo = setInterval(
    consultar,
    intervaloMs
  );

  // Emula el unsubscribe de onSnapshot
  return () => {
    activo = false;
    clearInterval(intervalo);
  };
}

// =========================
// Rastreo GPS del repartidor
// =========================

export async function iniciarRastreoRepartidor(
  rutaId,
  onUpdate
) {
  const {
    status,
  } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error(
      "No se otorgaron permisos para acceder a la ubicación."
    );
  }

  const subscription =
    await Location.watchPositionAsync(
      {
        accuracy:
          Location.Accuracy.High,

        timeInterval: 5000,
        distanceInterval: 10,
      },
      async (location) => {
        const {
          latitude,
          longitude,
          heading,
          speed,
        } = location.coords;

        try {
          await actualizarUbicacionRuta(
            rutaId,
            {
              latitud: latitude,
              longitud: longitude,
              rumbo: heading || 0,
              velocidad: speed || 0,
            }
          );

          if (onUpdate) {
            onUpdate({
              latitude,
              longitude,
              heading: heading || 0,
              speed: speed || 0,
              timestamp:
                location.timestamp,
            });
          }
        } catch (error) {
          console.log(
            "No se pudo enviar la coordenada:",
            error.message
          );
        }
      }
    );

  return subscription;
}

// =========================
// Abrir navegación Google Maps
// =========================

export function abrirNavegacionGoogleMaps(
  latitud,
  longitud
) {
  const url =
    `https://www.google.com/maps/dir/` +
    `?api=1&destination=${latitud},${longitud}` +
    `&travelmode=driving`;

  return Linking.openURL(url);
}

// =========================
// Mostrar ubicación en Google Maps
// =========================

export function abrirEnGoogleMaps(
  latitud,
  longitud
) {
  const url =
    `https://www.google.com/maps?q=` +
    `${latitud},${longitud}`;

  return Linking.openURL(url);
}

// =========================
// Compartir por WhatsApp
// =========================

export async function compartirUbicacionWhatsApp({
  latitud,
  longitud,
  pedidoId = "",
}) {
  const mapsUrl =
    `https://www.google.com/maps?q=` +
    `${latitud},${longitud}`;

  const mensaje = encodeURIComponent(
    `🛵 GasRuta - Ubicación del repartidor\n` +
      `El pedido va en camino${
        pedidoId
          ? ` (Pedido #${pedidoId.slice(
              0,
              6
            )})`
          : ""
      }.\n` +
      `Ubicación:\n${mapsUrl}`
  );

  const appUrl =
    `whatsapp://send?text=${mensaje}`;

  const webUrl =
    `https://wa.me/?text=${mensaje}`;

  try {
    const disponible =
      await Linking.canOpenURL(
        appUrl
      );

    return Linking.openURL(
      disponible
        ? appUrl
        : webUrl
    );
  } catch {
    return Linking.openURL(webUrl);
  }
}