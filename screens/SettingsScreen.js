import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Modal
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
  // Removido: const [locationEnabled, setLocationEnabled] = useState(true);

  // Estado do Tema e Modais
  const [loading, setLoading] = useState(true);
  const [isCompany, setIsCompany] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  
  // --- ESTADO PARA O MODAL DE LOGOUT ---
  const [logoutVisible, setLogoutVisible] = useState(false);
  
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

  // Função chamada ao clicar no botão "Sair" - Abre o Modal
  const handleLogoutPress = () => {
    setLogoutVisible(true);
  };

  // Função que executa o logout
  const confirmLogout = async () => {
    setLogoutVisible(false);
    await supabase.auth.signOut();
  };

  // --- Modal de Privacidade ---
  const PrivacyModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={privacyVisible}
      onRequestClose={() => setPrivacyVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons name="shield-check" size={32} color={theme.primary} />
            <Text style={styles.modalTitle}>Política de Privacidade</Text>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>1. Coleta de Dados:</Text> Coletamos informações como nome, endereço e localização apenas para otimizar as rotas de coleta e gerar certificados ambientais.
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>2. Uso das Informações:</Text> Seus dados são utilizados exclusivamente para a prestação do serviço de gestão de resíduos e comunicação sobre o status das coletas.
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>3. Segurança:</Text> Adotamos medidas de segurança rigorosas para proteger seus dados pessoais contra acesso não autorizado.
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>4. Compartilhamento:</Text> Não compartilhamos seus dados com terceiros, exceto quando exigido por lei ou para órgãos ambientais reguladores (no caso de emissão de CDF).
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>5. Localização:</Text> O uso do GPS é necessário apenas durante o uso do app para mostrar a localização do caminhão em tempo real.
            </Text>
            <View style={{height: 20}} />
          </ScrollView>

          <TouchableOpacity 
            style={[styles.modalButton, { backgroundColor: theme.primary }]} 
            onPress={() => setPrivacyVisible(false)}
          >
            <Text style={styles.modalButtonText}>Entendi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // --- NOVO MODAL DE LOGOUT ---
  const LogoutModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={logoutVisible}
      onRequestClose={() => setLogoutVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.logoutContent}>
          <View style={[styles.logoutIconCircle, { backgroundColor: theme.dangerLight }]}>
            <Ionicons name="log-out" size={32} color={theme.danger} />
          </View>
          
          <Text style={styles.logoutTitle}>Sair da Conta</Text>
          <Text style={styles.logoutMessage}>
            Tem certeza que deseja desconectar? Você precisará fazer login novamente para acessar.
          </Text>

          <View style={styles.logoutActions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setLogoutVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.confirmButton, { backgroundColor: theme.danger }]} 
              onPress={confirmLogout}
            >
              <Text style={styles.confirmButtonText}>Sim, Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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

        {/* Seção Localização REMOVIDA AQUI */}

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
            onPress={() => setPrivacyVisible(true)} 
          />
          
          <View style={styles.divider} />
          
          <LinkItem
            icon="help-circle-outline"
            iconLib={Ionicons}
            title="Central de Ajuda"
            onPress={() => navigation.navigate("FAQ")} 
          />
        </View>

        {/* Botão Sair - Chama a nova função com Modal */}
        <TouchableOpacity 
          style={[
            styles.logoutButton, 
            { backgroundColor: theme.dangerLight, borderColor: theme.danger + '40' }
          ]} 
          onPress={handleLogoutPress}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.danger} />
          <Text style={[styles.logoutText, { color: theme.danger }]}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Conecta Coleta v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Renderiza os Modais */}
      <PrivacyModal />
      <LogoutModal />
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
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginTop: 20,
  },
  logoutText: {
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

  // --- Estilos do Modal de Privacidade ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 15,
    lineHeight: 22,
    textAlign: 'justify'
  },
  bold: {
    fontWeight: 'bold',
    color: '#333'
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 2,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // --- ESTILOS DO MODAL DE LOGOUT ---
  logoutContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    width: '90%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logoutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoutTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  logoutMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  logoutActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
    elevation: 2,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default SettingsScreen;