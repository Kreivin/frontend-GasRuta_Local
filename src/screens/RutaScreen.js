import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { RutaContext } from "../context/RutaContext";
import { PedidoContext } from "../context/PedidoContext";
import colors from "../theme/color";

export default function RutaScreen({ navigation }) {
  const { rutas, loading, error, agregarRuta, editarRuta, borrarRuta, cargarRutas } =
    useContext(RutaContext);
  const { pedidos } = useContext(PedidoContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Campos del formulario
  const [pedidoId, setPedidoId] = useState("");
  const [distanciaEstimada, setDistanciaEstimada] = useState("");
  const [rutaAsignada, setRutaAsignada] = useState("");
  const [tiempoEstimado, setTiempoEstimado] = useState("");

  const resetForm = () => {
    setPedidoId(pedidos[0]?.id || "");
    setDistanciaEstimada("");
    setRutaAsignada("");
    setTiempoEstimado("");
    setEditMode(false);
    setSelectedRuta(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    if (pedidos.length > 0) {
      setPedidoId(pedidos[0].id);
    }
    setModalVisible(true);
  };

  const handleOpenEdit = (ruta) => {
    setEditMode(true);
    setSelectedRuta(ruta);
    setPedidoId(ruta.pedidoId || "");
    setDistanciaEstimada(ruta.distancia_estimada || "");
    setRutaAsignada(ruta.ruta_asignada || "");
    setTiempoEstimado(ruta.tiempo_estimado ? String(ruta.tiempo_estimado) : "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!pedidoId.trim()) {
      Alert.alert("Error", "El ID del pedido es obligatorio.");
      return;
    }
    if (!rutaAsignada.trim()) {
      Alert.alert("Error", "La ruta asignada es obligatoria.");
      return;
    }

    try {
      const rutaData = {
        pedidoId: pedidoId.trim(),
        distancia_estimada: distanciaEstimada.trim(),
        ruta_asignada: rutaAsignada.trim(),
        tiempo_estimado: Number(tiempoEstimado) || 0,
        fecha_inicio: new Date(),
        fecha_final: null,
      };

      if (editMode && selectedRuta) {
        await editarRuta(selectedRuta.id, rutaData);
        Alert.alert("✅ Ruta actualizada", "La ruta se actualizó correctamente.");
      } else {
        await agregarRuta(rutaData);
        Alert.alert("✅ Ruta creada", "La nueva ruta se creó correctamente.");
      }

      setModalVisible(false);
      resetForm();
    } catch (err) {
      Alert.alert("Error", "No se pudo guardar la ruta. Intenta de nuevo.");
    }
  };

  const handleDelete = (ruta) => {
    Alert.alert(
      "Eliminar ruta",
      `¿Estás seguro de eliminar la ruta "${ruta.ruta_asignada}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await borrarRuta(ruta.id);
              Alert.alert("Eliminada", "La ruta fue eliminada.");
            } catch (err) {
              Alert.alert("Error", "No se pudo eliminar la ruta.");
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarRutas();
    setRefreshing(false);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return date.toLocaleDateString("es-NI", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && rutas.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando rutas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.phone}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Rutas</Text>

          <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreate}>
            <Text style={styles.addBtnText}>+ Nueva</Text>
          </TouchableOpacity>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Lista de Rutas */}
        <ScrollView
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          {rutas.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🛣️</Text>
              <Text style={styles.emptyTitle}>Sin rutas</Text>
              <Text style={styles.emptySubtitle}>
                Aún no hay rutas registradas.{"\n"}Crea una nueva para comenzar.
              </Text>
            </View>
          ) : (
            rutas.map((ruta) => (
              <View key={ruta.id} style={styles.rutaCard}>
                {/* Cabecera de la tarjeta */}
                <View style={styles.cardHeader}>
                  <View style={styles.routeBadge}>
                    <Text style={styles.routeBadgeText}>🛣️</Text>
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.rutaName} numberOfLines={1}>
                      {ruta.ruta_asignada || "Ruta sin nombre"}
                    </Text>
                    <Text style={styles.rutaPedido}>
                      Pedido: {ruta.pedidoId || "N/A"}
                    </Text>
                  </View>
                </View>

                {/* Detalles */}
                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📏 Distancia</Text>
                    <Text style={styles.detailValue}>
                      {ruta.distancia_estimada || "—"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>⏱️ Tiempo est.</Text>
                    <Text style={styles.detailValue}>
                      {ruta.tiempo_estimado ? `${ruta.tiempo_estimado} min` : "—"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🟢 Inicio</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(ruta.fecha_inicio)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🔴 Final</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(ruta.fecha_final)}
                    </Text>
                  </View>
                </View>

                {/* Acciones */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenEdit(ruta)}
                  >
                    <Text style={styles.editBtnText}>✏️ Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(ruta)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️ Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* Espaciado inferior */}
          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Modal para crear/editar */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setModalVisible(false);
            resetForm();
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editMode ? "Editar Ruta" : "Nueva Ruta"}
              </Text>

              <Text style={styles.inputLabel}>ID DEL PEDIDO</Text>
              <TextInput
                style={styles.input}
                placeholder="ID del documento en Pedido"
                value={pedidoId}
                onChangeText={setPedidoId}
                placeholderTextColor="#AAA"
              />

              <Text style={styles.inputLabel}>RUTA ASIGNADA</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: madrid, el santuario, en juigalpa"
                value={rutaAsignada}
                onChangeText={setRutaAsignada}
                placeholderTextColor="#AAA"
              />

              <Text style={styles.inputLabel}>DISTANCIA ESTIMADA</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 20km de distancia"
                value={distanciaEstimada}
                onChangeText={setDistanciaEstimada}
                placeholderTextColor="#AAA"
              />

              <Text style={styles.inputLabel}>TIEMPO ESTIMADO (minutos)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 18"
                value={tiempoEstimado}
                onChangeText={setTiempoEstimado}
                keyboardType="numeric"
                placeholderTextColor="#AAA"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelModalText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>
                    {editMode ? "Guardar cambios" : "Crear ruta"}
                  </Text>
                </TouchableOpacity>
              </View>
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
  center: {
    justifyContent: "center",
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
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    flex: 1,
    marginLeft: 15,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  addBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  errorBanner: {
    backgroundColor: "#FBE5E5",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  errorText: {
    color: "#D94A4A",
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 15,
    color: colors.gray,
    fontSize: 16,
  },

  // Estado vacío
  emptyState: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },

  // Tarjeta de ruta
  rutaCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  routeBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF3E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  routeBadgeText: {
    fontSize: 22,
  },
  cardHeaderText: {
    flex: 1,
  },
  rutaName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 3,
  },
  rutaPedido: {
    fontSize: 12,
    color: colors.gray,
  },

  // Detalles de la tarjeta
  cardDetails: {
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.gray,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "600",
    maxWidth: "55%",
    textAlign: "right",
  },

  // Acciones de la tarjeta
  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#E8F0FE",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  editBtnText: {
    color: "#1A73E8",
    fontWeight: "700",
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#FBE5E5",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#D94A4A",
    fontWeight: "700",
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 20,
  },
  inputLabel: {
    fontWeight: "700",
    color: colors.gray,
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#F4F4F4",
    borderRadius: 15,
    padding: 15,
    marginBottom: 16,
    fontSize: 15,
    color: colors.text,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelModalText: {
    fontWeight: "700",
    color: colors.gray,
    fontSize: 15,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
