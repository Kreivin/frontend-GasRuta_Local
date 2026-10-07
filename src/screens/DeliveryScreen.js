import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import * as Location from "expo-location";

import { CartContext } from "../context/CartContext";

export default function DeliveryScreen({ navigation }) {
  const { cart } = useContext(CartContext);

  const [barrio, setBarrio] = useState("");
  const [referencia, setReferencia] = useState("");
  const [loadingGps, setLoadingGps] = useState(false);

  // Función para obtener la ubicación actual con expo-location
  const handleGetLocation = async () => {
    try {
      setLoadingGps(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos permisos de ubicación para autocompletar tu dirección."
        );
        setLoadingGps(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const addressData = reverseGeocode[0];
        const detectedBarrio = addressData.district || addressData.subregion || addressData.city || "Juigalpa";
        const detectedStreet = addressData.street || addressData.name || "Ubicación GPS actual";
        
        setBarrio(detectedBarrio);
        setReferencia(`Coordenadas detectadas (${detectedStreet})`);
      } else {
        setBarrio("Juigalpa, Chontales");
        setReferencia(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      }

      setLoadingGps(false);
    } catch (error) {
      setLoadingGps(false);
      Alert.alert("Error", "No pudimos obtener tu ubicación actual. Inténtalo de nuevo.");
    }
  };

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(String(item.price).replace(",", "")) *
        item.qty,
    0
  );

  const delivery = 50;
  const total = subtotal + delivery;

  const handleConfirmOrder = () => {
    if (!barrio.trim()) {
      alert("Por favor, ingresa o detecta tu barrio/sector.");
      return;
    }
    
    // Pasamos la dirección completa formateada a la siguiente pantalla
    const fullAddress = `${barrio}${referencia ? ` - ${referencia}` : ""}`;
    navigation.navigate("OrderStatus", { address: fullAddress });
  };

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
            <Text style={{ fontWeight: "700", color: "#1B1435" }}>Juigalpa, Chontales</Text>
            <Text style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
              {barrio ? `📍 ${barrio}` : "Ubicación de cobertura local"}
            </Text>
          </View>

          {/* BOTÓN GPS */}
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={handleGetLocation}
            disabled={loadingGps}
          >
            <Text style={styles.gpsButtonText}>
              {loadingGps ? "Obteniendo ubicación..." : "📍 Usar mi ubicación GPS actual"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>
            BARRIO / SECTOR
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej: Barrio El Carmen"
            value={barrio}
            onChangeText={setBarrio}
          />

          <Text style={styles.label}>
            REFERENCIA (OPCIONAL)
          </Text>

          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            multiline
            placeholder="Ej: Casa azul con portón negro"
            value={referencia}
            onChangeText={setReferencia}
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
            onPress={handleConfirmOrder}
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
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: "#EDF4EE",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D5E5D8",
  },

  mapIcon: {
    fontSize: 40,
    marginBottom: 8,
  },

  gpsButton: {
    backgroundColor: "#E8F0FE",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D2E3FC",
  },

  gpsButtonText: {
    color: "#1A73E8",
    fontWeight: "700",
    fontSize: 15,
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