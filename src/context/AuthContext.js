import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  auth,
} from "../services/firebaseConfig";

import {
  obtenerUsuarios,
} from "../services/usuarioService";

export const AuthContext =
  createContext();

export function AuthProvider({
  children,
}) {
  const [
    usuarios,
    setUsuarios,
  ] = useState([]);

  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  const [token, setToken] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);

  const [error, setError] =
    useState(null);

  // =========================
  // Obtener mensaje de error
  // =========================

  const obtenerMensajeError = (err) => {
    return (
      err.response?.data?.mensaje ||
      err.response?.data?.error ||
      err.message ||
      "Ocurrió un error con los usuarios"
    );
  };

  // =========================
  // Cargar usuarios
  // =========================

  const cargarUsuarios =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const lista =
          await obtenerUsuarios();

        setUsuarios(
          Array.isArray(lista)
            ? lista
            : []
        );

        /*
         * Si ya existe una sesión, actualizamos
         * sus datos sin cambiar de identidad.
         */
        setCurrentUser(
          (usuarioActual) => {
            if (!usuarioActual) {
              return null;
            }

            const actualizado =
              lista.find(
                (usuario) =>
                  usuario.id ===
                    usuarioActual.id ||
                  usuario.uid ===
                    usuarioActual.uid
              );

            return (
              actualizado ||
              usuarioActual
            );
          }
        );

        return lista;
      } catch (err) {
        const mensaje =
          obtenerMensajeError(err);

        console.log(
          "Error cargando usuarios:",
          {
            mensaje,
            estado:
              err.response?.status,
            datos:
              err.response?.data,
          }
        );

        setError(mensaje);
        setUsuarios([]);

        return [];
      } finally {
        setLoading(false);
      }
    }, []);

  // =========================
  // Guardar sesión autenticada
  // =========================

  const establecerSesion =
    useCallback(
      ({
        usuario,
        token: nuevoToken,
      }) => {
        setCurrentUser(usuario);
        setToken(nuevoToken);

        /*
         * Si el usuario autenticado todavía no está
         * en la lista, se agrega temporalmente.
         */
        setUsuarios(
          (listaAnterior) => {
            const existe =
              listaAnterior.some(
                (elemento) =>
                  elemento.id ===
                    usuario.id ||
                  elemento.uid ===
                    usuario.uid
              );

            if (existe) {
              return listaAnterior.map(
                (elemento) =>
                  elemento.id ===
                    usuario.id ||
                  elemento.uid ===
                    usuario.uid
                    ? usuario
                    : elemento
              );
            }

            return [
              usuario,
              ...listaAnterior,
            ];
          }
        );
      },
      []
    );

  // =========================
  // Actualizar usuario actual
  // =========================

  const actualizarSesion =
    useCallback((usuario) => {
      setCurrentUser(usuario);

      setUsuarios(
        (listaAnterior) =>
          listaAnterior.map(
            (elemento) =>
              elemento.id ===
                usuario.id ||
              elemento.uid ===
                usuario.uid
                ? usuario
                : elemento
          )
      );
    }, []);

  // =========================
  // Seleccionar usuario
  // =========================

  /*
   * Se conserva temporalmente para no romper
   * componentes antiguos.
   *
   * No debe utilizarse como método real para
   * cambiar de cuenta, porque no cambia la
   * identidad de Firebase Authentication.
   */
  const seleccionarUsuario =
    useCallback((usuario) => {
      console.warn(
        "seleccionarUsuario es una función temporal. No cambia la cuenta autenticada en Firebase."
      );

      setCurrentUser(usuario);
    }, []);

  // =========================
  // Cerrar sesión
  // =========================

  const logout =
    useCallback(async () => {
      try {
        await signOut(auth);
      } finally {
        setCurrentUser(null);
        setToken(null);
      }
    }, []);

  // =========================
  // Observar Firebase Auth
  // =========================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (usuarioFirebase) => {
          /*
           * No borramos currentUser al iniciar
           * el observador si LoginScreen está
           * terminando de obtener el perfil.
           */
          if (!usuarioFirebase) {
            setCurrentUser(null);
            setToken(null);
          }

          setAuthLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  // =========================
  // Cargar lista inicial
  // =========================

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  return (
    <AuthContext.Provider
      value={{
        usuarios,
        currentUser,
        token,

        loading,
        authLoading,
        error,

        cargarUsuarios,
        establecerSesion,
        actualizarSesion,
        seleccionarUsuario,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}