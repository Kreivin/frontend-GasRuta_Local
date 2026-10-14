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
import { Ionicons } from "@expo/vector-icons";

import { ResenaContext } from "../context/ResenaContext";
import colors from "../theme/color";

export default function ResenaScreen({ navigation, route }) {
  const { resenas, loading, error, agregarResena, editarResena, borrarResena, cargarResenas } =
    useContext(ResenaContext);

  const defaultClienteId = route.params?.clienteId || "MFSECY3Z1K6X3JePUdO5";
  const defaultPedidoId = route.params?.pedidoId || "NTiOxIHiRc8ZXWxcmVfR";
  const defaultRepartidorId = route.params?.repartidorId || "SPk4vMRTErAtvsg23WHa";

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedResena, setSelectedResena] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [clienteId, setClienteId] = useState(defaultClienteId);
  const [pedidoId, setPedidoId] = useState(defaultPedidoId);
  const [repartidorId, setRepartidorId] = useState(defaultRepartidorId);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const resetForm = () => {
    setCalificacion(5);
    setComentario("");
    setClienteId(defaultClienteId);
    setPedidoId(defaultPedidoId);
    setRepartidorId(defaultRepartidorId);
    setShowAdvanced(false);
    setEditMode(false);
    setSelectedResena(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleOpenEdit = (resena) => {
    setEditMode(true);
    setSelectedResena(resena);
    setCalificacion(resena.calificacion || 5);
    setComentario(resena.comentario || "");
    setClienteId(resena.clienteId || defaultClienteId);
    setPedidoId(resena.pedidoId || defaultPedidoId);
    setRepartidorId(resena.repartidorId || defaultRepartidorId);
    setShowAdvanced(false);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!comentario.trim()) {
      Alert.alert("Campo requerido", "Por favor escribe un comentario sobre tu experiencia.");
      return;
    }

    try {
      const data = {
        clienteId: clienteId.trim() || defaultClienteId,
        pedidoId: pedidoId.trim() || defaultPedidoId,
        repartidorId: repartidorId.trim() || defaultRepartidorId,
        calificacion: Number(calificacion),
        comentario: comentario.trim(),
      };

      if (editMode && selectedResena) {
        await editarResena(selectedResena.id, data);
        Alert.alert("✅ Reseña actualizada", "Gracias por actualizar tu comentario.");
      } else {
        await agregarResena(data);
        Alert.alert("🎉 ¡Gracias por tu opinión!", "Tu reseña ha sido registrada exitosamente.");
      }

      setModalVisible(false);
      resetForm();
    } catch (err) {
      Alert.alert("Error", "No se pudo guardar la reseña. Inténtalo de nuevo.");
    }
  };

  const handleDelete = (resena) => {
    Alert.alert(
      "Eliminar reseña",
      "¿Estás seguro de que deseas eliminar este comentario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await borrarResena(resena.id);
            } catch (err) {
              Alert.alert("Error", "No se pudo eliminar la reseña.");
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarResenas();
    setRefreshing(false);
  };

  const formatDate = (date) => {
    if (!date) return "Reciente";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "30 de septiembre de 2026, 11:56 a.m.";
    return d.toLocaleDateString("es-NI", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Promedio de calificación
  const avgRating =
    resenas.length > 0
      ? (resenas.reduce((acc, r) => acc + (Number(r.calificacion) || 5), 0) / resenas.length).toFixed(1)
      : "5.0";

  return (
    <View style={styles.container}>
      <View style={styles.phone}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("MainTabs");
              }
            }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.dark} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Reseñas</Text>
            <Text style={styles.subtitle}>Experiencia y Servicio</Text>
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreate}>
            <Ionicons name="star" size={16} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.addBtnText}>Opinar</Text>
          </TouchableOpacity>
        </View>

        {/* Resumen de Calificación */}
        <View style={styles.ratingSummaryCard}>
          <View style={styles.ratingLeft}>
            <Text style={styles.avgNumber}>{avgRating}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(Number(avgRating)) ? "star" : "star-outline"}
                  size={18}
                  color="#FFB000"
                />
              ))}
            </View>
            <Text style={styles.totalReviewsText}>
              Basado en {resenas.length} {resenas.length === 1 ? "opinión" : "opiniones"}
            </Text>
          </View>

          <View style={styles.ratingRight}>
            <TouchableOpacity style={styles.leaveReviewCTA} onPress={handleOpenCreate}>
              <Text style={styles.leaveReviewCTAText}>✍️ Dejar comentario</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Listado de Reseñas */}
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
          <Text style={styles.sectionHeader}>Comentarios de Clientes</Text>

          {resenas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 50 }}>💬</Text>
              <Text style={styles.emptyTitle}>Aún no hay reseñas</Text>
              <Text style={styles.emptySubtitle}>
                Sé el primero en calificar tu entrega y servicio.
              </Text>
              <TouchableOpacity style={styles.firstReviewBtn} onPress={handleOpenCreate}>
                <Text style={styles.firstReviewBtnText}>Escribir una reseña</Text>
              </TouchableOpacity>
            </View>
          ) : (
            resenas.map((item) => (
              <View key={item.id} style={styles.reviewCard}>
                <View style={styles.reviewCardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      👤
                    </Text>
                  </View>
                  <View style={styles.userMeta}>
                    <Text style={styles.userName}>
                      Cliente #{item.clienteId ? item.clienteId.slice(0, 8) : "Usuario"}
                    </Text>
                    <Text style={styles.reviewDate}>{formatDate(item.fechaResena)}</Text>
                  </View>

                  <View style={styles.starBadge}>
                    <Ionicons name="star" size={14} color="#FFB000" />
                    <Text style={styles.starBadgeText}>{item.calificacion || 5}</Text>
                  </View>
                </View>

                {/* Comentario principal */}
                <Text style={styles.reviewComment}>"{item.comentario}"</Text>

                {/* Tags / IDs de referencia */}
                <View style={styles.tagsContainer}>
                  {item.pedidoId && (
                    <View style={styles.tag}>
                      <Ionicons name="receipt-outline" size={12} color="#666" />
                      <Text style={styles.tagText}>Pedido: {item.pedidoId.slice(0, 10)}...</Text>
                    </View>
                  )}
                  {item.repartidorId && (
                    <View style={styles.tag}>
                      <Ionicons name="bicycle-outline" size={12} color="#666" />
                      <Text style={styles.tagText}>Repartidor: {item.repartidorId.slice(0, 10)}...</Text>
                    </View>
                  )}
                </View>

                {/* Botones de acción */}
                <View style={styles.reviewActions}>
                  <TouchableOpacity
                    style={styles.actionBtnEdit}
                    onPress={() => handleOpenEdit(item)}
                  >
                    <Ionicons name="pencil-outline" size={14} color="#1A73E8" />
                    <Text style={styles.actionBtnEditText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnDelete}
                    onPress={() => handleDelete(item)}
                  >
                    <Ionicons name="trash-outline" size={14} color="#D94A4A" />
                    <Text style={styles.actionBtnDeleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Modal para Crear o Editar Reseña */}
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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editMode ? "Editar Reseña" : "Califica tu Experiencia"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Ionicons name="close" size={24} color="#555" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Selector de Estrellas interactivo */}
                <Text style={styles.ratingLabel}>¿Cómo calificarías el servicio?</Text>
                <View style={styles.starPickerRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setCalificacion(star)}
                      style={styles.starTouch}
                    >
                      <Ionicons
                        name={star <= calificacion ? "star" : "star-outline"}
                        size={36}
                        color={star <= calificacion ? "#FFB000" : "#CCC"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.ratingHint}>
                  {calificacion === 5 && "⭐ ¡Excelente servicio!"}
                  {calificacion === 4 && "⭐ Muy buen servicio"}
                  {calificacion === 3 && "⭐ Servicio aceptable"}
                  {calificacion === 2 && "⭐ Regular"}
                  {calificacion === 1 && "⭐ Mal servicio"}
                </Text>

                {/* Campo de comentario */}
                <Text style={styles.inputLabel}>TU COMENTARIO</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Escribe tu opinión... (Ej: que buen servicio realizan las entregas rapido y en buen estado)"
                  placeholderTextColor="#999"
                  value={comentario}
                  onChangeText={setComentario}
                  multiline
                  numberOfLines={4}
                />

                {/* Opciones avanzadas de IDs */}
                <TouchableOpacity
                  style={styles.advancedToggle}
                  onPress={() => setShowAdvanced(!showAdvanced)}
                >
                  <Text style={styles.advancedToggleText}>
                    {showAdvanced ? "Ocultar IDs de referencia ▲" : "Ver / Modificar IDs de Firebase ▼"}
                  </Text>
                </TouchableOpacity>

                {showAdvanced && (
                  <View style={styles.advancedBox}>
                    <Text style={styles.subInputLabel}>ID Cliente (Usuario)</Text>
                    <TextInput
                      style={styles.smallInput}
                      value={clienteId}
                      onChangeText={setClienteId}
                      placeholder="MFSECY3Z1K6X3JePUdO5"
                      placeholderTextColor="#AAA"
                    />

                    <Text style={styles.subInputLabel}>ID Pedido</Text>
                    <TextInput
                      style={styles.smallInput}
                      value={pedidoId}
                      onChangeText={setPedidoId}
                      placeholder="NTiOxIHiRc8ZXWxcmVfR"
                      placeholderTextColor="#AAA"
                    />

                    <Text style={styles.subInputLabel}>ID Repartidor (Usuario)</Text>
                    <TextInput
                      style={styles.smallInput}
                      value={repartidorId}
                      onChangeText={setRepartidorId}
                      placeholder="SPk4vMRTErAtvsg23WHa"
                      placeholderTextColor="#AAA"
                    />
                  </View>
                )}

                {/* Botones de acción del Modal */}
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
                      {editMode ? "Actualizar" : "Publicar Reseña"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.dark,
  },
  subtitle: {
    fontSize: 12,
    color: colors.gray,
  },
  addBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  addBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
  ratingSummaryCard: {
    backgroundColor: "#FFF9F2",
    margin: 20,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FFE2C4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingLeft: {
    flex: 1,
  },
  avgNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FF6B00",
  },
  starsRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  totalReviewsText: {
    fontSize: 12,
    color: "#888",
  },
  ratingRight: {
    marginLeft: 10,
  },
  leaveReviewCTA: {
    backgroundColor: "#FF6B00",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  leaveReviewCTAText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#555",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.dark,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 20,
  },
  firstReviewBtn: {
    marginTop: 18,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  firstReviewBtnText: {
    color: "#FFF",
    fontWeight: "700",
  },
  reviewCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  reviewCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.dark,
  },
  reviewDate: {
    fontSize: 11,
    color: "#999",
  },
  starBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF6E5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  starBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#D48B00",
  },
  reviewComment: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    color: "#666",
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F4F4F4",
    paddingTop: 10,
  },
  actionBtnEdit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionBtnEditText: {
    fontSize: 12,
    color: "#1A73E8",
    fontWeight: "600",
  },
  actionBtnDelete: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionBtnDeleteText: {
    fontSize: 12,
    color: "#D94A4A",
    fontWeight: "600",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.dark,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
    textAlign: "center",
    marginBottom: 8,
  },
  starPickerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 6,
  },
  starTouch: {
    padding: 4,
  },
  ratingHint: {
    textAlign: "center",
    color: "#FF8C42",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#777",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  textArea: {
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: "#333",
    height: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    marginBottom: 14,
  },
  advancedToggle: {
    paddingVertical: 6,
    marginBottom: 10,
  },
  advancedToggleText: {
    fontSize: 12,
    color: "#1A73E8",
    fontWeight: "600",
  },
  advancedBox: {
    backgroundColor: "#F9F9F9",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  subInputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#888",
    marginBottom: 4,
  },
  smallInput: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: "#333",
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: "#F1F1F1",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelModalText: {
    fontWeight: "700",
    color: "#666",
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
