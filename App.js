import React, { useContext } from "react";
import { StyleSheet, View, Platform, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import CartScreen from "./src/screens/CartScreen";
import DeliveryScreen from "./src/screens/DeliveryScreen";
import OrderStatusScreen from "./src/screens/OrderStatusScreen";
import RutaScreen from "./src/screens/RutaScreen";
import ResenaScreen from "./src/screens/ResenaScreen";
import IncidenciaScreen from "./src/screens/IncidenciaScreen";
import VistaAdminScreen from "./src/screens/VistaAdminScreen";
import NuevoProductoScreen from "./src/screens/NuevoProductoScreen";
import PerfilScreen from "./src/screens/PerfilScreen";
import MapaSeguimientoScreen from "./src/screens/MapaSeguimientoScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import MisPedidosScreen from "./src/screens/MisPedidosScreen";

import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { ProductProvider } from "./src/context/ProductContext";
import { PedidoProvider } from "./src/context/PedidoContext";
import { RutaProvider } from "./src/context/RutaContext";
import { ResenaProvider } from "./src/context/ResenaContext";
import { IncidenciaProvider } from "./src/context/IncidenciaContext";
import { HistorialProvider } from "./src/context/HistorialContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="VistaAdmin"
        component={VistaAdminScreen}
      />
      <Stack.Screen
        name="NuevoProducto"
        component={NuevoProductoScreen}
      />
      <Stack.Screen
        name="IncidenciaAdmin"
        component={IncidenciaScreen}
      />
      {/* Pantalla de perfil del administrador con opción de cerrar sesión */}
      <Stack.Screen
        name="PerfilAdmin"
        component={PerfilScreen}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const {
    currentUser,
  } = useContext(AuthContext);

  const rol = String(
    currentUser?.Rol || ""
  )
    .trim()
    .toLowerCase();

  const opcionesTabs = {
    headerShown: false,

    tabBarActiveTintColor:
      "#FF6B00",

    tabBarInactiveTintColor:
      "#888888",

    tabBarStyle: {
      height: 64,
      paddingTop: 6,
      paddingBottom: 7,
      backgroundColor: "#FFFFFF",
      borderTopColor: "#E7E7E7",
      borderTopWidth: 1,
    },

    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: "600",
    },
  };

  // =========================
  // Navegación del cliente
  // =========================

  if (rol === "cliente") {
    return (
      <Tab.Navigator
        initialRouteName="Catalogo"
        screenOptions={opcionesTabs}
      >
        <Tab.Screen
          name="Catalogo"
          component={HomeScreen}
          options={{
            title: "Catálogo",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="flame-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tab.Screen
          name="MisPedidos"
          component={MisPedidosScreen}
          options={{
            title: "Pedidos",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="receipt-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Rutas"
          component={RutaScreen}
          options={{
            title: "Rutas",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="map-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tab.Screen
          name="ResenasTab"
          component={ResenaScreen}
          options={{
            title: "Reseñas",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="chatbubble-ellipses-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{
            title: "Perfil",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="person-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // =========================
  // Navegación del repartidor
  // =========================

  if (rol === "repartidor") {
    return (
      <Tab.Navigator
        initialRouteName="Rutas"
        screenOptions={opcionesTabs}
      >
        <Tab.Screen
          name="Rutas"
          component={RutaScreen}
          options={{
            title: "Rutas",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="map-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tab.Screen
          name="IncidenciasTab"
          component={IncidenciaScreen}
          options={{
            title: "Incidencias",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="warning-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tab.Screen
          name="ResenasRepartidor"
          component={ResenaScreen}
          options={{
            title: "Reseñas",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="chatbubble-ellipses-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tab.Screen
          name="PerfilRepartidor"
          component={PerfilScreen}
          options={{
            title: "Perfil",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="person-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // =========================
  // Navegación del administrador
  // =========================

  
if (
  rol === "administrador" ||
  rol === "admin"
) {
  return (
    <Tab.Navigator
      initialRouteName="Administracion"
      screenOptions={opcionesTabs}
    >
      <Tab.Screen
        name="Administracion"
        component={AdminStack}
        options={{
          title: "Panel",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="grid-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tab.Screen
        name="RutasAdmin"
        component={RutaScreen}
        options={{
          title: "Rutas",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="map-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tab.Screen
        name="IncidenciasAdminTab"
        component={IncidenciaScreen}
        options={{
          title: "Incidencias",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="warning-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ResenasAdmin"
        component={ResenaScreen}
        options={{
          title: "Reseñas",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

     <Tab.Screen
  name="PerfilAdministrador"
  component={PerfilScreen}
  options={{
    title: "Perfil",

    tabBarIcon: ({
      color,
      size,
    }) => (
      <Ionicons
        name="person-circle-outline"
        color={color}
        size={size}
      />
    ),
  }}
/>
    </Tab.Navigator>
  );
}

// =========================
// Rol desconocido
// =========================
//
// Un rol desconocido no debe recibir
// Administración por defecto.
// Solo se muestra Perfil.
// =========================

return (
  <Tab.Navigator
    initialRouteName="PerfilSinRol"
    screenOptions={opcionesTabs}
  >
    <Tab.Screen
      name="PerfilSinRol"
      component={PerfilScreen}
      options={{
        title: "Perfil",

        tabBarIcon: ({
          color,
          size,
        }) => (
          <Ionicons
            name="person-circle-outline"
            color={color}
            size={size}
          />
        ),
      }}
    />
  </Tab.Navigator>
);
}

export default function App() {
  return (
    <View style={styles.webContainer}>
      <View style={styles.phoneContainer}>
        <AuthProvider>
          <PedidoProvider>
            <RutaProvider>
              <ResenaProvider>
                <IncidenciaProvider>
                  <HistorialProvider>
                    <CartProvider>
                      <ProductProvider>
                        <NavigationContainer>
                          <Stack.Navigator
                            initialRouteName="Login"
                            screenOptions={{
                              headerShown: false,
                            }}
                          >
                            <Stack.Screen
                              name="Login"
                              component={LoginScreen}
                            />

                            <Stack.Screen
                              name="Register"
                              component={RegisterScreen}
                            />

                            <Stack.Screen
                              name="MainTabs"
                              component={MainTabs}
                            />

                            <Stack.Screen
                              name="Cart"
                              component={CartScreen}
                            />

                            <Stack.Screen
                              name="Delivery"
                              component={DeliveryScreen}
                            />

                            <Stack.Screen
                              name="OrderStatus"
                              component={OrderStatusScreen}
                            />

                            <Stack.Screen
                              name="Resena"
                              component={ResenaScreen}
                            />

                            <Stack.Screen
                              name="Incidencia"
                              component={IncidenciaScreen}
                            />

                            <Stack.Screen
                              name="MapaSeguimiento"
                              component={MapaSeguimientoScreen}
                            />
                          </Stack.Navigator>
                        </NavigationContainer>
                      </ProductProvider>
                    </CartProvider>
                  </HistorialProvider>
                </IncidenciaProvider>
              </ResenaProvider>
            </RutaProvider>
          </PedidoProvider>
        </AuthProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    ...Platform.select({
      web: {
        height: '100vh',
        maxHeight: 896,
        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
      },
    }),
  },
});