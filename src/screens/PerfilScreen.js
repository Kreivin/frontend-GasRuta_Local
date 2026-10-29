import React, {
  useContext,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../context/AuthContext";

export default function PerfilScreen({
  navigation,
  route,
}) {
  const authContext = useContext(AuthContext);

  const [cerrandoSesion, setCerrandoSesion] =
    useState(false);

  /*
   * Primero intenta obtener el usuario desde AuthContext.
   * Si todavía no está guardado en el contexto, utiliza
   * el usuario enviado mediante navigation.replace().
   */
  const usuario =
    authContext?.currentUser ||
    route?.params?.usuario ||
    null;

  const cerrarSesion = async () => {
    try {
      setCerrandoSesion(true);

      if (authContext?.logout) {
        await authContext.logout();
      }

      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Login",
          },
        ],
      });
    } catch (error) {
      console.log(
        "Error al cerrar sesión:",
        error.message
      );

      Alert.alert(
        "Error",
        "No fue posible cerrar la sesión."
      );
    } finally {
      setCerrandoSesion(false);
    }
  };

  const confirmarCerrarSesion = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Deseas cerrar tu sesión actual?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: cerrarSesion,
        },
      ]
    );
  };

  // Si todavía no se ha cargado el perfil
  if (!usuario) {
    return (
      <View
        style={[
          styles.contenedor,
          styles.centrado,
        ]}
      >
        <Ionicons
          name="person-circle-outline"
          size={80}
          color="#B0B0B0"
        />

        <Text style={styles.sinPerfilTitulo}>
          Perfil no disponible
        </Text>

        <Text style={styles.sinPerfilTexto}>
          No se encontró la información de la
          sesión actual.
        </Text>

        <TouchableOpacity
          style={styles.botonVolverLogin}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: "Login",
                },
              ],
            })
          }
        >
          <Text style={styles.textoBotonVolver}>
            Volver al inicio de sesión
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const inicialNombre =
    usuario.Nombre?.trim()?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenedor}
      showsVerticalScrollIndicator={false}
    >
      {/* Encabezado del perfil */}
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarTexto}>
            {inicialNombre}
          </Text>
        </View>

        <Text style={styles.titulo}>
          {usuario.Nombre || "Usuario"}
        </Text>

        <View style={styles.rolBadge}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color="#FF6B00"
          />

          <Text style={styles.rolBadgeTexto}>
            {usuario.Rol || "Sin rol"}
          </Text>
        </View>

        <Text style={styles.subtitulo}>
          GasRuta Local
        </Text>
      </View>

      {/* Información personal */}
      <View style={styles.infoCard}>
        <Text style={styles.seccionTitulo}>
          Información personal
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.iconoContainer}>
            <Ionicons
              name="person-outline"
              size={21}
              color="#FF6B00"
            />
          </View>

          <View style={styles.infoContenido}>
            <Text style={styles.infoLabel}>
              Nombre completo
            </Text>

            <Text style={styles.infoText}>
              {usuario.Nombre || "No registrado"}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconoContainer}>
            <Ionicons
              name="mail-outline"
              size={21}
              color="#FF6B00"
            />
          </View>

          <View style={styles.infoContenido}>
            <Text style={styles.infoLabel}>
              Correo electrónico
            </Text>

            <Text style={styles.infoText}>
              {usuario.Correo || "No registrado"}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconoContainer}>
            <Ionicons
              name="call-outline"
              size={21}
              color="#FF6B00"
            />
          </View>

          <View style={styles.infoContenido}>
            <Text style={styles.infoLabel}>
              Teléfono
            </Text>

            <Text style={styles.infoText}>
              {usuario.Telefono || "No registrado"}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconoContainer}>
            <Ionicons
              name="location-outline"
              size={21}
              color="#FF6B00"
            />
          </View>

          <View style={styles.infoContenido}>
            <Text style={styles.infoLabel}>
              Dirección
            </Text>

            <Text style={styles.infoText}>
              {usuario.Direccion || "No registrada"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.infoRow,
            styles.ultimaFila,
          ]}
        >
          <View style={styles.iconoContainer}>
            <Ionicons
              name="key-outline"
              size={21}
              color="#FF6B00"
            />
          </View>

          <View style={styles.infoContenido}>
            <Text style={styles.infoLabel}>
              Código de usuario
            </Text>

            <Text style={styles.infoText}>
              {usuario.Usuariokey ||
                "No registrado"}
            </Text>
          </View>
        </View>
      </View>

      {/* Información de cuenta */}
      <View style={styles.infoCard}>
        <Text style={styles.seccionTitulo}>
          Información de la cuenta
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.iconoContainer}>
            <Ionicons
              name="shield-outline"
              size={21}
              color="#FF6B00"
            />
          </View>

          <View style={styles.infoContenido}>
            <Text style={styles.infoLabel}>
              Rol asignado
            </Text>

            <Text style={styles.infoText}>
              {usuario.Rol || "Sin rol"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.infoRow,
            styles.ultimaFila,
          ]}
        >
          <View style={styles.iconoContainer}>
            <Ionicons
              name={
                usuario.activo === false
                  ? "close-circle-outline"
                  : "checkmark-circle-outline"
              }
              size={21}
              color={
                usuario.activo === false
                  ? "#D94A4A"
                  : "#2E9B59"
              }
            />
          </View>

          <View style={styles.infoContenido}>
            <Text style={styles.infoLabel}>
              Estado
            </Text>

            <Text
              style={[
                styles.infoText,
                usuario.activo === false
                  ? styles.estadoInactivo
                  : styles.estadoActivo,
              ]}
            >
              {usuario.activo === false
                ? "Cuenta inactiva"
                : "Cuenta activa"}
            </Text>
          </View>
        </View>
      </View>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity
        style={[
          styles.botonCerrarSesion,
          cerrandoSesion &&
            styles.botonDeshabilitado,
        ]}
        onPress={confirmarCerrarSesion}
        disabled={cerrandoSesion}
        activeOpacity={0.8}
      >
        {cerrandoSesion ? (
          <ActivityIndicator color="#D94A4A" />
        ) : (
          <>
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#D94A4A"
            />

            <Text style={styles.textoCerrarSesion}>
              Cerrar sesión
            </Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.versionTexto}>
        GasRuta Local
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  contenedor: {
    flexGrow: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
  },

  centrado: {
    justifyContent: "center",
  },

  headerCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginTop: 25,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  avatarContainer: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#FFF3ED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#FFD4B8",
  },

  avatarTexto: {
    color: "#FF6B00",
    fontSize: 40,
    fontWeight: "800",
  },

  titulo: {
    fontSize: 23,
    fontWeight: "800",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },

  rolBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3ED",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
    gap: 5,
  },

  rolBadgeTexto: {
    fontSize: 13,
    color: "#FF6B00",
    fontWeight: "700",
  },

  subtitulo: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
  },

  infoCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 18,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  seccionTitulo: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },

  infoRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  ultimaFila: {
    borderBottomWidth: 0,
  },

  iconoContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFF3ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  infoContenido: {
    flex: 1,
  },

  infoLabel: {
    color: "#888888",
    fontSize: 12,
    marginBottom: 3,
  },

  infoText: {
    fontSize: 15,
    color: "#333333",
    fontWeight: "600",
  },

  estadoActivo: {
    color: "#2E9B59",
  },

  estadoInactivo: {
    color: "#D94A4A",
  },

  botonCerrarSesion: {
    width: "100%",
    minHeight: 56,
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F2B8B8",
    backgroundColor: "#FFF5F5",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoCerrarSesion: {
    color: "#D94A4A",
    fontSize: 16,
    fontWeight: "700",
  },

  versionTexto: {
    color: "#AAAAAA",
    fontSize: 12,
    marginTop: 20,
  },

  sinPerfilTitulo: {
    color: "#333333",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 15,
  },

  sinPerfilTexto: {
    color: "#777777",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  botonVolverLogin: {
    backgroundColor: "#FF6B00",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  textoBotonVolver: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});