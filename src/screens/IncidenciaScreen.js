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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IncidenciaContext } from "../context/IncidenciaContext";
import { PedidoContext } from "../context/PedidoContext";
import { AuthContext } from "../context/AuthContext";
import { TIPOS_INCIDENCIA, ESTADOS_INCIDENCIA } from "../services/incidenciaService";

export default function IncidenciaScreen({ navigation, route }) {
  const { incidencias, loading, registrarIncidencia, cambiarEstadoIncidencia } =
    useContext(IncidenciaContext);
  const { pedidos } = useContext(PedidoContext);
  const { currentUser } = useContext(AuthContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(TIPOS_INCIDENCIA[0].id);
  const [pedidoId, setPedidoId] = useState(route.params?.pedidoId || "");
  const [descripcion, setDescripcion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState("todos");

  const abrirModalCrear = () => {
    setDescripcion("");
    setObservaciones("");
    setTipoSeleccionado(TIPOS_INCIDENCIA[0].id);
    if (pedidos.length > 0 && !pedidoId) {
      setPedidoId(pedidos[0].id);
    }
    setModalVisible(true);
  };

  const handleCrear = async () => {
    if (!descripcion.trim()) {
      Alert.alert("Campo obligatorio", "Por favor ingresa una descripción de la incidencia.");
      return;
    }

    try {
      setSubmitting(true);
      await registrarIncidencia({
        usuarioId: currentUser?.id || "dehkUp2gjgVT0piTBKfX",
        pedidoId: pedidoId || (pedidos[0]?.id || "NTiOxIHiRc8ZXWxcmVfR"),
        tipoIncidente: tipoSeleccionado,
        descripcion: descripcion.trim(),
        observaciones: observaciones.trim(),
      });
      setSubmitting(false);
      setModalVisible(false);
      Alert.alert("✅ Incidencia Registrada", "La incidencia se ha guardado en Firestore.");
    } catch (err) {
      setSubmitting(false);
      Alert.alert("Error", err.message || "No se pudo registrar la incidencia.");
    }
  };

  const handleCambiarEstado = (incidencia, nuevoEstado) => {
    Alert.alert(
      "Actualizar Incidencia",
      `¿Deseas cambiar el estado a "${nuevoEstado}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              await cambiarEstadoIncidencia(incidencia.id, nuevoEstado, "Actualizado desde la app");
              Alert.alert("Actualizado", "El estado se actualizó correctamente en Firestore.");
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ]
    );
  };

  const incidenciasFiltradas = incidencias.filter((item) => {
    if (filtroEstado === "todos") return true;
    return item.estado === filtroEstado;
  });

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F1B2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reporte de Incidencias</Text>
      </View>

      <View style={styles.actionsBar}>
        <TouchableOpacity style={styles.createBtn} onPress={abrirModalCrear}>
          <Ionicons name="warning-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.createBtnText}>Reportar Incidencia</Text>
        </TouchableOpacity>
      </View>

      {/* FILTROS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
        <TouchableOpacity
          style={[styles.filterChip, filtroEstado === "todos" && styles.filterChipActive]}
          onPress={() => setFiltroEstado("todos")}
        >
          <Text style={[styles.filterChipText, filtroEstado === "todos" && styles.filterChipTextActive]}>
            Todas ({incidencias.length})
          </Text>
        </TouchableOpacity>
        {ESTADOS_INCIDENCIA.map((est) => (
          <TouchableOpacity
            key={est}
            style={[styles.filterChip, filtroEstado === est && styles.filterChipActive]}
            onPress={() => setFiltroEstado(est)}
          >
            <Text style={[styles.filterChipText, filtroEstado === est && styles.filterChipTextActive]}>
              {est}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LISTA */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF6B00" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {incidenciasFiltradas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 36, marginBottom: 10 }}>📋</Text>
              <Text style={styles.emptyText}>No hay incidencias en esta categoría.</Text>
            </View>
          ) : (
            incidenciasFiltradas.map((inc) => (
              <View key={inc.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.tipoBadge}>
                    <Text style={styles.tipoText}>
                      ⚠️ {inc.tipo_incidente?.replace(/_/g, " ") || "Incidencia"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.estadoBadge,
                      inc.estado === "resuelta"
                        ? styles.estadoResuelta
                        : inc.estado === "en_revision"
                        ? styles.estadoRevision
                        : styles.estadoPendiente,
                    ]}
                  >
                    <Text style={styles.estadoText}>{inc.estado || "pendiente"}</Text>
                  </View>
                </View>

                <Text style={styles.descripcion}>{inc.descripcion}</Text>

                {inc.observaciones ? (
                  <Text style={styles.observaciones}>
                    <Text style={{ fontWeight: "700" }}>Obs: </Text>
                    {inc.observaciones}
                  </Text>
                ) : null}

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    📦 Pedido: {inc.pedidoId ? inc.pedidoId.slice(0, 8) + "..." : "No asignado"}
                  </Text>
                  <Text style={styles.metaText}>
                    📅 {inc.fechaRegistroFormateada || "Reciente"}
                  </Text>
                </View>

                {/* BOTONES DE ACCIÓN PARA RESOLVER / REVISAR */}
                <View style={styles.cardActions}>
                  {inc.estado !== "resuelta" && (
                    <TouchableOpacity
                      style={styles.actionBtnResuelta}
                      onPress={() => handleCambiarEstado(inc, "resuelta")}
                    >
                      <Text style={styles.actionBtnText}>Marcar Resuelta</Text>
                    </TouchableOpacity>
                  )}
                  {inc.estado !== "en_revision" && inc.estado !== "resuelta" && (
                    <TouchableOpacity
                      style={styles.actionBtnRevision}
                      onPress={() => handleCambiarEstado(inc, "en_revision")}
                    >
                      <Text style={styles.actionBtnTextDark}>En Revisión</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* MODAL CREAR INCIDENCIA */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reportar Nueva Incidencia</Text>

            <Text style={styles.label}>Tipo de Incidencia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {TIPOS_INCIDENCIA.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.tipoChip, tipoSeleccionado === t.id && styles.tipoChipActive]}
                  onPress={() => setTipoSeleccionado(t.id)}
                >
                  <Text
                    style={[
                      styles.tipoChipText,
                      tipoSeleccionado === t.id && styles.tipoChipTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>ID del Pedido Asociado</Text>
            <TextInput
              placeholder="Ej: NTiOxIHiRc8ZXWxcmVfR"
              value={pedidoId}
              onChangeText={setPedidoId}
              style={styles.input}
            />

            <Text style={styles.label}>Descripción de lo ocurrido</Text>
            <TextInput
              placeholder="Explica detalladamente la incidencia..."
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
              style={[styles.input, { height: 70, textAlignVertical: "top" }]}
            />

            <Text style={styles.label}>Observaciones adicionales</Text>
            <TextInput
              placeholder="Notas de contacto, teléfono, etc."
              value={observaciones}
              onChangeText={setObservaciones}
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleCrear}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Guardar Incidencia</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  backBtn: {
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F1B2E",
  },
  actionsBar: {
    padding: 16,
  },
  createBtn: {
    flexDirection: "row",
    backgroundColor: "#D9534F",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  createBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  filtersScroll: {
    paddingHorizontal: 16,
    maxHeight: 40,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#E4E6EA",
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#1F1B2E",
  },
  filterChipText: {
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#888",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EBEBEF",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tipoBadge: {
    backgroundColor: "#FFF2F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tipoText: {
    color: "#D9534F",
    fontWeight: "700",
    fontSize: 13,
    textTransform: "capitalize",
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  estadoPendiente: {
    backgroundColor: "#FFF5E6",
  },
  estadoRevision: {
    backgroundColor: "#EBF3FF",
  },
  estadoResuelta: {
    backgroundColor: "#EAF8F0",
  },
  estadoText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  descripcion: {
    fontSize: 15,
    color: "#222",
    marginBottom: 6,
    lineHeight: 20,
  },
  observaciones: {
    fontSize: 13,
    color: "#666",
    backgroundColor: "#F9F9FB",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 8,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#888",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  actionBtnResuelta: {
    backgroundColor: "#2ECC71",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionBtnRevision: {
    backgroundColor: "#E0E3EA",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  actionBtnTextDark: {
    color: "#333",
    fontSize: 12,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F1B2E",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
  },
  tipoChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#F0F0F3",
    borderRadius: 14,
    marginRight: 8,
  },
  tipoChipActive: {
    backgroundColor: "#D9534F",
  },
  tipoChipText: {
    fontSize: 13,
    color: "#555",
  },
  tipoChipTextActive: {
    color: "#FFF",
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#F6F7F9",
    borderWidth: 1,
    borderColor: "#E2E4E9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: "#E4E6EA",
    borderRadius: 12,
    marginRight: 8,
    alignItems: "center",
  },
  modalCancelText: {
    fontWeight: "700",
    color: "#444",
  },
  modalSubmitBtn: {
    flex: 2,
    padding: 14,
    backgroundColor: "#D9534F",
    borderRadius: 12,
    alignItems: "center",
  },
  modalSubmitText: {
    fontWeight: "700",
    color: "#FFF",
  },
});
