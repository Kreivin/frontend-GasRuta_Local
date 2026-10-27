import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PerfilAdminScreen({ navigation }) {
  const cerrarSesion = () => {
    const realizarCierre = () => {
      // Resetea el stack principal para regresar al Login de forma segura
      if (navigation.getParent()) {
        navigation.getParent()?.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      } else {
        navigation.replace("Login");
      }
    };

    if (Platform.OS === "web") {
      // Confirmación adaptada para web
      if (window.confirm("¿Deseas salir de tu cuenta de administrador?")) {
        realizarCierre();
      }
    } else {
      // Confirmación nativa para móvil
      Alert.alert(
        "Cerrar sesión",
        "¿Deseas salir de tu cuenta?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Cerrar sesión",
            style: "destructive",
            onPress: realizarCierre,
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="shield-sharp" size={45} color="#FF6B00" />
        </View>
        <Text style={styles.titulo}>Panel de Administración</Text>
        <Text style={styles.subtitulo}>Gestión y Control - GasRuta Local</Text>
      </View>

      <TouchableOpacity style={styles.boton} onPress={cerrarSesion}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.textoBoton}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 40,
  },
  headerCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: { web: 0.1, default: 0.1 },
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#fff3ed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  boton: {
    flexDirection: "row",
    backgroundColor: "#FF6B00",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});