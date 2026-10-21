import React, { createContext, useState, useEffect } from "react";
import {
  obtenerUsuarios,
  autenticarUsuario,
  escucharUsuarios,
} from "../services/usuarioService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuarios, setUsuarios] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    id: "dehkUp2gjgVT0piTBKfX",
    Usuariokey: "US0003",
    Nombre: "Carlos Antonio López",
    Correo: "carlos@gmail.com",
    Telefono: "8888-1234",
    Rol: "Cliente",
    Direccion: "Juigalpa, barrio satuario",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const unsub = escucharUsuarios((lista) => {
        setUsuarios(lista);
        // Si el usuario actual está en la lista actualizada, actualizarlo
        if (lista.length > 0) {
          setCurrentUser((prev) => {
            const found = lista.find((u) => u.id === prev?.id);
            return found || prev || lista[0];
          });
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn("Error al escuchar usuarios:", e.message);
    }
  }, []);

  const login = async (correo, contrasena) => {
    try {
      setLoading(true);
      setError(null);
      const res = await autenticarUsuario(correo, contrasena);
      if (res.exito) {
        setCurrentUser(res.usuario);
        return { exito: true };
      } else {
        setError(res.mensaje);
        return { exito: false, mensaje: res.mensaje };
      }
    } catch (err) {
      setError(err.message);
      return { exito: false, mensaje: err.message };
    } finally {
      setLoading(false);
    }
  };

  const seleccionarUsuario = (usuario) => {
    setCurrentUser(usuario);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usuarios,
        loading,
        error,
        login,
        seleccionarUsuario,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
