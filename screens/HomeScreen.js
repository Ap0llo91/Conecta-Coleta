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
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../utils/supabaseClient";
import * as Location from "expo-location"; // Importando Location

// --- DADOS DOS ECOPONTOS (Mesmos do Mapa) ---
const ECOPONTOS = [
  { title: "Ecoponto Boa Viagem", latitude: -8.1275, longitude: -34.902 },
  { title: "Ecoponto Torre", latitude: -8.052, longitude: -34.91 },
  { title: "Ecoponto Casa Forte", latitude: -8.037, longitude: -34.919 },
  { title: "Ecoponto Ibura", latitude: -8.13, longitude: -34.94 },
];

// --- Componentes de Cards ---

const EtaCard = ({ onPress }) => (
  <View style={styles.etaCard}>
    <View style={styles.etaHeader}>
      <MaterialCommunityIcons
        name="truck-delivery-outline"
        size={24}
        color="#fff"
      />
      <Text style={styles.etaHeaderText}>Coleta Comum</Text>
    </View>
    <Text style={styles.etaTitle}>Previsão de Chegada</Text>
    <Text style={styles.etaTime}>8</Text>
    <Text style={styles.etaMinutes}>MINUTOS</Text>
    <View style={styles.etaStatus}>
      <Ionicons name="time-outline" size={20} color="#fff" />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.etaStatusTitle}>O caminhão está chegando!</Text>
        <Text style={styles.etaStatusSubtitle}>
          Deixe seu lixo na calçada agora
        </Text>
      </View>
    </View>

    <TouchableOpacity style={styles.mapButton} onPress={onPress}>
      <Ionicons name="location-outline" size={20} color="#007BFF" />
      <Text style={styles.mapButtonText}>Ver Caminhão no Mapa</Text>
    </TouchableOpacity>
  </View>
);

const InfoCard = ({
  icon,
  iconBgColor,
  title,
  subtitle,
  onPress,
  isLoading,
}) => (
  <TouchableOpacity style={styles.infoCard} onPress={onPress}>
    <View style={[styles.infoIconContainer, { backgroundColor: iconBgColor }]}>
      {icon}
    </View>
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoTitle}>{title}</Text>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color="#666"
          style={{ alignSelf: "flex-start" }}
        />
      ) : (
        <Text style={styles.infoSubtitle}>{subtitle}</Text>
      )}
    </View>
    <Ionicons name="chevron-forward" size={24} color="#ccc" />
  </TouchableOpacity>
);

const DicaCard = () => (
  <View style={styles.dicaCard}>
    <Ionicons
      name="bulb-outline"
      size={24}
      color="#2E8B57"
      style={styles.dicaIcon}
    />
    <View style={styles.infoTextContainer}>
      <Text style={styles.dicaTitle}>Dica do Dia</Text>
      <Text style={styles.dicaSubtitle}>
        Lave as embalagens recicláveis antes de descartar. Isso facilita o
        processo de reciclagem!
      </Text>
    </View>
  </View>
);

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState("Visitante");
  const [loading, setLoading] = useState(true);

  // Estados para o Ecoponto Próximo
  const [nearestEcopoint, setNearestEcopoint] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [userAddress, setUserAddress] = useState("Carregando localização...");

  const handleOpenMap = () => {
    navigation.navigate("MapScreen");
  };

  // Função Matemática de Distância (Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
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

  useEffect(() => {
    const initData = async () => {
      // 1. Buscar Usuário do Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("usuarios")
          .select("nome_razao_social")
          .eq("usuario_id", user.id)
          .single();
        if (profile) setUserName(profile.nome_razao_social);
      }
      setLoading(false);

      // 2. Buscar Localização e Calcular Ecoponto
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setUserAddress("Permissão de localização negada");
          setLoadingLocation(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});

        // Pega o endereço legível (Rua)
        let geocode = await Location.reverseGeocodeAsync(location.coords);
        if (geocode.length > 0) {
          setUserAddress(
            `${geocode[0].street}, ${
              geocode[0].district || geocode[0].subregion
            }`
          );
        }

        // Calcula o mais próximo
        let minDistance = Infinity;
        let closest = null;

        ECOPONTOS.forEach((point) => {
          const dist = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            point.latitude,
            point.longitude
          );
          if (dist < minDistance) {
            minDistance = dist;
            closest = { ...point, distance: dist };
          }
        });

        setNearestEcopoint(closest);
      } catch (error) {
        console.log("Erro ao obter localização:", error);
        setUserAddress("Localização indisponível");
      } finally {
        setLoadingLocation(false);
      }
    };

    initData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Olá, {userName}! 👋</Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}
          >
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.locationText}> {userAddress}</Text>
          </View>
        </View>

        {/* Card Principal de ETA */}
        <EtaCard onPress={handleOpenMap} />

        {/* Seção de Informações Rápidas */}
        <Text style={styles.sectionTitle}>Informações Rápidas</Text>

        <InfoCard
          icon={<FontAwesome name="check" size={20} color="#28a745" />}
          iconBgColor="#e0f8e6"
          title="Coleta Seletiva"
          subtitle="Às quartas-feiras"
          onPress={() => navigation.navigate("HowItWorks")}
        />

        {/* Card Inteligente de Ecoponto */}
        <InfoCard
          icon={<Ionicons name="location-sharp" size={20} color="#8A2BE2" />}
          iconBgColor="#f0e6ff"
          title={
            nearestEcopoint ? nearestEcopoint.title : "Ecoponto Mais Próximo"
          }
          subtitle={
            nearestEcopoint
              ? `A ${nearestEcopoint.distance.toFixed(1)} km de você`
              : "Localizando..."
          }
          isLoading={loadingLocation}
          onPress={() => navigation.navigate("Ecopoints")} // Vai para a lista detalhada
        />

        {/* Card de Dica */}
        <DicaCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  locationText: {
    fontSize: 14,
    color: "#666",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  // Card Azul
  etaCard: {
    backgroundColor: "#007BFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  etaHeader: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    opacity: 0.8,
  },
  etaHeaderText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 10,
  },
  etaTitle: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.8,
    marginTop: 15,
  },
  etaTime: {
    color: "#fff",
    fontSize: 100,
    fontWeight: "bold",
    lineHeight: 120,
  },
  etaMinutes: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
    marginTop: -15,
  },
  etaStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    width: "100%",
  },
  etaStatusTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  etaStatusSubtitle: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.9,
  },
  mapButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    elevation: 3,
  },
  mapButtonText: {
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  // Cards Brancos
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 30,
    marginBottom: 15,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
  },
  infoIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  infoSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  // Card de Dica
  dicaCard: {
    flexDirection: "row",
    backgroundColor: "#f0fff8",
    borderRadius: 15,
    padding: 15,
    alignItems: "flex-start",
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#2E8B57",
  },
  dicaIcon: {
    marginRight: 15,
    marginTop: 3,
  },
  dicaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E8B57",
  },
  dicaSubtitle: {
    fontSize: 14,
    color: "#333",
    flexWrap: "wrap",
  },
});
