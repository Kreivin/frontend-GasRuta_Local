import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

export const PedidoContext = createContext();

export function PedidoProvider({ children }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const obtenerMensajeError = (err) => {
    return (
      err.response?.data?.mensaje ||
      err.response?.data?.error ||
      err.message ||
      "Ocurrió un error con los pedidos"
    );
  };

  // =========================
  // Cargar todos los pedidos
  // =========================
  const cargarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const respuesta = await api.get("/pedidos");

      const lista = Array.isArray(respuesta.data)
        ? respuesta.data
        : respuesta.data.pedidos || [];

      setPedidos(lista);

      return lista;
    } catch (err) {
      const mensaje = obtenerMensajeError(err);

      console.log("Error cargando pedidos:", {
        mensaje,
        estado: err.response?.status,
        datos: err.response?.data,
      });

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
  const crearPedido = useCallback(
    async (datos) => {
      try {
        setError(null);

        console.log(
          "PedidoContext enviando al backend:",
          datos
        );

        const respuesta = await api.post(
          "/pedidos",
          datos
        );

        console.log(
          "PedidoContext respuesta:",
          respuesta.data
        );

        const pedidoCreado = {
          id: respuesta.data.id,
          ...(respuesta.data.pedido || {}),
        };

        setPedidos((listaAnterior) => [
          pedidoCreado,
          ...listaAnterior,
        ]);

        return {
          ...respuesta.data,
          pedido: pedidoCreado,
        };
      } catch (err) {
        const mensaje = obtenerMensajeError(err);

        console.log("Error creando pedido:", {
          mensaje,
          estado: err.response?.status,
          datos: err.response?.data,
          ruta: err.config?.url,
        });

        setError(mensaje);

        throw err;
      }
    },
    []
  );

  // =========================
  // Actualizar pedido
  // =========================
  const actualizarPedido = useCallback(
    async (id, datos) => {
      try {
        setError(null);

        const respuesta = await api.patch(
          `/pedidos/${id}`,
          datos
        );

        await cargarPedidos();

        return respuesta.data;
      } catch (err) {
        setError(obtenerMensajeError(err));
        throw err;
      }
    },
    [cargarPedidos]
  );

  // =========================
  // Actualizar estado
  // =========================
  const actualizarEstadoPedido = useCallback(
    async (id, estado) => {
      try {
        setError(null);

        const respuesta = await api.patch(
          `/pedidos/${id}/estado`,
          {
            estado,
          }
        );

        await cargarPedidos();

        return respuesta.data;
      } catch (err) {
        setError(obtenerMensajeError(err));
        throw err;
      }
    },
    [cargarPedidos]
  );

  // =========================
  // Eliminar pedido
  // =========================
  const eliminarPedido = useCallback(
    async (id) => {
      try {
        setError(null);

        const respuesta = await api.delete(
          `/pedidos/${id}`
        );

        setPedidos((listaAnterior) =>
          listaAnterior.filter(
            (pedido) => pedido.id !== id
          )
        );

        return respuesta.data;
      } catch (err) {
        setError(obtenerMensajeError(err));
        throw err;
      }
    },
    []
  );

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
        crearPedido,
        actualizarPedido,
        actualizarEstadoPedido,
        eliminarPedido,
      }}
    >
      {children}
    </PedidoContext.Provider>
  );
}