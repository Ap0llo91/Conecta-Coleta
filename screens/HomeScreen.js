import React, { useState, useEffect, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

// --- CONFIGURAÇÃO DA SIMULAÇÃO ---
const CYCLE_MINUTES = 20; // O caminhão leva 20 min para chegar
const MAX_DISTANCE_KM = 10.0; // Começa a 10km de distância

const ECOPONTOS = [
  { title: "Ecoponto Boa Viagem", latitude: -8.1275, longitude: -34.902 },
  { title: "Ecoponto Torre", latitude: -8.052, longitude: -34.91 },
  { title: "Ecoponto Casa Forte", latitude: -8.037, longitude: -34.919 },
  { title: "Ecoponto Ibura", latitude: -8.13, longitude: -34.94 },
];

const DICAS = [
  "Lave as embalagens recicláveis antes de descartar. Isso facilita o processo de reciclagem e evita mau cheiro!",
  "Amasse as latas de alumínio e garrafas PET para ocupar menos espaço na lixeira e facilitar o transporte.",
  "Separe o óleo de cozinha usado em uma garrafa PET e leve a um ponto de coleta. Nunca jogue na pia!",
  "Papéis engordurados (como caixas de pizza) não são recicláveis. Descarte no lixo comum (orgânico).",
  "Pilhas e baterias contêm metais pesados. Descarte apenas em pontos de coleta específicos, nunca no lixo comum.",
  "Vidros quebrados devem ser embrulhados em jornal ou caixa de leite para proteger os coletores de acidentes.",
  "Remova as tampas das garrafas antes de amassar, mas descarte-as junto para reciclagem também!",
];

// --- COMPONENTES ---

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
      <View style={{ alignItems: "center", marginVertical: 10 }}>
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
          {minutes <= 5
            ? "O caminhão está muito perto!"
            : "O caminhão está a caminho"}
        </Text>
        <Text style={styles.etaStatusSubtitle}>
          {minutes <= 5
            ? "Deixe seu lixo na calçada agora."
            : "Prepare seu lixo para coleta."}
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
  const getDailyTip = () => {
    const today = new Date();
    const dayIndex = today.getDay();
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
        <Text style={styles.dicaSubtitle}>{dicaDoDia}</Text>
      </View>
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState("Visitante");
  const [loading, setLoading] = useState(true);
  const [nearestEcopoint, setNearestEcopoint] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [userAddress, setUserAddress] = useState("Carregando localização...");
  const [etaMinutes, setEtaMinutes] = useState(15);

  // Coordenadas do usuário (baseadas no endereço cadastrado)
  const [userCoords, setUserCoords] = useState({
    latitude: -8.0476,
    longitude: -34.877,
  });

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

  // --- LÓGICA DE SIMULAÇÃO BASEADA NO TEMPO ---
  // Calcula a distância "virtual" do caminhão até a casa
  // Ciclo: 100% da distância -> 0% da distância (Chegada)
  const getSimulatedDistanceKm = () => {
    const CYCLE_MS = CYCLE_MINUTES * 60 * 1000;
    const now = Date.now();

    // Progresso de 0.0 a 1.0 dentro do ciclo
    const rawProgress = (now % CYCLE_MS) / CYCLE_MS;

    // Inverte: Começa em 1.0 (Longe) e vai até 0.0 (Chegou)
    // Para parecer que está vindo
    const progressInv = 1.0 - rawProgress;

    return progressInv * MAX_DISTANCE_KM;
  };

  // Atualiza ETA periodicamente
  useEffect(() => {
    const updateEta = () => {
      const distKm = getSimulatedDistanceKm();

      // Velocidade média simulada: 30 km/h = 0.5 km/min
      const speedKmH = 30;
      const timeHours = distKm / speedKmH;

      // Adicionamos um pequeno "buffer" para não ficar zerado muito tempo
      let timeMinutes = Math.ceil(timeHours * 60);

      // Se estiver no finalzinho do ciclo (último minuto), mostra "CHEGANDO"
      if (timeMinutes < 1) timeMinutes = 0;

      setEtaMinutes(timeMinutes);
    };

    updateEta();
    const interval = setInterval(updateEta, 5000); // Atualiza a cada 5s
    return () => clearInterval(interval);
  }, []);

  // Carregar dados do usuário (Nome e Endereço do Banco)
  useEffect(() => {
    const initData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 1. Pega Nome
        const { data: profile } = await supabase
          .from("usuarios")
          .select("nome_razao_social")
          .eq("usuario_id", user.id)
          .single();
        if (profile) setUserName(profile.nome_razao_social);

        // 2. Pega Endereço do Banco (Prioridade Total)
        const { data: addressData } = await supabase
          .from("enderecos")
          .select("*")
          .eq("usuario_id", user.id)
          .eq("is_padrao", true)
          .maybeSingle();

        if (addressData) {
          const fullAddr = `${addressData.rua}, ${addressData.numero} - ${addressData.bairro}`;
          setUserAddress(fullAddr);

          // Geocodifica o endereço do banco para coordenadas
          try {
            const searchStr = `${addressData.rua}, ${addressData.numero}, ${addressData.bairro}, Recife`;
            const geocoded = await Location.geocodeAsync(searchStr);

            if (geocoded && geocoded.length > 0) {
              setUserCoords({
                latitude: geocoded[0].latitude,
                longitude: geocoded[0].longitude,
              });
            }
          } catch (e) {
            console.log("Erro no geocoding:", e);
          }
        } else {
          setUserAddress("Endereço não cadastrado");
          // Se não tiver endereço, tenta pegar GPS como fallback silencioso
          try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
              let location = await Location.getCurrentPositionAsync({});
              setUserCoords(location.coords);
            }
          } catch (e) {}
        }
      }

      setLoading(false);
      setLoadingLocation(false);
    };

    initData();
  }, []);

  // Recalcula Ecoponto mais próximo quando as coordenadas do usuário mudam
  useEffect(() => {
    if (!userCoords) return;

    let minDistance = Infinity;
    let closest = null;

    ECOPONTOS.forEach((point) => {
      const dist = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        point.latitude,
        point.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        closest = { ...point, distance: dist };
      }
    });
    setNearestEcopoint(closest);
  }, [userCoords]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
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
            <Text style={styles.locationText} numberOfLines={1}>
              {" "}
              {userAddress}
            </Text>
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
  container: { flex: 1, backgroundColor: "#F0F2F5" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  header: { marginTop: 10, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#333" },
  locationText: { fontSize: 14, color: "#666", flex: 1 },

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
  etaHeaderText: { color: "#fff", fontSize: 14, marginLeft: 10 },
  etaTitle: { color: "#fff", fontSize: 16, opacity: 0.8, marginTop: 15 },
  etaTime: {
    color: "#fff",
    fontSize: 100,
    fontWeight: "bold",
    lineHeight: 120,
  },
  etaTimeSmall: {
    color: "#fff",
    fontSize: 42,
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
  etaStatusTitle: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  etaStatusSubtitle: { color: "#fff", fontSize: 12, opacity: 0.9 },
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
  infoTextContainer: { flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  infoSubtitle: { fontSize: 14, color: "#666" },

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
  dicaIcon: { marginRight: 15, marginTop: 3 },
  dicaTitle: { fontSize: 16, fontWeight: "bold", color: "#2E8B57" },
  dicaSubtitle: { fontSize: 14, color: "#333", flexWrap: "wrap" },
});
