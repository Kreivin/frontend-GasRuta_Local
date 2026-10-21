import React, { createContext, useState, useEffect, useCallback } from "react";
import {
  crearHistorial,
  obtenerHistoriales,
  escucharHistorial,
} from "../services/historialService";

export const HistorialContext = createContext();

export function HistorialProvider({ children }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setLoading(true);
      const unsub = escucharHistorial((lista) => {
        setHistorial(lista);
        setLoading(false);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Error al escuchar historial:", e.message);
      setLoading(false);
    }
  }, []);

  const registrarHistorial = useCallback(async (datos) => {
    try {
      setError(null);
      const res = await crearHistorial(datos);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return (
    <HistorialContext.Provider
      value={{
        historial,
        loading,
        error,
        registrarHistorial,
      }}
    >
      {children}
    </HistorialContext.Provider>
  );
}
