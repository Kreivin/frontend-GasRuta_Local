import React, {
  useContext,
  useState,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  AuthContext,
} from "../context/AuthContext";

export default function PerfilScreen({
  navigation,
}) {
  const {
    currentUser,
    logout,
  } = useContext(AuthContext);

  const [
    cerrandoSesion,
    setCerrandoSesion,
  ] = useState(false);

  const rol = String(
    currentUser?.Rol || "Cliente"
  ).trim();

  const rolNormalizado =
    rol.toLowerCase();

  const esAdministrador =
    rolNormalizado ===
      "administrador" ||
    rolNormalizado === "admin";

  const esRepartidor =
    rolNormalizado ===
    "repartidor";

  // =========================
  // Configuración visual
  // =========================

  const obtenerConfiguracionRol =
    () => {
      if (esAdministrador) {
        return {
          icono:
            "shield-checkmark-outline",

          color: "#FF6B00",

          fondo: "#FFF3E8",

          titulo:
            "Perfil administrativo",

          descripcion:
            "Gestión y control de GasRuta Local",
        };
      }

      if (esRepartidor) {
        return {
          icono:
            "bicycle-outline",

          color: "#1A73E8",

          fondo: "#E8F0FE",

          titulo:
            "Perfil de repartidor",

          descripcion:
            "Gestión de recorridos y entregas",
        };
      }

      return {
        icono:
          "person-outline",

        color: "#2E9B59",

        fondo: "#EAF8F0",

        titulo:
          "Perfil de cliente",

        descripcion:
          "Información de tu cuenta",
      };
    };

  const configuracionRol =
    obtenerConfiguracionRol();

  // =========================
  // Obtener iniciales
  // =========================

  const obtenerIniciales = () => {
    const nombre = String(
      currentUser?.Nombre || ""
    ).trim();

    if (!nombre) {
      return "U";
    }

    const palabras =
      nombre.split(/\s+/);

    if (palabras.length === 1) {
      return palabras[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      palabras[0]
        .charAt(0)
        .toUpperCase() +
      palabras[1]
        .charAt(0)
        .toUpperCase()
    );
  };

  // =========================
  // Regresar al Login
  // =========================

  const regresarAlLogin = () => {
    /*
     * Buscamos el navegador principal.
     *
     * Perfil está dentro de Tabs y Tabs está
     * dentro del Stack principal. Por eso no
     * siempre basta con navigation.replace().
     */
    let navegadorRaiz =
      navigation;

    while (
      navegadorRaiz.getParent?.()
    ) {
      navegadorRaiz =
        navegadorRaiz.getParent();
    }

    navegadorRaiz.reset({
      index: 0,
      routes: [
        {
          name: "Login",
        },
      ],
    });
  };

  // =========================
  // Ejecutar cierre
  // =========================

  const ejecutarCierreSesion =
    async () => {
      if (cerrandoSesion) {
        return;
      }

      try {
        setCerrandoSesion(true);

        /*
         * AuthContext.logout debe ejecutar
         * signOut(auth).
         */
        if (
          typeof logout ===
          "function"
        ) {
          await logout();
        } else {
          console.warn(
            "AuthContext no tiene la función logout."
          );
        }

        regresarAlLogin();
      } catch (error) {
        console.log(
          "Error cerrando sesión:",
          error
        );

        Alert.alert(
          "No se pudo cerrar sesión",
          error.message ||
            "Ocurrió un error al cerrar la sesión."
        );
      } finally {
        setCerrandoSesion(false);
      }
    };

  // =========================
  // Confirmar cierre
  // =========================

  const cerrarSesion = () => {
    if (cerrandoSesion) {
      return;
    }

    if (
      Platform.OS === "web" &&
      typeof window !==
        "undefined"
    ) {
      const confirmado =
        window.confirm(
          "¿Deseas cerrar tu sesión?"
        );

      if (confirmado) {
        ejecutarCierreSesion();
      }

      return;
    }

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
          onPress:
            ejecutarCierreSesion,
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  // =========================
  // Sin información de cuenta
  // =========================

  if (!currentUser) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
        ]}
      >
        <View
          style={
            styles.emptyIconContainer
          }
        >
          <Ionicons
            name="person-circle-outline"
            size={64}
            color="#999999"
          />
        </View>

        <Text
          style={styles.emptyTitle}
        >
          No hay una sesión activa
        </Text>

        <Text
          style={styles.emptyText}
        >
          Inicia sesión para consultar
          la información de tu cuenta.
        </Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={regresarAlLogin}
        >
          <Text
            style={
              styles.loginButtonText
            }
          >
            Ir a iniciar sesión
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Encabezado */}
        <View
          style={styles.headerCard}
        >
          <View
            style={[
              styles.roleIconContainer,
              {
                backgroundColor:
                  configuracionRol.fondo,
              },
            ]}
          >
            <Ionicons
              name={
                configuracionRol.icono
              }
              size={30}
              color={
                configuracionRol.color
              }
            />
          </View>

          <Text
            style={styles.roleTitle}
          >
            {configuracionRol.titulo}
          </Text>

          <Text
            style={
              styles.roleDescription
            }
          >
            {
              configuracionRol.descripcion
            }
          </Text>
        </View>

        {/* Información principal */}
        <View style={styles.profileCard}>
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor:
                  configuracionRol.fondo,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                {
                  color:
                    configuracionRol.color,
                },
              ]}
            >
              {obtenerIniciales()}
            </Text>
          </View>

          <Text style={styles.name}>
            {currentUser.Nombre ||
              "Usuario"}
          </Text>

          <Text style={styles.email}>
            {currentUser.Correo ||
              "Correo no disponible"}
          </Text>

          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor:
                  configuracionRol.fondo,
              },
            ]}
          >
            <Ionicons
              name={
                configuracionRol.icono
              }
              size={16}
              color={
                configuracionRol.color
              }
            />

            <Text
              style={[
                styles.roleBadgeText,
                {
                  color:
                    configuracionRol.color,
                },
              ]}
            >
              {rol}
            </Text>
          </View>
        </View>

        {/* Datos de la cuenta */}
        <View style={styles.infoCard}>
          <Text
            style={styles.sectionTitle}
          >
            INFORMACIÓN DE LA CUENTA
          </Text>

          <View style={styles.infoRow}>
            <View
              style={
                styles.infoIconContainer
              }
            >
              <Ionicons
                name="person-outline"
                size={20}
                color="#FF6B00"
              />
            </View>

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.infoLabel}
              >
                Nombre completo
              </Text>

              <Text
                style={styles.infoValue}
              >
                {currentUser.Nombre ||
                  "No disponible"}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View
              style={
                styles.infoIconContainer
              }
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color="#FF6B00"
              />
            </View>

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.infoLabel}
              >
                Correo electrónico
              </Text>

              <Text
                style={styles.infoValue}
              >
                {currentUser.Correo ||
                  "No disponible"}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View
              style={
                styles.infoIconContainer
              }
            >
              <Ionicons
                name="call-outline"
                size={20}
                color="#FF6B00"
              />
            </View>

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.infoLabel}
              >
                Teléfono
              </Text>

              <Text
                style={styles.infoValue}
              >
                {currentUser.Telefono ||
                  "Sin teléfono"}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View
              style={
                styles.infoIconContainer
              }
            >
              <Ionicons
                name="location-outline"
                size={20}
                color="#FF6B00"
              />
            </View>

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.infoLabel}
              >
                Dirección
              </Text>

              <Text
                style={styles.infoValue}
              >
                {currentUser.Direccion ||
                  "Sin dirección registrada"}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View
              style={
                styles.infoIconContainer
              }
            >
              <Ionicons
                name="finger-print-outline"
                size={20}
                color="#FF6B00"
              />
            </View>

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.infoLabel}
              >
                Código de usuario
              </Text>

              <Text
                style={styles.infoValue}
              >
                {currentUser.Usuariokey ||
                  currentUser.id ||
                  currentUser.uid ||
                  "No disponible"}
              </Text>
            </View>
          </View>
        </View>

        {/* Sección administrativa */}
        {esAdministrador ? (
          <View
            style={
              styles.adminInformation
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color="#FF6B00"
            />

            <View style={{ flex: 1 }}>
              <Text
                style={
                  styles.adminInformationTitle
                }
              >
                Cuenta administrativa
              </Text>

              <Text
                style={
                  styles.adminInformationText
                }
              >
                Esta cuenta tiene acceso
                al panel de administración,
                usuarios, pedidos, rutas e
                incidencias.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Seguridad */}
        <View style={styles.securityCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color="#2E9B59"
          />

          <View style={{ flex: 1 }}>
            <Text
              style={
                styles.securityTitle
              }
            >
              Sesión protegida
            </Text>

            <Text
              style={
                styles.securityText
              }
            >
              La autenticación de la cuenta
              es administrada de forma
              segura por Firebase
              Authentication.
            </Text>
          </View>
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            cerrandoSesion &&
              styles.disabledButton,
          ]}
          onPress={cerrarSesion}
          disabled={cerrandoSesion}
          activeOpacity={0.8}
        >
          {cerrandoSesion ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.logoutButtonText
                }
              >
                Cerrar sesión
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.versionText}>
          GasRuta Local
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F8",
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  scrollContent: {
    padding: 20,
    paddingTop: 45,
    paddingBottom: 40,
  },

  headerCard: {
    backgroundColor: "#1F1B2E",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
  },

  roleIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 13,
  },

  roleTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  roleDescription: {
    color: "#C8C3D3",
    fontSize: 13,
    textAlign: "center",
    marginTop: 5,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7E7EB",
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
  },

  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 13,
  },

  avatarText: {
    fontSize: 31,
    fontWeight: "900",
  },

  name: {
    color: "#222222",
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
  },

  email: {
    color: "#777777",
    fontSize: 13,
    textAlign: "center",
    marginTop: 5,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginTop: 13,
    gap: 5,
  },

  roleBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7E7EB",
    padding: 18,
    marginBottom: 16,
  },

  sectionTitle: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  infoIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFF3E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: "#888888",
    fontSize: 11,
    marginBottom: 3,
  },

  infoValue: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "700",
  },

  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 3,
  },

  adminInformation: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF3E8",
    borderWidth: 1,
    borderColor: "#FFD8B5",
    borderRadius: 16,
    padding: 15,
    marginBottom: 16,
    gap: 10,
  },

  adminInformationTitle: {
    color: "#9A4D00",
    fontSize: 14,
    fontWeight: "800",
  },

  adminInformationText: {
    color: "#8A6542",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  securityCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EEFAF2",
    borderWidth: 1,
    borderColor: "#CAEBD5",
    borderRadius: 16,
    padding: 15,
    marginBottom: 18,
    gap: 10,
  },

  securityTitle: {
    color: "#2E6B45",
    fontSize: 14,
    fontWeight: "800",
  },

  securityText: {
    color: "#487458",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  logoutButton: {
    minHeight: 57,
    backgroundColor: "#D9534F",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },

  versionText: {
    color: "#AAAAAA",
    fontSize: 11,
    textAlign: "center",
    marginTop: 18,
  },

  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EEEEEE",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    color: "#333333",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 17,
  },

  emptyText: {
    color: "#777777",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
  },

  loginButton: {
    minHeight: 52,
    backgroundColor: "#FF6B00",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 22,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});