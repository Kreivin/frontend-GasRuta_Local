import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.phone}>
        <LinearGradient
          colors={["#1F1B2E", "#4A2218"]}
          style={styles.header}
        >
          <Text style={styles.logo}>🔥 GasFácil</Text>

          <Text style={styles.subtitle}>
            Tu gas de cocina en minutos
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.title}>
            Iniciar sesión
          </Text>

          <TextInput
            placeholder="correo@ejemplo.com"
            style={styles.input}
          />

          <TextInput
            placeholder="********"
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity>
            <Text style={styles.forgot}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buttonText}>
              Entrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAEAEA",
    justifyContent: "center",
    alignItems: "center",
  },

  phone: {
    width: 430,
    maxWidth: "100%",
    height: "100%",
    backgroundColor: "#FFF",
  },

  header: {
    height: 260,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  logo: {
    color: "#FFF",
    fontSize: 34,
    fontWeight: "700",
  },

  subtitle: {
    color: "#FFBE85",
    marginTop: 10,
  },

  content: {
    flex: 1,
    padding: 25,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 25,
  },

  input: {
    backgroundColor: "#F5F5F5",
    padding: 18,
    borderRadius: 18,
    marginBottom: 15,
  },

  forgot: {
    textAlign: "right",
    color: "#FF6B00",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#FF6B00",
    padding: 18,
    borderRadius: 18,
  },

  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 18,
  },
});