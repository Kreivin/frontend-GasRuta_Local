import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PerfilScreen({ navigation }) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={50} color="#FF6B00" />
        </View>
        <Text style={styles.titulo}>Mi Perfil</Text>
        <Text style={styles.subtitulo}>GasRuta Local - Soporte y Entregas</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <Text style={styles.infoText}>usuario@gasruta.com</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
          <Text style={styles.infoText}>Rol: Repartidor / Cliente</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
    justifyContent: "flex-start",
    alignItems: "center",
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
  },
  subtitulo: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: { web: 0.1, default: 0.1 },
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#444444",
  },
});