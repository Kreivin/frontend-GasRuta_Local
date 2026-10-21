import React from "react";
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

import { AuthProvider } from "./src/context/AuthContext";
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
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6B00",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tab.Screen
        name="Catálogo"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "flame" : "flame-outline"}
              size={size || 24}
              color={focused ? "#FF6B00" : color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Rutas"
        component={RutaScreen}
        options={{
          tabBarIcon: ({ size, color, focused }) => (
            <Ionicons
              name={focused ? "map" : "map-outline"}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Reseñas"
        component={ResenaScreen}
        options={{
          tabBarIcon: ({ size, color, focused }) => (
            <Ionicons
              name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Admin"
        component={AdminStack}
        options={({ route }) => {
          const routeName = route.state?.routes[route.state.index]?.name;
          const isHidden = routeName === "NuevoProducto";
          return {
            tabBarStyle: isHidden ? { display: "none" } : undefined,
            tabBarIcon: ({ size, color, focused }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={size || 24}
                color={color}
              />
            ),
          };
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
          <ProductProvider>
            <PedidoProvider>
              <RutaProvider>
                <ResenaProvider>
                  <IncidenciaProvider>
                    <HistorialProvider>
                      <CartProvider>
                        <NavigationContainer>
                          <Stack.Navigator
                            screenOptions={{
                              headerShown: false,
                            }}
                          >
                            <Stack.Screen
                              name="Login"
                              component={LoginScreen}
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
                          </Stack.Navigator>
                        </NavigationContainer>
                      </CartProvider>
                    </HistorialProvider>
                  </IncidenciaProvider>
                </ResenaProvider>
              </RutaProvider>
            </PedidoProvider>
          </ProductProvider>
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