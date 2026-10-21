import React, { createContext, useState, useEffect, useCallback } from "react";
import {
  crearPedido,
  obtenerPedidos,
  actualizarEstadoPedido,
  eliminarPedido,
  escucharPedidos,
} from "../services/pedidoService";

export const PedidoContext = createContext();

export function PedidoProvider({ children }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setLoading(true);
      const unsub = escucharPedidos((lista) => {
        setPedidos(lista);
        setLoading(false);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Error al escuchar pedidos:", e.message);
      setLoading(false);
    }
  }, []);

  const crearNuevoPedido = useCallback(async (datosPedido) => {
    try {
      setError(null);
      const res = await crearPedido(datosPedido);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const cambiarEstado = useCallback(async (id, nuevoEstado, usuarioId) => {
    try {
      setError(null);
      await actualizarEstadoPedido(id, nuevoEstado, usuarioId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const borrarPedido = useCallback(async (id) => {
    try {
      setError(null);
      await eliminarPedido(id);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return (
    <PedidoContext.Provider
      value={{
        pedidos,
        loading,
        error,
        crearNuevoPedido,
        cambiarEstado,
        borrarPedido,
      }}
    >
      {children}
    </PedidoContext.Provider>
  );
}
