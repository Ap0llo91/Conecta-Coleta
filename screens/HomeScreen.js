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
import * as Location from "expo-location";

// --- DADOS DOS ECOPONTOS ---
const ECOPONTOS = [
  { title: "Ecoponto Boa Viagem", latitude: -8.1275, longitude: -34.902 },
  { title: "Ecoponto Torre", latitude: -8.052, longitude: -34.91 },
  { title: "Ecoponto Casa Forte", latitude: -8.037, longitude: -34.919 },
  { title: "Ecoponto Ibura", latitude: -8.13, longitude: -34.94 },
];

// --- LISTA DE DICAS (7 DICAS) ---
const DICAS = [
  "Lave as embalagens recicláveis antes de descartar. Isso facilita o processo de reciclagem e evita mau cheiro!",
  "Amasse as latas de alumínio e garrafas PET para ocupar menos espaço na lixeira e facilitar o transporte.",
  "Separe o óleo de cozinha usado em uma garrafa PET e leve a um ponto de coleta. Nunca jogue na pia!",
  "Papéis engordurados (como caixas de pizza) não são recicláveis. Descarte no lixo comum (orgânico).",
  "Pilhas e baterias contêm metais pesados. Descarte apenas em pontos de coleta específicos, nunca no lixo comum.",
  "Vidros quebrados devem ser embrulhados em jornal ou caixa de leite para proteger os coletores de acidentes.",
  "Remova as tampas das garrafas antes de amassar, mas descarte-as junto para reciclagem também!"
];

// --- Componentes de Cards ---

const EtaCard = ({ minutes, onPress }) => (
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
    
    {minutes <= 1 ? (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Text style={styles.etaTimeSmall}>CHEGANDO</Text>
            <Text style={styles.etaMinutes}>AGORA</Text>
        </View>
    ) : (
        <>
            <Text style={styles.etaTime}>{minutes}</Text>
            <Text style={styles.etaMinutes}>MINUTOS</Text>
        </>
    )}

    <View style={styles.etaStatus}>
      <Ionicons name="time-outline" size={20} color="#fff" />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={styles.etaStatusTitle}>
            {minutes <= 5 ? "O caminhão está muito perto!" : "O caminhão está a caminho"}
        </Text>
        <Text style={styles.etaStatusSubtitle}>
          {minutes <= 5 ? "Deixe seu lixo na calçada agora." : "Prepare seu lixo para coleta."}
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

const DicaCard = () => {
  // Lógica para selecionar a dica baseada no dia do ano
  const getDailyTip = () => {
    const today = new Date();
    // Um jeito simples de pegar um índice único para cada dia:
    // Soma dia + mês + ano (para variar sempre)
    // Ou usa getDay() para repetir semanalmente (0-6)
    const dayIndex = today.getDay(); // 0 (Domingo) a 6 (Sábado)
    
    return DICAS[dayIndex];
  };

  const dicaDoDia = getDailyTip();

  return (
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
          {dicaDoDia}
        </Text>
      </View>
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState("Visitante");
  const [loading, setLoading] = useState(true);

  // Estados para localização e ETA
  const [nearestEcopoint, setNearestEcopoint] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [userAddress, setUserAddress] = useState("Carregando localização...");
  const [etaMinutes, setEtaMinutes] = useState(12);

  const handleOpenMap = () => {
    navigation.navigate("MapScreen");
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
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

  const calculateEta = (userLat, userLon) => {
      const truckLat = userLat + 0.02; 
      const truckLon = userLon + 0.02;
      const distKm = calculateDistance(userLat, userLon, truckLat, truckLon);
      const speedKmH = 15; 
      const timeHours = distKm / speedKmH;
      const timeMinutes = Math.round(timeHours * 60);
      return timeMinutes < 2 ? 2 : timeMinutes; 
  };

  useEffect(() => {
    const initData = async () => {
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

      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setUserAddress("Localização não permitida");
          setLoadingLocation(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        
        const realEta = calculateEta(location.coords.latitude, location.coords.longitude);
        setEtaMinutes(realEta);

        let geocode = await Location.reverseGeocodeAsync(location.coords);
        if (geocode.length > 0) {
          setUserAddress(
            `${geocode[0].street}, ${
              geocode[0].district || geocode[0].subregion
            }`
          );
        }

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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Olá, {userName}! 👋</Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}
          >
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.locationText}> {userAddress}</Text>
          </View>
        </View>

        <EtaCard minutes={etaMinutes} onPress={handleOpenMap} />

        <Text style={styles.sectionTitle}>Informações Rápidas</Text>

        <InfoCard
          icon={<FontAwesome name="check" size={20} color="#28a745" />}
          iconBgColor="#e0f8e6"
          title="Coleta Seletiva"
          subtitle="Às quartas-feiras"
          onPress={() => navigation.navigate("HowItWorks")}
        />

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
          onPress={() => navigation.navigate("Ecopoints")}
        />

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
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
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
  etaTimeSmall: { 
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
    marginTop: 10,
  },
  etaMinutes: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
    marginTop: -15,
    marginBottom: 5,
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