import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";
import { useFocusEffect } from "@react-navigation/native";

const HistoryScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chamados")
        .select("*")
        .eq("usuario_id", user.id)
        .order("data_criacao", { ascending: false });

      if (error) {
        console.log("Erro:", error.message);
      } else {
        setReports(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--/--/----";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    const st = status ? status.toUpperCase() : "PENDENTE";
    switch (st) {
      case "RESOLVIDO":
      case "CONCLUÍDO":
      case "FINALIZADO":
        return { bg: "#2ECC71", text: "Finalizado", color: "white" };
      case "CANCELADO":
        return { bg: "#EEE", text: "Cancelado", color: "#666" };
      default:
        return { bg: "#E6F2FF", text: "Em análise", color: "#0056b3" };
    }
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);

    const serviceName = item.tipo_problema || "Solicitação";
    const rawDesc = item.descricao || "Sem detalhes";
    const previewDesc =
      rawDesc.replace(/\n/g, " ").substring(0, 60) +
      (rawDesc.length > 60 ? "..." : "");

    const idDisplay = item.chamado_id
      ? item.chamado_id.substring(0, 4).toUpperCase()
      : "---";

    let iconName = "clock-time-four-outline";
    if (serviceName.toLowerCase().includes("caçamba")) iconName = "dump-truck";
    else if (serviceName.toLowerCase().includes("lixo")) iconName = "trash-can";
    else if (serviceName.toLowerCase().includes("ecoponto"))
      iconName = "recycle";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("RequestDetails", { report: item })}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={iconName} size={24} color="#007BFF" />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.serviceTitle}>{serviceName}</Text>
              <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.badgeText, { color: statusStyle.color }]}>
                  {statusStyle.text}
                </Text>
              </View>
            </View>

            <Text style={styles.addressText}>{previewDesc}</Text>

            <Text style={styles.metaText}>
              ID: #{idDisplay} • {formatDate(item.data_criacao)}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#CCC"
            style={{ alignSelf: "center" }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Reportes</Text>
      </View>
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>
          {reports.length} solicitações encontradas
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item, i) =>
            item.chamado_id ? item.chamado_id.toString() : i.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={60}
                color="#DDD"
              />
              <Text style={styles.emptyText}>
                Nenhuma solicitação encontrada.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  subHeader: { padding: 20, paddingBottom: 10 },
  subHeaderText: { fontSize: 14, color: "#666" },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#EEE",
    elevation: 2,
  },
  cardContent: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: { flex: 1, marginRight: 10 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  serviceTitle: { fontSize: 15, fontWeight: "bold", color: "#333", flex: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: { fontSize: 10, fontWeight: "bold" },
  addressText: { fontSize: 13, color: "#555", marginBottom: 6, lineHeight: 18 },
  metaText: { fontSize: 11, color: "#999" },
  emptyState: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 10, color: "#999", fontSize: 16 },
});

export default HistoryScreen;
