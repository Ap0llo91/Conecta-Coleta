import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
// Lembre-se de instalar os ícones: npx expo install @expo/vector-icons
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'; 
import Logo from '../components/Logo'; // Usando o componente SVG que criamos

export default function RegisterChoiceScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* O <Stack.Screen> no App.js já define o título "Criar uma conta" */}
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Logo style={styles.logo} /> 
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Como você deseja se cadastrar?</Text>
      </View>

      {/* Botões de Escolha */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.citizenButton} 
          // Agora ele navega para a tela de Auth, mas com um parâmetro
          // para sabermos que é para mostrar o formulário de cadastro
          onPress={() => navigation.navigate('CitizenAuth', { mode: 'register' })}
        >
          <MaterialCommunityIcons name="account-group" size={30} color="#FFFFFF" style={styles.buttonIcon} />
          <View>
            <Text style={styles.buttonTitle}>Sou Cidadão</Text>
            <Text style={styles.buttonSubtitle}>Cadastrar com CPF</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.companyButton} 
          onPress={() => navigation.navigate('CompanyAuth', { mode: 'register' })}
        >
          <FontAwesome5 name="building" size={30} color="#FFFFFF" style={styles.buttonIcon} />
          <View>
            <Text style={styles.buttonTitle}>Sou Empresa</Text>
            <Text style={styles.buttonSubtitle}>Cadastrar com CNPJ</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Link para voltar ao Login */}
      <TouchableOpacity onPress={() => navigation.goBack()}> 
        <Text style={styles.createAccountText}>Já tem uma conta? <Text style={styles.createAccountLink}>Entrar</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

// --- Estilos ---
// (São os mesmos estilos da WelcomeScreen)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 50, 
  },
  buttonsContainer: {
    width: '90%', 
    marginBottom: 30,
  },
  citizenButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db', 
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  companyButton: {
    flexDirection: 'row',
    backgroundColor: '#FFD700', 
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 15,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  createAccountText: {
    fontSize: 16,
    color: '#666',
  },
  createAccountLink: {
    color: '#3498db', 
    fontWeight: 'bold',
  },
});