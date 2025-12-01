import React, { useState, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Modal, 
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { supabase } from '../utils/supabaseClient';

// COR DA EMPRESA (Amarelo/Laranja)
const primaryColor = '#F0B90B'; 

export default function CompanyAuthScreen({ navigation, route }) {
  const mode = route.params?.mode;
  const isRegisterMode = (mode === 'register');

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isRegisterMode ? 'Cadastro da Empresa' : 'Acesso da Empresa'}
        </Text>
      </View>

      {/* WRAPPER KEYBOARD AVOIDING VIEW */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={{flex: 1}} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {isRegisterMode ? <RegisterForm navigation={navigation} /> : <LoginForm navigation={navigation} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Formatação / Máscaras ---
const formatCNPJ = (text) => {
  const cleaned = text.replace(/\D/g, '');
  return cleaned
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const formatPhone = (text) => {
  let v = text.replace(/\D/g, "");
  v = v.substring(0, 11);
  if (v.length > 2 && v[2] === "9") {
    // Celular 9 dígitos: (XX) 9 XXXX-XXXX
    if (v.length > 7) {
      v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{1,4})$/, "($1) $2 $3-$4");
    } else {
      v = v.replace(/^(\d{2})(\d{1})(\d{0,4})$/, "($1) $2 $3");
    }
  } else {
    // Fixo ou celular antigo: (XX) XXXX-XXXX
    if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4})(\d{1,4})$/, "($1) $2-$3");
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,4})$/, "($1) $2");
    } else {
      v = v.replace(/^(\d*)/, "($1");
    }
  }
  return v;
};

// --- Componente de Login ---
const LoginForm = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados do Alerta Bonito
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error'); 

  const showAlert = (title, message, type = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (loading) return;
    
    if (!email || !password) {
      showAlert('Campos Vazios', 'Por favor, preencha seu email e senha.');
      return;
    }
    
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      showAlert('Erro no Login', 'Email ou senha incorretos. Tente novamente.');
      setLoading(false);
      return;
    }
    // Sucesso é tratado pelo onAuthStateChange no App.js
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.loginIconContainer}>
        <MaterialCommunityIcons name="office-building" size={60} color={primaryColor} />
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
        <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Acessar Conta'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{alignSelf: 'center', marginTop: 15}}>
        <Text style={styles.linkText}>Esqueceu a senha?</Text>
      </TouchableOpacity>

      {/* Modal de Alerta */}
      <CustomAlert 
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

