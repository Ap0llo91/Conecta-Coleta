import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'; 
import Logo from '../components/Logo';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Logo style={styles.logo} />
        
        <Text style={styles.title}>Conecta Coleta</Text>
        <Text style={styles.subtitle}>Bem-vindo! Como deseja entrar?</Text>
      </View>

      {/* Botões de Acesso */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.citizenButton} 
          onPress={() => navigation.navigate('CitizenAuth')}
        >
          <MaterialCommunityIcons name="account-group" size={30} color="#FFFFFF" style={styles.buttonIcon} />
          <View>
            <Text style={styles.buttonTitle}>Sou Cidadão</Text>
            <Text style={styles.buttonSubtitle}>Entrar com CPF</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.companyButton} 
          onPress={() => navigation.navigate('CompanyAuth')}
        >
          <FontAwesome5 name="building" size={30} color="#FFFFFF" style={styles.buttonIcon} />
          <View>
            <Text style={styles.buttonTitle}>Sou Empresa</Text>
            <Text style={styles.buttonSubtitle}>Entrar com CNPJ</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Link para Criar Conta */}
      <TouchableOpacity onPress={() => navigation.navigate('RegisterChoice')}>
        <Text style={styles.createAccountText}>
          Primeira vez aqui? <Text style={styles.createAccountLink}>Criar uma conta</Text>
        </Text>
      </TouchableOpacity>
      
    </SafeAreaView>
  );
}

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
    marginBottom: 40,
  },
  logo: {
    width: 300,  // Mantido em 300 como solicitado
    height: 300,
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
    textAlign: 'center',
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
    backgroundColor: '#FFD700', // Amarelo consistente com a marca
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
    opacity: 0.9,
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