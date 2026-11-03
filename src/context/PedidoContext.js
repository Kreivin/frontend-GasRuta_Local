import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  crearPedido as crearPedidoServicio,
  obtenerPedidos,
  obtenerPedidosUsuario,
  actualizarPedido as actualizarPedidoServicio,
  actualizarEstadoPedido as actualizarEstadoPedidoServicio,
  eliminarPedido as eliminarPedidoServicio,
} from "../services/pedidoService";

export const PedidoContext =
  createContext();

export function PedidoProvider({
  children,
}) {
  const [pedidos, setPedidos] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  // =========================
  // Obtener mensaje de error
  // =========================

  const obtenerMensajeError = (
    err
  ) => {
    return (
      err.response?.data?.mensaje ||
      err.response?.data?.error ||
      err.message ||
      "Ocurrió un error con los pedidos."
    );
  };

  // =========================
  // Cargar todos los pedidos
  // =========================

  const cargarPedidos =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const lista =
          await obtenerPedidos();

        const pedidosObtenidos =
          Array.isArray(lista)
            ? lista
            : [];

        setPedidos(
          pedidosObtenidos
        );

        return pedidosObtenidos;
      } catch (err) {
        const mensaje =
          obtenerMensajeError(err);

        console.log(
          "Error cargando pedidos:",
          {
            mensaje,
            estado:
              err.response?.status,
            datos:
              err.response?.data,
          }
        );

        setError(mensaje);
        setPedidos([]);

        return [];
      } finally {
        setLoading(false);
      }
    }, []);

  // =========================
  // Cargar pedidos del usuario
  // =========================

  const cargarPedidosUsuario =
    useCallback(async (usuarioId) => {
      if (!usuarioId) {
        const mensaje =
          "No se encontró el usuario autenticado.";

        setError(mensaje);

        return [];
      }

      try {
        setLoading(true);
        setError(null);

        const lista =
          await obtenerPedidosUsuario(
            usuarioId
          );

        const pedidosUsuario =
          Array.isArray(lista)
            ? lista
            : [];

        setPedidos(
          pedidosUsuario
        );

        return pedidosUsuario;
      } catch (err) {
        const mensaje =
          obtenerMensajeError(err);

        console.log(
          "Error cargando pedidos del usuario:",
          {
            usuarioId,
            mensaje,
            estado:
              err.response?.status,
            datos:
              err.response?.data,
          }
        );

        setError(mensaje);
        setPedidos([]);

        return [];
      } finally {
        setLoading(false);
      }
    }, []);

  // =========================
  // Crear pedido
  // =========================

  const crearPedido =
    useCallback(async (datos) => {
      try {
        setError(null);

        console.log(
          "PedidoContext enviando:",
          datos
        );

        const resultado =
          await crearPedidoServicio(
            datos
          );

        console.log(
          "Pedido creado:",
          resultado
        );

        const pedidoCreado =
          resultado?.pedido || resultado;

        if (pedidoCreado?.id) {
          setPedidos(
            (listaAnterior) => [
              pedidoCreado,
              ...listaAnterior.filter(
                (pedido) =>
                  pedido.id !==
                  pedidoCreado.id
              ),
            ]
          );
        }

        return resultado;
      } catch (err) {
        const mensaje =
          obtenerMensajeError(err);

        console.log(
          "Error creando pedido:",
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
    }, []);

  // Nombre compatible con código anterior
  const crearNuevoPedido =
    crearPedido;

  // Nombre compatible con otras pantallas
  const agregarPedido =
    crearPedido;

  // =========================
  // Actualizar pedido
  // =========================

  const actualizarPedido =
    useCallback(
      async (id, datos) => {
        try {
          setError(null);

          const resultado =
            await actualizarPedidoServicio(
              id,
              datos
            );

          const actualizado =
            resultado?.pedido ||
            resultado;

          setPedidos(
            (listaAnterior) =>
              listaAnterior.map(
                (pedido) =>
                  pedido.id === id
                    ? {
                        ...pedido,
                        ...actualizado,
                        id,
                      }
                    : pedido
              )
          );

          return resultado;
        } catch (err) {
          setError(
            obtenerMensajeError(err)
          );

          throw err;
        }
      },
      []
    );

  // Nombre compatible con código anterior
  const editarPedido =
    actualizarPedido;

  // =========================
  // Actualizar estado
  // =========================

  const actualizarEstadoPedido =
    useCallback(
      async (id, estado) => {
        try {
          setError(null);

          const resultado =
            await actualizarEstadoPedidoServicio(
              id,
              estado
            );

          setPedidos(
            (listaAnterior) =>
              listaAnterior.map(
                (pedido) =>
                  pedido.id === id
                    ? {
                        ...pedido,
                        estado,
                      }
                    : pedido
              )
          );

          return resultado;
        } catch (err) {
          setError(
            obtenerMensajeError(err)
          );

          throw err;
        }
      },
      []
    );

  // Nombre utilizado por VistaAdminScreen
  const cambiarEstado =
    actualizarEstadoPedido;

  // Nombre compatible con otras pantallas
  const cambiarEstadoPedido =
    actualizarEstadoPedido;

  // =========================
  // Cancelar pedido
  // =========================

  const cancelarPedido =
    useCallback(
      async (id) => {
        return actualizarEstadoPedido(
          id,
          "cancelado"
        );
      },
      [actualizarEstadoPedido]
    );

  // =========================
  // Eliminar pedido
  // =========================

  const eliminarPedido =
    useCallback(async (id) => {
      try {
        setError(null);

        const resultado =
          await eliminarPedidoServicio(
            id
          );

        setPedidos(
          (listaAnterior) =>
            listaAnterior.filter(
              (pedido) =>
                pedido.id !== id
            )
        );

        return resultado;
      } catch (err) {
        setError(
          obtenerMensajeError(err)
        );

        throw err;
      }
    }, []);

  // Nombre utilizado por VistaAdminScreen
  const borrarPedido =
    eliminarPedido;

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
    cargarPedidos();
  }, [cargarPedidos]);

  return (
    <PedidoContext.Provider
      value={{
        pedidos,
        loading,
        error,

        cargarPedidos,
        cargarPedidosUsuario,

        crearPedido,
        crearNuevoPedido,
        agregarPedido,

        actualizarPedido,
        editarPedido,

        actualizarEstadoPedido,
        cambiarEstadoPedido,
        cambiarEstado,
        cancelarPedido,

        eliminarPedido,
        borrarPedido,

        limpiarError,
      }}
    >
      {children}
    </PedidoContext.Provider>
  );
}