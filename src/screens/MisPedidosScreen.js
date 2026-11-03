import React, {
  useCallback,
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
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  AuthContext,
} from "../context/AuthContext";

import {
  PedidoContext,
} from "../context/PedidoContext";

import {
  RutaContext,
} from "../context/RutaContext";

export default function MisPedidosScreen({
  navigation,
}) {
  const {
    currentUser,
  } = useContext(AuthContext);

  const {
    pedidos = [],
    loading,
    error,
    cargarPedidosUsuario,
    actualizarPedido,
    cancelarPedido,
  } = useContext(PedidoContext);

  const {
    cargarRutasPedidos,
  } = useContext(RutaContext);

  const [refreshing, setRefreshing] =
    useState(false);

  const [
    procesandoPedidoId,
    setProcesandoPedidoId,
  ] = useState(null);

  const [
    modalEditarVisible,
    setModalEditarVisible,
  ] = useState(false);

  const [
    pedidoSeleccionado,
    setPedidoSeleccionado,
  ] = useState(null);

  const [direccion, setDireccion] =
    useState("");

  const [referencia, setReferencia] =
    useState("");

  const [cantidad, setCantidad] =
    useState("");

  const usuarioId =
    currentUser?.id ||
    currentUser?.uid ||
    null;

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
      "Ocurrió un error con el pedido."
    );
  };

  // =========================
  // Cargar pedidos del cliente
  // =========================

  const cargarMisPedidos =
    useCallback(async () => {
      if (
        !usuarioId ||
        typeof cargarPedidosUsuario !==
          "function"
      ) {
        return [];
      }

      try {
        const lista =
          await cargarPedidosUsuario(
            usuarioId
          );

        /*
         * Precargamos las rutas asociadas.
         * Esto no cambia la pantalla actual,
         * pero deja RutaContext preparado.
         */
        if (
          typeof cargarRutasPedidos ===
          "function"
        ) {
          await cargarRutasPedidos(
            lista
          );
        }

        return lista;
      } catch (err) {
        console.log(
          "Error cargando mis pedidos:",
          obtenerMensajeError(err)
        );

        return [];
      }
    }, [
      usuarioId,
      cargarPedidosUsuario,
      cargarRutasPedidos,
    ]);

  useEffect(() => {
    cargarMisPedidos();
  }, [cargarMisPedidos]);

  // =========================
  // Actualizar manualmente
  // =========================

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await cargarMisPedidos();
    } finally {
      setRefreshing(false);
    }
  };

  // =========================
  // Abrir edición
  // =========================

  const abrirEditarPedido = (
    pedido
  ) => {
    if (
      pedido.estado !==
      "pendiente"
    ) {
      Alert.alert(
        "Pedido no editable",
        "Solo puedes editar un pedido mientras esté pendiente."
      );

      return;
    }

    setPedidoSeleccionado(
      pedido
    );

    setDireccion(
      pedido.Ubicacion?.direccion ||
        pedido.direccion ||
        ""
    );

    setReferencia(
      pedido.Ubicacion?.referencia ||
        pedido.referencia ||
        ""
    );

    setCantidad(
      String(
        pedido.cantidad || 1
      )
    );

    setModalEditarVisible(
      true
    );
  };

  // =========================
  // Cerrar edición
  // =========================

  const cerrarEditarPedido = () => {
    if (procesandoPedidoId) {
      return;
    }

    setModalEditarVisible(
      false
    );

    setPedidoSeleccionado(
      null
    );

    setDireccion("");
    setReferencia("");
    setCantidad("");
  };

  // =========================
  // Guardar edición
  // =========================

  const guardarEdicion = async () => {
    if (!pedidoSeleccionado) {
      return;
    }

    if (!direccion.trim()) {
      Alert.alert(
        "Dirección requerida",
        "Ingresa la dirección de entrega."
      );

      return;
    }

    const cantidadNumerica =
      Number(cantidad);

    if (
      !Number.isInteger(
        cantidadNumerica
      ) ||
      cantidadNumerica <= 0
    ) {
      Alert.alert(
        "Cantidad no válida",
        "La cantidad debe ser un número entero mayor que cero."
      );

      return;
    }

    try {
      setProcesandoPedidoId(
        pedidoSeleccionado.id
      );

      const datosActualizados = {
        cantidad:
          cantidadNumerica,

        direccion:
          direccion.trim(),

        referencia:
          referencia.trim(),

        /*
         * Se conserva el peso del cilindro.
         * El backend recalculará subtotal
         * y total.
         */
        pesoKg:
          pedidoSeleccionado
            .Producto?.pesoKg ||
          pedidoSeleccionado
            .pesoKg,
      };

      await actualizarPedido(
        pedidoSeleccionado.id,
        datosActualizados
      );

      await cargarMisPedidos();

      cerrarEditarPedido();

      Alert.alert(
        "Pedido actualizado",
        "La información del pedido fue actualizada correctamente."
      );
    } catch (err) {
      Alert.alert(
        "No se pudo actualizar",
        obtenerMensajeError(err)
      );
    } finally {
      setProcesandoPedidoId(
        null
      );
    }
  };

  // =========================
  // Cancelar pedido
  // =========================

  const confirmarCancelacion = (
    pedido
  ) => {
    if (
      pedido.estado !==
      "pendiente"
    ) {
      Alert.alert(
        "Pedido no cancelable",
        "Solo puedes cancelar un pedido que todavía esté pendiente."
      );

      return;
    }

    Alert.alert(
      "Cancelar pedido",
      "¿Confirmas que deseas cancelar este pedido? El pedido permanecerá en el historial.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Cancelar pedido",
          style: "destructive",

          onPress: async () => {
            try {
              setProcesandoPedidoId(
                pedido.id
              );

              await cancelarPedido(
                pedido.id
              );

              await cargarMisPedidos();

              Alert.alert(
                "Pedido cancelado",
                "El pedido fue cancelado correctamente."
              );
            } catch (err) {
              Alert.alert(
                "No se pudo cancelar",
                obtenerMensajeError(err)
              );
            } finally {
              setProcesandoPedidoId(
                null
              );
            }
          },
        },
      ]
    );
  };

  // =========================
  // Ver ruta del pedido
  // =========================

  const verRutaPedido = async (
    pedido
  ) => {
    try {
      setProcesandoPedidoId(
        pedido.id
      );

      const rutasEncontradas =
        await cargarRutasPedidos([
          pedido,
        ]);

      if (
        !rutasEncontradas ||
        rutasEncontradas.length ===
          0
      ) {
        Alert.alert(
          "Ruta no asignada",
          "Este pedido todavía no tiene una ruta asignada."
        );

        return;
      }

      /*
       * Abre la pestaña de rutas.
       * Si tu Tab.Screen tiene otro nombre,
       * cambia "Rutas" por el nombre registrado.
       */
      navigation.navigate(
        "Rutas"
      );
    } catch (err) {
      Alert.alert(
        "No se pudo consultar la ruta",
        obtenerMensajeError(err)
      );
    } finally {
      setProcesandoPedidoId(
        null
      );
    }
  };

  // =========================
  // Reportar incidencia
  // =========================

  const reportarIncidencia = (
    pedido
  ) => {
    navigation.navigate(
      "Incidencia",
      {
        crearNueva: true,
        usuarioId,
        pedidoId: pedido.id,
        rutaId: null,
      }
    );
  };

  // =========================
  // Ir a reseñas
  // =========================

  const calificarPedido = (
    pedido
  ) => {
    navigation.navigate(
      "Resenas",
      {
        pedidoId: pedido.id,
        clienteId: usuarioId,
        crearNueva: true,
      }
    );
  };

  // =========================
  // Fecha del pedido
  // =========================

  const formatearFecha = (
    valor
  ) => {
    if (!valor) {
      return "Fecha no disponible";
    }

    let fecha;

    if (
      typeof valor ===
        "object" &&
      valor._seconds !==
        undefined
    ) {
      fecha = new Date(
        valor._seconds * 1000
      );
    } else if (
      typeof valor ===
        "object" &&
      valor.seconds !==
        undefined
    ) {
      fecha = new Date(
        valor.seconds * 1000
      );
    } else if (
      valor instanceof Date
    ) {
      fecha = valor;
    } else {
      fecha = new Date(valor);
    }

    if (
      Number.isNaN(
        fecha.getTime()
      )
    ) {
      return "Fecha no disponible";
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
// Convertir fecha a milisegundos
// =========================

const obtenerTiempoPedido = (pedido) => {
  const valor =
    pedido.fecha ||
    pedido.fechaCreacion ||
    pedido.createdAt ||
    pedido.fechaActualizacion;

  if (!valor) {
    return 0;
  }

  // Timestamp serializado por Firebase Admin
  if (
    typeof valor === "object" &&
    valor._seconds !== undefined
  ) {
    return valor._seconds * 1000;
  }

  // Otra representación de Timestamp
  if (
    typeof valor === "object" &&
    valor.seconds !== undefined
  ) {
    return valor.seconds * 1000;
  }

  // Timestamp de Firestore
  if (
    typeof valor?.toDate === "function"
  ) {
    return valor.toDate().getTime();
  }

  // Objeto Date
  if (valor instanceof Date) {
    return valor.getTime();
  }

  // Fecha enviada como texto
  const fechaConvertida =
    new Date(valor);

  if (
    Number.isNaN(
      fechaConvertida.getTime()
    )
  ) {
    return 0;
  }

  return fechaConvertida.getTime();
};

// =========================
// Ordenar de reciente a antiguo
// =========================

const pedidosOrdenados = [
  ...pedidos,
].sort(
  (pedidoA, pedidoB) =>
    obtenerTiempoPedido(pedidoB) -
    obtenerTiempoPedido(pedidoA)
);

  // =========================
  // Configuración de estado
  // =========================

  const obtenerEstado = (
    estado
  ) => {
    switch (estado) {
      case "confirmado":
        return {
          texto: "Confirmado",
          icono:
            "checkmark-circle-outline",
          fondo: "#E8F0FE",
          color: "#1A73E8",
        };

      case "en_preparacion":
        return {
          texto: "En preparación",
          icono: "time-outline",
          fondo: "#FFF3E6",
          color: "#D97706",
        };

      case "en_camino":
        return {
          texto: "En camino",
          icono: "bicycle-outline",
          fondo: "#EEE8FF",
          color: "#7048B8",
        };

      case "entregado":
        return {
          texto: "Entregado",
          icono:
            "checkmark-done-circle-outline",
          fondo: "#EAF8F0",
          color: "#2E9B59",
        };

      case "cancelado":
        return {
          texto: "Cancelado",
          icono:
            "close-circle-outline",
          fondo: "#FEE4E2",
          color: "#D9534F",
        };

      default:
        return {
          texto: "Pendiente",
          icono: "hourglass-outline",
          fondo: "#FFF5E6",
          color: "#D97706",
        };
    }
  };

  // =========================
  // Pantalla sin sesión
  // =========================

  if (!usuarioId) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
        ]}
      >
        <Ionicons
          name="person-circle-outline"
          size={70}
          color="#AAAAAA"
        />

        <Text style={styles.emptyTitle}>
          Sesión no encontrada
        </Text>

        <Text
          style={styles.emptyText}
        >
          Inicia sesión para consultar
          tus pedidos.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (
              navigation.canGoBack()
            ) {
              navigation.goBack();
            }
          }}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#1F1B2E"
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Mis pedidos
          </Text>

          <Text style={styles.subtitle}>
            Consulta y administra tus
            solicitudes
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator
              size="small"
              color="#FF6B00"
            />
          ) : (
            <Ionicons
              name="refresh-outline"
              size={22}
              color="#FF6B00"
            />
          )}
        </TouchableOpacity>
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

      {loading &&
      pedidos.length === 0 ? (
        <View
          style={[
            styles.content,
            styles.center,
          ]}
        >
          <ActivityIndicator
            size="large"
            color="#FF6B00"
          />

          <Text
            style={styles.loadingText}
          >
            Cargando tus pedidos...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={
            styles.contentContainer
          }
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[
                "#FF6B00",
              ]}
            />
          }
        >
          {pedidos.length === 0 ? (
            <View
              style={styles.emptyContainer}
            >
              <View
                style={
                  styles.emptyIconContainer
                }
              >
                <Ionicons
                  name="receipt-outline"
                  size={55}
                  color="#FF6B00"
                />
              </View>

              <Text
                style={styles.emptyTitle}
              >
                Aún no tienes pedidos
              </Text>

              <Text
                style={styles.emptyText}
              >
                Explora el catálogo y
                solicita tu primer cilindro
                de gas.
              </Text>

              <TouchableOpacity
                style={
                  styles.catalogButton
                }
                onPress={() =>
                  navigation.navigate(
                    "Catalogo"
                  )
                }
              >
                <Ionicons
                  name="flame-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.catalogButtonText
                  }
                >
                  Ir al catálogo
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            pedidosOrdenados.map((pedido) => {
              const configuracion =
                obtenerEstado(
                  pedido.estado
                );

              const procesando =
                procesandoPedidoId ===
                pedido.id;

              const puedeEditar =
                pedido.estado ===
                "pendiente";

              const puedeCalificar =
                pedido.estado ===
                "entregado";

              return (
                <View
                  key={pedido.id}
                  style={styles.card}
                >
                  {/* Cabecera */}
                  <View
                    style={
                      styles.cardHeader
                    }
                  >
                    <View
                      style={
                        styles.orderIcon
                      }
                    >
                      <Ionicons
                        name="cube-outline"
                        size={25}
                        color="#FF6B00"
                      />
                    </View>

                    <View
                      style={
                        styles.orderTitleContainer
                      }
                    >
                      <Text
                        style={
                          styles.orderTitle
                        }
                      >
                        Pedido #
                        {pedido.id.slice(
                          0,
                          8
                        )}
                      </Text>

                      <Text
                        style={
                          styles.orderDate
                        }
                      >
                        {formatearFecha(
                          pedido.fecha
                        )}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            configuracion.fondo,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          configuracion.icono
                        }
                        size={15}
                        color={
                          configuracion.color
                        }
                      />

                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              configuracion.color,
                          },
                        ]}
                      >
                        {
                          configuracion.texto
                        }
                      </Text>
                    </View>
                  </View>

                  {/* Producto */}
                  <View
                    style={
                      styles.productBox
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
                        Producto
                      </Text>

                      <Text
                        style={
                          styles.detailValue
                        }
                      >
                        {pedido.Producto
                          ?.nombre ||
                          "Cilindro de gas"}
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
                        Presentación
                      </Text>

                      <Text
                        style={
                          styles.detailValue
                        }
                      >
                        {pedido.Producto
                          ?.presentacion ||
                          `${
                            pedido.Producto
                              ?.pesoKg ||
                            pedido.pesoKg ||
                            ""
                          } kg`}
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
                        Cantidad
                      </Text>

                      <Text
                        style={
                          styles.detailValue
                        }
                      >
                        {pedido.cantidad ||
                          1}
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
                        Dirección
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          styles.addressValue,
                        ]}
                      >
                        {pedido.Ubicacion
                          ?.direccion ||
                          pedido.direccion ||
                          "Sin dirección"}
                      </Text>
                    </View>

                    {pedido.Ubicacion
                      ?.referencia ||
                    pedido.referencia ? (
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
                          Referencia
                        </Text>

                        <Text
                          style={[
                            styles.detailValue,
                            styles.addressValue,
                          ]}
                        >
                          {pedido
                            .Ubicacion
                            ?.referencia ||
                            pedido.referencia}
                        </Text>
                      </View>
                    ) : null}

                    <View
                      style={[
                        styles.detailRow,
                        styles.totalRow,
                      ]}
                    >
                      <Text
                        style={
                          styles.totalLabel
                        }
                      >
                        Total
                      </Text>

                      <Text
                        style={
                          styles.totalValue
                        }
                      >
                        C$
                        {Number(
                          pedido.total ||
                            0
                        ).toLocaleString(
                          "es-NI"
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
                        color="#FF6B00"
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
                      {/* Acciones principales */}
                      <View
                        style={
                          styles.actions
                        }
                      >
                        <TouchableOpacity
                          style={
                            styles.routeButton
                          }
                          onPress={() =>
                            verRutaPedido(
                              pedido
                            )
                          }
                        >
                          <Ionicons
                            name="map-outline"
                            size={18}
                            color="#1A73E8"
                          />

                          <Text
                            style={
                              styles.routeButtonText
                            }
                          >
                            Ver ruta
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={
                            styles.incidentButton
                          }
                          onPress={() =>
                            reportarIncidencia(
                              pedido
                            )
                          }
                        >
                          <Ionicons
                            name="warning-outline"
                            size={18}
                            color="#B45309"
                          />

                          <Text
                            style={
                              styles.incidentButtonText
                            }
                          >
                            Reportar
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Editar y cancelar */}
                      {puedeEditar ? (
                        <View
                          style={
                            styles.actions
                          }
                        >
                          <TouchableOpacity
                            style={
                              styles.editButton
                            }
                            onPress={() =>
                              abrirEditarPedido(
                                pedido
                              )
                            }
                          >
                            <Ionicons
                              name="create-outline"
                              size={18}
                              color="#7048B8"
                            />

                            <Text
                              style={
                                styles.editButtonText
                              }
                            >
                              Editar
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={
                              styles.cancelButton
                            }
                            onPress={() =>
                              confirmarCancelacion(
                                pedido
                              )
                            }
                          >
                            <Ionicons
                              name="close-circle-outline"
                              size={18}
                              color="#D9534F"
                            />

                            <Text
                              style={
                                styles.cancelButtonText
                              }
                            >
                              Cancelar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}

                      {/* Calificar */}
                      {puedeCalificar ? (
                        <TouchableOpacity
                          style={
                            styles.reviewButton
                          }
                          onPress={() =>
                            calificarPedido(
                              pedido
                            )
                          }
                        >
                          <Ionicons
                            name="star-outline"
                            size={20}
                            color="#FFFFFF"
                          />

                          <Text
                            style={
                              styles.reviewButtonText
                            }
                          >
                            Calificar servicio
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Modal de edición */}
      <Modal
        visible={modalEditarVisible}
        transparent
        animationType="slide"
        onRequestClose={
          cerrarEditarPedido
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.modalContent}
          >
            <View
              style={styles.modalHeader}
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Editar pedido
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Solo puedes editar pedidos
                  pendientes.
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.closeButton
                }
                onPress={
                  cerrarEditarPedido
                }
                disabled={
                  Boolean(
                    procesandoPedidoId
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#555555"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>
              CANTIDAD
            </Text>

            <TextInput
              style={styles.input}
              value={cantidad}
              onChangeText={setCantidad}
              keyboardType="numeric"
              placeholder="Ej: 1"
              placeholderTextColor="#999999"
              editable={
                !procesandoPedidoId
              }
            />

            <Text style={styles.inputLabel}>
              DIRECCIÓN DE ENTREGA
            </Text>

            <TextInput
              style={styles.input}
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Barrio o sector"
              placeholderTextColor="#999999"
              editable={
                !procesandoPedidoId
              }
            />

            <Text style={styles.inputLabel}>
              REFERENCIA
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.referenceInput,
              ]}
              value={referencia}
              onChangeText={setReferencia}
              placeholder="Casa, color, punto de referencia..."
              placeholderTextColor="#999999"
              multiline
              textAlignVertical="top"
              editable={
                !procesandoPedidoId
              }
            />

            <View
              style={styles.modalActions}
            >
              <TouchableOpacity
                style={
                  styles.modalCancelButton
                }
                onPress={
                  cerrarEditarPedido
                }
                disabled={
                  Boolean(
                    procesandoPedidoId
                  )
                }
              >
                <Text
                  style={
                    styles.modalCancelText
                  }
                >
                  Cerrar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSaveButton,
                  procesandoPedidoId &&
                    styles.disabledButton,
                ]}
                onPress={guardarEdicion}
                disabled={
                  Boolean(
                    procesandoPedidoId
                  )
                }
              >
                {procesandoPedidoId ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.modalSaveText
                    }
                  >
                    Guardar cambios
                  </Text>
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
    backgroundColor: "#F5F6F8",
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#1F1B2E",
    fontSize: 23,
    fontWeight: "800",
  },

  subtitle: {
    color: "#777777",
    fontSize: 12,
    marginTop: 2,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF3E8",
    justifyContent: "center",
    alignItems: "center",
  },

  errorBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FEE4E2",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  errorText: {
    flex: 1,
    color: "#B42318",
    fontSize: 13,
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 35,
  },

  loadingText: {
    color: "#777777",
    marginTop: 12,
  },

  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 75,
  },

  emptyIconContainer: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: "#FFF3E8",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    color: "#333333",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 18,
  },

  emptyText: {
    color: "#777777",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
  },

  catalogButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B00",
    paddingHorizontal: 22,
    borderRadius: 15,
    marginTop: 22,
    gap: 8,
  },

  catalogButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E8E8EE",
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },

  orderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF3E8",
    justifyContent: "center",
    alignItems: "center",
  },

  orderTitleContainer: {
    flex: 1,
  },

  orderTitle: {
    color: "#222222",
    fontSize: 16,
    fontWeight: "800",
  },

  orderDate: {
    color: "#888888",
    fontSize: 11,
    marginTop: 3,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  productBox: {
    backgroundColor: "#FAFAFA",
    borderRadius: 15,
    padding: 14,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 5,
    gap: 12,
  },

  detailLabel: {
    color: "#777777",
    fontSize: 13,
  },

  detailValue: {
    flex: 1,
    color: "#333333",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },

  addressValue: {
    maxWidth: "65%",
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    marginTop: 7,
    paddingTop: 12,
  },

  totalLabel: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "800",
  },

  totalValue: {
    color: "#FF6B00",
    fontSize: 18,
    fontWeight: "900",
  },

  actions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 11,
  },

  routeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#E8F0FE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  routeButtonText: {
    color: "#1A73E8",
    fontSize: 13,
    fontWeight: "700",
  },

  incidentButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#F59E0B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  incidentButtonText: {
    color: "#B45309",
    fontSize: 13,
    fontWeight: "700",
  },

  editButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#EEE8FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  editButtonText: {
    color: "#7048B8",
    fontSize: 13,
    fontWeight: "700",
  },

  cancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#FEE4E2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  cancelButtonText: {
    color: "#D9534F",
    fontSize: 13,
    fontWeight: "700",
  },

  reviewButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B00",
    borderRadius: 13,
    marginTop: 11,
    gap: 7,
  },

  reviewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  processingBox: {
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },

  processingText: {
    color: "#777777",
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 24,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  modalTitle: {
    color: "#1F1B2E",
    fontSize: 22,
    fontWeight: "800",
  },

  modalSubtitle: {
    color: "#777777",
    fontSize: 12,
    marginTop: 4,
  },

  closeButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
  },

  inputLabel: {
    color: "#666666",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
  },

  input: {
    minHeight: 52,
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#222222",
    marginBottom: 16,
  },

  referenceInput: {
    minHeight: 85,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },

  modalCancelButton: {
    flex: 1,
    minHeight: 54,
    backgroundColor: "#E5E5E8",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  modalCancelText: {
    color: "#555555",
    fontSize: 15,
    fontWeight: "700",
  },

  modalSaveButton: {
    flex: 2,
    minHeight: 54,
    backgroundColor: "#FF6B00",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  modalSaveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },
});