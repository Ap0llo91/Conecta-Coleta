import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados do Alerta
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Recuperar Senha",
      headerBackTitleVisible: false,
      headerTintColor: "#333",
    });
  }, [navigation]);

  const showAlert = (title, message, type = "info") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handlePasswordReset = async () => {
    if (loading) return;

    if (!email) {
      showAlert(
        "Campo Vazio",
        "Por favor, digite o e-mail cadastrado.",
        "warning"
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "conectacoleta://reset-password",
    });

    setLoading(false);

    if (error) {
      showAlert("Erro", error.message, "error");
    } else {
      showAlert(
        "Verifique seu E-mail",
        "Enviamos um link de recuperação para o e-mail informado (caso ele esteja cadastrado em nossa base).",
        "success"
      );
    }
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
    // Se deu certo, volta para a tela de login
    if (alertType === "success") {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        {/* Ícone */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-open-outline" size={50} color="#007BFF" />
          </View>
        </View>

        {/* Texto Explicativo */}
        <Text style={styles.title}>Redefinir Senha</Text>
        <Text style={styles.subtitle}>
          Digite o e-mail associado à sua conta e enviaremos as instruções para
          criar uma nova senha.
        </Text>

        {/* Formulário */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>E-mail Cadastrado</Text>
          <TextInput
            style={styles.input}
            placeholder="exemplo@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity
            style={[styles.button, styles.blueButton]}
            onPress={handlePasswordReset}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Enviando..." : "Enviar Link de Recuperação"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal de Alerta (O mesmo usado nas outras telas) */}
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          type={alertType}
          onClose={handleAlertClose}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Componente de Alerta Reutilizável ---
const CustomAlert = ({ visible, title, message, type, onClose }) => {
  let iconName = "information-circle";
  let color = "#007BFF";

  if (type === "warning") {
    iconName = "alert";
    color = "#FF9800";
  } else if (type === "error") {
    iconName = "alert-circle";
    color = "#D92D20";
  } else if (type === "success") {
    iconName = "mail-unread"; // Ícone de email para sucesso
    color = "#2ECC71";
  }

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Ionicons
            name={iconName}
            size={50}
            color={color}
            style={{ marginBottom: 15 }}
          />
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: color }]}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>OK, Entendi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    color: "#1F2937",
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  blueButton: {
    backgroundColor: "#007BFF",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 50,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
