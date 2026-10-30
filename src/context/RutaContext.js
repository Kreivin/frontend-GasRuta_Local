import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  crearRuta,
  obtenerTodasLasRutas,
  actualizarRuta,
  eliminarRuta,
  iniciarRuta,
  finalizarRuta,
  actualizarUbicacionRuta,
  escucharUbicacionRuta,
  iniciarRastreoRepartidor,
  abrirNavegacionGoogleMaps,
  abrirEnGoogleMaps,
  compartirUbicacionWhatsApp,
} from "../services/rutaService";

export const RutaContext =
  createContext();

export function RutaProvider({
  children,
}) {
  const [rutas, setRutas] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const obtenerMensaje = (err) => {
    return (
      err.response?.data?.mensaje ||
      err.response?.data?.error ||
      err.message ||
      "Ocurrió un error con las rutas"
    );
  };

  // =========================
  // Cargar rutas
  // =========================

  const cargarRutas =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const lista =
          await obtenerTodasLasRutas();

        setRutas(
          Array.isArray(lista)
            ? lista
            : []
        );

        return lista;
      } catch (err) {
        const mensaje =
          obtenerMensaje(err);

        console.log(
          "Error cargando rutas:",
          {
            mensaje,
            estado:
              err.response?.status,
            datos:
              err.response?.data,
          }
        );

        setError(mensaje);
        setRutas([]);

        return [];
      } finally {
        setLoading(false);
      }
    }, []);

  // =========================
  // Agregar ruta
  // =========================

  const agregarRuta =
    useCallback(
      async (rutaData) => {
        try {
          setError(null);

          const nuevaRuta =
            await crearRuta(rutaData);

          setRutas(
            (listaAnterior) => [
              nuevaRuta,
              ...listaAnterior,
            ]
          );

          await cargarRutas();

          return nuevaRuta;
        } catch (err) {
          const mensaje =
            obtenerMensaje(err);

          setError(mensaje);

          throw err;
        }
      },
      [cargarRutas]
    );

  // =========================
  // Editar ruta
  // =========================

  const editarRuta =
    useCallback(
      async (
        rutaId,
        datosActualizados
      ) => {
        try {
          setError(null);

          const rutaActualizada =
            await actualizarRuta(
              rutaId,
              datosActualizados
            );

          setRutas(
            (listaAnterior) =>
              listaAnterior.map(
                (ruta) =>
                  ruta.id === rutaId
                    ? rutaActualizada
                    : ruta
              )
          );

          await cargarRutas();

          return rutaActualizada;
        } catch (err) {
          setError(
            obtenerMensaje(err)
          );

          throw err;
        }
      },
      [cargarRutas]
    );

  // =========================
  // Borrar ruta
  // =========================

  const borrarRuta =
    useCallback(async (rutaId) => {
      try {
        setError(null);

        await eliminarRuta(rutaId);

        setRutas(
          (listaAnterior) =>
            listaAnterior.filter(
              (ruta) =>
                ruta.id !== rutaId
            )
        );

        return true;
      } catch (err) {
        setError(
          obtenerMensaje(err)
        );

        throw err;
      }
    }, []);

  // =========================
  // Iniciar una ruta
  // =========================

  const comenzarRuta =
    useCallback(
      async (rutaId) => {
        try {
          setError(null);

          const actualizada =
            await iniciarRuta(rutaId);

          await cargarRutas();

          return actualizada;
        } catch (err) {
          setError(
            obtenerMensaje(err)
          );

          throw err;
        }
      },
      [cargarRutas]
    );

  // =========================
  // Finalizar una ruta
  // =========================

  const completarRuta =
    useCallback(
      async (rutaId) => {
        try {
          setError(null);

          const actualizada =
            await finalizarRuta(
              rutaId
            );

          await cargarRutas();

          return actualizada;
        } catch (err) {
          setError(
            obtenerMensaje(err)
          );

          throw err;
        }
      },
      [cargarRutas]
    );

  // =========================
  // Actualizar GPS
  // =========================

  const actualizarUbicacion =
    useCallback(
      async (rutaId, coords) => {
        try {
          setError(null);

          const rutaActualizada =
            await actualizarUbicacionRuta(
              rutaId,
              coords
            );

          setRutas(
            (listaAnterior) =>
              listaAnterior.map(
                (ruta) =>
                  ruta.id === rutaId
                    ? rutaActualizada
                    : ruta
              )
          );

          return rutaActualizada;
        } catch (err) {
          setError(
            obtenerMensaje(err)
          );

          throw err;
        }
      },
      []
    );

  // =========================
  // Escuchar ubicación
  // =========================

  const escucharUbicacion =
    useCallback(
      (rutaId, callback) => {
        return escucharUbicacionRuta(
          rutaId,
          callback
        );
      },
      []
    );

  // =========================
  // Iniciar rastreo
  // =========================

  const iniciarRastreo =
    useCallback(
      async (
        rutaId,
        onUpdate
      ) => {
        return iniciarRastreoRepartidor(
          rutaId,
          onUpdate
        );
      },
      []
    );

  const refrescarRutas =
    useCallback(async () => {
      return cargarRutas();
    }, [cargarRutas]);

  const limpiarError =
    useCallback(() => {
      setError(null);
    }, []);

  useEffect(() => {
    cargarRutas();
  }, [cargarRutas]);

  return (
    <RutaContext.Provider
      value={{
        rutas,
        loading,
        error,

        cargarRutas,
        refrescarRutas,
        agregarRuta,
        editarRuta,
        borrarRuta,

        comenzarRuta,
        completarRuta,

        actualizarUbicacion,
        escucharUbicacion,
        iniciarRastreo,

        abrirNavegacionGoogleMaps,
        abrirEnGoogleMaps,
        compartirUbicacionWhatsApp,

        limpiarError,
      }}
    >
      {children}
    </RutaContext.Provider>
  );
}