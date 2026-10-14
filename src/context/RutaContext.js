import React, { createContext, useState, useEffect, useCallback } from "react";

let rutaService = null;
try {
  rutaService = require("../services/rutaService");
} catch (e) {
  console.warn("rutaService no disponible (Firebase no configurado):", e.message);
}

export const RutaContext = createContext();

export function RutaProvider({ children }) {
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Suscripción en tiempo real a la colección Ruta
  useEffect(() => {
    if (!rutaService?.escucharRutas) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const unsubscribe = rutaService.escucharRutas((rutasActualizadas) => {
        setRutas(rutasActualizadas);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("No se pudo conectar a Firestore:", err.message);
      setLoading(false);
      setError("Firebase no está configurado. Configura firebaseConfig.js");
    }
  }, []);

  // Cargar rutas manualmente (útil para refresh)
  const cargarRutas = useCallback(async () => {
    if (!rutaService?.obtenerTodasLasRutas) {
      setError("Firebase no está configurado.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await rutaService.obtenerTodasLasRutas();
      setRutas(data);
    } catch (err) {
      setError(err.message);
      console.error("Error al cargar rutas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva ruta
  const agregarRuta = useCallback(async (rutaData) => {
    if (!rutaService?.crearRuta) {
      setError("Firebase no está configurado.");
      throw new Error("Firebase no está configurado.");
    }
    try {
      setError(null);
      const id = await rutaService.crearRuta(rutaData);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Actualizar ruta existente
  const editarRuta = useCallback(async (rutaId, datosActualizados) => {
    if (!rutaService?.actualizarRuta) {
      setError("Firebase no está configurado.");
      throw new Error("Firebase no está configurado.");
    }
    try {
      setError(null);
      await rutaService.actualizarRuta(rutaId, datosActualizados);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Eliminar ruta
  const borrarRuta = useCallback(async (rutaId) => {
    if (!rutaService?.eliminarRuta) {
      setError("Firebase no está configurado.");
      throw new Error("Firebase no está configurado.");
    }
    try {
      setError(null);
      await rutaService.eliminarRuta(rutaId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return (
    <RutaContext.Provider
      value={{
        rutas,
        loading,
        error,
        cargarRutas,
        agregarRuta,
        editarRuta,
        borrarRuta,
      }}
    >
      {children}
    </RutaContext.Provider>
  );
}
