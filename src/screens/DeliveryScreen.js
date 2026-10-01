import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";

import { CartContext } from "../context/CartContext";

export default function DeliveryScreen({ navigation }) {
  const { cart } = useContext(CartContext);

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(String(item.price).replace(",", "")) *
        item.qty,
    0
  );

  const delivery = 50;
  const total = subtotal + delivery;

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
              Dirección de entrega
            </Text>
          </View>

          <View style={styles.mapBox}>
            <Text style={styles.mapIcon}>🗺️</Text>
            <Text>Juigalpa, Chontales</Text>
          </View>

          <Text style={styles.label}>
            BARRIO / SECTOR
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej: Barrio El Carmen"
          />

          <Text style={styles.label}>
            REFERENCIA (OPCIONAL)
          </Text>

          <TextInput
            style={[styles.input, { height: 100 }]}
            multiline
            placeholder="Ej: Casa azul con portón negro"
          />

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>
              RESUMEN DEL PEDIDO
            </Text>

            {cart.map((item) => (
              <View
                key={item.id}
                style={styles.row}
              >
                <Text>
                  {item.name.split("—")[0]} x{" "}
                  {item.qty}
                </Text>

                <Text>
                  C$
                  {Number(
                    String(item.price).replace(
                      ",",
                      ""
                    )
                  ) * item.qty}
                </Text>
              </View>
            ))}

            <View style={styles.row}>
              <Text>Delivery</Text>
              <Text>C$50</Text>
            </View>

            <View style={styles.line} />

            <View style={styles.row}>
              <Text style={styles.totalLabel}>
                Total
              </Text>

              <Text style={styles.total}>
                C${total}
              </Text>
            </View>
          </View>

         <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("OrderStatus")}
        >
        <Text style={styles.buttonText}>
            Confirmar pedido 🚚
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
    fontSize: 24,
    fontWeight: "700",
  },

  mapBox: {
    margin: 20,
    backgroundColor: "#EDF4EE",
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
  },

  mapIcon: {
    fontSize: 50,
    marginBottom: 10,
  },

  label: {
    marginHorizontal: 20,
    marginBottom: 10,
    fontWeight: "700",
    color: "#777",
  },

  input: {
    backgroundColor: "#F4F4F4",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
  },

  summary: {
    backgroundColor: "#FFF",
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },

  summaryTitle: {
    fontWeight: "700",
    marginBottom: 15,
    color: "#777",
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
    backgroundColor: "#FF6B00",
    margin: 20,
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