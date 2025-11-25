import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location"; // Biblioteca de GPS

// --- DADOS REAIS DE ECOPONTOS (RECIFE) ---
const RAW_POINTS = [
  {
    id: 1,
    title: "Ecoponto Boa Viagem",
    address: "Av. Boa Viagem, 5000",
    hours: "Seg-Sex: 8h-17h",
    phone: "(81) 3355-1234",
    coords: { latitude: -8.1275, longitude: -34.902 },
    tags: ["Eletrônicos", "Pilhas", "Óleo"],
  },
  {
    id: 2,
    title: "Ecoponto Torre",
    address: "Rua da Torre, 890",
    hours: "Seg-Sáb: 7h-18h",
    phone: "(81) 3355-5678",
    coords: { latitude: -8.052, longitude: -34.91 },
    tags: ["Recicláveis", "Lâmpadas", "Pilhas"],
  },
  {
    id: 3,
    title: "Ecoponto Casa Forte",
    address: "Praça de Casa Forte, 150",
    hours: "Seg-Sex: 8h-16h",
    phone: "(81) 3355-9012",
    coords: { latitude: -8.037, longitude: -34.919 },
    tags: ["Todos os tipos"],
  },
  {
    id: 4,
    title: "Ecoponto Ibura",
    address: "Av. Dois Rios, s/n",
    hours: "Seg-Sex: 8h-17h",
    phone: "(81) 3355-0000",
    coords: { latitude: -8.13, longitude: -34.94 },
    tags: ["Entulho", "Podas"],
  },
  {
    id: 5,
    title: "Ecoponto Jaqueira",
    address: "Rua do Futuro, 959",
    hours: "Todos os dias: 5h-22h",
    phone: "(81) 3355-1000",
    coords: { latitude: -8.0375, longitude: -34.9065 },
    tags: ["Recicláveis", "Óleo"],
  },
];

