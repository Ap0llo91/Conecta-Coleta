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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

const RequestDumpsterScreen = ({ navigation }) => {
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Estados do Formulário
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [tipoResiduo, setTipoResiduo] = useState("");
  const [volume, setVolume] = useState("");
  const [data, setData] = useState("");
  const [observacao, setObservacao] = useState("");

  // Estado para o Modal de Tipo de Resíduo
  const [modalVisible, setModalVisible] = useState(false);

  // Opções de resíduos
  const tiposResiduo = [
    "Entulho de construção",
    "Resíduos de reforma",
    "Móveis descartados",
    "Outros resíduos volumosos",
  ];

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
        Alert.alert("Erro", "Não foi possível encontrar o endereço.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao obter localização.");
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho Laranja */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitar Caçamba</Text>
        <Text style={styles.headerSubtitle}>
          Preencha os dados para sua solicitação
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={styles.input}
          placeholder="000.000.000-00"
          keyboardType="numeric"
          value={cpf}
          onChangeText={setCpf}
        />

        {/* Campo de Endereço com GPS */}
        <Text style={styles.label}>Endereço</Text>
        <View style={styles.addressContainer}>
          <TextInput
            style={styles.inputAddress}
            placeholder="Rua, número, bairro"
            value={endereco}
            onChangeText={setEndereco}
          />
          <TouchableOpacity
            onPress={handleGetLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <ActivityIndicator size="small" color="#FF4500" />
            ) : (
              <Ionicons name="location-outline" size={24} color="#FF4500" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.locationHelper}>Ou use sua localização atual</Text>

        <Text style={styles.label}>Tipo de Resíduo</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setModalVisible(true)}
        >
          <Text style={tipoResiduo ? styles.inputText : styles.placeholderText}>
            {tipoResiduo || "Selecione o tipo"}
          </Text>
          <Ionicons name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>Volume Estimado (m³)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 3"
          keyboardType="numeric"
          value={volume}
          onChangeText={setVolume}
        />

        <Text style={styles.label}>Data Desejada</Text>
        <TextInput
          style={styles.input}
          placeholder="dd/mm/aaaa"
          value={data}
          onChangeText={setData}
        />

        <Text style={styles.label}>Observações</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Informações adicionais sobre o local ou material"
          multiline
          numberOfLines={4}
          value={observacao}
          onChangeText={setObservacao}
        />

        <View style={styles.warningBox}>
          <MaterialCommunityIcons
            name="calendar-clock"
            size={24}
            color="#E65100"
          />
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningText}>
              A instalação da caçamba está sujeita a análise e disponibilidade.
            </Text>
            <Text
              style={[styles.warningText, { marginTop: 4, fontWeight: "bold" }]}
            >
              Prazo médio de atendimento: 3-5 dias úteis.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => console.log("Enviando...")}
        >
          <Text style={styles.submitButtonText}>Enviar Solicitação</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o tipo</Text>
            {tiposResiduo.map((tipo, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalItem}
                onPress={() => {
                  setTipoResiduo(tipo);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{tipo}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    backgroundColor: "#FF4500",
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
  inputAddress: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#333",
  },
  locationHelper: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    marginBottom: 5,
  },
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
  textArea: { height: 100, textAlignVertical: "top" },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginTop: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFCC80",
  },
  warningTextContainer: { flex: 1, marginLeft: 12 },
  warningText: { fontSize: 14, color: "#E65100" },
  submitButton: {
    backgroundColor: "#FF4500",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
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

export default RequestDumpsterScreen;
