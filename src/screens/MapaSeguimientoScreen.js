import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RutaContext } from "../context/RutaContext";
import colors from "../theme/color";

export default function MapaSeguimientoScreen({ navigation, route }) {
  const { rutaId, pedidoId, destino, esRepartidor: paramEsRepartidor } =
    route.params || {};

  const {
    escucharUbicacion,
    actualizarUbicacion,
    iniciarRastreo,
    abrirNavegacionGoogleMaps,
    abrirEnGoogleMaps,
    compartirUbicacionWhatsApp,
  } = useContext(RutaContext);

  const [ruta, setRuta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transmitiendo, setTransmitiendo] = useState(false);
  const [segundosDesdeActualizacion, setSegundosDesdeActualizacion] = useState(0);
  const [modoRepartidor, setModoRepartidor] = useState(!!paramEsRepartidor);

  const suscripcionGpsRef = useRef(null);
  const intervalTimerRef = useRef(null);

  // Coordenadas por defecto (Juigalpa, Chontales) si aún no hay coordenadas registradas
  const LAT_DEFAULT = 12.1063;
  const LNG_DEFAULT = -85.3645;

  // 1. Escuchar la ruta en Firestore en tiempo real
  useEffect(() => {
    if (!rutaId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = escucharUbicacion(rutaId, (rutaActualizada) => {
      setRuta(rutaActualizada);
      setLoading(false);
      setSegundosDesdeActualizacion(0);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [rutaId, escucharUbicacion]);

  // 2. Contador de segundos transcurridos desde el último ping
  useEffect(() => {
    intervalTimerRef.current = setInterval(() => {
      setSegundosDesdeActualizacion((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
    };
  }, []);

  // 3. Limpiar suscripción de rastreo al desmontar pantalla
  useEffect(() => {
    return () => {
      if (suscripcionGpsRef.current) {
        suscripcionGpsRef.current.remove();
        suscripcionGpsRef.current = null;
      }
    };
  }, []);

  // Coordenadas actuales del repartidor
  const coordsRepartidor = ruta?.ubicacion_actual
    ? {
        latitude: ruta.ubicacion_actual.latitud,
        longitude: ruta.ubicacion_actual.longitud,
        heading: ruta.ubicacion_actual.rumbo || 0,
        speed: ruta.ubicacion_actual.velocidad || 0,
      }
    : {
        latitude: LAT_DEFAULT,
        longitude: LNG_DEFAULT,
        heading: 0,
        speed: 0,
      };

  const tieneCoordsReales = !!ruta?.ubicacion_actual;

  // Manejar inicio / detención del rastreo del repartidor
  const handleToggleTransmitir = async () => {
    if (transmitiendo) {
      // Detener
      if (suscripcionGpsRef.current) {
        suscripcionGpsRef.current.remove();
        suscripcionGpsRef.current = null;
      }
      setTransmitiendo(false);
      Alert.alert(
        "⏸️ Transmisión pausada",
        "Has detenido el envío de tu ubicación en tiempo real."
      );
    } else {
      // Iniciar
      try {
        if (!rutaId) {
          Alert.alert("Error", "No se especificó la ruta a transmitir.");
          return;
        }

        const sub = await iniciarRastreo(rutaId, (loc) => {
          setSegundosDesdeActualizacion(0);
        });

        suscripcionGpsRef.current = sub;
        setTransmitiendo(true);
        Alert.alert(
          "📡 ¡GPS en Vivo activado!",
          "Tu ubicación ahora se comparte en tiempo real con el cliente y el administrador en Google Maps."
        );
      } catch (err) {
        Alert.alert(
          "Error de GPS",
          err.message || "No se pudo iniciar el rastreo GPS. Verifica los permisos."
        );
      }
    }
  };

  // URL del iframe interactivo de Google Maps
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${coordsRepartidor.latitude},${coordsRepartidor.longitude}&hl=es&z=15&output=embed`;

  return (
    <View style={styles.container}>
      <View style={styles.phone}>
        {/* Cabecera */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Rastreo Google Maps</Text>
            <Text style={styles.headerSubtitle}>
              {pedidoId ? `Pedido #${pedidoId.slice(0, 6)}` : "Ruta en curso"}
            </Text>
          </View>

          {/* Toggle modo repartidor */}
          <TouchableOpacity
            style={[
              styles.modeToggle,
              modoRepartidor && styles.modeToggleActive,
            ]}
            onPress={() => setModoRepartidor(!modoRepartidor)}
          >
            <Ionicons
              name={modoRepartidor ? "bicycle" : "person"}
              size={18}
              color={modoRepartidor ? "#FFF" : colors.primary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Banner de estado en vivo */}
          <View style={styles.liveBanner}>
            <View style={styles.liveIndicator}>
              <View
                style={[
                  styles.pulseDot,
                  tieneCoordsReales ? styles.dotGreen : styles.dotYellow,
                ]}
              />
              <Text style={styles.liveText}>
                {tieneCoordsReales
                  ? "UBICACIÓN EN VIVO"
                  : "ESPERANDO COORDENADAS"}
              </Text>
            </View>
            <Text style={styles.lastUpdateText}>
              {tieneCoordsReales
                ? `Actualizado hace ${segundosDesdeActualizacion}s`
                : "Sin señal de GPS aún"}
            </Text>
          </View>

          {/* Visor interactivo de Google Maps */}
          <View style={styles.mapCard}>
            {loading ? (
              <View style={styles.mapLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.mapLoadingText}>Conectando a Google Maps...</Text>
              </View>
            ) : Platform.OS === "web" ? (
              <View style={styles.iframeContainer}>
                <iframe
                  title="Google Maps Seguimiento"
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="260"
                  style={{ border: 0, borderRadius: 16 }}
                  loading="lazy"
                  allowFullScreen
                />
              </View>
            ) : (
              <View style={styles.mobileMapPlaceholder}>
                <Ionicons name="map" size={54} color={colors.primary} />
                <Text style={styles.mobileMapTitle}>Mapa de Google Maps</Text>
                <Text style={styles.coordsText}>
                  Lat: {coordsRepartidor.latitude.toFixed(5)}, Lng:{" "}
                  {coordsRepartidor.longitude.toFixed(5)}
                </Text>
                <TouchableOpacity
                  style={styles.openMapBtn}
                  onPress={() =>
                    abrirEnGoogleMaps(
                      coordsRepartidor.latitude,
                      coordsRepartidor.longitude
                    )
                  }
                >
                  <Ionicons name="open-outline" size={16} color="#FFF" />
                  <Text style={styles.openMapBtnText}>
                    Abrir en App de Google Maps
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Tarjeta de información del repartidor */}
          <View style={styles.infoCard}>
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Ionicons name="bicycle" size={28} color="#FFF" />
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>Repartidor de GasRuta</Text>
                <Text style={styles.driverStatus}>
                  {ruta?.estado === "en_curso"
                    ? "🛵 En camino a la entrega"
                    : "📋 Ruta asignada"}
                </Text>
              </View>
              {coordsRepartidor.speed > 0 && (
                <View style={styles.speedBadge}>
                  <Text style={styles.speedText}>
                    {Math.round(coordsRepartidor.speed * 3.6)} km/h
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Detalles de la ruta */}
            <View style={styles.detailsGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Destino</Text>
                <Text style={styles.gridValue} numberOfLines={2}>
                  {destino || ruta?.ruta_asignada || "Juigalpa, Chontales"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Distancia</Text>
                <Text style={styles.gridValue}>
                  {ruta?.distancia_estimada
                    ? `${ruta.distancia_estimada} km`
                    : "En cálculo"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Tiempo est.</Text>
                <Text style={styles.gridValue}>
                  {ruta?.tiempo_estimado
                    ? `${ruta.tiempo_estimado} min`
                    : "15-20 min"}
                </Text>
              </View>
            </View>
          </View>

          {/* Panel de control del repartidor */}
          {modoRepartidor && (
            <View style={styles.repartidorPanel}>
              <Text style={styles.panelTitle}>🛠️ Panel de Control del Repartidor</Text>
              <Text style={styles.panelSubtitle}>
                Controla la transmisión de tu GPS hacia los clientes y la central.
              </Text>

              <TouchableOpacity
                style={[
                  styles.transmitBtn,
                  transmitiendo ? styles.transmitBtnStop : styles.transmitBtnStart,
                ]}
                onPress={handleToggleTransmitir}
              >
                <Ionicons
                  name={transmitiendo ? "pause-circle" : "radio"}
                  size={22}
                  color="#FFF"
                />
                <Text style={styles.transmitBtnText}>
                  {transmitiendo
                    ? "Detener Transmisión GPS"
                    : "Iniciar Transmisión GPS en Vivo"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Acciones Rápidas con Google Maps y Compartir */}
          <Text style={styles.sectionTitle}>Acciones de Geolocalización</Text>

          <View style={styles.actionButtonsCol}>
            {/* 1. Abrir en Google Maps */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                abrirEnGoogleMaps(
                  coordsRepartidor.latitude,
                  coordsRepartidor.longitude
                )
              }
            >
              <View style={[styles.actionIcon, { backgroundColor: "#E8F0FE" }]}>
                <Ionicons name="map-outline" size={22} color="#1A73E8" />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>Ver en Google Maps</Text>
                <Text style={styles.actionDesc}>
                  Abrir mapa interactivo oficial en app o navegador
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#AAA" />
            </TouchableOpacity>

            {/* 2. Navegación guiada */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                abrirNavegacionGoogleMaps(
                  coordsRepartidor.latitude,
                  coordsRepartidor.longitude
                )
              }
            >
              <View style={[styles.actionIcon, { backgroundColor: "#E6F4EA" }]}>
                <Ionicons name="navigate-outline" size={22} color="#1E8E3E" />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>Navegación paso a paso</Text>
                <Text style={styles.actionDesc}>
                  Indicaciones por voz con Google Maps hacia el destino
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#AAA" />
            </TouchableOpacity>

            {/* 3. Compartir por WhatsApp */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                compartirUbicacionWhatsApp({
                  latitud: coordsRepartidor.latitude,
                  longitud: coordsRepartidor.longitude,
                  pedidoId,
                })
              }
            >
              <View style={[styles.actionIcon, { backgroundColor: "#E1F5FE" }]}>
                <Ionicons
                  name="logo-whatsapp"
                  size={22}
                  color="#25D366"
                />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>Compartir enlace por WhatsApp</Text>
                <Text style={styles.actionDesc}>
                  Enviar la ubicación en vivo de Google Maps al cliente
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#AAA" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
  },
  phone: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFF",
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  modeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFF3EB",
  },
  modeToggleActive: {
    backgroundColor: colors.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  liveBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1F1B2E",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  dotGreen: {
    backgroundColor: "#00E676",
  },
  dotYellow: {
    backgroundColor: "#FFD600",
  },
  liveText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  lastUpdateText: {
    color: "#AAA",
    fontSize: 11,
  },
  mapCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    minHeight: 220,
    justifyContent: "center",
  },
  mapLoading: {
    padding: 40,
    alignItems: "center",
  },
  mapLoadingText: {
    marginTop: 10,
    color: colors.gray,
    fontSize: 13,
  },
  iframeContainer: {
    width: "100%",
    height: 260,
  },
  mobileMapPlaceholder: {
    padding: 24,
    alignItems: "center",
  },
  mobileMapTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: 8,
  },
  coordsText: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  openMapBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  openMapBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  driverStatus: {
    fontSize: 13,
    color: "#1E8E3E",
    fontWeight: "500",
    marginTop: 2,
  },
  speedBadge: {
    backgroundColor: "#FFF3EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD5B8",
  },
  speedText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridItem: {
    flex: 1,
    paddingHorizontal: 4,
  },
  gridLabel: {
    fontSize: 11,
    color: colors.gray,
    marginBottom: 3,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  repartidorPanel: {
    backgroundColor: "#FFF8F2",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFE2CC",
    marginBottom: 18,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  panelSubtitle: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 12,
  },
  transmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  transmitBtnStart: {
    backgroundColor: "#1E8E3E",
  },
  transmitBtnStop: {
    backgroundColor: "#D93025",
  },
  transmitBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
    marginLeft: 4,
  },
  actionButtonsCol: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  actionDesc: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
  },
});
