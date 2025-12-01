import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";

// TEMA DE CORES
const THEME = {
  citizen: { primary: "#007BFF", light: "#E3F2FD", danger: "#D32F2F", dangerLight: "#FFEBEE" },
  company: { primary: "#F0B90B", light: "#FFF9C4", danger: "#E65100", dangerLight: "#FFF3E0" }
};

const SettingsScreen = ({ navigation }) => {
  // Estados para os Switches
  const [truckNotif, setTruckNotif] = useState(true);
  const [reportNotif, setReportNotif] = useState(true);
  const [scheduleNotif, setScheduleNotif] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  // Estado do Tema
  const [loading, setLoading] = useState(true);
  const [isCompany, setIsCompany] = useState(false);
  const theme = isCompany ? THEME.company : THEME.citizen;

  useEffect(() => {
    checkUserType();
  }, []);

  const checkUserType = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('usuarios')
          .select('tipo_usuario')
          .eq('usuario_id', user.id)
          .single();
        
        if (data && data.tipo_usuario === 'CNPJ') {
          setIsCompany(true);
        } else {
          setIsCompany(false);
        }
      }
    } catch (error) {
      console.log("Erro ao verificar tipo de usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sair da Conta", "Você tem certeza que quer sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim, Sair",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          // Reseta a navegação para garantir que volte para o Welcome limpo
          navigation.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Simples */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Seção: Notificações */}
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Notificações</Text>
        <View style={styles.sectionCard}>
          <ToggleItem
            icon="truck-fast-outline"
            iconLib={MaterialCommunityIcons}
            title="Chegada do caminhão"
            subtitle="Avisar quando o caminhão estiver próximo"
            value={truckNotif}
            onValueChange={setTruckNotif}
            trackColor={theme.primary}
          />

          <View style={styles.divider} />

          <ToggleItem
            icon="file-document-edit-outline"
            iconLib={MaterialCommunityIcons}
            title="Atualizações de reportes"
            subtitle="Status dos seus reportes"
            value={reportNotif}
            onValueChange={setReportNotif}
            trackColor={theme.primary}
          />

          <View style={styles.divider} />

          <ToggleItem
            icon="clock-time-eight-outline"
            iconLib={MaterialCommunityIcons}
            title="Alterações de horário"
            subtitle="Mudanças na programação de coleta"
            value={scheduleNotif}
            onValueChange={setScheduleNotif}
            trackColor={theme.primary}
          />
        </View>

        {/* Seção: Localização */}
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Localização</Text>
        <View style={styles.sectionCard}>
          <ToggleItem
            icon="map-marker-radius-outline"
            iconLib={MaterialCommunityIcons}
            title="Usar localização atual"
            subtitle="Para rastreamento do caminhão"
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={theme.primary}
          />
        </View>

        {/* Seção: Ajuda e Sobre */}
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Ajuda e Sobre</Text>
        <View style={styles.sectionCard}>
          <LinkItem
            icon="book-open-page-variant-outline"
            iconLib={MaterialCommunityIcons}
            title="Como usar o App"
            onPress={() => navigation.navigate('Tutorial', { fromSettings: true })}
          />
          
          <View style={styles.divider} />

          <LinkItem
            icon="shield-check-outline"
            iconLib={MaterialCommunityIcons}
            title="Privacidade e Segurança"
            onPress={() =>
              Alert.alert(
                "Privacidade",
                "Aqui abriria a política de privacidade."
              )
            }
          />
          
          <View style={styles.divider} />
          
          <LinkItem
            icon="help-circle-outline"
            iconLib={Ionicons}
            title="Central de Ajuda"
            onPress={() => navigation.navigate("FAQ")} 
          />
        </View>

        {/* Botão Sair */}
        <TouchableOpacity 
          style={[
            styles.logoutButton, 
            { backgroundColor: theme.dangerLight, borderColor: theme.danger + '40' }
          ]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.danger} />
          <Text style={[styles.logoutText, { color: theme.danger }]}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Conecta Coleta v1.2.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Componentes Auxiliares ---

const ToggleItem = ({
  icon,
  iconLib: IconLib,
  title,
  subtitle,
  value,
  onValueChange,
  trackColor
}) => (
  <View style={styles.itemRow}>
    <View style={styles.iconContainer}>
      <IconLib name={icon} size={22} color="#666" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemSubtitle}>{subtitle}</Text>
    </View>
    <Switch
      trackColor={{ false: "#E0E0E0", true: trackColor }}
      thumbColor={value ? "#FFF" : "#FFF"}
      ios_backgroundColor="#3e3e3e"
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);

const LinkItem = ({ icon, iconLib: IconLib, title, onPress }) => (
  <TouchableOpacity style={styles.itemRow} onPress={onPress}>
    <View style={styles.iconContainer}>
      <IconLib name={icon} size={22} color="#666" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.itemTitle}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={22} color="#CCC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },

  content: { padding: 20 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    // color definido inline pelo tema
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 5,
    marginTop: 10,
  },

  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },

  iconContainer: {
    width: 30,
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  itemSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 60,
  },

  logoutButton: {
    flexDirection: "row",
    // backgroundColor definido pelo tema
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    // borderColor definido pelo tema
    marginTop: 20,
  },
  logoutText: {
    // color definido pelo tema
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },

  versionText: {
    textAlign: "center",
    color: "#BBB",
    fontSize: 12,
    marginTop: 20,
  },
});

export default SettingsScreen;