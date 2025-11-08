import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
// Lembre-se de instalar os ícones!
// No terminal, rode: npx expo install @expo/vector-icons
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'; 
import Logo from '../components/Logo';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {<Logo style={styles.logo} />}
      <Text style={styles.title}>Conecta Coleta</Text>
      <Text style={styles.subtitle}>Bem-vindo! Como deseja entrar?</Text>

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

      <TouchableOpacity onPress={() => navigation.navigate('RegisterChoice')}>
        <Text style={styles.createAccountText}>Primeira vez aqui? <Text style={styles.createAccountLink}>Criar uma conta</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

// --- ESTILOS QUE FALTAVAM ---
// (Estes são os estilos do seu Figma original)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Cor de fundo clara
    alignItems: 'center',
    justifyContent: 'center', // Adicionado para centralizar tudo
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50, 
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 50, // Adicionado espaçamento
  },
  buttonsContainer: {
    width: '90%', // Aumentado para 90%
    marginBottom: 30,
  },
  citizenButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db', // Azul principal
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
    backgroundColor: '#FFD700', // Amarelo principal
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