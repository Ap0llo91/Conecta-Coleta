// screens/CompanyAuthScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; 
import { supabase } from '../utils/supabaseClient'; // <<< 1. IMPORTE O SUPABASE

// Cores
const primaryYellow = '#F0B90B'; 

// { navigation, route } são passados automaticamente
export default function CompanyAuthScreen({ navigation, route }) {
  const mode = route.params?.mode;
  const isRegisterMode = (mode === 'register');

  return (
    <ScrollView style={{flex: 1}} contentContainerStyle={styles.container}>
      <View style={[styles.iconContainer, {backgroundColor: primaryYellow}]}>
        <FontAwesome5 name="building" size={40} color="#fff" />
      </View>

      {isRegisterMode ? <RegisterForm /> : <LoginForm navigation={navigation} />}
    </ScrollView>
  );
}

// --- Componente de Formulário de Login (Empresa) ---
const LoginForm = ({ navigation }) => {
  const [email, setEmail] = useState(''); // Estado para email
  const [password, setPassword] = useState(''); // Estado para senha
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Lógica de login (próximo passo)
    Alert.alert('Login', 'Lógica de login ainda não implementada.');
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>Email</Text>
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
        style={[styles.button, styles.yellowButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Componente de Formulário de Cadastro (Empresa) ---
const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(false);

  // <<< 2. FUNÇÃO DE CADASTRO NO SUPABASE
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
      .from('usuarios') // <<< 3. USA A TABELA 'usuarios'
      .insert({ 
        usuario_id: authData.user.id, // ID do Supabase Auth
        tipo_usuario: 'CNPJ', 
        cpf_cnpj: cnpj, 
        nome_razao_social: razaoSocial,
        email: email
      });

    if (dbError) {
      Alert.alert('Erro ao salvar dados', dbError.message);
      setLoading(false);
      return;
    }
    
    // 3. Salva os dados de endereço na tabela 'Enderecos'
    const { error: addrError } = await supabase
      .from('enderecos') // <<< 4. USA A TABELA 'enderecos'
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
    Alert.alert('Sucesso!', 'Conta criada. Verifique seu e-mail para confirmar!');
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>Razão Social</Text>
      <TextInput style={styles.input} placeholder="Nome da empresa" value={razaoSocial} onChangeText={setRazaoSocial} />
      
      <Text style={styles.label}>CNPJ</Text>
      <TextInput style={styles.input} placeholder="00.000.000/0000-00" keyboardType="numeric" value={cnpj} onChangeText={setCnpj} />
      
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} placeholder="contato@empresa.com" keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
      
      <Text style={styles.label}>Telefone</Text>
      <TextInput style={styles.input} placeholder="(00) 0000-0000" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />
      
      <Text style={styles.label}>Endereço</Text>
      <TextInput style={styles.input} placeholder="Rua, número, bairro" value={endereco} onChangeText={setEndereco} />
      
      <Text style={styles.label}>Senha</Text>
      <TextInput style={styles.input} placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity 
        style={[styles.button, styles.yellowButton]}
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
  // ... (Cole os mesmos estilos que você tinha antes) ...
  // ...
  container: {
    flexGrow: 1,
    backgroundColor: '#fffbe6', 
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginTop: 20,
    marginBottom: 30, 
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
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
    backgroundColor: '#fff', 
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
  yellowButton: {
    backgroundColor: primaryYellow,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: primaryYellow,
    textAlign: 'center',
    marginTop: 20,
  },
});