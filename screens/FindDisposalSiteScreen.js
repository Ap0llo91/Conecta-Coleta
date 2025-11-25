import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

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
        {/* 1. Card Mapa de Ecopontos (Atalho Principal - Sem Filtro) */}
        <TouchableOpacity
          style={styles.mapCard}
          onPress={() => goToEcopoints(null)}
        >
          <View style={styles.mapIconContainer}>
            <Ionicons name="location-outline" size={28} color="#2ECC71" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Mapa de Ecopontos</Text>
            <Text style={styles.cardSubtitle}>
              Ver todos os pontos de coleta
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#CCC" />
        </TouchableOpacity>

        {/* 2. Grid de Tipos de Resíduos */}
        <Text style={styles.sectionTitle}>Tipos de Resíduos</Text>
        <View style={styles.gridContainer}>
          <GridItem
            label="Pilhas e Baterias"
            icon="battery-charging"
            iconLib={MaterialCommunityIcons}
            color="#E53935"
            onPress={() => goToEcopoints("Pilhas")}
          />
          <GridItem
            label="Eletrônicos"
            icon="cellphone"
            iconLib={MaterialCommunityIcons}
            color="#F57C00"
            onPress={() => goToEcopoints("Eletrônicos")}
          />
          <GridItem
            label="Lâmpadas"
            icon="lightbulb-on-outline"
            iconLib={MaterialCommunityIcons}
            color="#FBC02D"
            onPress={() => goToEcopoints("Lâmpadas")}
          />
          <GridItem
            label="Óleo de Cozinha"
            icon="water-outline"
            iconLib={Ionicons}
            color="#FFA000"
            onPress={() => goToEcopoints("Óleo")}
          />
          <GridItem
            label="Recicláveis"
            icon="recycle"
            iconLib={MaterialCommunityIcons}
            color="#2ECC71"
            onPress={() => goToEcopoints("Recicláveis")}
          />
          <GridItem
            label="Orgânicos"
            icon="leaf-outline"
            iconLib={Ionicons}
            color="#2E7D32"
            onPress={() => goToEcopoints("Orgânicos")}
          />
        </View>

        {/* 3. Card Benefícios */}
        <TouchableOpacity
          style={styles.benefitsCard}
          onPress={() => navigation.navigate("RecyclingBenefits")}
        >
          <Text style={styles.benefitsTitle}>Benefícios da Reciclagem</Text>
          <BenefitItem text="Reduz a poluição ambiental" icon="leaf" />

          {/* CORREÇÃO AQUI: Agora passamos iconLib={MaterialCommunityIcons} para a árvore funcionar */}
          <BenefitItem
            text="Economiza recursos naturais"
            icon="tree"
            iconLib={MaterialCommunityIcons}
          />

          <BenefitItem text="Gera economia de energia" icon="flash" />
          <BenefitItem text="Cria empregos e renda" icon="briefcase" />
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Componentes Auxiliares

const GridItem = ({ label, icon, iconLib: IconLib, color, onPress }) => (
  <TouchableOpacity style={styles.gridItem} onPress={onPress}>
    <IconLib name={icon} size={32} color={color} style={{ marginBottom: 10 }} />
    <Text style={styles.gridLabel}>{label}</Text>
  </TouchableOpacity>
);

// CORREÇÃO NO COMPONENTE: Adicionei "iconLib" com valor padrão "Ionicons"
const BenefitItem = ({ text, icon, iconLib: IconLib = Ionicons }) => (
  <View style={styles.benefitRow}>
    <IconLib name={icon} size={16} color="#2E7D32" style={{ marginRight: 8 }} />
    <Text style={styles.benefitText}>{text}</Text>
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
  },
  mapIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E9",
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
    paddingVertical: 25,
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
  gridLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
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
  benefitText: { fontSize: 14, color: "#1B5E20" },
});

export default FindDisposalSiteScreen;
