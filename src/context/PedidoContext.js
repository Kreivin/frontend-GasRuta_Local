import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  crearPedido,
  obtenerPedidos,
  obtenerPedido,
  obtenerPedidosUsuario,
  actualizarPedido,
  actualizarEstadoPedido,
  eliminarPedido,
} from "../services/pedidoService";

export const PedidoContext = createContext();

export function PedidoProvider({ children }) {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // Cargar todos los pedidos
  // =========================
  const cargarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const lista = await obtenerPedidos();

      setPedidos(
        Array.isArray(lista) ? lista : []
      );

      return lista;
    } catch (err) {
      console.error(
        "Error al cargar pedidos:",
        err.message
      );

      setError(
        err.message ||
          "No se pudieron cargar los pedidos."
      );

      setPedidos([]);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // Cargar pedido por ID
  // =========================
  const cargarPedidoPorId = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          throw new Error(
            "El ID del pedido es obligatorio."
          );
        }

        const pedido = await obtenerPedido(id);

        setPedidoSeleccionado(pedido);

        return pedido;
      } catch (err) {
        console.error(
          "Error al obtener pedido:",
          err.message
        );

        setError(
          err.message ||
            "No se pudo obtener el pedido."
        );

        setPedidoSeleccionado(null);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // =========================
  // Cargar pedidos de usuario
  // =========================
  const cargarPedidosUsuario = useCallback(
    async (usuarioId) => {
      try {
        setLoading(true);
        setError(null);

        if (!usuarioId) {
          throw new Error(
            "El ID del usuario es obligatorio."
          );
        }

        const lista =
          await obtenerPedidosUsuario(usuarioId);

        setPedidos(
          Array.isArray(lista) ? lista : []
        );

        return lista;
      } catch (err) {
        console.error(
          "Error al cargar pedidos del usuario:",
          err.message
        );

        setError(
          err.message ||
            "No se pudieron cargar los pedidos del usuario."
        );

        setPedidos([]);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // =========================
  // Crear pedido
  // =========================
  const crearNuevoPedido = useCallback(
    async (datosPedido) => {
      try {
        setLoading(true);
        setError(null);

        const resultado =
          await crearPedido(datosPedido);

        // Volver a consultar para mantener la lista actualizada
        await cargarPedidos();

        return resultado;
      } catch (err) {
        console.error(
          "Error al crear pedido:",
          err.message
        );

        setError(
          err.message ||
            "No se pudo crear el pedido."
        );

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cargarPedidos]
  );

  // =========================
  // Editar pedido
  // =========================
  const editarPedido = useCallback(
    async (id, datosActualizados) => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          throw new Error(
            "El ID del pedido es obligatorio."
          );
        }

        const resultado = await actualizarPedido(
          id,
          datosActualizados
        );

        await cargarPedidos();

        if (pedidoSeleccionado?.id === id) {
          const pedidoActualizado =
            resultado?.pedido || resultado;

          setPedidoSeleccionado(
            pedidoActualizado
          );
        }

        return resultado;
      } catch (err) {
        console.error(
          "Error al actualizar pedido:",
          err.message
        );

        setError(
          err.message ||
            "No se pudo actualizar el pedido."
        );

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cargarPedidos, pedidoSeleccionado]
  );

  // =========================
  // Cambiar estado
  // =========================
  const cambiarEstado = useCallback(
    async (id, nuevoEstado) => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          throw new Error(
            "El ID del pedido es obligatorio."
          );
        }

        if (!nuevoEstado) {
          throw new Error(
            "El nuevo estado es obligatorio."
          );
        }

        const resultado =
          await actualizarEstadoPedido(
            id,
            nuevoEstado
          );

        // Actualización local inmediata
        setPedidos((pedidosActuales) =>
          pedidosActuales.map((pedido) =>
            pedido.id === id
              ? {
                  ...pedido,
                  estado: nuevoEstado,
                }
              : pedido
          )
        );

        if (pedidoSeleccionado?.id === id) {
          setPedidoSeleccionado(
            (pedidoActual) => ({
              ...pedidoActual,
              estado: nuevoEstado,
            })
          );
        }

        return resultado;
      } catch (err) {
        console.error(
          "Error al cambiar estado:",
          err.message
        );

        setError(
          err.message ||
            "No se pudo cambiar el estado."
        );

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pedidoSeleccionado]
  );

  // =========================
  // Eliminar pedido
  // =========================
  const borrarPedido = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          throw new Error(
            "El ID del pedido es obligatorio."
          );
        }

        const resultado =
          await eliminarPedido(id);

        // Retirar inmediatamente de la lista local
        setPedidos((pedidosActuales) =>
          pedidosActuales.filter(
            (pedido) => pedido.id !== id
          )
        );

        if (pedidoSeleccionado?.id === id) {
          setPedidoSeleccionado(null);
        }

        return resultado;
      } catch (err) {
        console.error(
          "Error al eliminar pedido:",
          err.message
        );

        setError(
          err.message ||
            "No se pudo eliminar el pedido."
        );

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pedidoSeleccionado]
  );

  // =========================
  // Limpiar errores
  // =========================
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // =========================
  // Limpiar pedido seleccionado
  // =========================
  const limpiarPedidoSeleccionado =
    useCallback(() => {
      setPedidoSeleccionado(null);
    }, []);

  // Cargar pedidos cuando se monta el Provider
  useEffect(() => {
    cargarPedidos().catch(() => {
      // El mensaje ya queda guardado en error.
    });
  }, [cargarPedidos]);

  return (
    <PedidoContext.Provider
      value={{
        // Estados
        pedidos,
        pedidoSeleccionado,
        loading,
        error,

        // Consultas
        cargarPedidos,
        cargarPedidoPorId,
        cargarPedidosUsuario,

        // CRUD
        crearNuevoPedido,
        editarPedido,
        cambiarEstado,
        borrarPedido,

        // Utilidades
        limpiarError,
        limpiarPedidoSeleccionado,
      }}
    >
      {children}
    </PedidoContext.Provider>
  );
}