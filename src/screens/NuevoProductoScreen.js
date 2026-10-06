import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ProductContext } from "../context/ProductContext";

export default function NuevoProductoScreen({ route, navigation }) {
  const { addProduct, updateProduct } = useContext(ProductContext);

  // Verificamos si estamos editando o creando
  const mode = route.params?.mode || "create";
  const productToEdit = route.params?.product;

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Si estamos editando, rellenamos los campos con los datos actuales
  useEffect(() => {
    if (mode === "edit" && productToEdit) {
      setNombre(productToEdit.name || "");
      setPrecio(productToEdit.price || "");
      setDescripcion(productToEdit.description || "");
    }
  }, [mode, productToEdit]);

  const guardarProducto = () => {
    if (!nombre || !precio) {
      alert("Por favor completa al menos el nombre y el precio");
      return;
    }

    if (mode === "edit" && productToEdit) {
      updateProduct(productToEdit.id, { 
        name: nombre, 
        price: precio, 
        description: descripcion 
      });
    } else {
      addProduct({ 
        name: nombre, 
        price: precio, 
        description: descripcion 
      });
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {mode === "edit" ? "Editar Producto" : "Nuevo Producto"}
        </Text>
      </View>

      <TextInput
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />

      <TextInput
        placeholder="Precio"
        value={precio}
        onChangeText={setPrecio}
        style={styles.input}
      />

      <TextInput
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={guardarProducto}
      >
        <Text style={styles.buttonText}>
          {mode === "edit" ? "Guardar Cambios" : "Guardar Producto"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 25,
  },

  backBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    elevation: 3,
  },

  backText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B1435",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B1435",
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#FF6B00",
    padding: 18,
    borderRadius: 15,
    marginTop: 10,
  },

  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});