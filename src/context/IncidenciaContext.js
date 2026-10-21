import React, { createContext, useState, useEffect, useCallback } from "react";
import {
  crearIncidencia,
  actualizarEstadoIncidencia,
  eliminarIncidencia,
  escucharIncidencias,
} from "../services/incidenciaService";

export const IncidenciaContext = createContext();

export function IncidenciaProvider({ children }) {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setLoading(true);
      const unsub = escucharIncidencias((lista) => {
        setIncidencias(lista);
        setLoading(false);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Error al escuchar incidencias:", e.message);
      setLoading(false);
    }
  }, []);

  const registrarIncidencia = useCallback(async (datos) => {
    try {
      setError(null);
      const res = await crearIncidencia(datos);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const cambiarEstadoIncidencia = useCallback(async (id, nuevoEstado, observaciones) => {
    try {
      setError(null);
      await actualizarEstadoIncidencia(id, nuevoEstado, observaciones);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const borrarIncidencia = useCallback(async (id) => {
    try {
      setError(null);
      await eliminarIncidencia(id);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return (
    <IncidenciaContext.Provider
      value={{
        incidencias,
        loading,
        error,
        registrarIncidencia,
        cambiarEstadoIncidencia,
        borrarIncidencia,
      }}
    >
      {children}
    </IncidenciaContext.Provider>
  );
}
