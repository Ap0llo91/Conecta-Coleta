import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
  FlatList,
  Platform,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";
import * as Location from "expo-location";

// --- CONSTANTES ---
const CYCLE_MINUTES = 20;

// Função Haversine para calcular distância real em KM
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Raio da Terra
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Componente para evitar renderizações excessivas nos marcadores
const StableMarker = ({ coordinate, onPress, children, anchor, flat }) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Marker
      coordinate={coordinate}
      onPress={onPress}
      tracksViewChanges={tracksViewChanges}
      anchor={anchor}
      flat={flat}
      calloutAnchor={{ x: 0.5, y: 0 }}
    >
      {children}
    </Marker>
  );
};

// --- ESTILO DO MAPA (Clean) ---
const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9e7f8" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

const FALLBACK_ROUTE = [
  { latitude: -8.112, longitude: -34.895 },
  { latitude: -8.1132, longitude: -34.8955 },
  { latitude: -8.1145, longitude: -34.896 },
];

// --- LISTA EXPANDIDA DE ECOPONTOS E RECICLAGEM (Baseada na busca real) ---
const FIXED_POINTS = [
  // ECOPONTOS (Oficiais da Prefeitura/Emlurb)
  {
    id: 1,
    type: "ecoponto",
    title: "EcoEstação Boa Viagem",
    address: "Rua Padre Carapuceiro, s/n - Boa Viagem",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.1275, longitude: -34.902 },
    materials: ["Entulho", "Poda", "Móveis", "Recicláveis"],
  },
  {
    id: 2,
    type: "ecoponto",
    title: "EcoEstação Imbiribeira",
    address: "Av. Mascarenhas de Morais (ao lado do Viaduto Tancredo Neves)",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.113, longitude: -34.912 },
    materials: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 3,
    type: "ecoponto",
    title: "EcoEstação Ibura",
    address: "Rua Rio Tapado (prox. BR-101) - Ibura",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.131, longitude: -34.935 },
    materials: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 4,
    type: "ecoponto",
    title: "EcoEstação Torre",
    address: "Rua Ciclovia República da Argélia - Torre",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.048, longitude: -34.91 },
    materials: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 5,
    type: "ecoponto",
    title: "EcoEstação Campo Grande",
    address: "Av. Agamenon Magalhães x Rua Odorico Mendes",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.035, longitude: -34.89 },
    materials: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 6,
    type: "ecoponto",
    title: "EcoEstação Cais de Santa Rita",
    address: "Travessa Cais de Santa Rita - São José",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.068, longitude: -34.878 },
    materials: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 7,
    type: "ecoponto",
    title: "EcoEstação Arruda",
    address: "Av. Professor José dos Anjos - Arruda",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.025, longitude: -34.89 },
    materials: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 8,
    type: "ecoponto",
    title: "EcoEstação Torrões",
    address: "Rua Maestro Jones Johnson - Torrões",
    hours: "Seg-Sáb: 8h-16h",
    coords: { latitude: -8.06, longitude: -34.93 },
    materials: ["Entulho", "Poda", "Recicláveis"],
  },
  {
    id: 9,
    type: "ecoponto",
    title: "Econúcleo Jaqueira",
    address: "Parque da Jaqueira - Graças",
    hours: "Qui-Dom: 9h-17h",
    coords: { latitude: -8.0375, longitude: -34.9065 },
    materials: ["Educação Ambiental", "Recicláveis Leves"],
  },

  // PONTOS DE ENTREGA VOLUNTÁRIA (Shoppings/Mercados - Reciclagem)
  {
    id: 20,
    type: "reciclagem",
    title: "PEV Shopping Recife",
    address: "Rua Padre Carapuceiro, 777 - Boa Viagem",
    hours: "Seg-Sáb: 10h-22h",
    coords: { latitude: -8.1185, longitude: -34.9045 },
    materials: ["Eletrônicos", "Pilhas", "Plástico"],
  },
  {
    id: 21,
    type: "reciclagem",
    title: "PEV Plaza Casa Forte",
    address: "Rua Dr. João Santos Filho, 255 - Casa Forte",
    hours: "Seg-Sáb: 10h-22h",
    coords: { latitude: -8.036, longitude: -34.912 },
    materials: ["Vidro", "Papel", "Metal"],
  },
  {
    id: 22,
    type: "reciclagem",
    title: "PEV RioMar Recife",
    address: "Av. República do Líbano, 251 - Pina",
    hours: "Seg-Sáb: 10h-22h",
    coords: { latitude: -8.086, longitude: -34.895 },
    materials: ["Eletrônicos", "Recicláveis Gerais"],
  },
  // ENDEREÇO CORRIGIDO AQUI:
  {
    id: 23,
    type: "reciclagem",
    title: "Atacadão Casa Amarela",
    address: "R. Paula Batista, 680 - Casa Amarela, Recife - PE, 52070-070",
    hours: "Seg-Sáb: 7h-21h",
    coords: { latitude: -8.028, longitude: -34.92 },
    materials: ["Pilhas", "Baterias"],
  },
];

