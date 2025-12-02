import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";

// Cor Principal (Azul)
const primaryBlue = "#007BFF";

// --- FUNÇÃO DE VALIDAÇÃO DE CPF (Algoritmo Oficial) ---
const validateCPF = (cpf) => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]+/g, "");

  if (cpf == "") return false;

  // Elimina CPFs invalidos conhecidos
  if (
    cpf.length != 11 ||
    cpf == "00000000000" ||
    cpf == "11111111111" ||
    cpf == "22222222222" ||
    cpf == "33333333333" ||
    cpf == "44444444444" ||
    cpf == "55555555555" ||
    cpf == "66666666666" ||
    cpf == "77777777777" ||
    cpf == "88888888888" ||
    cpf == "99999999999"
  )
    return false;

  // Valida 1o digito
  let add = 0;
  for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev == 10 || rev == 11) rev = 0;
  if (rev != parseInt(cpf.charAt(9))) return false;

  // Valida 2o digito
  add = 0;
  for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev == 10 || rev == 11) rev = 0;
  if (rev != parseInt(cpf.charAt(10))) return false;

  return true;
};

export default function CitizenAuthScreen({ navigation, route }) {
  const mode = route.params?.mode;
  const isRegisterMode = mode === "register";

  // 1. Esconde o header padrão do navegador
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 2. Header Personalizado */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isRegisterMode ? "Cadastro do Cidadão" : "Acesso do Cidadão"}
        </Text>
      </View>

      {/* WRAPPER KEYBOARD AVOIDING VIEW */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {isRegisterMode ? (
            <RegisterForm navigation={navigation} />
          ) : (
            <LoginForm navigation={navigation} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const LoginForm = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados do Alerta Bonito
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");

  const showAlert = (title, message, type = "error") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showAlert("Erro no Login", "Email ou senha incorretos.");
      setLoading(false);
      return;
    }

  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.loginIconContainer}>
        <Ionicons name="person" size={60} color={primaryBlue} />
      </View>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="seu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={[styles.button, styles.blueButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Entrando..." : "Entrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("ForgotPassword")}
        style={{ alignSelf: "center", marginTop: 15 }}
      >
        <Text style={styles.linkText}>Esqueceu a senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("RegisterChoice")}
        style={{ alignSelf: "center", marginTop: 25 }}
      >
        <Text style={styles.createAccountText}>
          Primeira vez aqui?{" "}
          <Text style={styles.createAccountLink}>Criar uma conta</Text>
        </Text>
      </TouchableOpacity>

      {/* Modal de Alerta */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

const RegisterForm = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nome, setNome] = useState("");

  // Estados formatados
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");

  // Endereço
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [semNumero, setSemNumero] = useState(false);

  const [loading, setLoading] = useState(false);

  // Estados do Alerta
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");

  const showAlert = (title, message, type = "error") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  // --- MÁSCARAS ---
  const maskCPF = (text) => {
    let v = text.replace(/\D/g, "");
    v = v.substring(0, 11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(v);
  };

  const maskPhone = (text) => {
    let v = text.replace(/\D/g, "");
    v = v.substring(0, 11);
    if (v.length > 2 && v[2] === "9") {
      if (v.length > 7) {
        v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{1,4})$/, "($1) $2 $3-$4");
      } else {
        v = v.replace(/^(\d{2})(\d{1})(\d{0,4})$/, "($1) $2 $3");
      }
    } else {
      if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{1,4})$/, "($1) $2-$3");
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,4})$/, "($1) $2");
      } else {
        v = v.replace(/^(\d*)/, "($1");
      }
    }
    setTelefone(v);
  };

  const maskCEP = (text) => {
    let v = text.replace(/\D/g, "");
    v = v.substring(0, 8);
    if (v.length > 5) {
      v = v.replace(/^(\d{5})(\d)/, "$1-$2");
    }
    setCep(v);
  };

  const handleRegister = async () => {
    if (loading) return;

    // 1. Validação de campos vazios
    if (
      !rua ||
      !bairro ||
      !cep ||
      (!numero && !semNumero) ||
      !nome ||
      !email ||
      !password ||
      !confirmPassword // Valida se campo de confirmação está vazio
    ) {
      showAlert(
        "Campos Incompletos",
        "Por favor, preencha todos os campos obrigatórios.",
        "warning"
      );
      return;
    }

    // 2. Validação de Senha (mínimo 6 caracteres)
    if (password.length < 6) {
        showAlert(
            "Senha Curta",
            "A senha deve ter no mínimo 6 caracteres.",
            "warning"
        );
        return;
    }

    // --- COMPARAÇÃO DE SENHAS ---
    if (password !== confirmPassword) {
        showAlert(
            "Senhas não conferem",
            "A senha e a confirmação de senha estão diferentes.",
            "warning"
        );
        return;
    }

    // 3. Validação de CPF REAL
    if (!validateCPF(cpf)) {
      showAlert(
        "CPF Inválido",
        "O CPF informado não é válido. Verifique os números.",
        "error"
      );
      return;
    }

    setLoading(true);
    const cpfLimpo = cpf.replace(/\D/g, "");
    const telLimpo = telefone.replace(/\D/g, "");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      // Tenta enviar metadados para agilizar o App.js
      options: {
        data: {
            tipo_usuario: 'CPF',
            nome: nome
        }
      }
    });

    if (authError) {
      showAlert("Erro no Cadastro", authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      showAlert(
        "Erro",
        "Não foi possível criar usuário (email pode já estar em uso)."
      );
      setLoading(false);
      return;
    }

    // Salva na tabela usuarios
    const { error: dbError } = await supabase.from("usuarios").insert({
      usuario_id: authData.user.id,
      tipo_usuario: "CPF",
      cpf_cnpj: cpfLimpo,
      nome_razao_social: nome,
      email: email,
      telefone: telLimpo,
    });

    if (dbError) {
      showAlert("Erro ao salvar dados", dbError.message);
      setLoading(false);
      return;
    }

    // Salva endereço
    const numeroFinal = semNumero ? "S/N" : numero;

    const { error: addrError } = await supabase.from("enderecos").insert({
      usuario_id: authData.user.id,
      rua: rua,
      numero: numeroFinal,
      bairro: bairro,
      cep: cep,
      latitude: 0,
      longitude: 0,
      is_padrao: true,
    });

    if (addrError) {
      showAlert("Erro ao salvar endereço", addrError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    
    await supabase.auth.refreshSession();
    
    // Alerta de Sucesso
    setAlertTitle("Sucesso!");
    setAlertMessage("Conta criada. Verifique seu e-mail para confirmar.");
    setAlertType("success");
    setAlertVisible(true);
  };

  const handleAlertClose = () => {
      setAlertVisible(false);
      if (alertType === 'success') {
          navigation.navigate("Welcome");
      }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.sectionHeader}>Dados Pessoais</Text>

      <Text style={styles.label}>Nome Completo</Text>
      <TextInput
        style={styles.input}
        placeholder="Seu nome completo"
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.label}>CPF</Text>
      <TextInput
        style={styles.input}
        placeholder="000.000.000-00"
        keyboardType="numeric"
        value={cpf}
        onChangeText={maskCPF}
        maxLength={14}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="seu@email.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        placeholder="(81) 9 0000-0000"
        keyboardType="phone-pad"
        value={telefone}
        onChangeText={maskPhone}
        maxLength={16}
      />

      {/* Seção de Endereço com CEP */}
      <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Endereço</Text>

      <Text style={styles.label}>CEP</Text>
      <TextInput
        style={styles.input}
        placeholder="00000-000"
        keyboardType="numeric"
        value={cep}
        onChangeText={maskCEP}
        maxLength={9}
      />

      <Text style={styles.label}>Logradouro (Rua/Av)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Rua das Flores"
        value={rua}
        onChangeText={setRua}
      />

      <View style={styles.rowContainer}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.label}>Número</Text>
          <TextInput
            style={[styles.input, semNumero && styles.disabledInput]}
            placeholder="123"
            value={semNumero ? "S/N" : numero}
            onChangeText={setNumero}
            editable={!semNumero}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => {
            setSemNumero(!semNumero);
            if (!semNumero) setNumero("");
          }}
        >
          <View
            style={[styles.checkboxBase, semNumero && styles.checkedCheckbox]}
          >
            {semNumero && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <Text style={styles.checkboxLabel}>Sem número</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Bairro</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Boa Viagem"
        value={bairro}
        onChangeText={setBairro}
      />

      <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Acesso</Text>
      <Text style={styles.label}>Senha (Min. 6 caracteres)</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* --- CAMPO NOVO: CONFIRMAR SENHA --- */}
      <Text style={styles.label}>Confirmar Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={[styles.button, styles.blueButton]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Cadastrando..." : "Cadastrar Cidadão"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* Modal de Alerta */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={handleAlertClose}
      />
    </View>
  );
};

