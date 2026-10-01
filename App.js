import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import CartScreen from "./src/screens/CartScreen";
import DeliveryScreen from "./src/screens/DeliveryScreen";
import OrderStatusScreen from "./src/screens/OrderStatusScreen";

import { CartProvider } from "./src/context/CartContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
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
            name="Home"
            component={HomeScreen}
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
  );
}