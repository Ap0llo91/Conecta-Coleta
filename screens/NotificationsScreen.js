import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";
import { useFocusEffect } from "@react-navigation/native";

// CORES TEMÁTICAS
const THEME = {
  citizen: { primary: "#007BFF", light: "#E3F2FD" },
  company: { primary: "#F0B90B", light: "#FFFDE7" }
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estado do Tema (Começa como Cidadão por padrão)
  const [isCompany, setIsCompany] = useState(false);
  const theme = isCompany ? THEME.company : THEME.citizen;

  // Estados do Alerta Bonito
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertAction, setAlertAction] = useState(null); // Callback para ação destrutiva

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Descobre o tipo de usuário para ajustar a cor
      const { data: userData } = await supabase
        .from("usuarios")
        .select("tipo_usuario")
        .eq("usuario_id", user.id)
        .single();
      
      if (userData && userData.tipo_usuario === 'CNPJ') {
          setIsCompany(true);
      } else {
          setIsCompany(false);
      }

      // 2. Busca notificações
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

  const handleClearAll = () => {
    if (notifications.length === 0) return;

    // Configura o alerta de confirmação
    setAlertTitle("Limpar Notificações");
    setAlertMessage("Tem certeza que deseja apagar todas as notificações? Essa ação não pode ser desfeita.");
    setAlertAction(() => async () => {
        setNotifications([]);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
            .from("notificacoes")
            .delete()
            .eq("usuario_id", user.id);
        }
        setAlertVisible(false);
    });
    setAlertVisible(true);
  };

  const getIconStyle = (type) => {
    // Cores fixas para status específicos (sucesso/erro), mas adaptável onde fizer sentido
    switch (type) {
      case "truck":
        return {
          icon: "truck-delivery-outline",
          lib: MaterialCommunityIcons,
          color: theme.primary, // Usa cor do tema
          bg: theme.light,
        };
      case "info":
        return {
          icon: "information-variant",
          lib: MaterialCommunityIcons,
          color: theme.primary,
          bg: theme.light,
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
        style={[styles.card, !item.lida && { backgroundColor: theme.light, borderColor: theme.primary + '40' }]}
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
          <Text style={styles.description}>{item.descricao}</Text>
          <Text style={styles.time}>{date}</Text>
        </View>

        {!item.lida && <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.lida).length;

  // --- Modal de Confirmação ---
  const ConfirmationAlert = () => (
    <Modal transparent={true} visible={alertVisible} animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <MaterialCommunityIcons name="trash-can-outline" size={50} color="#D92D20" style={{marginBottom: 10}} />
                <Text style={styles.modalTitle}>{alertTitle}</Text>
                <Text style={styles.modalMessage}>{alertMessage}</Text>
                
                <View style={styles.modalButtonsRow}>
                    <TouchableOpacity 
                        style={[styles.modalButton, { backgroundColor: '#EEE', marginRight: 10 }]} 
                        onPress={() => setAlertVisible(false)}
                    >
                        <Text style={[styles.modalButtonText, { color: '#333' }]}>Cancelar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.modalButton, { backgroundColor: '#D92D20' }]} 
                        onPress={alertAction}
                    >
                        <Text style={[styles.modalButtonText, { color: 'white' }]}>Apagar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
  );

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

        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={24} color="#E74C3C" />
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={[styles.subHeader, { backgroundColor: theme.light, borderColor: theme.primary + '20' }]}>
          <Text style={[styles.subHeaderText, { color: theme.primary }]}>
            Você tem {unreadCount} novas notificações
          </Text>
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
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

      <ConfirmationAlert />
    </SafeAreaView>
  );
}

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
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  subHeaderText: { fontSize: 13, fontWeight: "600" },

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
    elevation: 1,
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
    marginTop: 6,
  },
  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#999", marginTop: 10, marginBottom: 20 },

  // Modal
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalContent: {
      width: '85%',
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 25,
      alignItems: 'center',
      elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  modalMessage: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 20 },
  modalButtonsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalButtonText: { fontWeight: 'bold', fontSize: 15 },
});