const CustomAlert = ({ visible, title, message, type, onClose }) => {
    let iconName = 'alert-circle';
    let color = '#D92D20'; // Vermelho (Erro)

    if (type === 'warning') {
        iconName = 'alert';
        color = '#FF9800'; // Laranja (Atenção)
    } else if (type === 'success') {
        iconName = 'check-circle';
        color = '#2ECC71'; // Verde (Sucesso)
    }

    const buttonColor = type === 'success' ? primaryBlue : color;

    return (
        <Modal transparent={true} visible={visible} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <MaterialCommunityIcons name={iconName} size={60} color={color} style={{marginBottom: 15}} />
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalMessage}>{message}</Text>
                    <TouchableOpacity 
                        style={[styles.modalButton, { backgroundColor: buttonColor }]} 
                        onPress={onClose}
                    >
                        <Text style={styles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFF",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    width: "100%",
  },
  loginIconContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: primaryBlue,
    marginTop: 5,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    marginLeft: 0,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: "#333",
  },
  disabledInput: {
    backgroundColor: "#eee",
    color: "#999",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 5,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: primaryBlue,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  checkedCheckbox: {
    backgroundColor: primaryBlue,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  blueButton: {
    backgroundColor: primaryBlue,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: primaryBlue,
    fontWeight: "600",
    fontSize: 14,
  },
  createAccountText: {
    fontSize: 16,
    color: "#666",
  },
  createAccountLink: {
    color: primaryBlue,
    fontWeight: "bold",
  },

  // --- Estilos do Modal Bonito ---
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalContent: {
      width: '85%',
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 30,
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
  },
  modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
      textAlign: 'center',
  },
  modalMessage: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 25,
      lineHeight: 22,
  },
  modalButton: {
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 25,
      elevation: 2,
  },
  modalButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  }
});