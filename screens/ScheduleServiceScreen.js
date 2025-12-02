import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const ScheduleServiceScreen = ({ navigation }) => {
  const ServiceOption = ({ title, subtitle, icon, iconColor, onPress }) => (
    <TouchableOpacity style={styles.optionButton} onPress={onPress}>
      <View
        style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}
      >
        <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Agendar um Serviço</Text>
        <Text style={styles.headerSubtitle}>
          Escolha o tipo de coleta que você precisa
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* BOTÃO 1: CAÇAMBA */}
        <ServiceOption
          title="Solicitar Caçamba"
          subtitle="Para entulho e grande volume"
          icon="trash-can-outline"
          iconColor="#FF9500"
          onPress={() => navigation.navigate("RequestDumpster")}
        />

        {/* BOTÃO 2: CATA-TRECO */}
        <ServiceOption
          title="Cata-Treco"
          subtitle="Coleta de móveis e eletrodomésticos"
          icon="sofa-outline"
          iconColor="#7B68EE"
          onPress={() => navigation.navigate("RequestCataTreco")}
        />

        {/* BOTÃO 3: LIXO NÃO COLETADO */}
        <ServiceOption
          title="Lixo Não Coletado"
          subtitle="Solicitar retirada urgente"
          icon="truck-outline"
          iconColor="#FF3B30"
          onPress={() => navigation.navigate("RequestUncollected")}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Informações Importantes</Text>
          <View style={styles.infoRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              As solicitações serão analisadas pela Emlurb
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Você receberá uma notificação com o status
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Prazo médio de atendimento: 48-72h úteis
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    backgroundColor: "#0055A5",
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backText: {
    color: "white",
    fontSize: 16,
    marginLeft: 5,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  infoBox: {
    backgroundColor: "#EDF4FF",
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#D1E3FF",
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0055A5",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "flex-start",
  },
  bullet: {
    color: "#0055A5",
    fontSize: 16,
    marginRight: 8,
    lineHeight: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
  },
});

export default ScheduleServiceScreen;
