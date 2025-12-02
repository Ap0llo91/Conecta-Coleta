import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

// PARA WEB: Importação Condicional do Mapa ---
let MapView, Marker, PROVIDER_GOOGLE;

if (Platform.OS !== "web") {
  // Só carrega a biblioteca de mapas se NÃO for web
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

// --- LISTA COMPLETA DE PONTOS (ECOPONTOS + RECICLAGEM) ---
const RAW_POINTS = [
  // ECOPONTOS (Oficiais da Prefeitura/Emlurb)
  {
    id: 1,
    type: "ecoponto",
    title: "EcoEstação Boa Viagem",
    address: "Rua Padre Carapuceiro, s/n - Boa Viagem",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.1275, longitude: -34.902 },
    tags: ["Entulho", "Poda", "Móveis", "Recicláveis"],
  },
  {
    id: 2,
    type: "ecoponto",
    title: "EcoEstação Imbiribeira",
    address: "Av. Mascarenhas de Morais (ao lado do Viaduto Tancredo Neves)",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.113, longitude: -34.912 },
    tags: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 3,
    type: "ecoponto",
    title: "EcoEstação Ibura",
    address: "Rua Rio Tapado (prox. BR-101) - Ibura",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.131, longitude: -34.935 },
    tags: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 4,
    type: "ecoponto",
    title: "EcoEstação Torre",
    address: "Rua Ciclovia República da Argélia - Torre",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.048, longitude: -34.91 },
    tags: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 5,
    type: "ecoponto",
    title: "EcoEstação Campo Grande",
    address: "Av. Agamenon Magalhães x Rua Odorico Mendes",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.035, longitude: -34.89 },
    tags: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 6,
    type: "ecoponto",
    title: "EcoEstação Cais de Santa Rita",
    address: "Travessa Cais de Santa Rita - São José",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.068, longitude: -34.878 },
    tags: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 7,
    type: "ecoponto",
    title: "EcoEstação Arruda",
    address: "Av. Professor José dos Anjos - Arruda",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.025, longitude: -34.89 },
    tags: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 8,
    type: "ecoponto",
    title: "EcoEstação Torrões",
    address: "Rua Maestro Jones Johnson - Torrões",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.06, longitude: -34.93 },
    tags: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 9,
    type: "ecoponto",
    title: "Econúcleo Jaqueira",
    address: "Parque da Jaqueira - Graças",
    hours: "Qui-Dom: 9h-17h",
    coords: { latitude: -8.0375, longitude: -34.9065 },
    tags: ["Educação Ambiental", "Recicláveis Leves"],
  },
  {
    id: 10,
    type: "ecoponto",
    title: "EcoEstação Cohab",
    address: "Av. Rio Largo x Av. Santos - Cohab/Ibura",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.125, longitude: -34.945 },
    tags: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 11,
    type: "ecoponto",
    title: "EcoEstação Totó",
    address: "Rua Onze de Agosto x Rua Nelson de Sena",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.09, longitude: -34.955 },
    tags: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 12,
    type: "ecoponto",
    title: "Econúcleo Barbalho",
    address: "Estrada do Barbalho - Iputinga",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.042, longitude: -34.925 },
    tags: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 13,
    type: "ecoponto",
    title: "EcoEstação Nova Descoberta",
    address: "Rua Nova Descoberta, 1062",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.012, longitude: -34.928 },
    tags: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 14,
    type: "ecoponto",
    title: "EcoEstação Cabanga",
    address: "Av. Saturnino de Brito - Cabanga",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.075, longitude: -34.89 },
    tags: ["Entulho", "Poda", "Recicláveis"],
  },

  // PONTOS DE ENTREGA VOLUNTÁRIA (Shoppings/Mercados - Reciclagem)
  {
    id: 20,
    type: "reciclagem",
    title: "PEV Shopping Recife",
    address: "Rua Padre Carapuceiro, 777 - Boa Viagem",
    hours: "Seg-Sáb: 10h-22h",
    coords: { latitude: -8.1185, longitude: -34.9045 },
    tags: ["Eletrônicos", "Pilhas", "Plástico"],
  },
  {
    id: 21,
    type: "reciclagem",
    title: "PEV Plaza Casa Forte",
    address: "Rua Dr. João Santos Filho, 255 - Casa Forte",
    hours: "Seg-Sáb: 10h-22h",
    coords: { latitude: -8.036, longitude: -34.912 },
    tags: ["Vidro", "Papel", "Metal"],
  },
  {
    id: 22,
    type: "reciclagem",
    title: "PEV RioMar Recife",
    address: "Av. República do Líbano, 251 - Pina",
    hours: "Seg-Sáb: 10h-22h",
    coords: { latitude: -8.086, longitude: -34.895 },
    tags: ["Eletrônicos", "Recicláveis Gerais"],
  },
  {
    id: 23,
    type: "reciclagem",
    title: "Atacadão Casa Amarela",
    address: "R. Paula Batista, 680 - Casa Amarela, Recife - PE, 52070-070",
    hours: "Seg-Sáb: 7h-21h",
    coords: { latitude: -8.028, longitude: -34.92 },
    tags: ["Pilhas", "Baterias"],
  },
];

