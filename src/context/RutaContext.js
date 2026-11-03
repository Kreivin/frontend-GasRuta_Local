import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  crearRuta,
  obtenerTodasLasRutas,
  obtenerRutaPorPedido,
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

  // =========================
  // Obtener mensaje de error
  // =========================

  const obtenerMensaje = (err) => {
    return (
      err.response?.data?.mensaje ||
      err.response?.data?.error ||
      err.message ||
      "Ocurrió un error con las rutas."
    );
  };

  // =========================
  // Cargar todas las rutas
  // =========================

  const cargarRutas =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const lista =
          await obtenerTodasLasRutas();

        const rutasObtenidas =
          Array.isArray(lista)
            ? lista
            : [];

        setRutas(
          rutasObtenidas
        );

        return rutasObtenidas;
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
  // Cargar rutas de varios pedidos
  // =========================

  const cargarRutasPedidos =
    useCallback(
      async (pedidosUsuario) => {
        try {
          setLoading(true);
          setError(null);

          if (
            !Array.isArray(
              pedidosUsuario
            ) ||
            pedidosUsuario.length === 0
          ) {
            setRutas([]);
            return [];
          }

          const pedidosValidos =
            pedidosUsuario.filter(
              (pedido) =>
                pedido?.id
            );

          const resultados =
            await Promise.all(
              pedidosValidos.map(
                async (pedido) => {
                  try {
                    return await obtenerRutaPorPedido(
                      pedido.id
                    );
                  } catch (err) {
                    console.log(
                      `No se pudo cargar la ruta del pedido ${pedido.id}:`,
                      obtenerMensaje(err)
                    );

                    return [];
                  }
                }
              )
            );

          const rutasEncontradas =
            resultados
              .flat()
              .filter(
                (ruta) =>
                  ruta?.id
              );

          /*
           * Evita rutas duplicadas.
           */
          const rutasUnicas =
            Array.from(
              new Map(
                rutasEncontradas.map(
                  (ruta) => [
                    ruta.id,
                    ruta,
                  ]
                )
              ).values()
            );

          setRutas(rutasUnicas);

          return rutasUnicas;
        } catch (err) {
          const mensaje =
            obtenerMensaje(err);

          console.log(
            "Error cargando rutas de los pedidos:",
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
      },
      []
    );

  // =========================
  // Agregar ruta
  // =========================

  const agregarRuta =
    useCallback(
      async (rutaData) => {
        try {
          setError(null);

          const nuevaRuta =
            await crearRuta(
              rutaData
            );

          setRutas(
            (listaAnterior) => [
              nuevaRuta,
              ...listaAnterior.filter(
                (ruta) =>
                  ruta.id !==
                  nuevaRuta.id
              ),
            ]
          );

          return nuevaRuta;
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
                    ? {
                        ...ruta,
                        ...rutaActualizada,
                        id: rutaId,
                      }
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
  // Borrar ruta
  // =========================

  const borrarRuta =
    useCallback(async (rutaId) => {
      try {
        setError(null);

        await eliminarRuta(
          rutaId
        );

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
  // Iniciar ruta
  // =========================

  const comenzarRuta =
    useCallback(
      async (rutaId) => {
        try {
          setError(null);

          const actualizada =
            await iniciarRuta(
              rutaId
            );

          setRutas(
            (listaAnterior) =>
              listaAnterior.map(
                (ruta) =>
                  ruta.id === rutaId
                    ? {
                        ...ruta,
                        ...actualizada,
                        id: rutaId,
                      }
                    : ruta
              )
          );

          return actualizada;
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
  // Finalizar ruta
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

          setRutas(
            (listaAnterior) =>
              listaAnterior.map(
                (ruta) =>
                  ruta.id === rutaId
                    ? {
                        ...ruta,
                        ...actualizada,
                        id: rutaId,
                      }
                    : ruta
              )
          );

          return actualizada;
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
  // Actualizar ubicación
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
                    ? {
                        ...ruta,
                        ...rutaActualizada,
                        id: rutaId,
                      }
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
  // Iniciar rastreo GPS
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

  // =========================
  // Refrescar
  // =========================

  const refrescarRutas =
    useCallback(async () => {
      return cargarRutas();
    }, [cargarRutas]);

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
    cargarRutas();
  }, [cargarRutas]);

  return (
    <RutaContext.Provider
      value={{
        rutas,
        loading,
        error,

        cargarRutas,
        cargarRutasPedidos,
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