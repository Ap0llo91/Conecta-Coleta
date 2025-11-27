import React, { useState, useLayoutEffect } from "react";
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

// Cor Principal (Azul)
const primaryBlue = "#007BFF";

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isRegisterMode ? "Cadastro do Cidadão" : "Acesso do Cidadão"}
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

    // CORREÇÃO: REMOVIDA A NAVEGAÇÃO MANUAL
    // O App.js detectará a sessão automaticamente e trocará a tela.
    
    // setLoading(false); 
  };

  return (
    <View style={styles.formContainer}>
      {/* Ícone menor para identificar login */}
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
      
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={{alignSelf: 'center', marginTop: 15}}>
        <Text style={styles.linkText}>Esqueceu a senha?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate("RegisterChoice")} style={{alignSelf: 'center', marginTop: 25}}>
        <Text style={styles.createAccountText}>
          Primeira vez aqui? <Text style={styles.createAccountLink}>Criar uma conta</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const RegisterForm = ({ navigation }) => {
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

    if (!authData.user) {
        Alert.alert("Erro", "Não foi possível criar usuário.");
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
    const enderecoCompleto = `${rua}, ${numeroFinal}, ${bairro}`;

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
    Alert.alert("Sucesso!", "Conta criada. Verifique seu e-mail para confirmar.", [
        { text: "OK", onPress: () => navigation.navigate("Welcome") }
    ]);
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
        maxLength={15}
      />

      {/* Endereço Dividido */}
      <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Endereço</Text>

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
          <View style={[styles.checkboxBase, semNumero && styles.checkedCheckbox]}>
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
        style={[styles.button, styles.blueButton]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Cadastrando..." : "Cadastrar Cidadão"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  // Header Styles (Novo)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  
  container: { 
    flexGrow: 1, 
    padding: 20 
  },
  formContainer: { 
    width: "100%" 
  },
  loginIconContainer: {
    alignItems: 'center',
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
    fontWeight: '500' 
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#333'
  },
  disabledInput: { 
    backgroundColor: "#eee", 
    color: "#999" 
  },
  rowContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 5 
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
    backgroundColor: primaryBlue 
  },
  checkboxLabel: { 
    fontSize: 14, 
    color: "#333" 
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  blueButton: { 
    backgroundColor: primaryBlue 
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  linkText: {
    color: primaryBlue,
    fontWeight: '600',
    fontSize: 14,
  },
  createAccountText: { 
    fontSize: 16, 
    color: "#666" 
  },
  createAccountLink: { 
    color: primaryBlue, 
    fontWeight: "bold" 
  },
});