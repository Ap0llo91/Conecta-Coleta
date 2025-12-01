import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

// Importação do Supabase
import { supabase } from "../utils/supabaseClient"; 

const RequestCataTrecoScreen = ({ navigation }) => {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados do Formulário
  const [endereco, setEndereco] = useState("");
  const [coords, setCoords] = useState(null);
  const [pontoReferencia, setPontoReferencia] = useState("");
  const [outrosItens, setOutrosItens] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [telefone, setTelefone] = useState("");

  // Estados dos Modais
  const [modalPeriodoVisible, setModalPeriodoVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false); // NOVO: Modal de Alerta/Erro

  // Estados para Conteúdo do Alerta
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("warning"); // 'warning' ou 'error'

  const [periodo, setPeriodo] = useState("");
  const periodos = [
    "Manhã (8h - 12h)",
    "Tarde (13h - 17h)",
    "Qualquer horário",
  ];

  const [itensSelecionados, setItensSelecionados] = useState({
    sofa: false,
    geladeira: false,
    fogao: false,
    colchao: false,
    mesa: false,
    armario: false,
    outros: false,
  });

  // Função auxiliar para mostrar o alerta bonito
  const showCustomAlert = (title, message, type = "warning") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertModalVisible(true);
  };

  const formatPhone = (text) => {
    let cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 11) cleaned = cleaned.substring(0, 11);

    if (cleaned.length === 0) return "";
    if (cleaned.length <= 2) return `(${cleaned}`;
    if (cleaned.length <= 3) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
    if (cleaned.length <= 7) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 3)} ${cleaned.substring(3)}`;
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 3)} ${cleaned.substring(3, 7)}-${cleaned.substring(7)}`;
  };

  const handlePhoneChange = (text) => {
    setTelefone(formatPhone(text));
  };

  const toggleItem = (key) => {
    setItensSelecionados((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGetLocation = async () => {
    if (loadingLocation) return;
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      showCustomAlert("Permissão negada", "Necessário para preencher endereço.", "error");
      return;
    }
    setLoadingLocation(true);
    try {
      let location = await Location.getCurrentPositionAsync({});
      
      setCoords({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
      });

      let geocode = await Location.reverseGeocodeAsync(location.coords);
      if (geocode.length > 0) {
        const g = geocode[0];
        const addressFormatted = `${g.street || ""}, ${g.streetNumber || ""}, ${g.subregion || ""}`;
        setEndereco(addressFormatted);
      }
    } catch (error) {
      showCustomAlert("Erro", "Falha ao obter localização.", "error");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleAgendar = async () => {
    // 1. Validação (Substituindo Alert nativo)
    if (!endereco || !telefone || !quantidade) {
        showCustomAlert("Campos Obrigatórios", "Por favor, preencha o endereço, telefone e a quantidade.", "warning");
        return;
    }

    setLoading(true);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            showCustomAlert("Sessão Expirada", "Faça login novamente.", "error");
            setLoading(false);
            return;
        }

        const itensAtivos = Object.keys(itensSelecionados)
            .filter(key => itensSelecionados[key])
            .map(key => key.charAt(0).toUpperCase() + key.slice(1));

        let descricaoFinal = `Itens: ${itensAtivos.join(", ")}`;
        
        if (outrosItens.trim()) descricaoFinal += `. Detalhes: ${outrosItens}`;
        if (pontoReferencia.trim()) descricaoFinal += `. Ref: ${pontoReferencia}`;
        if (periodo) descricaoFinal += `. Pref: ${periodo}`;
        descricaoFinal += `. Tel: ${telefone}. Qtd: ${quantidade}`;

        const { error } = await supabase
            .from('chamados')
            .insert({
                usuario_id: user.id,
                tipo_problema: 'Cata-Treco',
                descricao: descricaoFinal,
                endereco_local: endereco,
                latitude: coords ? coords.latitude : null,
                longitude: coords ? coords.longitude : null,
                status: 'Pendente'
            });

        if (error) {
            console.error("Erro Supabase:", error);
            throw error;
        }

        setSuccessModalVisible(true);

    } catch (error) {
        console.error("Erro ao agendar:", error);
        showCustomAlert("Erro no Envio", "Não foi possível registrar o pedido. Verifique sua conexão.", "error");
    } finally {
        setLoading(false);
    }
  };

  const closeSuccessModal = () => {
      setSuccessModalVisible(false);
      navigation.goBack();
  };

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
        <Text style={styles.headerTitle}>Cata-Treco</Text>
        <Text style={styles.headerSubtitle}>
          Agende a coleta de móveis e eletrodomésticos
        </Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Endereço Completo</Text>
          <View style={styles.addressContainer}>
            <TextInput
              style={styles.inputAddress}
              placeholder="Rua, número, complemento"
              value={endereco}
              onChangeText={setEndereco}
            />
            <TouchableOpacity
              onPress={handleGetLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color="#8A2BE2" />
              ) : (
                <Ionicons name="location-outline" size={24} color="#8A2BE2" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Ponto de Referência</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Próximo ao supermercado"
            value={pontoReferencia}
            onChangeText={setPontoReferencia}
          />

          <Text style={styles.label}>Itens a coletar</Text>
          <View style={styles.checkboxGroup}>
            <Checkbox
              label="Sofá"
              checked={itensSelecionados.sofa}
              onPress={() => toggleItem("sofa")}
            />
            <Checkbox
              label="Geladeira"
              checked={itensSelecionados.geladeira}
              onPress={() => toggleItem("geladeira")}
            />
            <Checkbox
              label="Fogão"
              checked={itensSelecionados.fogao}
              onPress={() => toggleItem("fogao")}
            />
            <Checkbox
              label="Colchão"
              checked={itensSelecionados.colchao}
              onPress={() => toggleItem("colchao")}
            />
            <Checkbox
              label="Mesa"
              checked={itensSelecionados.mesa}
              onPress={() => toggleItem("mesa")}
            />
            <Checkbox
              label="Armário"
              checked={itensSelecionados.armario}
              onPress={() => toggleItem("armario")}
            />
            <Checkbox
              label="Outros"
              checked={itensSelecionados.outros}
              onPress={() => toggleItem("outros")}
            />
          </View>

          <Text style={styles.label}>Outros Itens (Descrição)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva o que mais será coletado..."
            multiline
            numberOfLines={3}
            value={outrosItens}
            onChangeText={setOutrosItens}
          />

          <Text style={styles.label}>Quantidade Total de Itens</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 3"
            keyboardType="numeric"
            value={quantidade}
            onChangeText={setQuantidade}
          />

          <Text style={styles.label}>Telefone de Contato</Text>
          <TextInput
            style={styles.input}
            placeholder="(81) 9 9999-9999"
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={handlePhoneChange}
            maxLength={16}
          />

          <Text style={styles.label}>Período Preferencial</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setModalPeriodoVisible(true)}
          >
            <Text style={periodo ? styles.inputText : styles.placeholderText}>
              {periodo || "Selecione o período"}
            </Text>
            <Ionicons name="chevron-down" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleAgendar}
            disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.submitButtonText}>Agendar Coleta</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Período */}
      <Modal
        visible={modalPeriodoVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o período</Text>
            {periodos.map((p, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalItem}
                onPress={() => {
                  setPeriodo(p);
                  setModalPeriodoVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{p}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalPeriodoVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Sucesso */}
      <Modal
        visible={successModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.centerModalOverlay}>
            <View style={styles.card}>
                <Ionicons name="checkmark-circle" size={80} color="#4CAF50" style={{ marginBottom: 20 }} />
                <Text style={styles.cardTitle}>Solicitação Enviada!</Text>
                <Text style={styles.cardMessage}>
                    Sua coleta foi agendada com sucesso.{'\n'}
                    A equipe entrará em contato em breve.
                </Text>
                <TouchableOpacity 
                    style={[styles.cardButton, { backgroundColor: '#8A2BE2' }]} 
                    onPress={closeSuccessModal}
                >
                    <Text style={styles.cardButtonText}>Ótimo, entendi</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* NOVO: Modal de Alerta/Erro Bonito */}
      <Modal
        visible={alertModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.centerModalOverlay}>
            <View style={styles.card}>
                <Ionicons 
                  name={alertType === "error" ? "alert-circle" : "warning"} 
                  size={80} 
                  color={alertType === "error" ? "#D92D20" : "#FF9800"} 
                  style={{ marginBottom: 20 }} 
                />
                <Text style={styles.cardTitle}>{alertTitle}</Text>
                <Text style={styles.cardMessage}>{alertMessage}</Text>
                <TouchableOpacity 
                    style={[styles.cardButton, { backgroundColor: alertType === "error" ? "#D92D20" : "#FF9800" }]} 
                    onPress={() => setAlertModalVisible(false)}
                >
                    <Text style={styles.cardButtonText}>OK</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const Checkbox = ({ label, checked, onPress }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
    <View style={[styles.checkboxBase, checked && styles.checkboxChecked]}>
      {checked && <Ionicons name="checkmark" size={18} color="white" />}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    backgroundColor: "#8A2BE2",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { color: "white", fontSize: 16, marginLeft: 5 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "white" },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)" },
  content: { padding: 20 },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#EEE",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addressContainer: {
    flexDirection: "row",
    backgroundColor: "#EEE",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  inputAddress: { flex: 1, paddingVertical: 15, fontSize: 16, color: "#333" },
  textArea: { height: 80, textAlignVertical: "top" },
  checkboxGroup: { marginVertical: 5 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#8A2BE2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "white",
  },
  checkboxChecked: { backgroundColor: "#8A2BE2" },
  checkboxLabel: { fontSize: 16, color: "#333" },
  dropdown: {
    backgroundColor: "#EEE",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputText: { fontSize: 16, color: "#333" },
  placeholderText: { fontSize: 16, color: "#999" },
  submitButton: {
    backgroundColor: "#8A2BE2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  
  // Modais Inferiores (Período)
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  modalItemText: { fontSize: 16, color: "#333" },
  modalCloseButton: {
    marginTop: 20,
    padding: 15,
    alignItems: "center",
    backgroundColor: "#EEE",
    borderRadius: 10,
  },
  modalCloseText: { fontSize: 16, fontWeight: "bold", color: "#333" },

  // --- Estilos para Modais de Sucesso e Alerta (Cards Centrais) ---
  centerModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  card: {
      width: '85%',
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 30,
      alignItems: 'center',
      elevation: 10,
  },
  cardTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
      textAlign: 'center',
  },
  cardMessage: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 25,
  },
  cardButton: {
      borderRadius: 30,
      paddingVertical: 12,
      paddingHorizontal: 40,
      elevation: 2,
  },
  cardButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
  }
});

export default RequestCataTrecoScreen;