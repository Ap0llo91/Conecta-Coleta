import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const RequestDetailsScreen = ({ navigation, route }) => {
  const { report } = route.params;

  // Tenta pegar o ID correto (seja 'chamado_id' ou 'id')
  const reportId = report.chamado_id || report.id;
  const displayId = reportId
    ? reportId.toString().substring(0, 4).toUpperCase()
    : "---";

  // Lógica visual do Status
  const getStatusInfo = (status) => {
    switch (status) {
      case "RESOLVIDO":
      case "CONCLUIDO":
        return {
          label: "Resolvido",
          color: "#FFF",
          bg: "#2ECC71",
          icon: "checkmark-circle",
        };
      case "CANCELADO":
        return {
          label: "Cancelado",
          color: "#FFF",
          bg: "#999",
          icon: "close-circle",
        };
      case "EM_ANDAMENTO":
        return {
          label: "Em Andamento",
          color: "#FFF",
          bg: "#007BFF",
          icon: "construct",
        };
      default:
        return {
          label: "Em Análise",
          color: "#333",
          bg: "#FFC107",
          icon: "time",
        };
    }
  };

  const statusInfo = getStatusInfo(report.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Pedido</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Banner de Status */}
        <View style={[styles.statusBanner, { backgroundColor: statusInfo.bg }]}>
          <Ionicons name={statusInfo.icon} size={32} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>

        {/* Informações Principais */}
        <View style={styles.card}>
          <Text style={styles.label}>Tipo de Serviço</Text>
          <Text style={styles.value}>
            {report.chamadotipos?.nome_servico || "Serviço Geral"}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.label}>Descrição do Problema</Text>
          <Text style={styles.value}>
            {report.descricao_usuario || "Sem descrição informada."}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.label}>Data da Solicitação</Text>
          <Text style={styles.value}>
            {new Date(report.data_criacao).toLocaleDateString("pt-BR")} às{" "}
            {new Date(report.data_criacao).toLocaleTimeString("pt-BR")}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.label}>ID do Protocolo</Text>
          <Text style={styles.value}>#{displayId}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },

  content: { padding: 20 },

  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statusText: { fontSize: 22, fontWeight: "bold", marginLeft: 10 },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  label: { fontSize: 14, color: "#888", marginBottom: 5 },
  value: { fontSize: 16, color: "#333", fontWeight: "500", marginBottom: 5 },
  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 15 },
});

export default RequestDetailsScreen;
