import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import { supabase } from '../utils/supabaseClient';

export default function UpdatePasswordScreen({ navigation }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
        Alert.alert('Erro', 'Preencha todos os campos.');
        return;
    }

    if (password.length < 6) {
        Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres.');
        return;
    }

    if (password !== confirmPassword) {
        Alert.alert('Erro', 'As senhas não conferem.');
        return;
    }

    setLoading(true);

    // Atualiza a senha do usuário ATUALMENTE LOGADO (o link do email já fez o login)
    const { error } = await supabase.auth.updateUser({
        password: password
    });

    setLoading(false);

    if (error) {
        Alert.alert('Erro ao atualizar', error.message);
    } else {
        Alert.alert(
            'Sucesso!', 
            'Sua senha foi redefinida com sucesso.',
            [
                { 
                    text: 'OK', 
                    onPress: () => {
                        // Navega para a tela inicial ou faz logout para forçar novo login
                        navigation.navigate('Welcome'); 
                    }
                }
            ]
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
            <Ionicons name="key-outline" size={60} color="#007BFF" />
        </View>
        
        <Text style={styles.title}>Nova Senha</Text>
        <Text style={styles.subtitle}>
          Crie uma nova senha segura para sua conta.
        </Text>

        <View style={styles.form}>
            <Text style={styles.label}>Nova Senha</Text>
            <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Text style={styles.label}>Confirmar Nova Senha</Text>
            <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity 
                style={styles.button} 
                onPress={handleUpdatePassword}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.buttonText}>Salvar Nova Senha</Text>
                )}
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});