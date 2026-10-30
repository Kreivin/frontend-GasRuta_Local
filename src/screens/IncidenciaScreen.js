import React, {
  useContext,
  useEffect,
  useState,
} from "react";

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

import {
  IncidenciaContext,
} from "../context/IncidenciaContext";

import {
  PedidoContext,
} from "../context/PedidoContext";

import {
  AuthContext,
} from "../context/AuthContext";

import {
  TIPOS_INCIDENCIA,
  ESTADOS_INCIDENCIA,
} from "../services/incidenciaService";

export default function IncidenciaScreen({
  navigation,
  route,
}) {
  const {
    incidencias,
    loading,
    error,
    registrarIncidencia,
    cambiarEstadoIncidencia,
    refrescarIncidencias,
  } = useContext(IncidenciaContext);

  const {
    pedidos = [],
  } = useContext(PedidoContext);

  const {
    currentUser,
  } = useContext(AuthContext);

  // =========================
  // Estados del formulario
  // =========================

  const [modalVisible, setModalVisible] =
    useState(false);

  const [
    tipoSeleccionado,
    setTipoSeleccionado,
  ] = useState(
    TIPOS_INCIDENCIA[0]?.id || "otro"
  );

  const [pedidoId, setPedidoId] =
    useState("");

  const [rutaId, setRutaId] =
    useState("");

  const [descripcion, setDescripcion] =
    useState("");

  const [
    observaciones,
    setObservaciones,
  ] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [
    filtroEstado,
    setFiltroEstado,
  ] = useState("todos");

  // =========================
  // Recibir pedido desde navegación
  // =========================

  useEffect(() => {
    const pedidoRecibido =
      route?.params?.pedidoId;

    const rutaRecibida =
      route?.params?.rutaId;

    const crearNueva =
      route?.params?.crearNueva;

    if (pedidoRecibido) {
      setPedidoId(pedidoRecibido);
    }

    if (rutaRecibida) {
      setRutaId(rutaRecibida);
    }

    if (crearNueva && pedidoRecibido) {
      setDescripcion("");
      setObservaciones("");
      setTipoSeleccionado(
        TIPOS_INCIDENCIA[0]?.id || "otro"
      );
      setModalVisible(true);

      /*
       * Limpiamos el parámetro para evitar que el
       * formulario vuelva a abrirse automáticamente.
       */
      navigation.setParams({
        crearNueva: false,
      });
    }
  }, [
    route?.params?.pedidoId,
    route?.params?.rutaId,
    route?.params?.crearNueva,
    navigation,
  ]);

  // =========================
  // Abrir formulario manualmente
  // =========================

  const abrirModalCrear = () => {
    setDescripcion("");
    setObservaciones("");
    setTipoSeleccionado(
      TIPOS_INCIDENCIA[0]?.id || "otro"
    );

    /*
     * Si no se recibió un pedido desde navegación,
     * seleccionamos temporalmente el primero.
     */
    if (!pedidoId && pedidos.length > 0) {
      setPedidoId(pedidos[0].id);
    }

    setModalVisible(true);
  };

  // =========================
  // Cerrar formulario
  // =========================

  const cerrarModal = () => {
    if (submitting) {
      return;
    }

    setModalVisible(false);
    setDescripcion("");
    setObservaciones("");
    setTipoSeleccionado(
      TIPOS_INCIDENCIA[0]?.id || "otro"
    );
  };

  // =========================
  // Crear incidencia
  // =========================

  const handleCrear = async () => {
    const usuarioId =
      route?.params?.usuarioId ||
      currentUser?.id ||
      currentUser?.uid;

    const pedidoSeleccionado =
      pedidoId.trim();

    const rutaSeleccionada =
      rutaId.trim();

    if (!usuarioId) {
      Alert.alert(
        "Usuario no encontrado",
        "No se pudo identificar al usuario que está reportando la incidencia."
      );
      return;
    }

    if (!pedidoSeleccionado) {
      Alert.alert(
        "Pedido obligatorio",
        "Selecciona o indica el pedido asociado con la incidencia."
      );
      return;
    }

    if (!tipoSeleccionado) {
      Alert.alert(
        "Tipo obligatorio",
        "Selecciona el tipo de incidencia."
      );
      return;
    }

    if (!descripcion.trim()) {
      Alert.alert(
        "Descripción obligatoria",
        "Explica brevemente qué ocurrió."
      );
      return;
    }

    try {
      setSubmitting(true);

      const datosIncidencia = {
        usuarioId,
        pedidoId: pedidoSeleccionado,
        tipoIncidente:
          tipoSeleccionado,
        descripcion:
          descripcion.trim(),
        observaciones:
          observaciones.trim(),
      };

      // La ruta es opcional
      if (rutaSeleccionada) {
        datosIncidencia.rutaId =
          rutaSeleccionada;
      }

      console.log(
        "Datos enviados para incidencia:",
        datosIncidencia
      );

      const resultado =
        await registrarIncidencia(
          datosIncidencia
        );

      console.log(
        "Incidencia creada:",
        resultado
      );

      if (refrescarIncidencias) {
        await refrescarIncidencias();
      }

      setModalVisible(false);
      setDescripcion("");
      setObservaciones("");
      setTipoSeleccionado(
        TIPOS_INCIDENCIA[0]?.id || "otro"
      );

      Alert.alert(
        "Incidencia registrada",
        "El reporte se guardó correctamente."
      );
    } catch (err) {
      const mensaje =
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        err.message ||
        "No se pudo registrar la incidencia.";

      console.error(
        "Error creando incidencia:",
        err.response?.data || err.message
      );

      Alert.alert(
        "No se pudo registrar",
        mensaje
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // Cambiar estado
  // =========================

  const handleCambiarEstado = (
    incidencia,
    nuevoEstado
  ) => {
    Alert.alert(
      "Actualizar incidencia",
      `¿Deseas cambiar el estado a "${nuevoEstado.replace(
        /_/g,
        " "
      )}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              await cambiarEstadoIncidencia(
                incidencia.id,
                nuevoEstado,
                "Actualizado desde la aplicación"
              );

              if (refrescarIncidencias) {
                await refrescarIncidencias();
              }

              Alert.alert(
                "Estado actualizado",
                "La incidencia se actualizó correctamente."
              );
            } catch (err) {
              Alert.alert(
                "No se pudo actualizar",
                err.response?.data?.mensaje ||
                  err.response?.data?.error ||
                  err.message ||
                  "Ocurrió un error."
              );
            }
          },
        },
      ]
    );
  };

  // =========================
  // Filtrar incidencias
  // =========================

  const incidenciasFiltradas =
    incidencias.filter((item) => {
      if (filtroEstado === "todos") {
        return true;
      }

      return item.estado === filtroEstado;
    });

  // =========================
  // Obtener etiqueta de tipo
  // =========================

  const obtenerEtiquetaTipo = (
    tipoIncidente
  ) => {
    const tipoEncontrado =
      TIPOS_INCIDENCIA.find(
        (tipo) =>
          tipo.id === tipoIncidente
      );

    return (
      tipoEncontrado?.label ||
      tipoIncidente
        ?.replace(/_/g, " ") ||
      "Incidencia"
    );
  };

  // =========================
  // Obtener estilo por estado
  // =========================

  const obtenerEstiloEstado = (
    estado
  ) => {
    switch (estado) {
      case "resuelta":
        return styles.estadoResuelta;

      case "en_revision":
        return styles.estadoRevision;

      case "cancelada":
        return styles.estadoCancelada;

      default:
        return styles.estadoPendiente;
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#1F1B2E"
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Reporte de Incidencias
          </Text>

          <Text style={styles.headerSubtitle}>
            Seguimiento de problemas y entregas
          </Text>
        </View>
      </View>

      {/* Mensaje de error */}
      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color="#B42318"
          />

          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : null}

      {/* Acción principal */}
      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={abrirModalCrear}
          activeOpacity={0.8}
        >
          <Ionicons
            name="warning-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.createBtnText}>
            Reportar incidencia
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={
          styles.filtersContent
        }
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            filtroEstado === "todos" &&
              styles.filterChipActive,
          ]}
          onPress={() =>
            setFiltroEstado("todos")
          }
        >
          <Text
            style={[
              styles.filterChipText,
              filtroEstado === "todos" &&
                styles.filterChipTextActive,
            ]}
          >
            Todas ({incidencias.length})
          </Text>
        </TouchableOpacity>

        {ESTADOS_INCIDENCIA.map(
          (estado) => {
            const total =
              incidencias.filter(
                (incidencia) =>
                  incidencia.estado === estado
              ).length;

            return (
              <TouchableOpacity
                key={estado}
                style={[
                  styles.filterChip,
                  filtroEstado === estado &&
                    styles.filterChipActive,
                ]}
                onPress={() =>
                  setFiltroEstado(estado)
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filtroEstado === estado &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {estado.replace(/_/g, " ")}
                  {" "}({total})
                </Text>
              </TouchableOpacity>
            );
          }
        )}
      </ScrollView>

      {/* Lista */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#FF6B00"
          />

          <Text style={styles.loadingText}>
            Cargando incidencias...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={false}
        >
          {incidenciasFiltradas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={58}
                color="#B4B4B4"
              />

              <Text style={styles.emptyTitle}>
                No hay incidencias
              </Text>

              <Text style={styles.emptyText}>
                No se encontraron incidencias en
                esta categoría.
              </Text>
            </View>
          ) : (
            incidenciasFiltradas.map(
              (incidencia) => (
                <View
                  key={incidencia.id}
                  style={styles.card}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.tipoBadge}>
                      <Ionicons
                        name="warning-outline"
                        size={16}
                        color="#D9534F"
                      />

                      <Text style={styles.tipoText}>
                        {obtenerEtiquetaTipo(
                          incidencia.tipoIncidente ||
                            incidencia.tipo_incidente
                        )}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.estadoBadge,
                        obtenerEstiloEstado(
                          incidencia.estado
                        ),
                      ]}
                    >
                      <Text
                        style={styles.estadoText}
                      >
                        {(
                          incidencia.estado ||
                          "pendiente"
                        ).replace(/_/g, " ")}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.descripcion}>
                    {incidencia.descripcion}
                  </Text>

                  {incidencia.observaciones ? (
                    <View
                      style={
                        styles.observacionesContainer
                      }
                    >
                      <Text
                        style={
                          styles.observacionesLabel
                        }
                      >
                        Observaciones
                      </Text>

                      <Text
                        style={
                          styles.observaciones
                        }
                      >
                        {incidencia.observaciones}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.metaContainer}>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="cube-outline"
                        size={15}
                        color="#777777"
                      />

                      <Text style={styles.metaText}>
                        Pedido:{" "}
                        {incidencia.pedidoId
                          ? `${incidencia.pedidoId.slice(
                              0,
                              10
                            )}...`
                          : "No asignado"}
                      </Text>
                    </View>

                    {incidencia.rutaId ? (
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="map-outline"
                          size={15}
                          color="#777777"
                        />

                        <Text
                          style={styles.metaText}
                        >
                          Ruta:{" "}
                          {`${incidencia.rutaId.slice(
                            0,
                            10
                          )}...`}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.metaItem}>
                      <Ionicons
                        name="calendar-outline"
                        size={15}
                        color="#777777"
                      />

                      <Text style={styles.metaText}>
                        {incidencia
                          .fechaRegistroFormateada ||
                          "Reciente"}
                      </Text>
                    </View>
                  </View>

                  {/* Acciones */}
                  <View style={styles.cardActions}>
                    {incidencia.estado !==
                      "en_revision" &&
                    incidencia.estado !==
                      "resuelta" &&
                    incidencia.estado !==
                      "cancelada" ? (
                      <TouchableOpacity
                        style={
                          styles.actionBtnRevision
                        }
                        onPress={() =>
                          handleCambiarEstado(
                            incidencia,
                            "en_revision"
                          )
                        }
                      >
                        <Ionicons
                          name="search-outline"
                          size={16}
                          color="#333333"
                        />

                        <Text
                          style={
                            styles.actionBtnTextDark
                          }
                        >
                          En revisión
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {incidencia.estado !==
                      "resuelta" &&
                    incidencia.estado !==
                      "cancelada" ? (
                      <TouchableOpacity
                        style={
                          styles.actionBtnResuelta
                        }
                        onPress={() =>
                          handleCambiarEstado(
                            incidencia,
                            "resuelta"
                          )
                        }
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={16}
                          color="#FFFFFF"
                        />

                        <Text
                          style={
                            styles.actionBtnText
                          }
                        >
                          Marcar resuelta
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              )
            )
          )}
        </ScrollView>
      )}

      {/* Modal para crear */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Reportar incidencia
                </Text>

                <Text
                  style={styles.modalSubtitle}
                >
                  Describe el problema relacionado
                  con el pedido.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={cerrarModal}
                disabled={submitting}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#555555"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>
                Tipo de incidencia
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tipoScroll}
              >
                {TIPOS_INCIDENCIA.map(
                  (tipo) => (
                    <TouchableOpacity
                      key={tipo.id}
                      style={[
                        styles.tipoChip,
                        tipoSeleccionado ===
                          tipo.id &&
                          styles.tipoChipActive,
                      ]}
                      onPress={() =>
                        setTipoSeleccionado(
                          tipo.id
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.tipoChipText,
                          tipoSeleccionado ===
                            tipo.id &&
                            styles.tipoChipTextActive,
                        ]}
                      >
                        {tipo.label}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>

              <Text style={styles.label}>
                Pedido asociado
              </Text>

              <TextInput
                placeholder="ID del pedido"
                placeholderTextColor="#999999"
                value={pedidoId}
                onChangeText={setPedidoId}
                editable={
                  !route?.params?.pedidoId
                }
                style={[
                  styles.input,
                  route?.params?.pedidoId &&
                    styles.inputDisabled,
                ]}
              />

              {route?.params?.pedidoId ? (
                <Text style={styles.helpText}>
                  El pedido fue seleccionado
                  automáticamente.
                </Text>
              ) : null}

              {rutaId ? (
                <>
                  <Text style={styles.label}>
                    Ruta asociada
                  </Text>

                  <TextInput
                    value={rutaId}
                    editable={false}
                    style={[
                      styles.input,
                      styles.inputDisabled,
                    ]}
                  />
                </>
              ) : null}

              <Text style={styles.label}>
                Descripción de lo ocurrido
              </Text>

              <TextInput
                placeholder="Explica detalladamente la incidencia..."
                placeholderTextColor="#999999"
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
                maxLength={500}
                style={[
                  styles.input,
                  styles.textArea,
                ]}
              />

              <Text style={styles.characterCount}>
                {descripcion.length}/500
              </Text>

              <Text style={styles.label}>
                Observaciones adicionales
              </Text>

              <TextInput
                placeholder="Notas, referencias o información adicional"
                placeholderTextColor="#999999"
                value={observaciones}
                onChangeText={setObservaciones}
                multiline
                numberOfLines={3}
                style={[
                  styles.input,
                  styles.observacionesInput,
                ]}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={cerrarModal}
                  disabled={submitting}
                >
                  <Text
                    style={
                      styles.modalCancelText
                    }
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalSubmitBtn,
                    submitting &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleCrear}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="send-outline"
                        size={18}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.modalSubmitText
                        }
                      >
                        Enviar reporte
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F1B2E",
  },

  headerSubtitle: {
    color: "#777777",
    fontSize: 12,
    marginTop: 2,
  },

  errorBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEE4E2",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  errorText: {
    flex: 1,
    color: "#B42318",
    fontSize: 13,
  },

  actionsBar: {
    padding: 16,
  },

  createBtn: {
    minHeight: 52,
    flexDirection: "row",
    backgroundColor: "#D9534F",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  createBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  filtersScroll: {
    maxHeight: 44,
    marginBottom: 10,
  },

  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#E4E6EA",
    borderRadius: 20,
  },

  filterChipActive: {
    backgroundColor: "#1F1B2E",
  },

  filterChipText: {
    fontSize: 13,
    color: "#444444",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  filterChipTextActive: {
    color: "#FFFFFF",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#777777",
    marginTop: 12,
  },

  listContainer: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 70,
    paddingHorizontal: 25,
  },

  emptyTitle: {
    color: "#333333",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 12,
  },

  emptyText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
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
    gap: 8,
  },

  tipoBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF2F2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },

  tipoText: {
    flex: 1,
    color: "#D9534F",
    fontWeight: "700",
    fontSize: 13,
  },

  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
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

  estadoCancelada: {
    backgroundColor: "#FEE4E2",
  },

  estadoText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  descripcion: {
    fontSize: 15,
    color: "#222222",
    marginBottom: 10,
    lineHeight: 21,
  },

  observacionesContainer: {
    backgroundColor: "#F9F9FB",
    padding: 10,
    borderRadius: 9,
    marginBottom: 10,
  },

  observacionesLabel: {
    color: "#555555",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 3,
  },

  observaciones: {
    fontSize: 13,
    color: "#666666",
  },

  metaContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 10,
    gap: 6,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    fontSize: 12,
    color: "#777777",
  },

  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  actionBtnResuelta: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2ECC71",
    paddingHorizontal: 12,
    borderRadius: 9,
    gap: 5,
  },

  actionBtnRevision: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E3EA",
    paddingHorizontal: 12,
    borderRadius: 9,
    gap: 5,
  },

  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  actionBtnTextDark: {
    color: "#333333",
    fontSize: 12,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F1B2E",
  },

  modalSubtitle: {
    color: "#777777",
    fontSize: 13,
    marginTop: 4,
    maxWidth: 290,
  },

  closeModalBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 7,
  },

  tipoScroll: {
    marginBottom: 16,
  },

  tipoChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#F0F0F3",
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  tipoChipActive: {
    backgroundColor: "#D9534F",
    borderColor: "#D9534F",
  },

  tipoChipText: {
    fontSize: 13,
    color: "#555555",
  },

  tipoChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  input: {
    minHeight: 50,
    backgroundColor: "#F6F7F9",
    borderWidth: 1,
    borderColor: "#E2E4E9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 12,
    fontSize: 14,
    color: "#222222",
  },

  inputDisabled: {
    backgroundColor: "#ECEEF1",
    color: "#777777",
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  observacionesInput: {
    minHeight: 75,
    textAlignVertical: "top",
  },

  characterCount: {
    color: "#999999",
    textAlign: "right",
    fontSize: 11,
    marginTop: -8,
    marginBottom: 12,
  },

  helpText: {
    color: "#777777",
    fontSize: 11,
    marginTop: -8,
    marginBottom: 12,
  },

  modalButtons: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 18,
    gap: 10,
  },

  modalCancelBtn: {
    flex: 1,
    minHeight: 52,
    backgroundColor: "#E4E6EA",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  modalCancelText: {
    fontWeight: "700",
    color: "#444444",
  },

  modalSubmitBtn: {
    flex: 2,
    minHeight: 52,
    flexDirection: "row",
    backgroundColor: "#D9534F",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  modalSubmitText: {
    fontWeight: "700",
    color: "#FFFFFF",
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});