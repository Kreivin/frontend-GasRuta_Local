import React, { createContext, useState, useEffect, useCallback } from "react";

let resenaService = null;
try {
  resenaService = require("../services/resenaService");
} catch (e) {
  console.warn("resenaService no disponible (Firebase no configurado):", e.message);
}

const SAMPLE_RESENAS = [
  {
    id: "sample_resena_1",
    clienteId: "MFSECY3Z1K6X3JePUdO5",
    pedidoId: "NTiOxIHiRc8ZXWxcmVfR",
    calificacion: 5,
    comentario: "que buen servicio realizan las entregas rapido y en buen estado",
    fechaResena: new Date("2026-09-30T11:56:45-06:00"),
    repartidorId: "SPk4vMRTErAtvsg23WHa",
  },
];

export const ResenaContext = createContext();

export function ResenaProvider({ children }) {
  const [resenas, setResenas] = useState(SAMPLE_RESENAS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Suscripción en tiempo real a la colección Resena si Firebase está activo
  useEffect(() => {
    if (!resenaService?.escucharResenas) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const unsubscribe = resenaService.escucharResenas((resenasActualizadas) => {
        if (resenasActualizadas && resenasActualizadas.length > 0) {
          setResenas(resenasActualizadas);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("No se pudo conectar a Firestore (Resena):", err.message);
      setLoading(false);
    }
  }, []);

  // Cargar reseñas manualmente
  const cargarResenas = useCallback(async () => {
    if (!resenaService?.obtenerTodasLasResenas) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await resenaService.obtenerTodasLasResenas();
      if (data && data.length > 0) {
        setResenas(data);
      }
    } catch (err) {
      console.warn("Error al cargar reseñas desde Firestore:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva reseña (con fallback local)
  const agregarResena = useCallback(async (resenaData) => {
    const localId = "resena_" + Date.now();
    const nuevaLocal = {
      id: localId,
      clienteId: resenaData.clienteId,
      pedidoId: resenaData.pedidoId,
      calificacion: resenaData.calificacion || 5,
      comentario: resenaData.comentario || "",
      fechaResena: new Date(),
      repartidorId: resenaData.repartidorId,
    };

    if (resenaService?.crearResena) {
      try {
        const id = await resenaService.crearResena(resenaData);
        nuevaLocal.id = id;
      } catch (err) {
        console.warn("No se pudo guardar en Firestore, guardando localmente:", err.message);
      }
    }

    setResenas((prev) => [nuevaLocal, ...prev]);
    return nuevaLocal.id;
  }, []);

  // Actualizar reseña
  const editarResena = useCallback(async (resenaId, datosActualizados) => {
    if (resenaService?.actualizarResena) {
      try {
        await resenaService.actualizarResena(resenaId, datosActualizados);
      } catch (err) {
        console.warn("Error actualizando en Firestore:", err.message);
      }
    }

    setResenas((prev) =>
      prev.map((item) => (item.id === resenaId ? { ...item, ...datosActualizados } : item))
    );
  }, []);

  // Eliminar reseña
  const borrarResena = useCallback(async (resenaId) => {
    if (resenaService?.eliminarResena) {
      try {
        await resenaService.eliminarResena(resenaId);
      } catch (err) {
        console.warn("Error eliminando en Firestore:", err.message);
      }
    }

    setResenas((prev) => prev.filter((item) => item.id !== resenaId));
  }, []);

  return (
    <ResenaContext.Provider
      value={{
        resenas,
        loading,
        error,
        cargarResenas,
        agregarResena,
        editarResena,
        borrarResena,
      }}
    >
      {children}
    </ResenaContext.Provider>
  );
}
