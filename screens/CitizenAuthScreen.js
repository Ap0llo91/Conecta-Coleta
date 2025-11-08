// screens/CitizenAuthScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { supabase } from '../utils/supabaseClient'; // 1. IMPORTE O SUPABASE

// { navigation, route } são passados automaticamente
export default function CitizenAuthScreen({ navigation, route }) {
  // Pega o parâmetro 'mode' que enviamos da tela anterior
  const mode = route.params?.mode;

  // Se 'mode' for 'register', começamos na tela de cadastro (isRegisterMode = true)
  const isRegisterMode = (mode === 'register');

  return (
    <ScrollView style={{flex: 1}} contentContainerStyle={styles.container}>
      {/* Ícone de Usuário */}
      <View style={styles.iconContainer}>
        <Ionicons name="person-circle" size={80} color="#007BFF" />
      </View>

      {/* Renderiza o formulário de Login OU Cadastro baseado no 'mode' */}
      {isRegisterMode ? <RegisterForm /> : <LoginForm navigation={navigation} />}
      
    </ScrollView>
  );
}

// --- Componente de Formulário de Login ---
const LoginForm = ({ navigation }) => {
  const [email, setEmail] = useState(''); // Estado para email
  const [password, setPassword] = useState(''); // Estado para senha
  const [loading, setLoading] = useState(false);

  // 2. FUNÇÃO DE LOGIN DO SUPABASE
  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Erro no Login', error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
  // 'replace' impede o usuário de apertar "Voltar" e cair no login de novo.
  navigation.replace('AppTabs'); 
}
    
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
        <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('RegisterChoice')}>
        <Text style={styles.createAccountText}>Primeira vez aqui? <Text style={styles.createAccountLink}>Criar uma conta</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Componente de Formulário de Cadastro ---
const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(false);

  // 3. FUNÇÃO DE CADASTRO NO SUPABASE
  const handleRegister = async () => {
    if (loading) return;
    setLoading(true);

    // 1. Tenta criar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      Alert.alert('Erro no Cadastro', authError.message);
      setLoading(false);
      return;
    }

    // 2. Tenta salvar os dados extras na tabela 'Usuarios'
    const { error: dbError } = await supabase
      .from('usuarios') 
      .insert({ 
        usuario_id: authData.user.id, 
        tipo_usuario: 'CPF', 
        cpf_cnpj: cpf, 
        nome_razao_social: nome,
        email: email
      });

    if (dbError) {
      Alert.alert('Erro ao salvar dados', dbError.message);
      setLoading(false);
      return;
    }
    
    // 3. Salva os dados de endereço na tabela 'Enderecos'
    const { error: addrError } = await supabase
      .from('enderecos') 
      .insert({
        usuario_id: authData.user.id,
        rua: endereco,
        cep: '00000-000', // Placeholder
        latitude: 0, // Placeholder
        longitude: 0, // Placeholder
        is_padrao: true
      });

    if (addrError) {
      Alert.alert('Erro ao salvar endereço', addrError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    Alert.alert('Sucesso!', 'Conta criada. Você já pode fazer o login!');
    // Idealmente, levaria o usuário para a tela de login
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>Nome Completo</Text>
      <TextInput style={styles.input} placeholder="Seu nome completo" value={nome} onChangeText={setNome} />
      
      <Text style={styles.label}>CPF</Text>
      <TextInput style={styles.input} placeholder="000.000.000-00" keyboardType="numeric" value={cpf} onChangeText={setCpf} />
      
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} placeholder="seu@email.com" keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
      
      <Text style={styles.label}>Telefone</Text>
      <TextInput style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />
      
      <Text style={styles.label}>Endereço</Text>
      <TextInput style={styles.input} placeholder="Rua, número, bairro" value={endereco} onChangeText={setEndereco} />
      
      <Text style={styles.label}>Senha</Text>
      <TextInput style={styles.input} placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity 
        style={[styles.button, styles.blueButton]} 
        onPress={handleRegister} 
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginTop: 20,
    marginBottom: 30, 
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  blueButton: {
    backgroundColor: '#007BFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#007BFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20, 
  },
  createAccountText: {
    fontSize: 16,
    color: '#666',
  },
  createAccountLink: {
    color: '#007BFF', 
    fontWeight: 'bold',
  },
});