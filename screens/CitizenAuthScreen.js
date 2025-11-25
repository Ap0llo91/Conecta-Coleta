import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";

export default function CitizenAuthScreen({ navigation, route }) {
  const mode = route.params?.mode;
  const isRegisterMode = mode === "register";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="person-circle" size={80} color="#007BFF" />
        </View>
        {isRegisterMode ? (
          <RegisterForm />
        ) : (
          <LoginForm navigation={navigation} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const LoginForm = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      Alert.alert("Erro no Login", error.message);
      setLoading(false);
      return;
    }
    if (data.user) navigation.replace("AppTabs");
    setLoading(false);
  };

  return (
    <View style={styles.formContainer}>
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
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("RegisterChoice")}>
        <Text style={styles.createAccountText}>
          Primeira vez aqui?{" "}
          <Text style={styles.createAccountLink}>Criar uma conta</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");

  // Estados formatados
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");

  // Endereço dividido
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [semNumero, setSemNumero] = useState(false);

  const [loading, setLoading] = useState(false);

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
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
    } else if (v.length > 5) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    }
    setTelefone(v);
  };

  const handleRegister = async () => {
    if (loading) return;

    if (!rua || !bairro || (!numero && !semNumero)) {
      Alert.alert(
        "Endereço",
        "Por favor, preencha todos os campos do endereço."
      );
      return;
    }

    setLoading(true);
    const cpfLimpo = cpf.replace(/\D/g, "");
    const telLimpo = telefone.replace(/\D/g, "");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      Alert.alert("Erro no Cadastro", authError.message);
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
      Alert.alert("Erro ao salvar dados", dbError.message);
      setLoading(false);
      return;
    }

    // Salva endereço separado
    const numeroFinal = semNumero ? "S/N" : numero;
    const { error: addrError } = await supabase.from("enderecos").insert({
      usuario_id: authData.user.id,
      rua: rua,
      numero: numeroFinal,
      bairro: bairro,
      cep: "00000-000",
      latitude: 0,
      longitude: 0,
      is_padrao: true,
    });

    if (addrError) {
      Alert.alert("Erro ao salvar endereço", addrError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    Alert.alert("Sucesso!", "Conta criada. Você já pode fazer o login!");
  };

  return (
    <View style={styles.formContainer}>
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
        maxLength={15}
      />

      {/* Endereço Dividido */}
      <Text style={styles.sectionHeader}>Endereço</Text>

      <Text style={styles.label}>Logradouro (Rua/Av)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Rua das Flores"
        value={rua}
        onChangeText={setRua}
      />

      <View style={styles.row}>
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
          <View style={[styles.checkbox, semNumero && styles.checkedCheckbox]}>
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
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flexGrow: 1, alignItems: "center", padding: 20 },
  iconContainer: { marginTop: 20, marginBottom: 30 },
  formContainer: { width: "100%" },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
    marginTop: 10,
    marginBottom: 10,
  },
  label: { fontSize: 14, color: "#333", marginBottom: 5, marginLeft: 5 },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  disabledInput: { backgroundColor: "#eee", color: "#999" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    marginTop: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#007BFF",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  checkedCheckbox: { backgroundColor: "#007BFF" },
  checkboxLabel: { fontSize: 14, color: "#333" },
  button: {
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
  },
  blueButton: { backgroundColor: "#007BFF" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  forgotPassword: {
    color: "#007BFF",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  createAccountText: { fontSize: 16, color: "#666" },
  createAccountLink: { color: "#007BFF", fontWeight: "bold" },
});
