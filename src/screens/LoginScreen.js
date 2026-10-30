import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../services/firebaseConfig";
import api from "../services/api";

import {
  AuthContext,
} from "../context/AuthContext";

export default function LoginScreen({
  navigation,
  route,
}) {
  const authContext = useContext(AuthContext);

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] =
    useState("");

  const [
    mostrarContrasena,
    setMostrarContrasena,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  // =========================
  // Recibir correo del registro
  // =========================

  useEffect(() => {
    const correoRegistrado =
      route?.params?.correoRegistrado;

    if (correoRegistrado) {
      setCorreo(correoRegistrado);

      /*
       * Limpiamos el parámetro para evitar
       * que vuelva a establecerse continuamente.
       */
      navigation.setParams({
        correoRegistrado: undefined,
      });
    }
  }, [
    route?.params?.correoRegistrado,
    navigation,
  ]);

  // =========================
  // Validar correo
  // =========================

  const correoValido = (valor) => {
    const expresion =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return expresion.test(
      valor.trim()
    );
  };

  // =========================
  // Traducir errores Firebase
  // =========================

  const obtenerMensajeFirebase = (
    error
  ) => {
    switch (error.code) {
      case "auth/invalid-email":
        return "El correo electrónico no es válido.";

      case "auth/invalid-credential":
        return "Correo o contraseña incorrectos.";

      case "auth/user-not-found":
        return "No existe una cuenta con ese correo.";

      case "auth/wrong-password":
        return "La contraseña es incorrecta.";

      case "auth/user-disabled":
        return "Esta cuenta está deshabilitada.";

      case "auth/too-many-requests":
        return "Se realizaron demasiados intentos. Espera unos minutos.";

      case "auth/network-request-failed":
        return "No fue posible conectar con Firebase. Revisa tu conexión.";

      default:
        return (
          error.response?.data?.mensaje ||
          error.message ||
          "No fue posible iniciar sesión."
        );
    }
  };

  // =========================
  // Iniciar sesión
  // =========================

  const handleLogin = async () => {
    const correoLimpio = correo
      .trim()
      .toLowerCase();

    if (
      !correoLimpio ||
      !contrasena
    ) {
      Alert.alert(
        "Campos requeridos",
        "Ingresa tu correo y contraseña."
      );

      return;
    }

    if (!correoValido(correoLimpio)) {
      Alert.alert(
        "Correo no válido",
        "Ingresa una dirección de correo válida."
      );

      return;
    }

    try {
      setLoading(true);

      // 1. Autenticar con Firebase
      const credencial =
        await signInWithEmailAndPassword(
          auth,
          correoLimpio,
          contrasena
        );

      // 2. Obtener token actualizado
      const token =
        await credencial.user.getIdToken(
          true
        );

      console.log(
        "Firebase Authentication correcto:",
        credencial.user.uid
      );

      // 3. Consultar perfil en el backend
      const respuestaPerfil =
        await api.get(
          "/auth/perfil",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      // 4. Extraer perfil
      const perfil =
        respuestaPerfil.data.usuario;

      if (!perfil) {
        throw new Error(
          "El backend no devolvió el perfil del usuario."
        );
      }

      console.log(
        "Perfil recibido:",
        {
          id: perfil.id,
          uid: perfil.uid,
          nombre: perfil.Nombre,
          correo: perfil.Correo,
          rol: perfil.Rol,
        }
      );

      // 5. Guardar sesión en AuthContext
      if (
        typeof authContext
          ?.establecerSesion ===
        "function"
      ) {
        authContext.establecerSesion({
          usuario: perfil,
          token,
        });
      } else if (
        typeof authContext
          ?.seleccionarUsuario ===
        "function"
      ) {
        authContext.seleccionarUsuario(
          perfil,
          token
        );
      } else if (
        typeof authContext
          ?.setCurrentUser ===
        "function"
      ) {
        authContext.setCurrentUser(
          perfil
        );
      } else {
        console.warn(
          "AuthContext no tiene una función para guardar la sesión."
        );
      }

      // 6. Todos entran por ahora a MainTabs
      navigation.replace(
        "MainTabs",
        {
          usuario: perfil,
          rol: perfil.Rol,
          token,
        }
      );
    } catch (error) {
      console.log(
        "Error de inicio de sesión:",
        {
          codigo: error.code,
          mensaje: error.message,
          estado:
            error.response?.status,
          datos:
            error.response?.data,
        }
      );

      /*
       * Si Firebase inició sesión pero el
       * backend falló, cerramos la sesión
       * incompleta.
       */
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch (
          errorCerrarSesion
        ) {
          console.log(
            "No se pudo cerrar la sesión parcial:",
            errorCerrarSesion.message
          );
        }
      }

      const mensaje =
        error.response?.data
          ?.mensaje ||
        obtenerMensajeFirebase(error);

      Alert.alert(
        "No se pudo iniciar sesión",
        mensaje
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Abrir registro
  // =========================

  const abrirRegistro = () => {
    navigation.navigate("Register");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContenido
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.phone}>
          <LinearGradient
            colors={[
              "#1F1B2E",
              "#4A2218",
            ]}
            style={styles.header}
          >
            <Text style={styles.logo}>
              🔥 GasRuta-Local
            </Text>

            <Text
              style={styles.subtitle}
            >
              Tu distribuidor de gas de
              confianza
            </Text>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.title}>
              Iniciar sesión
            </Text>

            <Text
              style={
                styles.description
              }
            >
              Ingresa tus credenciales
              para continuar
            </Text>

            <Text
              style={styles.inputLabel}
            >
              Correo electrónico
            </Text>

            <TextInput
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#999999"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="next"
              style={styles.input}
            />

            <Text
              style={styles.inputLabel}
            >
              Contraseña
            </Text>

            <View
              style={
                styles.passwordContainer
              }
            >
              <TextInput
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#999999"
                value={contrasena}
                onChangeText={
                  setContrasena
                }
                secureTextEntry={
                  !mostrarContrasena
                }
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={
                  handleLogin
                }
                style={
                  styles.passwordInput
                }
              />

              <TouchableOpacity
                style={
                  styles.showPasswordButton
                }
                onPress={() =>
                  setMostrarContrasena(
                    !mostrarContrasena
                  )
                }
                disabled={loading}
              >
                <Text
                  style={
                    styles.showPasswordText
                  }
                >
                  {mostrarContrasena
                    ? "Ocultar"
                    : "Ver"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              disabled={loading}
              onPress={() =>
                Alert.alert(
                  "Recuperar contraseña",
                  "Esta función se agregará posteriormente."
                )
              }
            >
              <Text
                style={styles.forgot}
              >
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                loading &&
                  styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Entrar
                </Text>
              )}
            </TouchableOpacity>

            <View
              style={
                styles.registerContainer
              }
            >
              <Text
                style={
                  styles.registerQuestion
                }
              >
                ¿No tienes una cuenta?
              </Text>

              <TouchableOpacity
                disabled={loading}
                onPress={abrirRegistro}
              >
                <Text
                  style={
                    styles.registerLink
                  }
                >
                  Crear una cuenta
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={
                styles.securityText
              }
            >
              Tu contraseña es administrada
              de forma segura por Firebase
              Authentication.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAEAEA",
  },

  scrollContenido: {
    flexGrow: 1,
    alignItems: "center",
  },

  phone: {
    width: 430,
    maxWidth: "100%",
    minHeight: "100%",
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: 230,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    color: "#FFBE85",
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },

  content: {
    flex: 1,
    padding: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1F1B2E",
    marginBottom: 5,
  },

  description: {
    color: "#777777",
    fontSize: 14,
    marginBottom: 24,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 6,
  },

  input: {
    minHeight: 58,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 15,
    color: "#222222",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  passwordContainer: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  passwordInput: {
    flex: 1,
    minHeight: 56,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#222222",
  },

  showPasswordButton: {
    minHeight: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  showPasswordText: {
    color: "#FF6B00",
    fontSize: 13,
    fontWeight: "700",
  },

  forgot: {
    textAlign: "right",
    color: "#FF6B00",
    marginTop: 12,
    marginBottom: 20,
  },

  button: {
    minHeight: 58,
    backgroundColor: "#FF6B00",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  registerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 6,
  },

  registerQuestion: {
    color: "#777777",
    fontSize: 14,
  },

  registerLink: {
    color: "#FF6B00",
    fontSize: 14,
    fontWeight: "700",
  },

  securityText: {
    color: "#999999",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 28,
    paddingHorizontal: 12,
  },
});