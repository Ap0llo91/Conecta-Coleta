import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";
import { useFocusEffect } from "@react-navigation/native";

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("usuario_id", user.id)
        .order("data_criacao", { ascending: false });

      if (!error) setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handlePress = async (id, currentStatus) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
    if (!currentStatus) {
      await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
    }
  };

  // --- FUNÇÃO PARA LIMPAR TUDO ---
  const handleClearAll = () => {
    if (notifications.length === 0) return;

    Alert.alert(
      "Limpar Notificações",
      "Tem certeza que deseja apagar todas as notificações? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar Tudo",
          style: "destructive",
          onPress: async () => {
            // 1. Limpa visualmente
            setNotifications([]);

            // 2. Apaga do banco
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) {
              await supabase
                .from("notificacoes")
                .delete()
                .eq("usuario_id", user.id);
            }
          },
        },
      ]
    );
  };

  const getIconStyle = (type) => {
    switch (type) {
      case "truck":
        return {
          icon: "truck-delivery-outline",
          lib: MaterialCommunityIcons,
          color: "#007BFF",
          bg: "#E3F2FD",
        };
      case "info":
        return {
          icon: "information-variant",
          lib: MaterialCommunityIcons,
          color: "#007BFF",
          bg: "#E3F2FD",
        };
      case "success":
        return {
          icon: "check-circle-outline",
          lib: MaterialCommunityIcons,
          color: "#2ECC71",
          bg: "#E8F5E9",
        };
      case "warning":
        return {
          icon: "alert-circle-outline",
          lib: MaterialCommunityIcons,
          color: "#E65100",
          bg: "#FFF3E0",
        };
      case "tip":
        return {
          icon: "lightbulb-on-outline",
          lib: MaterialCommunityIcons,
          color: "#FBC02D",
          bg: "#FFF9C4",
        };
      default:
        return {
          icon: "bell-outline",
          lib: MaterialCommunityIcons,
          color: "#555",
          bg: "#EEE",
        };
    }
  };

  const renderItem = ({ item }) => {
    const style = getIconStyle(item.tipo);
    const IconLib = style.lib;
    const date = new Date(item.data_criacao).toLocaleDateString("pt-BR");

    return (
      <TouchableOpacity
        style={[styles.card, !item.lida && styles.unreadCard]}
        onPress={() => handlePress(item.id, item.lida)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: style.bg }]}>
          <IconLib name={style.icon} size={24} color={style.color} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, !item.lida && styles.boldTitle]}>
            {item.titulo}
          </Text>

          {/* CORREÇÃO AQUI: Mudamos de item.description para item.descricao */}
          <Text style={styles.description}>{item.descricao}</Text>

          <Text style={styles.time}>{date}</Text>
        </View>

        {!item.lida && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.lida).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notificações</Text>

        {/* Botão de Limpar (Lixeira) */}
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={24} color="#E74C3C" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sub-cabeçalho para o contador (se houver não lidas) */}
      {unreadCount > 0 && (
        <View style={styles.subHeader}>
          <Text style={styles.subHeaderText}>
            Você tem {unreadCount} novas notificações
          </Text>
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color="#CCC"
              />
              <Text style={styles.emptyText}>Nenhuma notificação.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    justifyContent: "space-between",
  },
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginLeft: 10,
  },
  clearButton: { padding: 5 },

  subHeader: {
    backgroundColor: "#F0F8FF",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E6F2FF",
  },
  subHeaderText: { color: "#007BFF", fontSize: 13, fontWeight: "600" },

  listContent: { padding: 20 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EEE",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  unreadCard: {
    borderColor: "#E3F2FD",
    backgroundColor: "#F8FDFF",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: { flex: 1, marginRight: 10 },
  title: { fontSize: 16, color: "#333", marginBottom: 4 },
  boldTitle: { fontWeight: "bold" },
  description: { fontSize: 14, color: "#666", lineHeight: 20, marginBottom: 6 },
  time: { fontSize: 12, color: "#999" },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007BFF",
    marginTop: 6,
  },
  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#999", marginTop: 10, marginBottom: 20 },
});

export default NotificationsScreen;
