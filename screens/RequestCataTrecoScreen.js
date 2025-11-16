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
} from "react-native";
// 1. Importação da biblioteca de Safe Area (Segurança de layout)
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

const RequestCataTrecoScreen = ({ navigation }) => {
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Estados do Formulário
  const [endereco, setEndereco] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");
  const [outrosItens, setOutrosItens] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [telefone, setTelefone] = useState("");

  // Estado do Dropdown de Período
  const [periodo, setPeriodo] = useState("");
  const [modalPeriodoVisible, setModalPeriodoVisible] = useState(false);
  const periodos = [
    "Manhã (8h - 12h)",
    "Tarde (13h - 17h)",
    "Qualquer horário",
  ];

  // Estado dos Checkboxes (Itens)
  const [itensSelecionados, setItensSelecionados] = useState({
    sofa: false,
    geladeira: false,
    fogao: false,
    colchao: false,
    mesa: false,
    armario: false,
    outros: false,
  });

  // Função para alternar checkbox
  const toggleItem = (key) => {
    setItensSelecionados((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Função de Localização
  const handleGetLocation = async () => {
    if (loadingLocation) return;
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Não podemos pegar sua localização sem permissão."
      );
      return;
    }
    setLoadingLocation(true);
    try {
      let location = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync(location.coords);
      if (geocode.length > 0) {
        const g = geocode[0];
        const addressFormatted = `${g.street || ""}, ${g.streetNumber || ""}, ${
          g.subregion || ""
        }`;
        setEndereco(addressFormatted);
      } else {
        Alert.alert("Erro", "Endereço não encontrado.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao obter localização.");
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    // 2. Trocamos View por SafeAreaView para garantir o topo da tela
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho Roxo */}
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Endereço com GPS */}
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

        {/* CHECKBOXES DE ITENS */}
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
          placeholder="(81) 99999-9999"
          keyboardType="phone-pad"
          value={telefone}
          onChangeText={setTelefone}
        />

        {/* Dropdown de Período */}
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
          onPress={() => console.log("Agendando...")}
        >
          <Text style={styles.submitButtonText}>Agendar Coleta</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

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
    </SafeAreaView>
  );
};

// Componente de Checkbox Simples
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
    backgroundColor: "#8A2BE2", // Roxo (BlueViolet)
    // 3. Ajustamos o padding para funcionar com SafeAreaView
    // Antes era 50, agora 20 é suficiente porque o SafeAreaView já empurra o conteúdo
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

  // Estilos do Checkbox
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

  // Modal
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
});

export default RequestCataTrecoScreen;