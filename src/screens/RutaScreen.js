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
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import {
  RutaContext,
} from "../context/RutaContext";

import {
  PedidoContext,
} from "../context/PedidoContext";

import {
  AuthContext,
} from "../context/AuthContext";

import colors from "../theme/color";

export default function RutaScreen({
  navigation,
}) {
  const {
    rutas = [],
    loading,
    error,
    agregarRuta,
    editarRuta,
    borrarRuta,
    cargarRutas,
    comenzarRuta,
    completarRuta,
  } = useContext(RutaContext);

  const {
    pedidos = [],
  } = useContext(PedidoContext);

  const {
    currentUser,
  } = useContext(AuthContext);

  // =========================
  // Permisos por rol
  // =========================

  const rolActual = String(
    currentUser?.Rol || ""
  )
    .trim()
    .toLowerCase();

  const esAdministrador =
    rolActual === "administrador" ||
    rolActual === "admin";

  const esRepartidor =
    rolActual === "repartidor";

  const esCliente =
    rolActual === "cliente";

  // Solo administrador
  const puedeCrearEditarEliminar =
    esAdministrador;

  // Administrador y repartidor
  const puedeGestionarRecorrido =
    esAdministrador ||
    esRepartidor;

  // =========================
  // Estados
  // =========================

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    editMode,
    setEditMode,
  ] = useState(false);

  const [
    selectedRuta,
    setSelectedRuta,
  ] = useState(null);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    procesandoRutaId,
    setProcesandoRutaId,
  ] = useState(null);

  const [pedidoId, setPedidoId] =
    useState("");

  const [
    distanciaEstimada,
    setDistanciaEstimada,
  ] = useState("");

  const [
    rutaAsignada,
    setRutaAsignada,
  ] = useState("");

  const [
    tiempoEstimado,
    setTiempoEstimado,
  ] = useState("");

  // =========================
  // Obtener mensaje de error
  // =========================

  const obtenerMensajeError = (
    err
  ) => {
    return (
      err.response?.data?.mensaje ||
      err.response?.data?.error ||
      err.message ||
      "Ocurrió un error con la ruta."
    );
  };

  // =========================
  // Limpiar formulario
  // =========================

  const resetForm = () => {
    setPedidoId(
      pedidos[0]?.id || ""
    );

    setDistanciaEstimada("");
    setRutaAsignada("");
    setTiempoEstimado("");

    setEditMode(false);
    setSelectedRuta(null);
  };

  // =========================
  // Abrir formulario de creación
  // =========================

  const handleOpenCreate = () => {
    if (!esAdministrador) {
      Alert.alert(
        "Acceso restringido",
        "Solo un administrador puede crear rutas."
      );

      return;
    }

    if (pedidos.length === 0) {
      Alert.alert(
        "No hay pedidos",
        "Debes tener al menos un pedido antes de crear una ruta."
      );

      return;
    }

    resetForm();
    setPedidoId(
      pedidos[0]?.id || ""
    );
    setModalVisible(true);
  };

  // =========================
  // Abrir formulario de edición
  // =========================

  const handleOpenEdit = (ruta) => {
    if (!esAdministrador) {
      Alert.alert(
        "Acceso restringido",
        "Solo un administrador puede editar rutas."
      );

      return;
    }

    setEditMode(true);
    setSelectedRuta(ruta);

    setPedidoId(
      ruta.pedidoId || ""
    );

    setDistanciaEstimada(
      ruta.distancia_estimada !==
        null &&
      ruta.distancia_estimada !==
        undefined
        ? String(
            ruta.distancia_estimada
          )
        : ""
    );

    setRutaAsignada(
      ruta.ruta_asignada || ""
    );

    setTiempoEstimado(
      ruta.tiempo_estimado !==
        null &&
      ruta.tiempo_estimado !==
        undefined
        ? String(
            ruta.tiempo_estimado
          )
        : ""
    );

    setModalVisible(true);
  };

  // =========================
  // Cerrar formulario
  // =========================

  const cerrarModal = () => {
    if (guardando) {
      return;
    }

    setModalVisible(false);
    resetForm();
  };

  // =========================
  // Guardar ruta
  // =========================

  const handleSave = async () => {
    if (!esAdministrador) {
      Alert.alert(
        "Acceso restringido",
        "Solo un administrador puede guardar rutas."
      );

      return;
    }

    if (!pedidoId.trim()) {
      Alert.alert(
        "Pedido requerido",
        "El ID del pedido es obligatorio."
      );

      return;
    }

    if (!rutaAsignada.trim()) {
      Alert.alert(
        "Ruta requerida",
        "La descripción de la ruta es obligatoria."
      );

      return;
    }

    const distancia = Number(
      distanciaEstimada
        .trim()
        .replace(",", ".")
    );

    const tiempo = Number(
      tiempoEstimado.trim()
    );

    if (
      Number.isNaN(distancia) ||
      distancia <= 0
    ) {
      Alert.alert(
        "Distancia no válida",
        "La distancia debe ser un número mayor que cero. Ejemplo: 20."
      );

      return;
    }

    if (
      !Number.isInteger(tiempo) ||
      tiempo <= 0
    ) {
      Alert.alert(
        "Tiempo no válido",
        "El tiempo debe ser un número entero mayor que cero."
      );

      return;
    }

    const rutaData = {
      pedidoId:
        pedidoId.trim(),

      distancia_estimada:
        distancia,

      ruta_asignada:
        rutaAsignada.trim(),

      tiempo_estimado:
        tiempo,
    };

    console.log(
      "Datos enviados para ruta:",
      rutaData
    );

    try {
      setGuardando(true);

      if (
        editMode &&
        selectedRuta
      ) {
        await editarRuta(
          selectedRuta.id,
          rutaData
        );

        Alert.alert(
          "Ruta actualizada",
          "La ruta se actualizó correctamente."
        );
      } else {
        await agregarRuta(
          rutaData
        );

        Alert.alert(
          "Ruta creada",
          "La ruta se creó correctamente."
        );
      }

      await cargarRutas();

      setModalVisible(false);
      resetForm();
    } catch (err) {
      const mensaje =
        obtenerMensajeError(err);

      console.log(
        "Error guardando ruta:",
        {
          mensaje,
          estado:
            err.response?.status,
          datos:
            err.response?.data,
        }
      );

      Alert.alert(
        "No se pudo guardar",
        mensaje
      );
    } finally {
      setGuardando(false);
    }
  };

  // =========================
  // Eliminar ruta
  // =========================

  const handleDelete = (ruta) => {
    if (!esAdministrador) {
      Alert.alert(
        "Acceso restringido",
        "Solo un administrador puede eliminar rutas."
      );

      return;
    }

    Alert.alert(
      "Eliminar ruta",
      `¿Deseas eliminar la ruta "${
        ruta.ruta_asignada ||
        "Ruta sin nombre"
      }"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",

          onPress: async () => {
            try {
              setProcesandoRutaId(
                ruta.id
              );

              await borrarRuta(
                ruta.id
              );

              Alert.alert(
                "Ruta eliminada",
                "La ruta fue eliminada correctamente."
              );
            } catch (err) {
              Alert.alert(
                "No se pudo eliminar",
                obtenerMensajeError(err)
              );
            } finally {
              setProcesandoRutaId(
                null
              );
            }
          },
        },
      ]
    );
  };

  // =========================
  // Iniciar recorrido
  // =========================

  const handleIniciarRuta = (
    ruta
  ) => {
    if (!puedeGestionarRecorrido) {
      Alert.alert(
        "Acceso restringido",
        "No tienes permiso para iniciar recorridos."
      );

      return;
    }

    if (
      typeof comenzarRuta !==
      "function"
    ) {
      Alert.alert(
        "Función no disponible",
        "RutaContext no expone la función comenzarRuta."
      );

      return;
    }

    Alert.alert(
      "Iniciar recorrido",
      `¿Deseas iniciar la ruta "${
        ruta.ruta_asignada ||
        "Ruta asignada"
      }"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Iniciar",

          onPress: async () => {
            try {
              setProcesandoRutaId(
                ruta.id
              );

              await comenzarRuta(
                ruta.id
              );

              Alert.alert(
                "Ruta iniciada",
                "El recorrido está ahora en curso."
              );
            } catch (err) {
              Alert.alert(
                "No se pudo iniciar",
                obtenerMensajeError(err)
              );
            } finally {
              setProcesandoRutaId(
                null
              );
            }
          },
        },
      ]
    );
  };

  // =========================
  // Finalizar recorrido
  // =========================

  const handleFinalizarRuta = (
    ruta
  ) => {
    if (!puedeGestionarRecorrido) {
      Alert.alert(
        "Acceso restringido",
        "No tienes permiso para finalizar recorridos."
      );

      return;
    }

    if (
      typeof completarRuta !==
      "function"
    ) {
      Alert.alert(
        "Función no disponible",
        "RutaContext no expone la función completarRuta."
      );

      return;
    }

    Alert.alert(
      "Finalizar recorrido",
      "¿Confirmas que el recorrido fue completado?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Finalizar",

          onPress: async () => {
            try {
              setProcesandoRutaId(
                ruta.id
              );

              await completarRuta(
                ruta.id
              );

              Alert.alert(
                "Ruta finalizada",
                "El recorrido fue finalizado correctamente."
              );
            } catch (err) {
              Alert.alert(
                "No se pudo finalizar",
                obtenerMensajeError(err)
              );
            } finally {
              setProcesandoRutaId(
                null
              );
            }
          },
        },
      ]
    );
  };

  // =========================
  // Actualizar lista
  // =========================

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await cargarRutas();
    } catch (err) {
      Alert.alert(
        "No se pudo actualizar",
        obtenerMensajeError(err)
      );
    } finally {
      setRefreshing(false);
    }
  };

  // =========================
  // Formatear fecha
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    let fecha;

    if (
      typeof date === "object" &&
      date._seconds !== undefined
    ) {
      fecha = new Date(
        date._seconds * 1000
      );
    } else if (
      typeof date === "object" &&
      date.seconds !== undefined
    ) {
      fecha = new Date(
        date.seconds * 1000
      );
    } else {
      fecha =
        date instanceof Date
          ? date
          : new Date(date);
    }

    if (
      Number.isNaN(fecha.getTime())
    ) {
      return "Fecha no válida";
    }

    return fecha.toLocaleString(
      "es-NI",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================
  // Configuración del estado
  // =========================

  const obtenerEstadoRuta = (
    estado
  ) => {
    switch (estado) {
      case "en_curso":
        return {
          texto: "En curso",
          estilo:
            styles.estadoEnCurso,
        };

      case "finalizada":
        return {
          texto: "Finalizada",
          estilo:
            styles.estadoFinalizada,
        };

      default:
        return {
          texto: "Asignada",
          estilo:
            styles.estadoAsignada,
        };
    }
  };

  // =========================
  // Vista de carga
  // =========================

  if (
    loading &&
    rutas.length === 0
  ) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text
          style={styles.loadingText}
        >
          Cargando rutas...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.phone}>
        {/* Encabezado */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (
                navigation.canGoBack()
              ) {
                navigation.goBack();
              }
            }}
          >
            <Text style={styles.backText}>
              ←
            </Text>
          </TouchableOpacity>

          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text style={styles.title}>
              Rutas
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              {esCliente
                ? "Seguimiento de tus pedidos"
                : esRepartidor
                ? "Recorridos y entregas asignadas"
                : "Administración de recorridos"}
            </Text>
          </View>

          {puedeCrearEditarEliminar ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleOpenCreate}
            >
              <Text
                style={
                  styles.addBtnText
                }
              >
                + Nueva
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={
                styles.headerPlaceholder
              }
            />
          )}
        </View>

        {/* Error */}
        {error ? (
          <View
            style={styles.errorBanner}
          >
            <Text
              style={styles.errorText}
            >
              ⚠️ {error}
            </Text>
          </View>
        ) : null}

        {/* Lista */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[
                colors.primary,
              ]}
            />
          }
        >
          {rutas.length === 0 ? (
            <View
              style={styles.emptyState}
            >
              <Text
                style={styles.emptyIcon}
              >
                🛣️
              </Text>

              <Text
                style={styles.emptyTitle}
              >
                Sin rutas
              </Text>

              <Text
                style={
                  styles.emptySubtitle
                }
              >
                {esCliente
                  ? "Tus pedidos todavía no tienen una ruta asignada."
                  : esRepartidor
                  ? "Todavía no hay rutas disponibles para realizar."
                  : "Aún no hay rutas registradas.\nCrea una nueva para comenzar."}
              </Text>
            </View>
          ) : (
            rutas.map((ruta) => {
              const estadoRuta =
                obtenerEstadoRuta(
                  ruta.estado
                );

              const procesando =
                procesandoRutaId ===
                ruta.id;

              return (
                <View
                  key={ruta.id}
                  style={styles.rutaCard}
                >
                  {/* Cabecera */}
                  <View
                    style={
                      styles.cardHeader
                    }
                  >
                    <View
                      style={
                        styles.routeBadge
                      }
                    >
                      <Text
                        style={
                          styles.routeBadgeText
                        }
                      >
                        🛣️
                      </Text>
                    </View>

                    <View
                      style={
                        styles.cardHeaderText
                      }
                    >
                      <Text
                        style={
                          styles.rutaName
                        }
                        numberOfLines={2}
                      >
                        {ruta.ruta_asignada ||
                          "Ruta sin nombre"}
                      </Text>

                      <Text
                        style={
                          styles.rutaPedido
                        }
                      >
                        Pedido:{" "}
                        {ruta.pedidoId ||
                          "N/A"}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.estadoBadge,
                        estadoRuta.estilo,
                      ]}
                    >
                      <Text
                        style={
                          styles.estadoText
                        }
                      >
                        {
                          estadoRuta.texto
                        }
                      </Text>
                    </View>
                  </View>

                  {/* GPS activo */}
                  {ruta.ubicacion_actual ? (
                    <View
                      style={
                        styles.gpsBadge
                      }
                    >
                      <View
                        style={
                          styles.gpsDot
                        }
                      />

                      <Text
                        style={
                          styles.gpsBadgeText
                        }
                      >
                        GPS ACTIVO
                      </Text>
                    </View>
                  ) : null}

                  {/* Detalles */}
                  <View
                    style={
                      styles.cardDetails
                    }
                  >
                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <Text
                        style={
                          styles.detailLabel
                        }
                      >
                        📏 Distancia
                      </Text>

                      <Text
                        style={
                          styles.detailValue
                        }
                      >
                        {ruta.distancia_estimada
                          ? `${ruta.distancia_estimada} km`
                          : "—"}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <Text
                        style={
                          styles.detailLabel
                        }
                      >
                        ⏱️ Tiempo estimado
                      </Text>

                      <Text
                        style={
                          styles.detailValue
                        }
                      >
                        {ruta.tiempo_estimado
                          ? `${ruta.tiempo_estimado} min`
                          : "—"}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <Text
                        style={
                          styles.detailLabel
                        }
                      >
                        🟢 Inicio
                      </Text>

                      <Text
                        style={
                          styles.detailValue
                        }
                      >
                        {formatDate(
                          ruta.fecha_inicio
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.detailRow
                      }
                    >
                      <Text
                        style={
                          styles.detailLabel
                        }
                      >
                        🔴 Final
                      </Text>

                      <Text
                        style={
                          styles.detailValue
                        }
                      >
                        {formatDate(
                          ruta.fecha_final
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* Procesando */}
                  {procesando ? (
                    <View
                      style={
                        styles.processingBox
                      }
                    >
                      <ActivityIndicator
                        color={
                          colors.primary
                        }
                      />

                      <Text
                        style={
                          styles.processingText
                        }
                      >
                        Procesando...
                      </Text>
                    </View>
                  ) : (
                    <>
                      {/* Iniciar o finalizar */}
                      {puedeGestionarRecorrido &&
                      ruta.estado ===
                        "asignada" ? (
                        <TouchableOpacity
                          style={
                            styles.startBtn
                          }
                          onPress={() =>
                            handleIniciarRuta(
                              ruta
                            )
                          }
                        >
                          <Text
                            style={
                              styles.startBtnText
                            }
                          >
                            ▶ Iniciar recorrido
                          </Text>
                        </TouchableOpacity>
                      ) : null}

                      {puedeGestionarRecorrido &&
                      ruta.estado ===
                        "en_curso" ? (
                        <TouchableOpacity
                          style={
                            styles.finishBtn
                          }
                          onPress={() =>
                            handleFinalizarRuta(
                              ruta
                            )
                          }
                        >
                          <Text
                            style={
                              styles.finishBtnText
                            }
                          >
                            ✓ Finalizar recorrido
                          </Text>
                        </TouchableOpacity>
                      ) : null}

                      {/* Mapa */}
                      <TouchableOpacity
                        style={styles.mapBtn}
                        onPress={() =>
                          navigation.navigate(
                            "MapaSeguimiento",
                            {
                              rutaId:
                                ruta.id,

                              pedidoId:
                                ruta.pedidoId,

                              destino:
                                ruta.ruta_asignada,

                              esRepartidor:
                                esRepartidor,
                            }
                          )
                        }
                      >
                        <Text
                          style={
                            styles.mapBtnText
                          }
                        >
                          📍 Google Maps en vivo
                        </Text>
                      </TouchableOpacity>

                      {/* Solo administrador */}
                      {puedeCrearEditarEliminar ? (
                        <View
                          style={
                            styles.cardActions
                          }
                        >
                          <TouchableOpacity
                            style={
                              styles.editBtn
                            }
                            onPress={() =>
                              handleOpenEdit(
                                ruta
                              )
                            }
                          >
                            <Text
                              style={
                                styles.editBtnText
                              }
                            >
                              ✏️ Editar
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={
                              styles.deleteBtn
                            }
                            onPress={() =>
                              handleDelete(
                                ruta
                              )
                            }
                          >
                            <Text
                              style={
                                styles.deleteBtnText
                              }
                            >
                              🗑️ Eliminar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </>
                  )}
                </View>
              );
            })
          )}

          <View
            style={{
              height: 30,
            }}
          />
        </ScrollView>

        {/* Modal administrativo */}
        <Modal
          visible={
            modalVisible &&
            esAdministrador
          }
          transparent
          animationType="slide"
          onRequestClose={
            cerrarModal
          }
        >
          <View
            style={styles.modalOverlay}
          >
            <View
              style={styles.modalContent}
            >
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="handled"
              >
                <View
                  style={
                    styles.modalHeader
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.modalTitle
                      }
                    >
                      {editMode
                        ? "Editar ruta"
                        : "Nueva ruta"}
                    </Text>

                    <Text
                      style={
                        styles.modalSubtitle
                      }
                    >
                      {editMode
                        ? "Actualiza los datos del recorrido."
                        : "Asigna una ruta a un pedido."}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={
                      styles.closeBtn
                    }
                    onPress={
                      cerrarModal
                    }
                    disabled={guardando}
                  >
                    <Text
                      style={
                        styles.closeText
                      }
                    >
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  PEDIDO ASOCIADO
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    editMode &&
                      styles.inputDisabled,
                  ]}
                  placeholder="ID del pedido"
                  placeholderTextColor="#AAAAAA"
                  value={pedidoId}
                  onChangeText={
                    setPedidoId
                  }
                  editable={
                    !editMode &&
                    !guardando
                  }
                />

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  RUTA ASIGNADA
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Ej: Barrio Madrid hacia El Santuario"
                  placeholderTextColor="#AAAAAA"
                  value={
                    rutaAsignada
                  }
                  onChangeText={
                    setRutaAsignada
                  }
                  editable={!guardando}
                />

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  DISTANCIA ESTIMADA
                  (KM)
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Ej: 20"
                  placeholderTextColor="#AAAAAA"
                  value={
                    distanciaEstimada
                  }
                  onChangeText={
                    setDistanciaEstimada
                  }
                  keyboardType="decimal-pad"
                  editable={!guardando}
                />

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  TIEMPO ESTIMADO
                  (MINUTOS)
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Ej: 18"
                  placeholderTextColor="#AAAAAA"
                  value={
                    tiempoEstimado
                  }
                  onChangeText={
                    setTiempoEstimado
                  }
                  keyboardType="numeric"
                  editable={!guardando}
                />

                <View
                  style={
                    styles.modalActions
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.cancelModalBtn
                    }
                    onPress={
                      cerrarModal
                    }
                    disabled={guardando}
                  >
                    <Text
                      style={
                        styles.cancelModalText
                      }
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveBtn,
                      guardando &&
                        styles.buttonDisabled,
                    ]}
                    onPress={
                      handleSave
                    }
                    disabled={guardando}
                  >
                    {guardando ? (
                      <ActivityIndicator
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text
                        style={
                          styles.saveBtnText
                        }
                      >
                        {editMode
                          ? "Guardar cambios"
                          : "Crear ruta"}
                      </Text>
                    )}
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

  center: {
    justifyContent: "center",
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
  },

  backText: {
    fontSize: 20,
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.dark,
  },

  headerSubtitle: {
    color: colors.gray,
    fontSize: 12,
    marginTop: 2,
  },

  headerPlaceholder: {
    width: 62,
  },

  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },

  addBtnText: {
    color: "#FFFFFF",
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

  listContent: {
    paddingTop: 4,
  },

  loadingText: {
    marginTop: 15,
    color: colors.gray,
    fontSize: 16,
  },

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

  rutaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },

  routeBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF3E8",
    justifyContent: "center",
    alignItems: "center",
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

  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
  },

  estadoAsignada: {
    backgroundColor: "#FFF3E8",
  },

  estadoEnCurso: {
    backgroundColor: "#E8F0FE",
  },

  estadoFinalizada: {
    backgroundColor: "#E6F4EA",
  },

  estadoText: {
    color: "#444444",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  gpsBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CEEAD6",
    marginBottom: 12,
  },

  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1E8E3E",
    marginRight: 5,
  },

  gpsBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E8E3E",
  },

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
    gap: 10,
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
    maxWidth: "58%",
    textAlign: "right",
  },

  startBtn: {
    backgroundColor: "#1A73E8",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  startBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  finishBtn: {
    backgroundColor: "#2E9B59",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  finishBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  mapBtn: {
    backgroundColor: "#FFF3EB",
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  mapBtnText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },

  processingBox: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  processingText: {
    color: colors.gray,
    fontSize: 13,
  },

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

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.dark,
  },

  modalSubtitle: {
    color: colors.gray,
    fontSize: 13,
    marginTop: 4,
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
  },

  closeText: {
    color: "#555555",
    fontSize: 17,
    fontWeight: "700",
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
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  inputDisabled: {
    backgroundColor: "#EDEDEF",
    color: "#777777",
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 15,
  },

  cancelModalBtn: {
    flex: 1,
    minHeight: 54,
    backgroundColor: "#F3F3F3",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelModalText: {
    fontWeight: "700",
    color: colors.gray,
    fontSize: 15,
  },

  saveBtn: {
    flex: 1,
    minHeight: 54,
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});