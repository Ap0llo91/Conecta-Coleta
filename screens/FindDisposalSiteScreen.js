import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

const FindDisposalSiteScreen = ({ navigation }) => {
  // Função para navegar para a lista de Ecopontos com filtro
  const goToEcopoints = (filterType) => {
    navigation.navigate("Ecopoints", { filter: filterType });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho Verde Escuro */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Encontrar Local de Descarte</Text>
        <Text style={styles.headerSubtitle}>
          Ecopontos, reciclagem e pontos de coleta próximos
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. Card Mapa Geral (Sem Filtro) */}
        <TouchableOpacity
          style={styles.mapCard}
          onPress={() => goToEcopoints(null)}
        >
          <View style={styles.mapIconContainer}>
            <Ionicons name="map" size={28} color="#00897B" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Ver Mapa Completo</Text>
            <Text style={styles.cardSubtitle}>
              Todos os Ecopontos e locais de reciclagem
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#CCC" />
        </TouchableOpacity>

        {/* 2. Grid de Tipos de Resíduos */}
        <Text style={styles.sectionTitle}>O que você deseja descartar?</Text>
        <View style={styles.gridContainer}>
          {/* Materiais Recicláveis Gerais */}
          <GridItem
            label="Recicláveis Gerais"
            subLabel="(Papel, Plástico, Metal, Vidro)"
            icon="recycle"
            iconLib={MaterialCommunityIcons}
            color="#2ECC71"
            onPress={() => goToEcopoints("Recicláveis")}
          />

          {/* Resíduos Especiais */}
          <GridItem
            label="Pilhas e Baterias"
            icon="battery-charging"
            iconLib={MaterialCommunityIcons}
            color="#F57C00"
            onPress={() => goToEcopoints("Pilhas")}
          />

          <GridItem
            label="Eletrônicos"
            icon="laptop"
            iconLib={MaterialCommunityIcons}
            color="#5C6BC0"
            onPress={() => goToEcopoints("Eletrônicos")}
          />

          {/* Resíduos Volumosos e Obras (EcoEstações) */}
          <GridItem
            label="Entulho e Metralha"
            icon="dump-truck"
            iconLib={MaterialCommunityIcons}
            color="#795548"
            onPress={() => goToEcopoints("Entulho")}
          />

          <GridItem
            label="Móveis Velhos"
            icon="sofa"
            iconLib={MaterialCommunityIcons}
            color="#8D6E63"
            onPress={() => goToEcopoints("Móveis")}
          />

          <GridItem
            label="Podas e Madeira"
            icon="tree"
            iconLib={MaterialCommunityIcons}
            color="#388E3C"
            onPress={() => goToEcopoints("Poda")}
          />
        </View>

        {/* 3. Card Informativo */}
        <TouchableOpacity
          style={styles.benefitsCard}
          onPress={() => navigation.navigate("RecyclingBenefits")}
        >
          <Text style={styles.benefitsTitle}>Por que separar seu lixo?</Text>
          <BenefitItem
            text="Evita multas por descarte irregular"
            icon="alert-circle-outline"
            iconLib={Ionicons}
            color="#D32F2F"
          />
          <BenefitItem
            text="Gera renda para catadores"
            icon="people-outline"
            iconLib={Ionicons}
          />
          <BenefitItem
            text="Preserva o meio ambiente"
            icon="leaf-outline"
            iconLib={Ionicons}
          />
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- COMPONENTES AUXILIARES ---

const GridItem = ({
  label,
  subLabel,
  icon,
  iconLib: IconLib,
  color,
  onPress,
}) => (
  <TouchableOpacity style={styles.gridItem} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color + "20" }]}>
      <IconLib name={icon} size={32} color={color} />
    </View>
    <Text style={styles.gridLabel}>{label}</Text>
    {subLabel && <Text style={styles.gridSubLabel}>{subLabel}</Text>}
  </TouchableOpacity>
);

const BenefitItem = ({
  text,
  icon,
  iconLib: IconLib = Ionicons,
  color = "#2E7D32",
}) => (
  <View style={styles.benefitRow}>
    <IconLib name={icon} size={18} color={color} style={{ marginRight: 8 }} />
    <Text
      style={[
        styles.benefitText,
        { color: color === "#D32F2F" ? color : "#1B5E20" },
      ]}
    >
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    backgroundColor: "#00897B",
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  backText: { color: "white", fontSize: 16, marginLeft: 5, fontWeight: "500" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "white" },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 5,
  },

  content: { padding: 20 },

  // Card Mapa
  mapCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#E0F2F1",
  },
  mapIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  cardSubtitle: { fontSize: 13, color: "#666", marginTop: 2 },

  // Grid
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  gridLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
  gridSubLabel: {
    fontSize: 11,
    color: "#888",
    textAlign: "center",
    marginTop: 2,
  },

  // Benefícios
  benefitsCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 15,
  },
  benefitRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  benefitText: { fontSize: 14, fontWeight: "500" },
});

export default FindDisposalSiteScreen;