export default function EcopointsScreen({ navigation, route }) {
  const [points, setPoints] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Pega o filtro da tela anterior (se houver)
  const filter = route.params?.filter;

  // --- FÓRMULA MATEMÁTICA DE DISTÂNCIA (HAVERSINE) ---
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da terra em km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // 1. Pedir Permissão e Pegar Localização Real
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg(
          "Permissão de localização negada. Mostrando distâncias da Praça do Marco Zero."
        );
        // Fallback: Marco Zero
        setUserLocation({ latitude: -8.0631, longitude: -34.8711 });
      } else {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      }

      // 2. Preparar a lista inicial (com ou sem filtro de tags)
      let filteredList = RAW_POINTS;
      if (filter) {
        filteredList = RAW_POINTS.filter((p) =>
          p.tags.some(
            (tag) =>
              tag.toLowerCase().includes(filter.toLowerCase()) ||
              tag === "Todos os tipos"
          )
        );
      }

      // 3. Calcular Distâncias e Ordenar
      const currentUserLoc = userLocation || {
        latitude: -8.0631,
        longitude: -34.8711,
      }; // Usa a localização obtida ou fallback

      const sortedList = filteredList
        .map((point) => {
          const dist = getDistanceFromLatLonInKm(
            currentUserLoc.latitude,
            currentUserLoc.longitude,
            point.coords.latitude,
            point.coords.longitude
          );
          return { ...point, distance: dist };
        })
        .sort((a, b) => a.distance - b.distance); // ORDENAÇÃO: Menor distância primeiro

      setPoints(sortedList);
      setLoading(false);
    })();
  }, [filter, userLocation?.latitude]); // Recalcula se o filtro ou a localização mudar

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Verde */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>
            {filter ? `Locais para: ${filter}` : "Ecopontos Próximos"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {points.length} locais encontrados ordenados por proximidade
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#00A859" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            Buscando sua localização...
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Mapa no Topo */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={{
                latitude: userLocation ? userLocation.latitude : -8.0631,
                longitude: userLocation ? userLocation.longitude : -34.8711,
                latitudeDelta: 0.15,
                longitudeDelta: 0.15,
              }}
              showsUserLocation={true} // Mostra a bolinha azul pulsante nativa do mapa
            >
              {/* Marcadores dos Ecopontos */}
              {points.map((point) => (
                <Marker
                  key={point.id}
                  coordinate={point.coords}
                  title={point.title}
                >
                  <View style={styles.ecoMarker}>
                    <MaterialCommunityIcons
                      name="recycle"
                      size={14}
                      color="white"
                    />
                  </View>
                </Marker>
              ))}
            </MapView>

            <View style={styles.mapOverlay} pointerEvents="none" />
          </View>

          {/* Lista de Cards Ordenada */}
          <View style={styles.listContainer}>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            {points.map((item, index) => (
              <View key={item.id} style={styles.card}>
                {/* Tag de "Mais Próximo" para o primeiro da lista */}
                {index === 0 && (
                  <View style={styles.nearestBadge}>
                    <Text style={styles.nearestText}>MAIS PRÓXIMO</Text>
                  </View>
                )}

                <View style={styles.cardHeader}>
                  <View style={styles.iconBg}>
                    <Ionicons
                      name="location-outline"
                      size={24}
                      color="#00A859"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardAddress}>{item.address}</Text>
                  </View>
                </View>

                {/* Distância Calculada */}
                <View style={styles.infoRow}>
                  <Ionicons
                    name="navigate-circle-outline"
                    size={18}
                    color="#007BFF"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.distText}>
                    {
                      item.distance < 1
                        ? `${(item.distance * 1000).toFixed(0)} m` // Mostra em metros se for perto
                        : `${item.distance.toFixed(1)} km` // Mostra em km se for longe
                    }
                  </Text>
                </View>

                <View style={styles.tagsRow}>
                  {item.tags.map((tag) => (
                    <View
                      key={tag}
                      style={[
                        styles.tag,
                        filter && tag.includes(filter) && styles.activeTag,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          filter &&
                            tag.includes(filter) &&
                            styles.activeTagText,
                        ]}
                      >
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.footerRow}>
                  <View style={styles.footerItem}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color="#666"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.footerText}>{item.hours}</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Ionicons
                      name="call-outline"
                      size={14}
                      color="#666"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.footerText}>{item.phone}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5" },
  header: { backgroundColor: "#00A859", padding: 20, paddingTop: 20 },
  headerTexts: { marginTop: 5 },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { color: "white", fontSize: 16, marginLeft: 5, fontWeight: "500" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "white" },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },

  content: { flex: 1 },
  centerLoading: { flex: 1, justifyContent: "center", alignItems: "center" },

  mapContainer: {
    height: 200,
    backgroundColor: "#EEE",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
    elevation: 5,
    marginBottom: 10,
  },
  map: { width: "100%", height: "100%" },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,168,89,0.05)",
  },

  ecoMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#00A859",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },

  listContainer: { padding: 20, marginTop: -10 },
  errorText: { color: "orange", textAlign: "center", marginBottom: 10 },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    position: "relative",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  nearestBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#00A859",
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  nearestText: { color: "white", fontSize: 10, fontWeight: "bold" },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  cardAddress: { fontSize: 13, color: "#666", marginTop: 2 },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 52,
    marginBottom: 10,
  },
  distText: { color: "#007BFF", fontWeight: "bold", fontSize: 14 },

  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 52,
    marginBottom: 15,
  },
  tag: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  activeTag: { backgroundColor: "#00A859" },
  tagText: { fontSize: 11, color: "#00A859", fontWeight: "600" },
  activeTagText: { color: "white" },

  divider: { height: 1, backgroundColor: "#F0F0F0", marginBottom: 12 },

  footerRow: { flexDirection: "row", justifyContent: "space-between" },
  footerItem: { flexDirection: "row", alignItems: "center" },
  footerText: { fontSize: 12, color: "#666" },
});
