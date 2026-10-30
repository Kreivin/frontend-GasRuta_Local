import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  crearIncidencia,
  obtenerIncidencias,
  actualizarIncidencia,
  actualizarEstadoIncidencia,
  eliminarIncidencia,
} from "../services/incidenciaService";

export const IncidenciaContext =
  createContext();

export function IncidenciaProvider({
  children,
}) {
  const [
    incidencias,
    setIncidencias,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const obtenerMensaje = (err) => {
    return (
      err.response?.data?.mensaje ||
      err.response?.data?.error ||
      err.message ||
      "Ocurrió un error con las incidencias"
    );
  };

  // =========================
  // Cargar incidencias
  // =========================

  const cargarIncidencias =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const lista =
          await obtenerIncidencias();

        setIncidencias(
          Array.isArray(lista) ? lista : []
        );

        return lista;
      } catch (err) {
        const mensaje =
          obtenerMensaje(err);

        console.error(
          "Error cargando incidencias:",
          mensaje
        );

        setError(mensaje);
        return [];
      } finally {
        setLoading(false);
      }
    }, []);

  // =========================
  // Crear incidencia
  // =========================

  const registrarIncidencia =
    useCallback(
      async (datos) => {
        try {
          setError(null);

          console.log(
            "Context registra incidencia:",
            datos
          );

          const nuevaIncidencia =
            await crearIncidencia(datos);

          setIncidencias(
            (listaAnterior) => [
              nuevaIncidencia,
              ...listaAnterior,
            ]
          );

          await cargarIncidencias();

          return nuevaIncidencia;
        } catch (err) {
          const mensaje =
            obtenerMensaje(err);

          console.error(
            "Context error incidencia:",
            mensaje
          );

          setError(mensaje);
          throw err;
        }
      },
      [cargarIncidencias]
    );

  // =========================
  // Editar incidencia
  // =========================

  const editarIncidencia =
    useCallback(async (id, datos) => {
      try {
        setError(null);

        const actualizada =
          await actualizarIncidencia(
            id,
            datos
          );

        setIncidencias(
          (listaAnterior) =>
            listaAnterior.map(
              (incidencia) =>
                incidencia.id === id
                  ? actualizada
                  : incidencia
            )
        );

        return actualizada;
      } catch (err) {
        setError(obtenerMensaje(err));
        throw err;
      }
    }, []);

  // =========================
  // Cambiar estado
  // =========================

  const cambiarEstadoIncidencia =
    useCallback(
      async (
        id,
        nuevoEstado,
        observaciones = ""
      ) => {
        try {
          setError(null);

          const actualizada =
            await actualizarEstadoIncidencia(
              id,
              nuevoEstado,
              observaciones
            );

          setIncidencias(
            (listaAnterior) =>
              listaAnterior.map(
                (incidencia) =>
                  incidencia.id === id
                    ? actualizada
                    : incidencia
              )
          );

          await cargarIncidencias();

          return actualizada;
        } catch (err) {
          setError(obtenerMensaje(err));
          throw err;
        }
      },
      [cargarIncidencias]
    );

  // =========================
  // Eliminar incidencia
  // =========================

  const borrarIncidencia =
    useCallback(async (id) => {
      try {
        setError(null);

        await eliminarIncidencia(id);

        setIncidencias(
          (listaAnterior) =>
            listaAnterior.filter(
              (incidencia) =>
                incidencia.id !== id
            )
        );

        return true;
      } catch (err) {
        setError(obtenerMensaje(err));
        throw err;
      }
    }, []);

  const refrescarIncidencias =
    useCallback(async () => {
      return cargarIncidencias();
    }, [cargarIncidencias]);

  useEffect(() => {
    cargarIncidencias();
  }, [cargarIncidencias]);

  return (
    <IncidenciaContext.Provider
      value={{
        incidencias,
        loading,
        error,

        cargarIncidencias,
        refrescarIncidencias,
        registrarIncidencia,
        editarIncidencia,
        cambiarEstadoIncidencia,
        borrarIncidencia,
      }}
    >
      {children}
    </IncidenciaContext.Provider>
  );
}