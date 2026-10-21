import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login, seleccionarUsuario, usuarios, currentUser } = useContext(AuthContext);

  const [correo, setCorreo] = useState("carlos@gmail.com");
  const [contrasena, setContrasena] = useState("Carlos12345");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!correo.trim() || !contrasena.trim()) {
      Alert.alert("Campos requeridos", "Por favor ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);
    const resultado = await login(correo, contrasena);
    setLoading(false);

    if (resultado.exito) {
      navigation.replace("MainTabs");
    } else {
      Alert.alert(
        "Acceso",
        resultado.mensaje || "Error al iniciar sesión. Puedes usar el acceso rápido abajo."
      );
    }
  };

  const handleQuickLogin = (usr) => {
    seleccionarUsuario(usr);
    navigation.replace("MainTabs");
  };

  return (
    <View style={styles.container}>
      <View style={styles.phone}>
        <LinearGradient
          colors={["#1F1B2E", "#4A2218"]}
          style={styles.header}
        >
          <Text style={styles.logo}>🔥 GasRuta-Local</Text>
          <Text style={styles.subtitle}>
            Tu distribuidor de gas de confianza
          </Text>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Iniciar sesión</Text>

          <Text style={styles.inputLabel}>Correo electrónico</Text>
          <TextInput
            placeholder="correo@ejemplo.com"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Contraseña</Text>
          <TextInput
            placeholder="********"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* ACCESOS RÁPIDOS CON USUARIOS REALES DE FIREBASE */}
          <View style={styles.quickSection}>
            <Text style={styles.quickTitle}>Usuarios registrados en Firebase:</Text>
            {usuarios && usuarios.length > 0 ? (
              usuarios.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.userBadge}
                  onPress={() => handleQuickLogin(u)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{u.Nombre || u.Correo}</Text>
                    <Text style={styles.userRole}>
                      {u.Rol || "Cliente"} • {u.Correo}
                    </Text>
                  </View>
                  <Text style={styles.loginPill}>Ingresar →</Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={styles.userBadge}
                onPress={() => navigation.replace("MainTabs")}
              >
                <Text style={styles.userName}>Entrar en modo demo</Text>
                <Text style={styles.loginPill}>Entrar →</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
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
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    color: "#FFBE85",
    marginTop: 8,
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F1B2E",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#FF6B00",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  quickSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#777",
    marginBottom: 12,
  },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9FB",
    borderWidth: 1,
    borderColor: "#E6E6EA",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F1B2E",
  },
  userRole: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  loginPill: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF6B00",
  },
});