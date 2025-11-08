// screens/ForgotPasswordScreen.js
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

// (Opcional, mas recomendado) Importe o Supabase para a lógica real
// import { supabase } from '../utils/supabaseClient'; // (Certifique-se que o caminho está correto)

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Esta é a função que será chamada quando o usuário clicar em "Enviar"
  const handlePasswordReset = async () => {
    if (loading) return;
    setLoading(true);

    // --- LÓGICA REAL DO SUPABASE (para o futuro) ---
    // const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    //   redirectTo: 'https://seusite.com/resetar-senha', // Você precisa configurar isso no Supabase
    // });
    //
    // if (error) {
    //   Alert.alert('Erro', error.message);
    // } else {
    //   Alert.alert('Sucesso', 'Link de recuperação enviado para o seu e-mail!');
    //   navigation.goBack(); // Volta para a tela de login
    // }

    // --- LÓGICA DE PROTÓTIPO (para agora) ---
    // Apenas simula um delay e mostra um alerta
    setTimeout(() => {
      Alert.alert(
        'Verifique seu E-mail',
        'Se uma conta com este e-mail existir, um link de recuperação será enviado.',
        [{ text: 'OK', onPress: () => navigation.goBack() }] // Volta para a tela de login
      );
      setLoading(false);
    }, 1500); // Simula 1.5s de espera
  };

  return (
    <ScrollView style={{flex: 1}} contentContainerStyle={styles.container}>
      {/* Ícone */}
      <View style={styles.iconContainer}>
        <Ionicons name="mail-unread-outline" size={80} color="#007BFF" />
      </View>

      {/* Texto Explicativo */}
      <Text style={styles.title}>Esqueceu sua senha?</Text>
      <Text style={styles.subtitle}>
        Sem problemas. Digite seu e-mail abaixo e enviaremos um link para você redefinir sua senha.
      </Text>

      {/* Formulário */}
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
        
        <TouchableOpacity 
          style={[styles.button, styles.blueButton]} 
          onPress={handlePasswordReset}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  iconContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
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
    },
});