export default function MapScreen({ navigation }) {
  const mapRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [truckRoute, setTruckRoute] = useState(FALLBACK_ROUTE);
  const [currentTruckPos, setCurrentTruckPos] = useState(FALLBACK_ROUTE[0]);
  const [userAddress, setUserAddress] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Estado para o Modal de Lista
  const [listModalVisible, setListModalVisible] = useState(false);
  const [listModalType, setListModalType] = useState(null); // 'ecoponto' ou 'reciclagem'

  const [filters, setFilters] = useState({
    ecoponto: true,
    reciclagem: true,
    caminhao: true,
  });

  // --- MEMO: Processamento Inteligente dos Pontos ---
  const processedPoints = useMemo(() => {
    if (!userLocation) return { ecopontos: [], reciclagem: [] };

    // Calcula a distância de todos os pontos
    const pointsWithDistance = FIXED_POINTS.map((p) => ({
      ...p,
      distance: getDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        p.coords.latitude,
        p.coords.longitude
      ),
    })).sort((a, b) => a.distance - b.distance); // Ordena do mais perto para o longe

    return {
      ecopontos: pointsWithDistance.filter((p) => p.type === "ecoponto"),
      reciclagem: pointsWithDistance.filter((p) => p.type === "reciclagem"),
    };
  }, [userLocation]);

  // Dados para os Cards
  const nearestReciclagem =
    processedPoints.reciclagem.length > 0
      ? processedPoints.reciclagem[0]
      : null;
  const nearestReciclagemDist = nearestReciclagem
    ? `${nearestReciclagem.distance.toFixed(1)} km`
    : "-- km";

  const nearestEcoponto =
    processedPoints.ecopontos.length > 0 ? processedPoints.ecopontos[0] : null;
  const nearestEcopontoDist = nearestEcoponto
    ? `${nearestEcoponto.distance.toFixed(1)} km`
    : "-- km";
  const ecopontosCount = processedPoints.ecopontos.length;

  // --- FUNÇÕES ---

  const openGoogleMaps = (lat, lng, label) => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${lat},${lng}`;
    const labelEncoded = encodeURIComponent(label);
    const url = Platform.select({
      ios: `${scheme}${labelEncoded}@${latLng}`,
      android: `${scheme}${latLng}(${labelEncoded})`,
    });
    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(webUrl);
        }
      })
      .catch(() => {
        Linking.openURL(webUrl);
      });
  };

  const calculateTruckPosition = (route) => {
    if (!route || route.length === 0) return null;
    const CYCLE_MS = CYCLE_MINUTES * 60 * 1000;
    const now = Date.now();
    let progress = (now % CYCLE_MS) / CYCLE_MS;
    const totalIndex = route.length - 1;
    const currentIndex = Math.floor(progress * totalIndex);
    return route[currentIndex];
  };

  const fetchStreetRoute = async (userLat, userLng) => {
    try {
      const startLat = userLat - 0.02;
      const startLng = userLng - 0.01;
      const endLat = userLat;
      const endLng = userLng;

      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const json = await response.json();

      if (json.routes && json.routes.length > 0) {
        const coordinates = json.routes[0].geometry.coordinates.map(
          (coord) => ({
            latitude: coord[1],
            longitude: coord[0],
          })
        );
        if (coordinates.length > 0) {
          setTruckRoute(coordinates);
          setCurrentTruckPos(calculateTruckPosition(coordinates));
        }
      }
    } catch (error) {
      console.log("Erro ao buscar rota:", error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: addressData } = await supabase
            .from("enderecos")
            .select("*")
            .eq("usuario_id", user.id)
            .eq("is_padrao", true)
            .maybeSingle();

          if (addressData) {
            setUserAddress(`${addressData.rua}, ${addressData.numero}`);
            const fullAddr = `${addressData.rua}, ${addressData.numero}, ${addressData.bairro}, Recife`;

            const geocoded = await Location.geocodeAsync(fullAddr);

            if (geocoded.length > 0) {
              const { latitude, longitude } = geocoded[0];
              setUserLocation({
                latitude,
                longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              });
              await fetchStreetRoute(latitude, longitude);
              setLoadingLocation(false);
              return;
            }
          }
        }

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          let location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
          await fetchStreetRoute(
            location.coords.latitude,
            location.coords.longitude
          );
        }
        setLoadingLocation(false);
      } catch (error) {
        console.log("Erro setup mapa:", error);
        setLoadingLocation(false);
      }
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (truckRoute.length > 0) {
        const newPos = calculateTruckPosition(truckRoute);
        if (newPos) setCurrentTruckPos(newPos);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [truckRoute]);

  const handleCenterOnTruck = () => {
    if (mapRef.current && currentTruckPos) {
      mapRef.current.animateToRegion(
        {
          latitude: currentTruckPos.latitude,
          longitude: currentTruckPos.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
    setSelectedPoint({ type: "caminhao", title: "Caminhão da Coleta" });
  };

  const handleRecenterUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        1000
      );
    }
  };

  const toggleFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderMarkerIcon = (type) => {
    switch (type) {
      case "ecoponto":
        return <MarkerIcon color="#2ECC71" icon="leaf" library="Ionicons" />;
      case "reciclagem":
        return (
          <MarkerIcon
            color="#007BFF"
            icon="recycle"
            library="MaterialCommunityIcons"
          />
        );
      default:
        return null;
    }
  };

  // Abre o modal de lista
  const handleOpenList = (type) => {
    setListModalType(type);
    setListModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa de Coleta</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapWrapper}>
          {loadingLocation && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="large" color="#00A859" />
              <Text style={{ marginTop: 10, color: "#555" }}>
                Localizando seu endereço...
              </Text>
            </View>
          )}

          <MapView
            ref={mapRef}
            style={styles.map}
            customMapStyle={MAP_STYLE}
            provider={PROVIDER_GOOGLE}
            initialRegion={
              userLocation || {
                latitude: -8.0849,
                longitude: -34.9027,
                latitudeDelta: 0.12,
                longitudeDelta: 0.12,
              }
            }
            showsUserLocation={true}
            showsMyLocationButton={false}
            onPress={() => {
              setSelectedPoint(null);
              setShowFilters(false);
            }}
          >
            {filters.caminhao && truckRoute.length > 1 && (
              <Polyline
                coordinates={truckRoute}
                strokeColor="#007BFF"
                strokeWidth={4}
              />
            )}

            {userLocation && (
              <Marker coordinate={userLocation} title="Seu Endereço">
                <View style={styles.homeMarker}>
                  <Ionicons name="home" size={16} color="white" />
                </View>
              </Marker>
            )}

            {FIXED_POINTS.map((point) => {
              if (!filters[point.type]) return null;
              return (
                <StableMarker
                  key={point.id}
                  coordinate={point.coords}
                  onPress={() => setSelectedPoint(point)}
                >
                  {renderMarkerIcon(point.type)}
                </StableMarker>
              );
            })}

            {filters.caminhao && currentTruckPos && (
              <StableMarker
                coordinate={currentTruckPos}
                onPress={() =>
                  setSelectedPoint({
                    type: "caminhao",
                    title: "Caminhão da Coleta",
                  })
                }
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.optimizedTruckMarker}>
                  <MaterialCommunityIcons
                    name="truck-delivery"
                    size={22}
                    color="white"
                  />
                </View>
              </StableMarker>
            )}
          </MapView>

          <View style={styles.legendCard}>
            <LegendItem color="#2ECC71" text="Ecopontos" />
            <LegendItem color="#007BFF" text="Reciclagem" />
          </View>

          <View style={styles.floatingButtons}>
            <TouchableOpacity
              style={[
                styles.circleBtn,
                showFilters && { backgroundColor: "#007BFF" },
              ]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons
                name="filter"
                size={20}
                color={showFilters ? "white" : "#666"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleBtn}
              onPress={handleRecenterUser}
            >
              <MaterialCommunityIcons
                name="crosshairs-gps"
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        {showFilters && (
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Ionicons
                name="options-outline"
                size={18}
                color="#666"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.filterHelperText}>
                Toque para filtrar o mapa:
              </Text>
            </View>
            <View style={styles.filtersRow}>
              <FilterChip
                label="Ecopontos"
                active={filters.ecoponto}
                onPress={() => toggleFilter("ecoponto")}
                color="#2ECC71"
                icon="leaf"
              />
              <FilterChip
                label="Reciclagem"
                active={filters.reciclagem}
                onPress={() => toggleFilter("reciclagem")}
                color="#007BFF"
                icon="recycle"
              />
              <FilterChip
                label="Caminhão"
                active={filters.caminhao}
                onPress={() => toggleFilter("caminhao")}
                color="#007BFF"
                icon="truck"
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.truckCard}
          onPress={handleCenterOnTruck}
        >
          <View style={styles.truckHeader}>
            <View style={styles.truckIconBg}>
              <MaterialCommunityIcons
                name="truck-outline"
                size={24}
                color="#007BFF"
              />
            </View>
            <View>
              <Text style={styles.truckTitle}>
                Caminhão próximo ao seu endereço
              </Text>
              <Text style={styles.truckSubtitle}>Seguindo rota oficial</Text>
            </View>
          </View>

          <View style={styles.timeContainer}>
            <View style={styles.liveIndicator}>
              <View style={styles.dot} />
              <Text style={styles.liveText}>EM ROTA</Text>
            </View>
            <Text style={styles.timeText}>{userAddress || "Sua região"}</Text>
          </View>
          <Text style={styles.updateText}>
            Atualizando posição em tempo real
          </Text>
          <View style={styles.divider} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Pontos de Coleta Próximos</Text>

        {/* CARDS AGORA SÃO BOTÕES (TouchableOpacity) */}
        <View style={styles.pointsRow}>
          <PointCard
            label="Ecopontos"
            sub={`${ecopontosCount} pontos na cidade`}
            extra={`+ Perto: ${nearestEcopontoDist}`}
            icon="leaf-outline"
            color="#2ECC71"
            bgColor="#E8F5E9"
            onPress={() => handleOpenList("ecoponto")}
          />
          <PointCard
            label="Reciclagem"
            sub="Shoppings e Mercados"
            extra={`+ Perto: ${nearestReciclagemDist}`}
            icon="sync"
            color="#007BFF"
            bgColor="#E3F2FD"
            onPress={() => handleOpenList("reciclagem")}
          />
        </View>

        {/* --- MODAL DE LISTA (NOVO) --- */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={listModalVisible}
          onRequestClose={() => setListModalVisible(false)}
        >
          <View style={styles.listModalContainer}>
            <View style={styles.listModalContent}>
              <View style={styles.listModalHeader}>
                <Text style={styles.listModalTitle}>
                  {listModalType === "ecoponto"
                    ? "Ecopontos Próximos"
                    : "Pontos de Reciclagem"}
                </Text>
                <TouchableOpacity onPress={() => setListModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={
                  listModalType === "ecoponto"
                    ? processedPoints.ecopontos
                    : processedPoints.reciclagem
                }
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <View style={styles.listItem}>
                    <View style={styles.listItemIconContainer}>
                      <Ionicons
                        name={listModalType === "ecoponto" ? "leaf" : "sync"}
                        size={24}
                        color={
                          listModalType === "ecoponto" ? "#2ECC71" : "#007BFF"
                        }
                      />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                      <Text style={styles.listItemTitle}>{item.title}</Text>
                      <Text style={styles.listItemAddress}>{item.address}</Text>
                      <View style={styles.listItemDistanceBadge}>
                        <Text style={styles.listItemDistanceText}>
                          {item.distance.toFixed(1)} km
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.listItemButton}
                      onPress={() =>
                        openGoogleMaps(
                          item.coords.latitude,
                          item.coords.longitude,
                          item.title
                        )
                      }
                    >
                      <MaterialCommunityIcons
                        name="google-maps"
                        size={24}
                        color="#FFF"
                      />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={
                  <Text
                    style={{
                      textAlign: "center",
                      marginTop: 20,
                      color: "#999",
                    }}
                  >
                    Nenhum ponto encontrado.
                  </Text>
                }
              />
            </View>
          </View>
        </Modal>

        {/* --- MODAL DE DETALHES DO MAPA --- */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedPoint}
          onRequestClose={() => setSelectedPoint(null)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedPoint(null)}
          >
            <View
              style={styles.infoPopup}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.popupHeader}>
                <Text style={styles.popupTitle}>{selectedPoint?.title}</Text>
                <TouchableOpacity onPress={() => setSelectedPoint(null)}>
                  <Ionicons name="close-circle" size={28} color="#DDD" />
                </TouchableOpacity>
              </View>

              {selectedPoint?.type === "caminhao" ? (
                <View>
                  <Text style={styles.popupText}>
                    Veículo CR-2024 em operação.
                  </Text>
                  <Text style={[styles.popupText, { marginTop: 5 }]}>
                    Status: Em movimento pela sua rua (Coleta Porta a Porta).
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 15,
                      backgroundColor: "#E3F2FD",
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="speedometer"
                      size={20}
                      color="#007BFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{ fontWeight: "bold", color: "#007BFF" }}>
                      Velocidade Média: 20 km/h
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  <InfoRow
                    icon="location-outline"
                    text={selectedPoint?.address}
                  />
                  {selectedPoint?.hours && (
                    <InfoRow
                      icon="time-outline"
                      text={selectedPoint.hours}
                      color="#007BFF"
                    />
                  )}
                  {selectedPoint?.materials && (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        marginBottom: 15,
                      }}
                    >
                      {selectedPoint.materials.map((mat, idx) => (
                        <View
                          key={idx}
                          style={{
                            backgroundColor: "#F0F0F0",
                            borderRadius: 4,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            marginRight: 6,
                            marginBottom: 4,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: "#555" }}>
                            {mat}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() =>
                      openGoogleMaps(
                        selectedPoint.coords.latitude,
                        selectedPoint.coords.longitude,
                        selectedPoint.title
                      )
                    }
                  >
                    <Text style={styles.modalButtonText}>
                      Traçar Rota no Google Maps
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- VISUAIS ---
const MarkerIcon = ({ color, icon, library }) => {
  const IconLib = library === "Ionicons" ? Ionicons : MaterialCommunityIcons;
  return (
    <View style={[styles.markerBase, { backgroundColor: "white" }]}>
      <View style={[styles.markerInner, { backgroundColor: color }]}>
        <IconLib name={icon} size={14} color="white" />
      </View>
    </View>
  );
};

const LegendItem = ({ color, text }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        marginRight: 6,
      }}
    />
    <Text style={{ fontSize: 10, color: "#333", fontWeight: "600" }}>
      {text}
    </Text>
  </View>
);

const PointCard = ({ label, sub, extra, icon, color, bgColor, onPress }) => (
  <TouchableOpacity
    style={[
      styles.pointCard,
      { backgroundColor: bgColor, borderColor: color + "40" },
    ]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={20} color={color} style={{ marginBottom: 5 }} />
    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>
      {label}
    </Text>
    <Text style={{ fontSize: 12, color: "#666" }}>{sub}</Text>
    {extra && (
      <Text
        style={{ fontSize: 11, color: color, marginTop: 4, fontWeight: "600" }}
      >
        {extra}
      </Text>
    )}
  </TouchableOpacity>
);

const FilterChip = ({ label, active, onPress, color, icon }) => (
  <TouchableOpacity
    style={[
      styles.chip,
      active
        ? { backgroundColor: color, borderColor: color }
        : { backgroundColor: "white", borderColor: "#DDD" },
    ]}
    onPress={onPress}
  >
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={12}
          color={active ? "white" : "#666"}
          style={{ marginRight: 5 }}
        />
      )}
      <Text
        style={[
          styles.chipText,
          active ? { color: "white" } : { color: "#666" },
        ]}
      >
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

const InfoRow = ({ icon, text, color }) => (
  <View
    style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
  >
    <Ionicons
      name={icon}
      size={20}
      color={color || "#666"}
      style={{ marginRight: 10, width: 24 }}
    />
    <Text
      style={[styles.bodyText, color && { color: color, fontWeight: "bold" }]}
    >
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  scrollContainer: { paddingHorizontal: 20 },
  mapWrapper: {
    height: 380,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  map: { width: "100%", height: "100%" },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  legendCard: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  floatingButtons: {
    position: "absolute",
    top: 15,
    right: 15,
    alignItems: "center",
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  markerBase: {
    padding: 3,
    backgroundColor: "white",
    borderRadius: 20,
    elevation: 3,
  },
  markerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  homeMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF5722",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  optimizedTruckMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  truckCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#EEE",
    elevation: 2,
  },
  truckHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  truckIconBg: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  truckTitle: { fontSize: 16, fontWeight: "bold", color: "#0D47A1" },
  truckSubtitle: { fontSize: 13, color: "#666" },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "white",
    marginRight: 4,
  },
  liveText: { color: "white", fontSize: 10, fontWeight: "bold" },
  timeText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  updateText: { fontSize: 12, color: "#999", marginBottom: 15 },
  divider: { height: 1, backgroundColor: "#F0F0F0", width: "100%" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  pointsRow: { flexDirection: "row", justifyContent: "space-between" },
  pointCard: { width: "48%", borderRadius: 12, padding: 15, borderWidth: 1 },
  filterSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "center",
  },
  filterHelperText: { fontSize: 12, color: "#666", fontStyle: "italic" },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 12, fontWeight: "bold" },

  // MODAL PRINCIPAL (Pop-up do Marker)
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  infoPopup: {
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    elevation: 20,
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  popupTitle: { fontSize: 20, fontWeight: "bold", color: "#333", width: "85%" },
  popupText: { fontSize: 15, color: "#555", lineHeight: 22 },
  modalButton: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 25,
  },
  modalButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  bodyText: { fontSize: 15, color: "#444" },

  // NOVO MODAL DE LISTA (Bottom Sheet Style)
  listModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  listModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "60%",
    padding: 20,
  },
  listModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 15,
  },
  listModalTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },

  // Item da Lista
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  listItemIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  listItemTitle: { fontSize: 15, fontWeight: "bold", color: "#333" },
  listItemAddress: { fontSize: 12, color: "#666", marginTop: 2 },
  listItemDistanceBadge: {
    backgroundColor: "#E8F5E9",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  listItemDistanceText: { fontSize: 11, fontWeight: "bold", color: "#2E7D32" },
  listItemButton: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 10,
    marginLeft: 10,
  },
});
