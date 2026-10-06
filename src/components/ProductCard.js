import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ProductCard({ product, onAddToCart }) {
  // Función para extraer únicamente el número limpio (ej: de "C$C$200" o "C$200" saca 200)
  const getCleanPrice = (priceVal) => {
    if (!priceVal) return 200;
    if (typeof priceVal === "number") return priceVal;
    
    const cleanStr = String(priceVal).replace(/[C\$]+/g, "").trim();
    const match = cleanStr.match(/\d+(\.\d+)?/g);
    if (match && match.length > 0) {
      const parsed = parseFloat(match[match.length - 1]);
      return isNaN(parsed) ? 200 : parsed;
    }
    return 200;
  };

  const numericPrice = getCleanPrice(product.price);
  const itemName = product.name ? product.name : "Tanque de gas";
  const itemDesc = product.description || "Tanque disponible";

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <Text style={{ fontSize: 30 }}>🛢️</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.prodName}>{itemName}</Text>
          <Text style={styles.prodDesc}>{itemDesc}</Text>
          {/* Se muestra un único C$ seguido del número limpio */}
          <Text style={styles.prodPrice}>C${numericPrice}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => onAddToCart({ ...product, price: numericPrice })}
      >
        <Text style={styles.addBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 60,
    height: 60,
    backgroundColor: "#FDF1E8",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoBox: {
    flex: 1,
  },
  prodName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B1435",
  },
  prodDesc: {
    fontSize: 14,
    color: "#777",
    marginVertical: 2,
  },
  prodPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF6B00",
  },
  addBtn: {
    width: 45,
    height: 45,
    backgroundColor: "#FF6B00",
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
  },
});