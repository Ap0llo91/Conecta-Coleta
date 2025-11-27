import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";

// COR ORIGINAL DA EMPRESA (Amarelo/Laranja)
const primaryColor = "#F0B90B";

export default function CompanyAuthScreen({ navigation, route }) {
  const mode = route.params?.mode;
  const isRegisterMode = mode === "register";

  // Esconde o header padrão
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Personalizado */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isRegisterMode ? "Cadastro da Empresa" : "Acesso da Empresa"}
        </Text>
      </View>

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
    </SafeAreaView>
  );
}

// --- Formatação / Máscaras ---
const formatCNPJ = (text) => {
  const cleaned = text.replace(/\D/g, "");
  return cleaned
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const formatPhone = (text) => {
  const cleaned = text.replace(/\D/g, "");
  if (cleaned.length <= 10) {
    return cleaned
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    return cleaned
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d)(\d{4})(\d)/, "$1 $2-$3");
  }
};

// --- Componente de Login ---
const LoginForm = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

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

    // CORREÇÃO: REMOVIDA A NAVEGAÇÃO MANUAL
    // O App.js detectará a sessão automaticamente e trocará a tela.

    // setLoading(false); // Opcional: não precisa desligar o loading se a tela vai desmontar
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.loginIconContainer}>
        <MaterialCommunityIcons
          name="office-building"
          size={60}
          color={primaryColor}
        />
      </View>

      <Text style={styles.label}>Email Corporativo</Text>
      <TextInput
        style={styles.input}
        placeholder="contato@empresa.com"
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
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Entrando..." : "Acessar Conta"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("ForgotPassword")}
        style={{ alignSelf: "center", marginTop: 15 }}
      >
        <Text style={styles.linkText}>Esqueceu a senha?</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Componente de Cadastro ---
const RegisterForm = ({ navigation }) => {
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");

  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [semNumero, setSemNumero] = useState(false);
  const [bairro, setBairro] = useState("");

  const [loading, setLoading] = useState(false);

  const handleCnpjChange = (text) => setCnpj(formatCNPJ(text));
  const handlePhoneChange = (text) => setTelefone(formatPhone(text));

  const handleRegister = async () => {
    if (loading) return;

    if (
      !email ||
      !password ||
      !razaoSocial ||
      !cnpj ||
      !rua ||
      !bairro ||
      (!numero && !semNumero)
    ) {
      Alert.alert(
        "Atenção",
        "Por favor, preencha todos os campos obrigatórios."
      );
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      Alert.alert("Erro no Cadastro", authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      Alert.alert("Erro", "Não foi possível criar o usuário.");
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("usuarios").insert({
      usuario_id: authData.user.id,
      tipo_usuario: "CNPJ",
      cpf_cnpj: cnpj,
      nome_razao_social: razaoSocial,
      email: email,
    });

    if (dbError) {
      Alert.alert("Erro ao salvar dados", dbError.message);
      setLoading(false);
      return;
    }

    const enderecoCompleto = `${rua}, ${semNumero ? "S/N" : numero}, ${bairro}`;

    const { error: addrError } = await supabase.from("enderecos").insert({
      usuario_id: authData.user.id,
      rua: enderecoCompleto,
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
    Alert.alert(
      "Sucesso!",
      "Conta criada com sucesso! Verifique seu e-mail para confirmar.",
      [{ text: "OK", onPress: () => navigation.navigate("Welcome") }]
    );
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.sectionHeader}>Dados da Empresa</Text>

      <Text style={styles.label}>Razão Social</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Supermercado Silva Ltda"
        value={razaoSocial}
        onChangeText={setRazaoSocial}
      />

      <Text style={styles.label}>CNPJ</Text>
      <TextInput
        style={styles.input}
        placeholder="00.000.000/0000-00"
        keyboardType="numeric"
        value={cnpj}
        onChangeText={handleCnpjChange}
        maxLength={18}
      />

      <Text style={styles.label}>Email Corporativo</Text>
      <TextInput
        style={styles.input}
        placeholder="contato@empresa.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Telefone / WhatsApp</Text>
      <TextInput
        style={styles.input}
        placeholder="(81) 9 0000-0000"
        keyboardType="phone-pad"
        value={telefone}
        onChangeText={handlePhoneChange}
        maxLength={15}
      />

      <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Endereço</Text>

      <Text style={styles.label}>Logradouro (Rua/Av)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Av. Boa Viagem"
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
            style={[styles.checkboxBase, semNumero && styles.checkboxChecked]}
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
      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Criando Conta..." : "Cadastrar Empresa"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    color: primaryColor, // Amarelo
    marginBottom: 15,
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: "#333",
  },
  disabledInput: {
    backgroundColor: "#F0F0F0",
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
    borderColor: primaryColor, // Borda Amarela
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: primaryColor, // Fundo Amarelo quando marcado
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#666",
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
    backgroundColor: primaryColor, // Botão Amarelo
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: primaryColor, // Link Amarelo
    fontWeight: "600",
    fontSize: 14,
  },
});
