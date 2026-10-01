import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { CartContext } from "../context/CartContext";

export default function CartScreen({ navigation }) {
  const { cart, increaseQty, decreaseQty } =
    useContext(CartContext);

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(String(item.price).replace(",", "")) *
        item.qty,
    0
  );

  const delivery = cart.length > 0 ? 50 : 0;
  const total = subtotal + delivery;

  // ==========================
  // CARRITO VACÍO
  // ==========================
  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.phone}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={{ fontSize: 20 }}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
              Mi pedido
            </Text>
          </View>

          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              🛒
            </Text>

            <Text style={styles.emptyText}>
              Tu carrito está vacío
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                navigation.navigate("Home")
              }
            >
              <Text style={styles.emptyButtonText}>
                Ver productos
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ==========================
  // CARRITO CON PRODUCTOS
  // ==========================
  return (
    <View style={styles.container}>
      <View style={styles.phone}>
        <ScrollView>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={{ fontSize: 20 }}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
              Mi pedido
            </Text>
          </View>

          {cart.map((item) => (
            <View
              key={item.id}
              style={styles.card}
            >
              <Text style={styles.icon}>🛢️</Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {item.name}
                </Text>

                <Text style={styles.price}>
                  C${item.price}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() =>
                  decreaseQty(item.id)
                }
              >
                <Text style={styles.qtyBtnText}>
                  -
                </Text>
              </TouchableOpacity>

              <Text style={styles.qty}>
                {item.qty}
              </Text>

              <TouchableOpacity
                style={[
                  styles.qtyBtn,
                  styles.plusBtn,
                ]}
                onPress={() =>
                  increaseQty(item.id)
                }
              >
                <Text
                  style={[
                    styles.qtyBtnText,
                    { color: "#fff" },
                  ]}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.deliveryCard}>
            <View>
              <Text style={styles.deliveryTitle}>
                🚚 Entrega a domicilio
              </Text>

              <Text style={styles.deliveryTime}>
                30-45 minutos · Juigalpa
              </Text>
            </View>

            <Text style={styles.deliveryPrice}>
              C$50
            </Text>
          </View>

          <View style={styles.summary}>
            <View style={styles.row}>
              <Text>
                Subtotal productos
              </Text>

              <Text>
                C${subtotal}
              </Text>
            </View>

            <View style={styles.row}>
              <Text>Delivery</Text>

              <Text>
                C${delivery}
              </Text>
            </View>

            <View style={styles.line} />

            <View style={styles.row}>
              <Text style={styles.totalLabel}>
                Total a pagar
              </Text>

              <Text style={styles.total}>
                C${total}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate("Delivery")
            }
          >
            <Text style={styles.buttonText}>
              Continuar →
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAEAEA",
    alignItems: "center",
  },

  phone: {
    width: 430,
    maxWidth: "100%",
    flex: 1,
    backgroundColor: "#FFF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  // ===== CARRITO VACÍO =====
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 180,
  },

  emptyIcon: {
    fontSize: 70,
    marginBottom: 20,
  },

  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#8A6F52",
    marginBottom: 20,
  },

  emptyButton: {
    backgroundColor: "#FF6B00",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
  },

  emptyButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },

  // ===== PRODUCTOS =====
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 18,
    borderRadius: 20,
    elevation: 3,
  },

  icon: {
    fontSize: 30,
    marginRight: 15,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
  },

  price: {
    color: "#FF6B00",
    marginTop: 5,
    fontWeight: "700",
  },

  qtyBtn: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
  },

  plusBtn: {
    backgroundColor: "#FF6B00",
  },

  qtyBtnText: {
    fontSize: 20,
    fontWeight: "700",
  },

  qty: {
    marginHorizontal: 15,
    fontSize: 18,
    fontWeight: "700",
  },

  deliveryCard: {
    backgroundColor: "#FFF3EC",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  deliveryTitle: {
    fontWeight: "700",
    fontSize: 16,
  },

  deliveryTime: {
    color: "#777",
    marginTop: 5,
  },

  deliveryPrice: {
    color: "#FF6B00",
    fontSize: 22,
    fontWeight: "700",
  },

  summary: {
    marginHorizontal: 20,
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  line: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 10,
  },

  totalLabel: {
    fontWeight: "700",
    fontSize: 18,
  },

  total: {
    color: "#FF6B00",
    fontWeight: "700",
    fontSize: 22,
  },

  button: {
    margin: 20,
    backgroundColor: "#FF6B00",
    padding: 18,
    borderRadius: 18,
  },

  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});