import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import CartScreen from "./src/screens/CartScreen";
import DeliveryScreen from "./src/screens/DeliveryScreen";
import OrderStatusScreen from "./src/screens/OrderStatusScreen";

import VistaAdminScreen from "./src/screens/VistaAdminScreen";
import NuevoProductoScreen from "./src/screens/NuevoProductoScreen";

import { CartProvider } from "./src/context/CartContext";
import { ProductProvider } from "./src/context/ProductContext"; // <-- Proveedor de productos añadido

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
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Catálogo"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Admin"
        component={AdminStack}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <View style={styles.webContainer}>
      <View style={styles.phoneContainer}>
        <ProductProvider>
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
              </Stack.Navigator>
            </NavigationContainer>
          </CartProvider>
        </ProductProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#e0e0e0', // Fondo gris claro alrededor del celular en la PC
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 420, // Ancho máximo simulando la pantalla de un celular
    backgroundColor: '#ffffff',
    ...Platform.select({
      web: {
        height: '100vh',
        maxHeight: 896, // Altura máxima simulada
        boxShadow: '0 0 20px rgba(0,0,0,0.2)', // Sombra elegante para que parezca un dispositivo real
      },
    }),
  },
});