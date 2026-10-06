import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { ProductContext } from "../context/ProductContext";

export default function VistaAdminScreen({ navigation }) {
  const { products, deleteProduct } = useContext(ProductContext);

  // Función limpia para asegurar que el precio se muestre con un solo C$
  const getCleanPrice = (priceVal) => {
    if (!priceVal) return "200";
    const raw = String(priceVal);
    const clean = raw.replace(/[C\$]+/g, "").trim();
    const match = clean.match(/\d+(\.\d+)?/g);
    return match ? match[match.length - 1] : "200";
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>

        {/* ENCABEZADO EXACTO */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            Panel Administrador
          </Text>
        </View>

        {/* BOTÓN AGREGAR EXACTO */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("NuevoProducto", { mode: "create" })}
        >
          <Text style={styles.addButtonText}>
            + Agregar Producto
          </Text>
        </TouchableOpacity>

        {/* LISTA DE PRODUCTOS */}
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nombre}>
                {item.name}
              </Text>

              <Text style={styles.precio}>
                C${getCleanPrice(item.price)}
              </Text>

              {item.description ? (
                <Text style={styles.descripcion} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate("NuevoProducto", {
                      mode: "edit",
                      product: item,
                    })
                  }
                >
                  <Text style={styles.buttonText}>
                    Editar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteProduct(item.id)}
                >
                  <Text style={styles.buttonText}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: 390,
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingTop: 25,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B1435",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B1435",
    flexShrink: 1,
  },
  addButton: {
    backgroundColor: "#FF6B00",
    height: 58,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  nombre: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
  },
  precio: {
    fontSize: 19,
    color: "#FF6B00",
    marginTop: 5,
    fontWeight: "bold",
  },
  descripcion: {
    fontSize: 14,
    color: "#666666",
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    marginTop: 16,
  },
  editButton: {
    backgroundColor: "#1B1435",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginRight: 12,
  },
  deleteButton: {
    backgroundColor: "#D9534F",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});