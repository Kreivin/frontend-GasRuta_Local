import React from "react";
import { View, StyleSheet } from "react-native";

export default function PhoneContainer({ children }) {
  return (
    <View style={styles.screen}>
      <View style={styles.phone}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#DCDCDC",
    alignItems: "center",
  },

  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#F5F5F5",
  },
});