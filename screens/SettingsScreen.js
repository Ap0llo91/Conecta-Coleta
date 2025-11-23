import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";

const SettingsScreen = ({ navigation }) => {
  // Estados para os Switches (Interruptores)
  const [truckNotif, setTruckNotif] = useState(true);
  const [reportNotif, setReportNotif] = useState(true);
  const [scheduleNotif, setScheduleNotif] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleLogout = async () => {
    Alert.alert("Sair da Conta", "Você tem certeza que quer sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim, Sair",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          // CORREÇÃO: Navega para Welcome e limpa o histórico
          navigation.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          });
        },
      },
    ]);
  };

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
        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.sectionCard}>
          <ToggleItem
            icon="truck-fast-outline"
            iconLib={MaterialCommunityIcons}
            title="Chegada do caminhão"
            subtitle="Avisar quando o caminhão estiver próximo"
            value={truckNotif}
            onValueChange={setTruckNotif}
          />

          <View style={styles.divider} />

          <ToggleItem
            icon="file-document-edit-outline"
            iconLib={MaterialCommunityIcons}
            title="Atualizações de reportes"
            subtitle="Status dos seus reportes"
            value={reportNotif}
            onValueChange={setReportNotif}
          />

          <View style={styles.divider} />

          <ToggleItem
            icon="clock-time-eight-outline"
            iconLib={MaterialCommunityIcons}
            title="Alterações de horário"
            subtitle="Mudanças na programação de coleta"
            value={scheduleNotif}
            onValueChange={setScheduleNotif}
          />
        </View>

        {/* Seção: Localização */}
        <Text style={styles.sectionTitle}>Localização</Text>
        <View style={styles.sectionCard}>
          <ToggleItem
            icon="map-marker-radius-outline"
            iconLib={MaterialCommunityIcons}
            title="Usar localização atual"
            subtitle="Para rastreamento do caminhão"
            value={locationEnabled}
            onValueChange={setLocationEnabled}
          />
        </View>

        {/* Seção: Links Úteis */}
        <View style={styles.sectionCard}>
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
            title="Ajuda e Suporte"
            onPress={() => navigation.navigate("FAQ")} // Atalho para o FAQ
          />
        </View>

        {/* Botão Sair */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Conecta Coleta v1.1.0</Text>
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
      trackColor={{ false: "#E0E0E0", true: "#007BFF" }}
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
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 5,
  },

  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 5,
    marginBottom: 20,
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
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    marginTop: 10,
  },
  logoutText: {
    color: "#D32F2F",
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
