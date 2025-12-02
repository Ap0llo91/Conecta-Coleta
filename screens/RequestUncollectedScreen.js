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
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";

import { supabase } from "../utils/supabaseClient";

const RequestUncollectedScreen = ({ navigation }) => {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  const [endereco, setEndereco] = useState("");
  const [coords, setCoords] = useState(null);
  const [tipoLixo, setTipoLixo] = useState("");

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dataColeta, setDataColeta] = useState("");

  const [horario, setHorario] = useState("");
  const [descricao, setDescricao] = useState("");

  const [modalTipoVisible, setModalTipoVisible] = useState(false);
  const [modalTimeVisible, setModalTimeVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("warning");

  const tiposDeLixo = [
    "Lixo doméstico",
    "Lixo reciclável",
    "Resíduo orgânico",
    "Entulho pequeno",
    "Outros",
  ];

  const showCustomAlert = (title, message, type = "warning") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertModalVisible(true);
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);

    if (selectedDate) {
      const day = currentDate.getDate().toString().padStart(2, "0");
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const year = currentDate.getFullYear();
      setDataColeta(`${day}/${month}/${year}`);
    }
  };

  const handleGetLocation = async () => {
    if (loadingLocation) return;
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      showCustomAlert(
        "Permissão negada",
        "Necessário para preencher o endereço.",
        "error"
      );
      return;
    }
    setLoadingLocation(true);
    try {
      let location = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      let geocode = await Location.reverseGeocodeAsync(location.coords);
      if (geocode.length > 0) {
        const g = geocode[0];
        const addressFormatted = `${g.street || ""}, ${g.streetNumber || ""}, ${
          g.subregion || ""
        }`;
        setEndereco(addressFormatted);
      } else {
        showCustomAlert(
          "Erro",
          "Não foi possível encontrar o endereço.",
          "error"
        );
      }
    } catch (error) {
      showCustomAlert("Erro", "Falha ao obter localização.", "error");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleEnviar = async () => {
    if (!endereco || !tipoLixo || !descricao) {
      showCustomAlert(
        "Campos Obrigatórios",
        "Por favor, preencha endereço, tipo de lixo e descrição.",
        "warning"
      );
      return;
    }
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        showCustomAlert("Sessão Expirada", "Faça login novamente.", "error");
        setLoading(false);
        return;
      }

      let descricaoFinal = `Tipo: ${tipoLixo}. Descrição: ${descricao}`;
      if (dataColeta)
        descricaoFinal += `. Data que deveria ter sido realizada: ${dataColeta}`;
      if (horario) descricaoFinal += `. Horário exposto: ${horario}`;

      const { error } = await supabase.from("chamados").insert({
        usuario_id: user.id,
        tipo_problema: "Lixo Não Coletado",
        descricao: descricaoFinal,
        endereco_local: endereco,
        latitude: coords ? coords.latitude : null,
        longitude: coords ? coords.longitude : null,
        status: "Pendente",
      });

      if (error) throw error;
      setSuccessModalVisible(true);
    } catch (error) {
      console.error("Erro ao enviar:", error);
      showCustomAlert(
        "Erro no Envio",
        "Não foi possível enviar a solicitação. Verifique sua conexão.",
        "error"
      );
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
        <Text style={styles.headerTitle}>Lixo Não Coletado</Text>
        <Text style={styles.headerSubtitle}>
          Reporte lixo que não foi coletado
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Localização</Text>
          <View style={styles.addressContainer}>
            <TextInput
              style={styles.inputAddress}
              placeholder="Rua, número"
              value={endereco}
              onChangeText={setEndereco}
            />
            <TouchableOpacity
              onPress={handleGetLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color="#D92D20" />
              ) : (
                <Ionicons name="location-outline" size={24} color="#D92D20" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Tipo de Lixo</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setModalTipoVisible(true)}
          >
            <Text style={tipoLixo ? styles.inputText : styles.placeholderText}>
              {tipoLixo || "Selecione o tipo"}
            </Text>
            <Ionicons name="chevron-down" size={24} color="#666" />
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              {/* CORREÇÃO: Adicionado style={styles.labelFixed}
               */}
              <Text style={styles.labelFixed}>
                Data que deveria ter sido realizada
              </Text>

              <TouchableOpacity
                style={[styles.input, { justifyContent: "center" }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={dataColeta ? styles.inputText : styles.placeholderText}
                >
                  {dataColeta || "DD/MM/AAAA"}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={onChangeDate}
                />
              )}
            </View>

            <View style={{ flex: 1 }}>
              {/* CORREÇÃO: Usando o mesmo style={styles.labelFixed}
               */}
              <Text style={styles.labelFixed}>Horário Exposto</Text>

              {/* CORREÇÃO: Estrutura do botão simplificada para igualar ao da Data */}
              <TouchableOpacity
                style={[styles.input, { justifyContent: "center" }]}
                onPress={() => setModalTimeVisible(true)}
              >
                <Text
                  style={horario ? styles.inputText : styles.placeholderText}
                >
                  {horario || "--:--"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>Descrição da Situação</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva o problema..."
            multiline
            numberOfLines={4}
            value={descricao}
            onChangeText={setDescricao}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleEnviar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Enviar Solicitação</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Tipo de Lixo */}
      <Modal
        visible={modalTipoVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tipo de Lixo</Text>
            {tiposDeLixo.map((tipo, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalItem}
                onPress={() => {
                  setTipoLixo(tipo);
                  setModalTipoVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{tipo}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalTipoVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Time Picker */}
      <TimePickerModal
        visible={modalTimeVisible}
        onClose={() => setModalTimeVisible(false)}
        onSelect={(h, m) => {
          setHorario(`${h}:${m}`);
          setModalTimeVisible(false);
        }}
      />

      {/* Modal de Sucesso */}
      <Modal
        visible={successModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.centerModalOverlay}>
          <View style={styles.card}>
            <Ionicons
              name="checkmark-circle"
              size={80}
              color="#4CAF50"
              style={{ marginBottom: 20 }}
            />
            <Text style={styles.cardTitle}>Reporte Enviado!</Text>
            <Text style={styles.cardMessage}>Agradecemos sua colaboração.</Text>
            <TouchableOpacity
              style={[styles.cardButton, { backgroundColor: "#4CAF50" }]}
              onPress={closeSuccessModal}
            >
              <Text style={styles.cardButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Alerta/Erro Bonito */}
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
              style={[
                styles.cardButton,
                {
                  backgroundColor:
                    alertType === "error" ? "#D92D20" : "#FF9800",
                },
              ]}
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

// Componente Time Picker
const TimePickerModal = ({ visible, onClose, onSelect }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { height: 400 }]}>
          <Text style={styles.modalTitle}>Selecione o Horário</Text>
          <SimpleTimeSelector onSelect={onSelect} onClose={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const SimpleTimeSelector = ({ onSelect, onClose }) => {
  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMinute, setSelectedMinute] = useState("00");

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const minutes = Array.from({ length: 12 }, (_, i) =>
    String(i * 5).padStart(2, "0")
  );

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View style={{ flexDirection: "row", height: 200 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ alignItems: "center" }}
          showsVerticalScrollIndicator={false}
        >
          {hours.map((h) => (
            <TouchableOpacity
              key={h}
              onPress={() => setSelectedHour(h)}
              style={[
                styles.timeSlot,
                selectedHour === h && styles.timeSlotSelected,
              ]}
            >
              <Text
                style={[
                  styles.timeText,
                  selectedHour === h && styles.timeTextSelected,
                ]}
              >
                {h}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={{ justifyContent: "center" }}>
          <Text style={{ fontSize: 30 }}>:</Text>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ alignItems: "center" }}
          showsVerticalScrollIndicator={false}
        >
          {minutes.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setSelectedMinute(m)}
              style={[
                styles.timeSlot,
                selectedMinute === m && styles.timeSlotSelected,
              ]}
            >
              <Text
                style={[
                  styles.timeText,
                  selectedMinute === m && styles.timeTextSelected,
                ]}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View
        style={{
          flexDirection: "row",
          marginTop: 20,
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={[styles.modalButton, { backgroundColor: "#EEE" }]}
        >
          <Text style={{ color: "#333" }}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSelect(selectedHour, selectedMinute)}
          style={[styles.modalButton, { backgroundColor: "#D92D20" }]}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    backgroundColor: "#D92D20",
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

  // Novo estilo para alinhar labels na mesma linha
  labelFixed: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
    minHeight: 48,
    textAlignVertical: "bottom",
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

  row: { flexDirection: "row", gap: 15 },

  submitButton: {
    backgroundColor: "#D92D20",
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

  // Modais Inferiores (Tipo de Lixo, Horário)
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

  // Estilos do Time Picker
  timeSlot: { padding: 15, alignItems: "center", borderRadius: 8, width: 80 },
  timeSlotSelected: { backgroundColor: "#FFEBEE" },
  timeText: { fontSize: 18, color: "#333" },
  timeTextSelected: { color: "#D92D20", fontWeight: "bold", fontSize: 24 },
  modalButton: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 5,
  },

  // --- Estilos para Modais de Sucesso e Erro (Cards Centrais) ---
  centerModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  card: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    elevation: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cardMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  cardButton: { borderRadius: 30, paddingVertical: 12, paddingHorizontal: 40 },
  cardButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default RequestUncollectedScreen;
