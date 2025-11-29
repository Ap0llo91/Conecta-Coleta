import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";
import { useFocusEffect } from "@react-navigation/native";

// --- FORMATAÇÃO ---
const formatDocument = (text) => {
  if (!text) return "Sem documento";
  const cleaned = text.replace(/\D/g, "");
  if (cleaned.length <= 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else {
    return cleaned.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }
};

const formatPhone = (text) => {
  if (!text) return "Telefone não informado";
  const cleaned = text.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
  } 
  else if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }
  return text;
};

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [address, setAddress] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Perfil
      const { data: profileData } = await supabase
        .from("usuarios")
        .select("*")
        .eq("usuario_id", user.id)
        .single();

      if (profileData) setProfile(profileData);

      // 2. Endereço (Pega o mais recente, sem filtros complexos)
      const { data: addressData } = await supabase
        .from("enderecos")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false }) 
        .limit(1)
        .maybeSingle();

      if (addressData) setAddress(addressData);

    } catch (error) {
      console.log("Erro geral:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Conecta Coleta - O melhor app de gestão de resíduos de Recife!",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  // --- Monta a string do endereço com CEP ---
  let fullAddress = "Endereço não cadastrado";
  if (address) {
    // Se tiver CEP, mostra ele primeiro
    const cepPart = address.cep && address.cep !== '00000-000' ? `CEP: ${address.cep}\n` : "";
    
    if (address.numero || address.bairro) {
      const r = address.rua || "";
      const n = address.numero ? `, ${address.numero}` : "";
      const b = address.bairro ? ` - ${address.bairro}` : "";
      fullAddress = `${cepPart}${r}${n}${b}`;
    } 
    else if (address.rua) {
      fullAddress = `${cepPart}${address.rua}`;
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View />
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons
                name="log-out-outline"
                size={24}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarContainer}>
              {profile?.foto_url ? (
                <Image
                  source={{ uri: profile.foto_url }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#007BFF" />
                </View>
              )}
            </View>

            <View style={styles.profileTexts}>
              <Text style={styles.userName} numberOfLines={1}>
                {profile?.nome_razao_social || "Usuário"}
              </Text>
              <Text style={styles.userId}>
                {formatDocument(profile?.cpf_cnpj)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informações de Contato</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText} numberOfLines={1}>
              {profile?.email}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {formatPhone(profile?.telefone)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText} numberOfLines={3}>
              {fullAddress}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editButtonText}>Editar Informações</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>MINHA CONTA</Text>

        <MenuOption
          icon="time-outline"
          title="Histórico"
          subtitle="Seus pedidos e solicitações"
          color="#007BFF"
          onPress={() => navigation.navigate("History")}
        />

        <MenuOption
          icon="notifications-outline"
          title="Notificações"
          subtitle="Alertas e avisos"
          color="#007BFF"
          onPress={() => navigation.navigate("Notifications")}
        />

        <MenuOption
          icon="settings-outline"
          title="Configurações"
          subtitle="Preferências do aplicativo"
          color="#007BFF"
          onPress={() => navigation.navigate("Settings")}
        />

        <Text style={styles.sectionTitle}>AJUDA E SUPORTE</Text>

        <MenuOption
          icon="help-circle-outline"
          title="Central de Ajuda"
          subtitle="Perguntas frequentes"
          color="#007BFF"
          onPress={() => navigation.navigate("FAQ")}
        />

        <MenuOption
          icon="share-social-outline"
          title="Compartilhar App"
          subtitle="Convide amigos e vizinhos"
          color="#007BFF"
          onPress={handleShare}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const MenuOption = ({ icon, title, subtitle, color, onPress }) => (
  <TouchableOpacity style={styles.menuOption} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: "#E3F2FD" }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#CCC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 20 },
  header: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  profileHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarImage: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  avatarPlaceholder: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileTexts: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  userId: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  infoCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 25,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  editButton: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  editButtonText: {
    color: "#007BFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#888",
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 5,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
});