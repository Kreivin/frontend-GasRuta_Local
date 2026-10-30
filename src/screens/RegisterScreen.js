import React, {
  useContext,
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
import { Ionicons } from "@expo/vector-icons";

import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../services/firebaseConfig";
import api from "../services/api";

import {
  AuthContext,
} from "../context/AuthContext";

export default function RegisterScreen({
  navigation,
}) {
  const authContext =
    useContext(AuthContext);

  const [nombre, setNombre] =
    useState("");

  const [correo, setCorreo] =
    useState("");

  const [telefono, setTelefono] =
    useState("");

  const [direccion, setDireccion] =
    useState("");

  const [contrasena, setContrasena] =
    useState("");

  const [
    confirmarContrasena,
    setConfirmarContrasena,
  ] = useState("");

  const [
    mostrarContrasena,
    setMostrarContrasena,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

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
  // Validar teléfono
  // =========================

  const telefonoValido = (valor) => {
    const numeros = valor.replace(
      /\D/g,
      ""
    );

    return numeros.length === 8;
  };

  // =========================
  // Formatear teléfono
  // =========================

  const manejarTelefono = (valor) => {
    const soloNumeros = valor.replace(
      /\D/g,
      ""
    );

    const limitado =
      soloNumeros.slice(0, 8);

    if (limitado.length > 4) {
      setTelefono(
        `${limitado.slice(
          0,
          4
        )}-${limitado.slice(4)}`
      );
    } else {
      setTelefono(limitado);
    }
  };

  // =========================
  // Traducir errores
  // =========================

  const obtenerMensajeRegistro = (
    error
  ) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Ya existe una cuenta con ese correo.";

      case "auth/invalid-email":
        return "El correo electrónico no es válido.";

      case "auth/weak-password":
        return "La contraseña es demasiado débil.";

      case "auth/invalid-credential":
        return "La cuenta fue creada, pero no se pudo iniciar sesión automáticamente.";

      case "auth/network-request-failed":
        return "No fue posible conectar con Firebase. Revisa tu conexión.";

      case "auth/too-many-requests":
        return "Se realizaron demasiados intentos. Espera unos minutos.";

      default:
        return (
          error.response?.data?.mensaje ||
          error.response?.data?.error ||
          error.message ||
          "No fue posible crear la cuenta."
        );
    }
  };

  // =========================
  // Crear cuenta
  // =========================

  const handleRegister = async () => {
    const nombreLimpio =
      nombre.trim();

    const correoLimpio =
      correo.trim().toLowerCase();

    const telefonoLimpio =
      telefono.trim();

    const direccionLimpia =
      direccion.trim();

    if (
      !nombreLimpio ||
      !correoLimpio ||
      !telefonoLimpio ||
      !direccionLimpia ||
      !contrasena ||
      !confirmarContrasena
    ) {
      Alert.alert(
        "Campos requeridos",
        "Completa todos los campos para crear tu cuenta."
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

    if (
      !telefonoValido(
        telefonoLimpio
      )
    ) {
      Alert.alert(
        "Teléfono no válido",
        "El teléfono debe contener exactamente 8 números."
      );

      return;
    }

    if (contrasena.length < 6) {
      Alert.alert(
        "Contraseña muy corta",
        "La contraseña debe tener al menos 6 caracteres."
      );

      return;
    }

    if (
      contrasena !==
      confirmarContrasena
    ) {
      Alert.alert(
        "Contraseñas diferentes",
        "Las contraseñas ingresadas no coinciden."
      );

      return;
    }

    try {
      setLoading(true);

      // 1. Crear cuenta mediante el backend.
      // El backend crea Authentication y Firestore.
      const respuestaRegistro =
        await api.post(
          "/usuarios",
          {
            Nombre: nombreLimpio,
            Correo: correoLimpio,
            Contraseña: contrasena,
            Telefono: telefonoLimpio,
            Direccion: direccionLimpia,
            Rol: "Cliente",
            Usuariokey: "",
          }
        );

      console.log(
        "Usuario creado correctamente:",
        respuestaRegistro.data
      );

      // 2. Iniciar sesión automáticamente.
      const credencial =
        await signInWithEmailAndPassword(
          auth,
          correoLimpio,
          contrasena
        );

      console.log(
        "Inicio automático correcto:",
        credencial.user.uid
      );

      // 3. Obtener token actualizado.
      const token =
        await credencial.user.getIdToken(
          true
        );

      // 4. Obtener perfil desde el backend.
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

      const perfil =
        respuestaPerfil.data.usuario;

      if (!perfil) {
        throw new Error(
          "La cuenta fue creada, pero el backend no devolvió el perfil."
        );
      }

      console.log(
        "Perfil del cliente:",
        {
          id: perfil.id,
          uid: perfil.uid,
          nombre: perfil.Nombre,
          correo: perfil.Correo,
          rol: perfil.Rol,
        }
      );

      // 5. Guardar sesión global.
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

      Alert.alert(
        "Cuenta creada",
        `Bienvenido a GasRuta Local, ${perfil.Nombre}.`
      );

      // 6. Todos entran temporalmente a MainTabs.
      navigation.replace(
        "MainTabs",
        {
          usuario: perfil,
          rol: perfil.Rol,
          token,
        }
      );
    } catch (error) {
      const mensaje =
        obtenerMensajeRegistro(error);

      console.log(
        "Error creando cuenta:",
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
       * Si Firebase inició sesión, pero falló la
       * consulta del perfil, cerramos la sesión
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

      Alert.alert(
        "No se pudo completar el registro",
        mensaje
      );
    } finally {
      setLoading(false);
    }
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
          styles.scrollContent
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                navigation.goBack()
              }
              disabled={loading}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View
              style={
                styles.headerContent
              }
            >
              <Text style={styles.logo}>
                🔥 GasRuta-Local
              </Text>

              <Text
                style={styles.subtitle}
              >
                Crea tu cuenta de cliente
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.title}>
              Crear una cuenta
            </Text>

            <Text
              style={styles.description}
            >
              Completa tus datos para
              solicitar cilindros de gas.
            </Text>

            <Text style={styles.label}>
              Nombre completo
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ej: Carlos López"
              placeholderTextColor="#999999"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
              editable={!loading}
            />

            <Text style={styles.label}>
              Correo electrónico
            </Text>

            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#999999"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>
              Teléfono
            </Text>

            <TextInput
              style={styles.input}
              placeholder="8888-8888"
              placeholderTextColor="#999999"
              value={telefono}
              onChangeText={
                manejarTelefono
              }
              keyboardType="phone-pad"
              maxLength={9}
              editable={!loading}
            />

            <Text style={styles.label}>
              Dirección
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.addressInput,
              ]}
              placeholder="Barrio, sector y referencia"
              placeholderTextColor="#999999"
              value={direccion}
              onChangeText={setDireccion}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!loading}
            />

            <Text style={styles.label}>
              Contraseña
            </Text>

            <View
              style={
                styles.passwordContainer
              }
            >
              <TextInput
                style={
                  styles.passwordInput
                }
                placeholder="Mínimo 6 caracteres"
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
              />

              <TouchableOpacity
                style={styles.showButton}
                onPress={() =>
                  setMostrarContrasena(
                    !mostrarContrasena
                  )
                }
                disabled={loading}
              >
                <Text
                  style={styles.showText}
                >
                  {mostrarContrasena
                    ? "Ocultar"
                    : "Ver"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>
              Confirmar contraseña
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Repite tu contraseña"
              placeholderTextColor="#999999"
              value={
                confirmarContrasena
              }
              onChangeText={
                setConfirmarContrasena
              }
              secureTextEntry={
                !mostrarContrasena
              }
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={
                handleRegister
              }
            />

            <TouchableOpacity
              style={[
                styles.registerButton,
                loading &&
                  styles.disabledButton,
              ]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="person-add-outline"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.registerButtonText
                    }
                  >
                    Crear cuenta
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View
              style={styles.loginContainer}
            >
              <Text
                style={styles.loginQuestion}
              >
                ¿Ya tienes una cuenta?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.goBack()
                }
                disabled={loading}
              >
                <Text
                  style={styles.loginLink}
                >
                  Iniciar sesión
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={styles.securityBox}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#2E9B59"
              />

              <Text
                style={
                  styles.securityText
                }
              >
                La contraseña se almacena
                de forma segura mediante
                Firebase Authentication y
                no se guarda en Firestore.
              </Text>
            </View>
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

  scrollContent: {
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
    height: 200,
    justifyContent: "center",
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  backButton: {
    position: "absolute",
    top: 48,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },

  headerContent: {
    alignItems: "center",
    marginTop: 20,
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    color: "#FFBE85",
    marginTop: 8,
    fontSize: 14,
  },

  content: {
    padding: 24,
    paddingBottom: 45,
  },

  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#1F1B2E",
  },

  description: {
    color: "#777777",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 24,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555555",
    marginBottom: 7,
  },

  input: {
    minHeight: 56,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    color: "#222222",
    fontSize: 15,
  },

  addressInput: {
    minHeight: 85,
  },

  passwordContainer: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 17,
  },

  passwordInput: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 16,
    color: "#222222",
    fontSize: 15,
  },

  showButton: {
    minHeight: 54,
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  showText: {
    color: "#FF6B00",
    fontSize: 13,
    fontWeight: "700",
  },

  registerButton: {
    minHeight: 58,
    backgroundColor: "#FF6B00",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 23,
    gap: 6,
  },

  loginQuestion: {
    color: "#777777",
    fontSize: 14,
  },

  loginLink: {
    color: "#FF6B00",
    fontSize: 14,
    fontWeight: "700",
  },

  securityBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EEFAF2",
    borderWidth: 1,
    borderColor: "#CAEBD5",
    borderRadius: 13,
    padding: 13,
    marginTop: 25,
    gap: 9,
  },

  securityText: {
    flex: 1,
    color: "#487458",
    fontSize: 12,
    lineHeight: 18,
  },
});