import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator, // Adicionado para o ícone de loading do GPS
} from "react-native";
// 1. Importação da biblioteca Safe Area
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../utils/supabaseClient";
import * as Location from "expo-location";

// Lista estática de fallback caso o Supabase falhe
const STATIC_PROBLEM_TYPES = [
  { label: "Coleta não realizada", value: "static_coleta_nao_realizada" },
  { label: "Lixo acumulado", value: "static_lixo_acumulado" },
  { label: "Vazamento do caminhão", value: "static_vazamento_caminhao" },
  { label: "Contentor danificado", value: "static_contentor_danificado" },
  { label: "Horário irregular", value: "static_horario_irregular" },
  { label: "Outro", value: "static_outro" },
];

export default function ReportProblemScreen({ navigation }) {
  const [problemType, setProblemType] = useState(null);
  const [problemTypeLabel, setProblemTypeLabel] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [problemTypesList, setProblemTypesList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchProblemTypes = async () => {
      const { data, error } = await supabase
        .from("chamadotipos")
        .select("chamado_tipo_id, nome_servico")
        .in("perfil_acesso", ["CPF", "AMBOS"]);

      if (error || !data || data.length === 0) {
        console.error(
          "Erro ao buscar tipos (usando lista estática):",
          error?.message
        );
        setProblemTypesList(STATIC_PROBLEM_TYPES);
      } else {
        const types = data.map((item) => ({
          label: item.nome_servico,
          value: item.chamado_tipo_id,
        }));
        setProblemTypesList(types);
      }
    };
    fetchProblemTypes();
  }, []);

  const handleGetLocation = async () => {
    if (loading) return;

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Não podemos pegar sua localização sem permissão."
      );
      return;
    }
    setLoading(true);
    try {
      let location = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync(location.coords);
      if (geocode.length > 0) {
        const g = geocode[0];
        const formattedAddress = `${g.street || ""}, ${g.streetNumber || ""}, ${g.subregion || ""}`;
        setAddress(formattedAddress);
      } else {
        setAddress("Não foi possível encontrar o endereço");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao obter localização.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!problemType || !description || !address) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, preencha o tipo, descrição e endereço."
      );
      return;
    }
    if (loading) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("chamados").insert({
      usuario_id: user.id,
      chamado_tipo_id: problemType,
      descricao_usuario: description,
      latitude_ocorrencia: 0, // Placeholder
      longitude_ocorrencia: 0, // Placeholder
      status: "ABERTO",
    });

    if (error) {
      Alert.alert("Erro ao enviar reporte", error.message);
    } else {
      Alert.alert("Sucesso!", "Seu reporte foi enviado.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
    setLoading(false);
  };

  const onProblemTypeSelect = (item) => {
    setProblemType(item.value);
    setProblemTypeLabel(item.label);
    setIsModalVisible(false);
  };

  return (
    // 2. Troca de View por SafeAreaView
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Cabeçalho Vermelho */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportar um Problema</Text>
        <Text style={styles.headerSubtitle}>
          Tire uma foto e nos conte o que aconteceu
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.label}>Tipo de problema</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text
            style={
              problemType ? styles.pickerButtonText : styles.pickerPlaceholder
            }
          >
            {problemTypeLabel || "Selecione o tipo"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.inputMultiline}
          placeholder="Descreva o problema em detalhes..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Endereço</Text>
        <View style={styles.addressContainer}>
          <TextInput
            style={styles.inputAddress}
            placeholder="Rua, número, bairro"
            value={address}
            onChangeText={setAddress}
          />
          <TouchableOpacity onPress={handleGetLocation} disabled={loading}>
             {/* Pequeno detalhe visual: mostrar loading no ícone se estiver buscando */}
            {loading && address === "" ? (
               <ActivityIndicator size="small" color="#007BFF" />
            ) : (
               <Ionicons name="location-outline" size={24} color="#007BFF" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.locationHelper}>Ou use sua localização atual</Text>

        <Text style={styles.label}>Foto (opcional)</Text>
        <TouchableOpacity style={styles.photoBox}>
          <Ionicons name="camera-outline" size={40} color="#ccc" />
          <Text style={styles.photoText}>Tirar ou escolher foto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitReport}
          disabled={loading}
        >
          <Ionicons name="send-outline" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>
            {loading ? "Enviando..." : "Enviar Reporte"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Selecione o tipo</Text>
            <FlatList
              data={problemTypesList}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => onProblemTypeSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D92D20", // Vermelho escuro
  },
  header: {
    // 3. Padding ajustado para SafeAreaView
    paddingTop: 20, 
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: "#aaa",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
  inputMultiline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    textAlignVertical: "top",
    height: 100,
  },
  addressContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
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
  },
  locationHelper: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    marginBottom: 15,
  },
  photoBox: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    borderRadius: 10,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  photoText: {
    fontSize: 14,
    color: "#aaa",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#007BFF",
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemText: {
    fontSize: 18,
    textAlign: "center",
  },
  modalCloseButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  modalCloseText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
  },
});