export default function EcopointsScreen({ navigation, route }) {
  const [points, setPoints] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const filterParam = route.params?.filter;

  // --- FUNÇÃO PARA ABRIR O MAPA ---
  const openGps = (lat, lng, label) => {
    if (Platform.OS === "web") {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      );
      return;
    }

    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${lat},${lng}`;
    const labelEncoded = encodeURIComponent(label);

    const url = Platform.select({
      ios: `maps:0,0?q=${labelEncoded}@${latLng}`,
      android: `google.navigation:q=${latLng}`,
    });

    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      );
    });
  };

  // Cálculo de Distância
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
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

      let currentUserLoc = { latitude: -8.0631, longitude: -34.8711 };

      if (Platform.OS !== "web") {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permissão negada. Mostrando distâncias do Marco Zero.");
        } else {
          let location = await Location.getCurrentPositionAsync({});
          currentUserLoc = location.coords;
          setUserLocation(location.coords);
        }
      } else {
        try {
          let location = await Location.getCurrentPositionAsync({});
          currentUserLoc = location.coords;
          setUserLocation(location.coords);
        } catch (e) {
          console.log("Localização web não disponível ou bloqueada");
        }
      }

      let filteredList = RAW_POINTS;

      if (filterParam) {
        if (filterParam === "ecoponto" || filterParam === "reciclagem") {
          filteredList = RAW_POINTS.filter((p) => p.type === filterParam);
        } else {
          filteredList = RAW_POINTS.filter((p) =>
            p.tags.some(
              (tag) =>
                tag.toLowerCase().includes(filterParam.toLowerCase()) ||
                tag === "Todos os tipos"
            )
          );
        }
      }

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
        .sort((a, b) => a.distance - b.distance);

      setPoints(sortedList);
      setLoading(false);
    })();
  }, [filterParam]);

  const renderMarkerIcon = (type) => {
    return type === "ecoponto" ? "#2ECC71" : "#007BFF";
  };

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
            {filterParam === "ecoponto"
              ? "Ecopontos Oficiais"
              : filterParam === "reciclagem"
              ? "Pontos de Reciclagem"
              : "Locais Próximos"}
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
            Buscando locais e calculando distâncias...
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Mapa Pequeno no Topo para Contexto */}
          <View style={styles.mapContainer}>
            {/* CORREÇÃO PARA WEB: Renderização Condicional */}
            {Platform.OS === "web" ? (
              <View style={styles.webMapPlaceholder}>
                <MaterialCommunityIcons
                  name="map-search-outline"
                  size={40}
                  color="#00A859"
                />
                <Text style={styles.webMapText}>
                  Mapa interativo disponível no App Mobile.{"\n"}
                  Clique em "Navegar" na lista abaixo para ver a rota.
                </Text>
              </View>
            ) : (
              <>
                <MapView
                  style={styles.map}
                  provider={PROVIDER_GOOGLE}
                  region={{
                    latitude: userLocation ? userLocation.latitude : -8.0631,
                    longitude: userLocation ? userLocation.longitude : -34.8711,
                    latitudeDelta: 0.12,
                    longitudeDelta: 0.12,
                  }}
                  showsUserLocation={true}
                >
                  {points.map((point) => (
                    <Marker
                      key={point.id}
                      coordinate={point.coords}
                      title={point.title}
                      pinColor={renderMarkerIcon(point.type)}
                      onCalloutPress={() =>
                        openGps(
                          point.coords.latitude,
                          point.coords.longitude,
                          point.title
                        )
                      }
                    />
                  ))}
                </MapView>
                <View style={styles.mapOverlay} pointerEvents="none" />
              </>
            )}
          </View>

          {/* Lista de Cards Ordenada */}
          <View style={styles.listContainer}>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            {points.map((item, index) => (
              <View key={item.id} style={styles.card}>
                {index === 0 && (
                  <View style={styles.nearestBadge}>
                    <Text style={styles.nearestText}>MAIS PRÓXIMO</Text>
                  </View>
                )}

                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardLeftInfo}>
                    <View
                      style={[
                        styles.iconBg,
                        {
                          backgroundColor:
                            item.type === "ecoponto" ? "#E8F5E9" : "#E3F2FD",
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.type === "ecoponto" ? "leaf" : "sync"}
                        size={24}
                        color={item.type === "ecoponto" ? "#2ECC71" : "#007BFF"}
                      />
                    </View>
                    <View style={{ flex: 1, marginRight: 5 }}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardAddress}>{item.address}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() =>
                      openGps(
                        item.coords.latitude,
                        item.coords.longitude,
                        item.title
                      )
                    }
                  >
                    <MaterialCommunityIcons
                      name="google-maps"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name="navigate-circle-outline"
                    size={18}
                    color="#007BFF"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.distText}>
                    {item.distance < 1
                      ? `${(item.distance * 1000).toFixed(0)} m`
                      : `${item.distance.toFixed(1)} km`}
                  </Text>
                </View>

                <View style={styles.tagsRow}>
                  {item.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
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
                  {item.phone && (
                    <View style={styles.footerItem}>
                      <Ionicons
                        name="call-outline"
                        size={14}
                        color="#666"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.footerText}>{item.phone}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {points.length === 0 && !loading && (
              <Text
                style={{ textAlign: "center", marginTop: 20, color: "#999" }}
              >
                Nenhum local encontrado.
              </Text>
            )}
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
    height: 180,
    backgroundColor: "#EEE",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
    elevation: 5,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  map: { width: "100%", height: "100%" },

  // Estilo para Web
  webMapPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#E8F5E9",
  },
  webMapText: {
    color: "#444",
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },

  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.05)",
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
    zIndex: 10,
  },
  nearestText: { color: "white", fontSize: 10, fontWeight: "bold" },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 5,
  },
  cardLeftInfo: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
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

  navButton: {
    backgroundColor: "#007BFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginTop: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },

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
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: { fontSize: 11, color: "#555", fontWeight: "600" },

  divider: { height: 1, backgroundColor: "#F0F0F0", marginBottom: 12 },

  footerRow: { flexDirection: "row", justifyContent: "space-between" },
  footerItem: { flexDirection: "row", alignItems: "center" },
  footerText: { fontSize: 12, color: "#666" },
});
