import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProductContext } from "../context/ProductContext";
import { PedidoContext } from "../context/PedidoContext";
import { IncidenciaContext } from "../context/IncidenciaContext";
import { HistorialContext } from "../context/HistorialContext";
import { AuthContext } from "../context/AuthContext";
import { ESTADOS_PEDIDO } from "../services/pedidoService";

export default function VistaAdminScreen({ navigation }) {
  const { products, deleteProduct } = useContext(ProductContext);
  const { pedidos, cambiarEstado, borrarPedido } = useContext(PedidoContext);
  const { incidencias, cambiarEstadoIncidencia } = useContext(IncidenciaContext);
  const { historial } = useContext(HistorialContext);
  const { usuarios, currentUser, seleccionarUsuario } = useContext(AuthContext);

  const [seccionActiva, setSeccionActiva] = useState("productos"); // productos | pedidos | incidencias | historial | usuarios

  const getCleanPrice = (priceVal) => {
    if (!priceVal) return "200";
    const raw = String(priceVal);
    const clean = raw.replace(/[C\$]+/g, "").trim();
    const match = clean.match(/\d+(\.\d+)?/g);
    return match ? match[match.length - 1] : "200";
  };

  const handleCambiarEstadoPedido = (pedido, nuevoEstado) => {
    Alert.alert(
      "Actualizar Pedido",
      `¿Cambiar el estado a "${nuevoEstado}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              await cambiarEstado(pedido.id, nuevoEstado, currentUser?.id);
              Alert.alert("Éxito", "Estado actualizado en Firestore.");
            } catch (e) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ]
    );
  };

  const handleEliminarPedido = (pedidoId) => {
    Alert.alert(
      "Eliminar Pedido",
      "¿Seguro que deseas eliminar este pedido de Firestore?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await borrarPedido(pedidoId);
              Alert.alert("Eliminado", "Pedido eliminado de la base de datos.");
            } catch (e) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Panel Administrador</Text>
            <Text style={styles.subUser}>
              👤 {currentUser?.Nombre || "Admin"} ({currentUser?.Rol || "Admin"})
            </Text>
          </View>
        </View>

        {/* PESTAÑAS DE ENTIDADES */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
        >
          <TouchableOpacity
            style={[styles.tabBtn, seccionActiva === "productos" && styles.tabBtnActive]}
            onPress={() => setSeccionActiva("productos")}
          >
            <Text style={[styles.tabText, seccionActiva === "productos" && styles.tabTextActive]}>
              🛢️ Productos ({products.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, seccionActiva === "pedidos" && styles.tabBtnActive]}
            onPress={() => setSeccionActiva("pedidos")}
          >
            <Text style={[styles.tabText, seccionActiva === "pedidos" && styles.tabTextActive]}>
              📦 Pedidos ({pedidos.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, seccionActiva === "incidencias" && styles.tabBtnActive]}
            onPress={() => setSeccionActiva("incidencias")}
          >
            <Text style={[styles.tabText, seccionActiva === "incidencias" && styles.tabTextActive]}>
              ⚠️ Incidencias ({incidencias.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, seccionActiva === "historial" && styles.tabBtnActive]}
            onPress={() => setSeccionActiva("historial")}
          >
            <Text style={[styles.tabText, seccionActiva === "historial" && styles.tabTextActive]}>
              📜 Historial ({historial.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, seccionActiva === "usuarios" && styles.tabBtnActive]}
            onPress={() => setSeccionActiva("usuarios")}
          >
            <Text style={[styles.tabText, seccionActiva === "usuarios" && styles.tabTextActive]}>
              👥 Usuarios ({usuarios.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* SECCIÓN 1: PRODUCTOS */}
        {seccionActiva === "productos" && (
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("NuevoProducto", { mode: "create" })}
            >
              <Text style={styles.addButtonText}>+ Agregar Cilindro</Text>
            </TouchableOpacity>

            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.nombre}>{item.name}</Text>
                  <Text style={styles.precio}>C${getCleanPrice(item.price)}</Text>
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
                      <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteProduct(item.id)}
                    >
                      <Text style={styles.buttonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {/* SECCIÓN 2: PEDIDOS */}
        {seccionActiva === "pedidos" && (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {pedidos.length === 0 ? (
              <Text style={styles.emptyNotice}>No hay pedidos registrados en Firestore.</Text>
            ) : (
              pedidos.map((p) => (
                <View key={p.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.idLabel}>ID: {p.id.slice(0, 8)}...</Text>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>{p.estado || "pendiente"}</Text>
                    </View>
                  </View>

                  <Text style={styles.nombre}>
                    {p.Producto?.nombre || "Cilindro"} - {p.Producto?.presentacion || ""} (x{p.cantidad || 1})
                  </Text>
                  <Text style={styles.precio}>Total: C${p.total || p.subtotal || 0}</Text>
                  <Text style={styles.direccionText}>
                    📍 {p.Ubicacion?.direccion || p.Direccion || "Sin dirección"}
                  </Text>
                  {p.Ubicacion?.referencia ? (
                    <Text style={styles.subRef}>Ref: {p.Ubicacion.referencia}</Text>
                  ) : null}

                  {/* CAMBIO RÁPIDO DE ESTADOS */}
                  <Text style={styles.statusActionLabel}>Actualizar estado:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                    {ESTADOS_PEDIDO.map((est) => (
                      <TouchableOpacity
                        key={est}
                        style={[
                          styles.stateOptionBtn,
                          p.estado === est && styles.stateOptionBtnActive,
                        ]}
                        onPress={() => handleCambiarEstadoPedido(p, est)}
                      >
                        <Text
                          style={[
                            styles.stateOptionText,
                            p.estado === est && styles.stateOptionTextActive,
                          ]}
                        >
                          {est}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleEliminarPedido(p.id)}
                    >
                      <Text style={styles.buttonText}>Eliminar Pedido</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* SECCIÓN 3: INCIDENCIAS */}
        {seccionActiva === "incidencias" && (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: "#D9534F" }]}
              onPress={() => navigation.navigate("Incidencia")}
            >
              <Text style={styles.addButtonText}>+ Ver y Registrar Incidencias</Text>
            </TouchableOpacity>

            {incidencias.length === 0 ? (
              <Text style={styles.emptyNotice}>No hay incidencias reportadas.</Text>
            ) : (
              incidencias.map((inc) => (
                <View key={inc.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={{ fontWeight: "700", color: "#D9534F" }}>
                      ⚠️ {inc.tipo_incidente}
                    </Text>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>{inc.estado}</Text>
                    </View>
                  </View>

                  <Text style={styles.nombre}>{inc.descripcion}</Text>
                  {inc.observaciones ? (
                    <Text style={styles.descripcion}>Obs: {inc.observaciones}</Text>
                  ) : null}
                  <Text style={styles.subRef}>
                    📦 Pedido: {inc.pedidoId || "No asignado"}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* SECCIÓN 4: HISTORIAL */}
        {seccionActiva === "historial" && (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {historial.length === 0 ? (
              <Text style={styles.emptyNotice}>No hay eventos de historial.</Text>
            ) : (
              historial.map((h) => (
                <View key={h.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={{ fontWeight: "700", color: "#1B1435" }}>
                      ⚡ {h.accion}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#888" }}>
                      {h.fechaEntregaFormateada}
                    </Text>
                  </View>
                  <Text style={styles.descripcion}>{h.descripcion}</Text>
                  <Text style={styles.subRef}>Estado resultante: {h.estado}</Text>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* SECCIÓN 5: USUARIOS */}
        {seccionActiva === "usuarios" && (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {usuarios.map((u) => (
              <View key={u.id} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.nombre}>{u.Nombre || u.Correo}</Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{u.Rol || "Cliente"}</Text>
                  </View>
                </View>
                <Text style={styles.descripcion}>✉️ {u.Correo}</Text>
                <Text style={styles.descripcion}>📞 {u.Telefono || "Sin teléfono"}</Text>
                <Text style={styles.descripcion}>📍 {u.Direccion || "Sin dirección"}</Text>

                <TouchableOpacity
                  style={[styles.editButton, { marginTop: 10, alignSelf: "flex-start" }]}
                  onPress={() => {
                    seleccionarUsuario(u);
                    Alert.alert("Usuario Activo", `Ahora estás usando la sesión de ${u.Nombre}`);
                  }}
                >
                  <Text style={styles.buttonText}>
                    {currentUser?.id === u.id ? "✓ Usuario Activo" : "Usar este Usuario"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
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
    maxWidth: 420,
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingTop: 45,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  },
  subUser: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  tabsScroll: {
    maxHeight: 45,
    marginBottom: 14,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#E4E6EA",
    borderRadius: 18,
    marginRight: 8,
    justifyContent: "center",
  },
  tabBtnActive: {
    backgroundColor: "#FF6B00",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  tabTextActive: {
    color: "#FFF",
  },
  addButton: {
    backgroundColor: "#FF6B00",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8E8EE",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  idLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
  },
  statusPill: {
    backgroundColor: "#FFF3E6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    color: "#FF6B00",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  nombre: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222222",
  },
  precio: {
    fontSize: 16,
    color: "#FF6B00",
    marginTop: 4,
    fontWeight: "bold",
  },
  direccionText: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  subRef: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  descripcion: {
    fontSize: 13,
    color: "#666666",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
  },
  editButton: {
    backgroundColor: "#1B1435",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#D9534F",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  emptyNotice: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 14,
  },
  statusActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,
  },
  stateOptionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#F0F0F4",
    borderRadius: 10,
    marginRight: 6,
  },
  stateOptionBtnActive: {
    backgroundColor: "#1B1435",
  },
  stateOptionText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
  },
  stateOptionTextActive: {
    color: "#FFF",
  },
});