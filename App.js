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

import VistaAdminScreen from "./src/screens/VistaAdminScreen";
import NuevoProductoScreen from "./src/screens/NuevoProductoScreen";

import { CartProvider } from "./src/context/CartContext";
import { ProductProvider } from "./src/context/ProductContext";

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
        tabBarActiveTintColor: "#FF6B00",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tab.Screen
        name="Catálogo"
        component={HomeScreen}
        // Bloquea la navegación si estás dentro de Admin
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const currentRouteName = state?.routes[state.index]?.name;
            if (currentRouteName === "Admin") {
              e.preventDefault();
            }
          },
        })}
        // Reduce la opacidad visualmente cuando el Admin está activo
        options={({ navigation }) => {
          const state = navigation.getState();
          const currentRouteName = state?.routes[state.index]?.name;
          const isAdminActive = currentRouteName === "Admin";
          return {
            tabBarItemStyle: isAdminActive ? { opacity: 0.4 } : {},
            tabBarIcon: ({ size, focused }) => (
              <Image
                source={{
                  uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZjFTQ_ArJQoQViRAJpxC4LpQJqu71lbzxAQBhL172AQ&s=10",
                }}
                style={{
                  width: size ? size + 4 : 28,
                  height: size ? size + 4 : 28,
                  borderRadius: (size ? size + 4 : 28) / 2,
                  opacity: focused ? 1 : 0.65,
                }}
                resizeMode="contain"
              />
            ),
          };
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