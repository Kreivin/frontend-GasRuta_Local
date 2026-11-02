import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  crearResena,
  obtenerTodasLasResenas,
  obtenerResenasPorPedido,
  actualizarResena,
  eliminarResena,
} from "../services/resenaService";

export const ResenaContext =
  createContext();

export function ResenaProvider({
  children,
}) {
  const [resenas, setResenas] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  // =========================
  // Obtener mensaje
  // =========================

  const obtenerMensajeError = (
    err
  ) => {
    return (
      err.response?.data?.mensaje ||
      err.response?.data?.error ||
      err.message ||
      "Ocurrió un error con las reseñas."
    );
  };

  // =========================
  // Cargar todas
  // =========================

  const cargarResenas =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const lista =
          await obtenerTodasLasResenas();

        setResenas(
          Array.isArray(lista)
            ? lista
            : []
        );

        return lista;
      } catch (err) {
        const mensaje =
          obtenerMensajeError(err);

        console.log(
          "Error cargando reseñas:",
          {
            mensaje,
            estado:
              err.response?.status,
            datos:
              err.response?.data,
          }
        );

        setError(mensaje);
        setResenas([]);

        return [];
      } finally {
        setLoading(false);
      }
    }, []);

  // =========================
  // Cargar por pedido
  // =========================

  const cargarResenasPedido =
    useCallback(async (pedidoId) => {
      if (!pedidoId) {
        setError(
          "El ID del pedido es obligatorio."
        );

        return [];
      }

      try {
        setLoading(true);
        setError(null);

        const lista =
          await obtenerResenasPorPedido(
            pedidoId
          );

        setResenas(
          Array.isArray(lista)
            ? lista
            : []
        );

        return lista;
      } catch (err) {
        const mensaje =
          obtenerMensajeError(err);

        setError(mensaje);

        return [];
      } finally {
        setLoading(false);
      }
    }, []);

  // =========================
  // Agregar reseña
  // =========================

  const agregarResena =
    useCallback(
      async (resenaData) => {
        try {
          setError(null);

          console.log(
            "Creando reseña desde contexto:",
            resenaData
          );

          const nuevaResena =
            await crearResena(
              resenaData
            );

          setResenas(
            (listaAnterior) => [
              nuevaResena,
              ...listaAnterior,
            ]
          );

          /*
           * Recarga para garantizar que el
           * estado coincida con el backend.
           */
          await cargarResenas();

          return nuevaResena;
        } catch (err) {
          const mensaje =
            obtenerMensajeError(err);

          console.log(
            "Error agregando reseña:",
            {
              mensaje,
              estado:
                err.response?.status,
              datos:
                err.response?.data,
            }
          );

          setError(mensaje);

          throw err;
        }
      },
      [cargarResenas]
    );

  // =========================
  // Editar reseña
  // =========================

  const editarResena =
    useCallback(
      async (
        resenaId,
        datosActualizados
      ) => {
        try {
          setError(null);

          const actualizada =
            await actualizarResena(
              resenaId,
              datosActualizados
            );

          setResenas(
            (listaAnterior) =>
              listaAnterior.map(
                (resena) =>
                  resena.id ===
                  resenaId
                    ? actualizada
                    : resena
              )
          );

          return actualizada;
        } catch (err) {
          const mensaje =
            obtenerMensajeError(err);

          setError(mensaje);

          throw err;
        }
      },
      []
    );

  // =========================
  // Eliminar reseña
  // =========================

  const borrarResena =
    useCallback(
      async (resenaId) => {
        try {
          setError(null);

          await eliminarResena(
            resenaId
          );

          setResenas(
            (listaAnterior) =>
              listaAnterior.filter(
                (resena) =>
                  resena.id !==
                  resenaId
              )
          );

          return true;
        } catch (err) {
          const mensaje =
            obtenerMensajeError(err);

          setError(mensaje);

          throw err;
        }
      },
      []
    );

  // =========================
  // Limpiar error
  // =========================

  const limpiarError =
    useCallback(() => {
      setError(null);
    }, []);

  // =========================
  // Carga inicial
  // =========================

  useEffect(() => {
    cargarResenas();
  }, [cargarResenas]);

  return (
    <ResenaContext.Provider
      value={{
        resenas,
        loading,
        error,

        cargarResenas,
        cargarResenasPedido,
        agregarResena,
        editarResena,
        borrarResena,
        limpiarError,
      }}
    >
      {children}
    </ResenaContext.Provider>
  );
}