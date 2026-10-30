import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  crearHistorial,
  obtenerHistoriales,
} from "../services/historialService";

export const HistorialContext = createContext();

export function HistorialProvider({ children }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // Cargar historial
  // =========================
  const cargarHistorial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const lista = await obtenerHistoriales();

      setHistorial(
        Array.isArray(lista) ? lista : []
      );

      return lista;
    } catch (err) {
      const mensaje =
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        err.message ||
        "No se pudo cargar el historial";

      console.error(
        "Error al cargar historial:",
        mensaje
      );

      setError(mensaje);
      setHistorial([]);

      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // Registrar historial
  // =========================
  const registrarHistorial = useCallback(
    async (datos) => {
      try {
        setError(null);

        const nuevoRegistro =
          await crearHistorial(datos);

        /*
         * Agrega inmediatamente el registro al estado.
         * Después recarga desde el backend para mantener
         * los datos sincronizados.
         */
        if (nuevoRegistro) {
          setHistorial((historialAnterior) => [
            nuevoRegistro,
            ...historialAnterior,
          ]);
        }

        await cargarHistorial();

        return nuevoRegistro;
      } catch (err) {
        const mensaje =
          err.response?.data?.mensaje ||
          err.response?.data?.error ||
          err.message ||
          "No se pudo registrar el historial";

        console.error(
          "Error al registrar historial:",
          mensaje
        );

        setError(mensaje);

        throw err;
      }
    },
    [cargarHistorial]
  );

  // =========================
  // Refrescar historial
  // =========================
  const refrescarHistorial = useCallback(
    async () => {
      return cargarHistorial();
    },
    [cargarHistorial]
  );

  // =========================
  // Limpiar errores
  // =========================
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // Carga inicial
  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  return (
    <HistorialContext.Provider
      value={{
        historial,
        loading,
        error,

        cargarHistorial,
        refrescarHistorial,
        registrarHistorial,
        limpiarError,
      }}
    >
      {children}
    </HistorialContext.Provider>
  );
}