// --- Componente de Cadastro ---
const RegisterForm = ({ navigation }) => {
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  
  // Endereço
  const [cep, setCep] = useState(''); 
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [semNumero, setSemNumero] = useState(false);
  const [bairro, setBairro] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Estados do Alerta Bonito
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');

  const showAlert = (title, message, type = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleCnpjChange = (text) => setCnpj(formatCNPJ(text));
  const handlePhoneChange = (text) => setTelefone(formatPhone(text));

  const maskCEP = (text) => {
    let v = text.replace(/\D/g, "");
    v = v.substring(0, 8);
    if (v.length > 5) {
      v = v.replace(/^(\d{5})(\d)/, "$1-$2");
    }
    setCep(v);
  };

  const handleRegister = async () => {
    if (loading) return;
    
    // 1. Validação simples
    if (!email || !password || !razaoSocial || !cnpj || !rua || !bairro || !cep || (!numero && !semNumero)) {
        showAlert('Atenção', 'Por favor, preencha todos os campos obrigatórios, incluindo o CEP.', 'warning');
        return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      showAlert('Erro no Cadastro', authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
        showAlert('Erro', 'Não foi possível criar o usuário.');
        setLoading(false);
        return;
    }

    // Limpa máscaras
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    const telLimpo = telefone.replace(/\D/g, "");

    const { error: dbError } = await supabase
      .from('usuarios')
      .insert({ 
        usuario_id: authData.user.id,
        tipo_usuario: 'CNPJ', 
        cpf_cnpj: cnpjLimpo, 
        nome_razao_social: razaoSocial,
        email: email,
        telefone: telLimpo
      });

    if (dbError) {
      showAlert('Erro ao salvar dados', dbError.message);
      setLoading(false);
      return;
    }
    
    // Salva Endereço
    const { error: addrError } = await supabase
      .from('enderecos')
      .insert({
        usuario_id: authData.user.id,
        rua: rua, 
        numero: semNumero ? 'S/N' : numero,
        bairro: bairro,
        cep: cep,
        latitude: 0,
        longitude: 0,
        is_padrao: true
      });

    if (addrError) {
      showAlert('Erro ao salvar endereço', addrError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    
    // Alerta de Sucesso
    setAlertTitle('Sucesso!');
    setAlertMessage('Conta criada com sucesso! Você será redirecionado em instantes.');
    setAlertType('success');
    setAlertVisible(true);
  };

  const handleAlertClose = () => {
      setAlertVisible(false);
      // MUDANÇA PRINCIPAL AQUI:
      // Removemos o 'navigation.navigate("Welcome")'.
      // Agora, se o login for automático (padrão do Supabase em dev), o App.js vai perceber e trocar para a tela da Empresa.
      // Se não trocar, o usuário fecha o alerta e continua na tela (ou volta manualmente para logar).
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
        maxLength={16}
      />

      <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Endereço</Text>
      
      <Text style={styles.label}>CEP</Text>
      <TextInput
        style={styles.input}
        placeholder="00000-000"
        keyboardType="numeric"
        value={cep}
        onChangeText={maskCEP}
        maxLength={9}
      />

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
                value={semNumero ? 'S/N' : numero} 
                onChangeText={setNumero} 
                editable={!semNumero}
                keyboardType="numeric"
            />
        </View>
        
        <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => {
                setSemNumero(!semNumero);
                if (!semNumero) setNumero('');
            }}
        >
            <View style={[styles.checkboxBase, semNumero && styles.checkboxChecked]}>
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
        <Text style={styles.buttonText}>{loading ? 'Criando Conta...' : 'Cadastrar Empresa'}</Text>
      </TouchableOpacity>

      {/* Modal de Alerta */}
      <CustomAlert 
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={handleAlertClose}
      />
    </View>
  );
};

// --- Componente Reutilizável de Alerta Bonito ---
const CustomAlert = ({ visible, title, message, type, onClose }) => {
    let iconName = 'alert-circle';
    let color = '#D92D20'; // Vermelho (Erro)

    if (type === 'warning') {
        iconName = 'alert';
        color = '#F0B90B'; // Amarelo (Atenção)
    } else if (type === 'success') {
        iconName = 'check-circle';
        color = '#2ECC71'; // Verde (Sucesso)
    }

    return (
        <Modal transparent={true} visible={visible} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <MaterialCommunityIcons name={iconName} size={60} color={color} style={{marginBottom: 15}} />
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalMessage}>{message}</Text>
                    <TouchableOpacity 
                        style={[styles.modalButton, { backgroundColor: color }]} 
                        onPress={onClose}
                    >
                        <Text style={styles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
    padding: 20,
  },
  formContainer: {
    width: '100%',
  },
  loginIconContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 15,
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8, 
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#F0F0F0',
    color: '#999',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
    marginBottom: 5, 
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15, 
    marginTop: 5,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: primaryColor,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: primaryColor,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: primaryColor,
    fontWeight: '600',
    fontSize: 14,
  },
  
  // --- Estilos do Modal Bonito ---
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalContent: {
      width: '85%',
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 30,
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
  },
  modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
      textAlign: 'center',
  },
  modalMessage: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 25,
      lineHeight: 22,
  },
  modalButton: {
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 25,
      elevation: 2,
  },
  modalButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  }
});