import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";

import { CartContext } from "../context/CartContext";

export default function OrderStatusScreen({
  navigation,
  route,
}) {
  const { cart, clearCart } = useContext(CartContext);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [confirmed, setConfirmed] =
    useState(false);

  const address =
    route.params?.address ||
    "Juigalpa, Chontales";

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(
        String(item.price).replace(",", "")
      ) *
        item.qty,
    0
  );

  const total = subtotal + 50;

  const confirmPurchase = () => {
    setConfirmed(true);

    setTimeout(() => {
      clearCart();

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.phone}>
        <ScrollView>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() =>
                navigation.goBack()
              }
            >
              <Text>↩</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
              Estado del pedido
            </Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.truck}>
              🛵
            </Text>

            <Text style={styles.statusTitle}>
              Pedido en camino
            </Text>

            <Text style={styles.statusText}>
              Tu gas llegará en 30–45 minutos
            </Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                EN CURSO
              </Text>
            </View>
          </View>

          <View style={styles.addressCard}>
            <Text style={styles.sectionTitle}>
              DIRECCIÓN DE ENTREGA
            </Text>

            <Text style={styles.address}>
              📍 {address}
            </Text>
          </View>

          <View style={styles.summary}>
            <Text style={styles.sectionTitle}>
              RESUMEN
            </Text>

            {cart.map((item) => (
              <View
                key={item.id}
                style={styles.row}
              >
                <Text>
                  {
                    item.name.split("—")[0]
                  }{" "}
                  x {item.qty}
                </Text>

                <Text>
                  C$
                  {Number(
                    String(
                      item.price
                    ).replace(",", "")
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
              <Text
                style={
                  styles.totalLabel
                }
              >
                Total pagado
              </Text>

              <Text style={styles.total}>
                C${total}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() =>
              setModalVisible(true)
            }
          >
            <Text style={styles.cancelText}>
              Cancelar pedido
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={confirmPurchase}
          >
            <Text style={styles.confirmText}>
              Confirmar compra
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={confirmed}
          transparent
          animationType="fade"
        >
          <View style={styles.overlay}>
            <View style={styles.popup}>
              <Text
                style={styles.popupTitle}
              >
                ✅ ¡Compra confirmada!
              </Text>

              <Text
                style={{
                  color: "#FFF",
                }}
              >
                Tu pedido está en camino 🛵
              </Text>
            </View>
          </View>
        </Modal>

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
        >
          <View
            style={styles.overlayBottom}
          >
            <View
              style={styles.cancelModal}
            >
              <Text
                style={styles.cancelTitle}
              >
                ¿Por qué cancelas?
              </Text>

              <Text
                style={styles.cancelSub}
              >
                Cuéntanos el motivo para
                mejorar nuestro servicio
              </Text>

              {[
                "Me equivoqué en el pedido",
                "Ya no lo necesito",
                "Tardará mucho tiempo",
                "Otro motivo",
              ].map((motivo) => (
                <TouchableOpacity
                  key={motivo}
                  style={styles.reason}
                  onPress={() => {
                    clearCart();

                    navigation.reset({
                      index: 0,
                      routes: [
                        {
                          name: "Home",
                        },
                      ],
                    });
                  }}
                >
                  <Text>{motivo}</Text>
                </TouchableOpacity>
              ))}

              <TextInput
                style={styles.input}
                placeholder="Escribe tu motivo aquí..."
                multiline
              />
            </View>
          </View>
        </Modal>
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

  statusCard: {
    margin: 20,
    backgroundColor: "#1B1435",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
  },

  truck: { fontSize: 50 },

  statusTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 15,
  },

  statusText: {
    color: "#DDD",
    marginTop: 10,
  },

  badge: {
    marginTop: 15,
    backgroundColor: "#FFB000",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },

  badgeText: {
    fontWeight: "700",
  },

  addressCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },

  sectionTitle: {
    color: "#777",
    marginBottom: 10,
    fontWeight: "700",
  },

  address: {
    fontSize: 16,
    fontWeight: "600",
  },

  summary: {
    backgroundColor: "#FFF",
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    marginBottom: 120,
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
  },

  total: {
    color: "#FF6B00",
    fontWeight: "700",
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: 10,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#FBE5E5",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
  },

  confirmBtn: {
    flex: 1,
    backgroundColor: "#FF6B00",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
  },

  cancelText: {
    color: "#D94A4A",
    fontWeight: "700",
  },

  confirmText: {
    color: "#FFF",
    fontWeight: "700",
  },

  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  popup: {
    backgroundColor: "#15153A",
    padding: 25,
    borderRadius: 20,
    width: "85%",
  },

  popupTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  overlayBottom: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(0,0,0,0.4)",
  },

  cancelModal: {
    backgroundColor: "#FFF",
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  cancelTitle: {
    fontSize: 24,
    fontWeight: "700",
  },

  cancelSub: {
    marginTop: 10,
    color: "#666",
    marginBottom: 20,
  },

  reason: {
    backgroundColor: "#F3F3F3",
    padding: 18,
    borderRadius: 15,
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#F3F3F3",
    height: 100,
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
});