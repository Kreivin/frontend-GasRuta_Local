import React, {
  useContext,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";

import * as Location from "expo-location";

import {
  CartContext,
} from "../context/CartContext";

import {
  AuthContext,
} from "../context/AuthContext";

import {
  PedidoContext,
} from "../context/PedidoContext";

export default function DeliveryScreen({
  navigation,
}) {
  const cartContext =
    useContext(CartContext);

  const authContext =
    useContext(AuthContext);

  const pedidoContext =
    useContext(PedidoContext);

  const cart =
    cartContext?.cart || [];

  const currentUser =
    authContext?.currentUser || null;

  const crearPedido =
    pedidoContext?.crearPedido;

  const [barrio, setBarrio] =
    useState("");

  const [referencia, setReferencia] =
    useState("");

  const [loadingGps, setLoadingGps] =
    useState(false);

  const [
    creandoPedido,
    setCreandoPedido,
  ] = useState(false);

  // =========================
  // Obtener ubicación GPS
  // =========================

  const handleGetLocation = async () => {
    try {
      setLoadingGps(true);

      const permiso =
        await Location.requestForegroundPermissionsAsync();

      if (permiso.status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos acceso a la ubicación para detectar tu dirección."
        );

        return;
      }

      const ubicacion =
        await Location.getCurrentPositionAsync({
          accuracy:
            Location.Accuracy.Balanced,
        });

      const {
        latitude,
        longitude,
      } = ubicacion.coords;

      const direcciones =
        await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

      if (direcciones.length > 0) {
        const direccionDetectada =
          direcciones[0];

        const barrioDetectado =
          direccionDetectada.district ||
          direccionDetectada.subregion ||
          direccionDetectada.city ||
          "Juigalpa";

        const calleDetectada =
          direccionDetectada.street ||
          direccionDetectada.name ||
          "Ubicación GPS actual";

        setBarrio(barrioDetectado);

        setReferencia(
          `Coordenadas detectadas (${calleDetectada}). Lat: ${latitude.toFixed(
            5
          )}, Lng: ${longitude.toFixed(5)}`
        );
      } else {
        setBarrio(
          "Juigalpa, Chontales"
        );

        setReferencia(
          `Lat: ${latitude.toFixed(
            5
          )}, Lng: ${longitude.toFixed(5)}`
        );
      }
    } catch (error) {
      console.log(
        "Error obteniendo ubicación:",
        error.message
      );

      Alert.alert(
        "No se pudo obtener la ubicación",
        "Puedes ingresar la dirección manualmente."
      );
    } finally {
      setLoadingGps(false);
    }
  };

  // =========================
  // Obtener precio
  // =========================

  const obtenerPrecio = (item) => {
    const valor =
      item.price ??
      item.precio ??
      0;

    const precio = Number(
      String(valor)
        .replace(/C\$/gi, "")
        .replace(/,/g, "")
        .trim()
    );

    return Number.isNaN(precio)
      ? 0
      : precio;
  };

  // =========================
  // Obtener cantidad
  // =========================

  const obtenerCantidad = (item) => {
    const cantidad = Number(
      item.qty ??
      item.cantidad ??
      1
    );

    return Number.isNaN(cantidad)
      ? 1
      : cantidad;
  };

  // =========================
  // Obtener peso
  // =========================

  const obtenerPesoKg = (item) => {
    const pesoDirecto =
      item.pesoKg ??
      item.peso ??
      item.weight ??
      item.kg;

    if (
      pesoDirecto !== undefined &&
      pesoDirecto !== null
    ) {
      const pesoNumerico = Number(
        String(pesoDirecto).replace(
          /[^0-9.]/g,
          ""
        )
      );

      if (!Number.isNaN(pesoNumerico)) {
        return pesoNumerico;
      }
    }

    const texto = [
      item.name,
      item.nombre,
      item.title,
      item.presentacion,
      item.description,
      item.descripcion,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const coincidenciaKg = texto.match(
      /(\d+(?:\.\d+)?)\s*kg/i
    );

    if (coincidenciaKg) {
      return Number(coincidenciaKg[1]);
    }

    if (
      texto.includes("pequeño") ||
      texto.includes("pequeno")
    ) {
      return 5;
    }

    if (texto.includes("mediano")) {
      return 10;
    }

    if (texto.includes("grande")) {
      return 15;
    }

    if (texto.includes("industrial")) {
      return 45;
    }

    return null;
  };

  // =========================
  // Totales
  // =========================

  const subtotal = cart.reduce(
    (suma, item) =>
      suma +
      obtenerPrecio(item) *
        obtenerCantidad(item),
    0
  );

  const delivery = 50;
  const total = subtotal + delivery;

  // =========================
  // Limpiar carrito
  // =========================

  const limpiarCarritoActual = () => {
    if (
      typeof cartContext?.clearCart ===
      "function"
    ) {
      cartContext.clearCart();
      return;
    }

    if (
      typeof cartContext?.limpiarCarrito ===
      "function"
    ) {
      cartContext.limpiarCarrito();
      return;
    }

    if (
      typeof cartContext?.vaciarCarrito ===
      "function"
    ) {
      cartContext.vaciarCarrito();
    }
  };

  // =========================
  // Confirmar pedido
  // =========================

  const handleConfirmOrder = async () => {
    const usuarioId =
      currentUser?.id ||
      currentUser?.uid;

    if (!usuarioId) {
      Alert.alert(
        "Sesión requerida",
        "No se encontró el usuario autenticado."
      );

      return;
    }

    if (!barrio.trim()) {
      Alert.alert(
        "Dirección requerida",
        "Ingresa o detecta tu barrio o sector."
      );

      return;
    }

    if (!cart || cart.length === 0) {
      Alert.alert(
        "Carrito vacío",
        "Agrega un cilindro antes de confirmar el pedido."
      );

      return;
    }

    /*
     * El backend actual admite una presentación
     * de cilindro por pedido.
     */
    if (cart.length > 1) {
      Alert.alert(
        "Un producto por pedido",
        "Por el momento debes seleccionar una sola presentación de cilindro."
      );

      return;
    }

    if (typeof crearPedido !== "function") {
      Alert.alert(
        "Configuración incompleta",
        "La función crearPedido no está disponible en PedidoContext."
      );

      console.log(
        "PedidoContext disponible:",
        pedidoContext
      );

      return;
    }

    const producto = cart[0];

    const pesoKg =
      obtenerPesoKg(producto);

    const cantidad =
      obtenerCantidad(producto);

    if (
      !pesoKg ||
      ![5, 10, 15, 45].includes(pesoKg)
    ) {
      console.log(
        "Producto no reconocido:",
        producto
      );

      Alert.alert(
        "Presentación no válida",
        "No fue posible identificar el peso del cilindro. Los pesos permitidos son 5, 10, 15 y 45 kg."
      );

      return;
    }

    if (
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      Alert.alert(
        "Cantidad no válida",
        "La cantidad debe ser un número entero mayor que cero."
      );

      return;
    }

    const datosPedido = {
      usuarioId,
      pesoKg,
      cantidad,
      direccion: barrio.trim(),
      referencia: referencia.trim(),
      costoEnvio: delivery,
    };

    console.log(
      "Creando pedido:",
      datosPedido
    );

    try {
      setCreandoPedido(true);

      /*
       * El pedido se crea una sola vez aquí.
       * OrderStatus no debe volver a crearlo.
       */
      const resultado =
        await crearPedido(datosPedido);

      console.log(
        "Pedido creado:",
        resultado
      );

      const pedidoId =
        resultado?.id ||
        resultado?.pedido?.id ||
        null;

      const pedidoCreado =
        resultado?.pedido ||
        resultado;

      limpiarCarritoActual();

      Alert.alert(
        "Pedido confirmado",
        "El pedido fue registrado correctamente."
      );

      navigation.navigate(
        "OrderStatus",
        {
          pedidoId,
          pedido: pedidoCreado,
          address: `${barrio.trim()}${
            referencia.trim()
              ? ` - ${referencia.trim()}`
              : ""
          }`,
          creado: true,
        }
      );
    } catch (error) {
      const datosBackend =
        error.response?.data;

      const mensaje =
        datosBackend?.mensaje ||
        datosBackend?.error ||
        error.message ||
        "Ocurrió un error al registrar el pedido.";

      console.log(
        "===== ERROR CREANDO PEDIDO ====="
      );
      console.log("Mensaje:", mensaje);
      console.log(
        "Estado HTTP:",
        error.response?.status
      );
      console.log(
        "Respuesta backend:",
        datosBackend
      );
      console.log(
        "Datos enviados:",
        datosPedido
      );
      console.log(
        "================================"
      );

      Alert.alert(
        "No se pudo crear el pedido",
        mensaje
      );
    } finally {
      setCreandoPedido(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.phone}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Encabezado */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() =>
                navigation.goBack()
              }
            >
              <Text style={styles.backText}>
                ←
              </Text>
            </TouchableOpacity>

            <Text style={styles.title}>
              Dirección de entrega
            </Text>
          </View>

          {/* Ubicación */}
          <View style={styles.mapBox}>
            <Text style={styles.mapIcon}>
              🗺️
            </Text>

            <Text style={styles.mapTitle}>
              Juigalpa, Chontales
            </Text>

            <Text style={styles.mapSubtitle}>
              {barrio
                ? `📍 ${barrio}`
                : "Ubicación de cobertura local"}
            </Text>
          </View>

          {/* Botón GPS */}
          <TouchableOpacity
            style={[
              styles.gpsButton,
              (loadingGps ||
                creandoPedido) &&
                styles.disabledButton,
            ]}
            onPress={handleGetLocation}
            disabled={
              loadingGps ||
              creandoPedido
            }
          >
            {loadingGps ? (
              <ActivityIndicator
                color="#1A73E8"
              />
            ) : (
              <Text
                style={
                  styles.gpsButtonText
                }
              >
                📍 Usar mi ubicación GPS actual
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>
            BARRIO / SECTOR
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej: Barrio El Carmen"
            placeholderTextColor="#999999"
            value={barrio}
            onChangeText={setBarrio}
            editable={!creandoPedido}
          />

          <Text style={styles.label}>
            REFERENCIA (OPCIONAL)
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.referenceInput,
            ]}
            multiline
            placeholder="Ej: Casa azul con portón negro"
            placeholderTextColor="#999999"
            value={referencia}
            onChangeText={setReferencia}
            editable={!creandoPedido}
          />

          {/* Resumen */}
          <View style={styles.summary}>
            <Text
              style={styles.summaryTitle}
            >
              RESUMEN DEL PEDIDO
            </Text>

            {cart.length === 0 ? (
              <Text style={styles.emptyCart}>
                No hay productos en el
                carrito.
              </Text>
            ) : (
              cart.map((item) => (
                <View
                  key={item.id}
                  style={styles.row}
                >
                  <Text
                    style={
                      styles.productName
                    }
                  >
                    {item.name ||
                      item.nombre ||
                      "Cilindro de gas"}{" "}
                    x {obtenerCantidad(item)}
                  </Text>

                  <Text
                    style={
                      styles.priceText
                    }
                  >
                    C$
                    {obtenerPrecio(item) *
                      obtenerCantidad(item)}
                  </Text>
                </View>
              ))
            )}

            <View style={styles.row}>
              <Text>Delivery</Text>

              <Text>C${delivery}</Text>
            </View>

            <View style={styles.line} />

            <View style={styles.row}>
              <Text
                style={styles.totalLabel}
              >
                Total
              </Text>

              <Text style={styles.total}>
                C${total}
              </Text>
            </View>
          </View>

          {/* Confirmar */}
          <TouchableOpacity
            style={[
              styles.button,
              creandoPedido &&
                styles.disabledButton,
            ]}
            onPress={handleConfirmOrder}
            disabled={creandoPedido}
          >
            {creandoPedido ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={styles.buttonText}
              >
                Confirmar pedido 🚚
              </Text>
            )}
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
    backgroundColor: "#FFFFFF",
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

  backText: {
    fontSize: 20,
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

  mapTitle: {
    fontWeight: "700",
    color: "#1B1435",
  },

  mapSubtitle: {
    fontSize: 13,
    color: "#666666",
    marginTop: 4,
    textAlign: "center",
  },

  gpsButton: {
    minHeight: 50,
    backgroundColor: "#E8F0FE",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    justifyContent: "center",
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
    color: "#777777",
  },

  input: {
    minHeight: 52,
    backgroundColor: "#F4F4F4",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 13,
    color: "#222222",
  },

  referenceInput: {
    height: 100,
    textAlignVertical: "top",
  },

  summary: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  summaryTitle: {
    fontWeight: "700",
    marginBottom: 15,
    color: "#777777",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 12,
  },

  productName: {
    flex: 1,
  },

  priceText: {
    fontWeight: "600",
  },

  emptyCart: {
    color: "#999999",
    textAlign: "center",
    marginBottom: 16,
  },

  line: {
    height: 1,
    backgroundColor: "#EEEEEE",
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
    minHeight: 58,
    backgroundColor: "#FF6B00",
    margin: 20,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});