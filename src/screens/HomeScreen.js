import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CartContext } from "../context/CartContext";
import { ProductContext } from "../context/ProductContext";

export default function HomeScreen({ navigation }) {
  const { cart, addToCart } = useContext(CartContext);
  const { products } = useContext(ProductContext);

  const totalItems = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  // Función para limpiar precios malformados o con C$ duplicado
  const getCleanPriceDisplay = (priceVal) => {
    if (!priceVal) return "200";
    const raw = String(priceVal);
    const clean = raw.replace(/[C\$]+/g, "").trim();
    const match = clean.match(/\d+(\.\d+)?/g);
    return match ? match[match.length - 1] : "200";
  };

  return (
    <View style={styles.container}>
      <View style={styles.phone}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.locationLabel}>
                UBICACIÓN
              </Text>

              <Text style={styles.location}>
                📍 Juigalpa, Chontales
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() =>
                navigation.navigate("Cart")
              }
            >
              <Ionicons
                name="cart-outline"
                size={26}
                color="#FF6B00"
              />

              {totalItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {totalItems}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* BANNER */}
          <View style={styles.banner}>
            <Text style={styles.offer}>
              OFERTA DEL DÍA
            </Text>

            <Text style={styles.bannerTitle}>
              Entrega gratis
            </Text>

            <Text style={styles.bannerTitle}>
              en tu primer pedido
            </Text>

            <TouchableOpacity
              style={styles.bannerBtn}
            >
              <Text style={styles.bannerBtnText}>
                USAR AHORA →
              </Text>
            </TouchableOpacity>
          </View>

          {/* TITULO */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              Cilindros disponibles
            </Text>

            <Text style={styles.sectionCount}>
              {products.length} opciones
            </Text>
          </View>

          {/* PRODUCTOS */}
          {products.map((item) => {
            const cleanNumericPrice = Number(getCleanPriceDisplay(item.price));

            return (
              <View
                key={item.id}
                style={styles.card}
              >
                <View style={styles.iconBox}>
                  <Text style={styles.icon}>
                    🛢️
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {item.name}
                  </Text>

                  {item.description ? (
                    <Text style={styles.descriptionText} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}

                  <Text style={styles.price}>
                    C${cleanNumericPrice}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.plus}
                  onPress={() =>
                    addToCart({ ...item, price: cleanNumericPrice })
                  }
                >
                  <Text style={styles.plusText}>
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
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
    flex: 1,
    backgroundColor: "#FFF",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 25,
    paddingTop: 50,
  },
  locationLabel: {
    color: "#999",
    fontSize: 12,
  },
  location: {
    marginTop: 5,
    fontWeight: "700",
    fontSize: 16,
  },
  cartBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F4F4F4",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  banner: {
    marginHorizontal: 20,
    backgroundColor: "#FF6B00",
    borderRadius: 20,
    padding: 20,
  },
  offer: {
    color: "#FFD5A5",
    marginBottom: 10,
    fontWeight: "600",
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "700",
  },
  bannerBtn: {
    backgroundColor: "#FFC107",
    alignSelf: "flex-start",
    marginTop: 15,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerBtnText: {
    fontWeight: "700",
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionCount: {
    color: "#999",
  },
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
  iconBox: {
    width: 60,
    height: 60,
    backgroundColor: "#FFF3EB",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  icon: {
    fontSize: 28,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  price: {
    color: "#FF6B00",
    marginTop: 2,
    fontSize: 22,
    fontWeight: "700",
  },
  plus: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FF6B00",
    justifyContent: "center",
    alignItems: "center",
  },
  plusText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
  },
});