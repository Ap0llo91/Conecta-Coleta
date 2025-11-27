import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

const primaryYellow = "#F0B90B";

export default function ServicesEmpresaScreen({ navigation }) {
  // Componente de Item de Serviço
  const ServiceCard = ({ title, subtitle, icon, color, iconBg, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho Amarelo Dourado */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            {/* Ícone transparente para alinhamento */}
          </TouchableOpacity>

          <View style={styles.headerIconBg}>
            <MaterialCommunityIcons
              name="office-building"
              size={24}
              color="#FFF"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Serviços Empresariais</Text>
            <Text style={styles.headerSubtitle}>
              Soluções especializadas para empresas
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            marginBottom: 15,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={{ marginLeft: 5, fontWeight: "bold", color: "#333" }}>
            Voltar
          </Text>
        </TouchableOpacity>

        {/* Card 1: Resíduos de Saúde -> Navega para o Formulário */}
        <ServiceCard
          title="Coleta de Resíduos de Saúde"
          subtitle="Para clínicas, hospitais e farmácias"
          icon="biohazard"
          color="#D32F2F" // Vermelho forte
          iconBg="#FFEBEE" // Vermelho claro
          onPress={() => navigation.navigate("RequestHealthService")}
        />

        {/* Card 2: Óleo de Cozinha -> Navega para o Formulário de Óleo */}
        <ServiceCard
          title="Coleta de Óleos e Gorduras"
          subtitle="Para restaurantes e cozinhas industriais"
          icon="water-outline" // Gota
          color="#F57C00" // Laranja
          iconBg="#FFF3E0" // Laranja claro
          onPress={() => navigation.navigate("RequestOilService")}
        />

        {/* REMOVIDO: Card de Grande Volume (Agora exclusivo da Home) */}

        {/* Painel de Informações */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Informações para Empresas</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Serviços especializados e regulamentados
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Certificados de destinação final fornecidos
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>Suporte técnico especializado</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Prazo de atendimento: 24-48h úteis
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    backgroundColor: "#E69138", // Amarelo mais escuro/dourado
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconBg: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },

  content: { flex: 1 },

  // Cards
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: { flex: 1, marginRight: 10 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#666",
  },

  // Info Box
  infoBox: {
    backgroundColor: "#FFFDE7", // Creme bem clarinho
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#5D4037", // Marrom
    marginBottom: 10,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    color: "#8D6E63",
    marginRight: 8,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 13,
    color: "#5D4037",
    flex: 1,
    lineHeight: 18,
  },
});
