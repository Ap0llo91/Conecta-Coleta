import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../utils/supabaseClient';

const primaryRed = '#D32F2F'; 

const RESIDUO_TYPES = [
  'Resíduos biológicos (Grupo A)',
  'Resíduos químicos (Grupo B)',
  'Rejeitos radioativos (Grupo C)',
  'Resíduos comuns (Grupo D)',
  'Perfurocortantes (Grupo E)',
];

const FREQUENCY_TYPES = [
  'Coleta única',
  'Semanal',
  'Quinzenal',
  'Mensal',
];

export default function RequestHealthServiceScreen({ navigation }) {
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  
  const [volume, setVolume] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [selectedResiduo, setSelectedResiduo] = useState(RESIDUO_TYPES[0]);
  const [showResiduoPicker, setShowResiduoPicker] = useState(false);

  const [selectedFreq, setSelectedFreq] = useState(FREQUENCY_TYPES[0]);
  const [showFreqPicker, setShowFreqPicker] = useState(false);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- 1. Correção da Máscara de Telefone (Bug do traço e limite) ---
  const handlePhoneChange = (text) => {
    let v = text.replace(/\D/g, ""); // Remove tudo que não é número
    v = v.substring(0, 11); // Limita a 11 números

    // Lógica ajustada para não travar ao apagar
    if (v.length > 10) {
      // 11 dígitos (Celular): (XX) X XXXX-XXXX
      v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
    } else if (v.length > 6) { 
      // 7 a 10 dígitos: (XX) XXXX-XXXX
      // Só coloca o traço SE tiver mais de 6 números (evita o bug de não apagar o traço)
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (v.length > 2) {
      // 3 a 6 dígitos: (XX) XXXX...
      v = v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    } else {
      // 1 ou 2 dígitos: (XX...
      if (v.length > 0) {
        v = v.replace(/^(\d*)/, "($1");
      }
    }
    
    setTelefone(v);
  };

  // --- 2. Buscar Dados do Cadastro ---
  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('usuarios')
        .select('nome_razao_social, cpf_cnpj, telefone')
        .eq('usuario_id', user.id)
        .single();

      const { data: address } = await supabase
        .from('enderecos')
        .select('rua, numero, bairro')
        .eq('usuario_id', user.id)
        .eq('is_padrao', true)
        .maybeSingle();

      if (profile) {
        setRazaoSocial(profile.nome_razao_social || '');
        setCnpj(profile.cpf_cnpj || '');
        // Formata o telefone vindo do banco também
        if (profile.telefone) {
            let tel = profile.telefone.replace(/\D/g, "");
            if (tel.length > 10) {
                tel = tel.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
            } else if (tel.length > 5) {
                tel = tel.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
            } else if (tel.length > 2) {
                tel = tel.replace(/^(\d{2})(\d+)$/, "($1) $2");
            }
            setTelefone(tel);
        }
      }

      if (address) {
        const num = address.numero === 'S/N' ? 'S/N' : `${address.numero}`;
        setEndereco(`${address.rua}, ${num} - ${address.bairro}`);
      } else {
        setEndereco('Endereço não cadastrado');
      }

    } catch (error) {
      console.log('Erro ao carregar dados:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!volume || !responsavel || !telefone) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha volume, responsável e telefone.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('chamados').insert({
        usuario_id: user.id,
        tipo_chamado_id: 4, 
        descricao: `Resíduos de Saúde: ${selectedResiduo}. Freq: ${selectedFreq}. Vol: ${volume}kg. Obs: ${observacoes}. Resp: ${responsavel}, Tel: ${telefone}`,
        status: 'Em Análise',
        endereco_local: endereco, 
        foto_url: null
      });

      if (error) throw error;

      Alert.alert('Solicitação Enviada!', 'Nossa equipe entrará em contato para agendar a coleta.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar solicitação: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const CustomPicker = ({ visible, onClose, options, onSelect, title }) => (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.modalItem} 
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryRed} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Resíduos de Saúde</Text>
        <Text style={styles.headerSubtitle}>Coleta especializada e regulamentada</Text>
      </SafeAreaView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
          
          {/* CAMPOS TRAVADOS (AUTO-COMPLETE) - FUNDO CINZA */}
          <Text style={styles.label}>Razão Social</Text>
          <View style={styles.inputDisabledContainer}>
            <Text style={styles.inputDisabledText}>{razaoSocial}</Text>
            <Ionicons name="lock-closed-outline" size={16} color="#888" />
          </View>

          <Text style={styles.label}>CNPJ</Text>
          <View style={styles.inputDisabledContainer}>
            <Text style={styles.inputDisabledText}>{cnpj}</Text>
            <Ionicons name="lock-closed-outline" size={16} color="#888" />
          </View>

          <Text style={styles.label}>Endereço de Coleta</Text>
          <View style={styles.inputDisabledContainer}>
            <Text style={styles.inputDisabledText}>{endereco}</Text>
            <Ionicons name="lock-closed-outline" size={16} color="#888" />
          </View>

          {/* CAMPOS EDITÁVEIS - FUNDO BRANCO */}
          
          <Text style={styles.label}>Tipo de Resíduo</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowResiduoPicker(true)}>
            <Text style={styles.dropdownText}>{selectedResiduo}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Text style={styles.label}>Volume Estimado (kg)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: 50" 
            keyboardType="numeric"
            value={volume}
            onChangeText={setVolume}
          />

          <Text style={styles.label}>Frequência Desejada</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowFreqPicker(true)}>
            <Text style={styles.dropdownText}>{selectedFreq}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Text style={styles.label}>Responsável Técnico</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nome do responsável" 
            value={responsavel}
            onChangeText={setResponsavel}
          />

          <Text style={styles.label}>Telefone de Contato</Text>
          <TextInput 
            style={styles.input} 
            placeholder="(00) 00000-0000" 
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={handlePhoneChange} 
            maxLength={16} // Garante que o formato (11) 9 1234-5678 caiba
          />

          <Text style={styles.label}>Observações</Text>
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
            placeholder="Informações adicionais sobre os resíduos" 
            multiline
            numberOfLines={3}
            value={observacoes}
            onChangeText={setObservacoes}
          />

          <View style={styles.warningBox}>
            <MaterialCommunityIcons name="biohazard" size={24} color={primaryRed} style={{marginRight: 10}} />
            <Text style={styles.warningText}>
              Serviço regulamentado pela ANVISA. Certificado de destinação final será fornecido após a coleta.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Solicitar Coleta</Text>
            )}
          </TouchableOpacity>

          <View style={{height: 30}} />
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomPicker 
        visible={showResiduoPicker} 
        onClose={() => setShowResiduoPicker(false)} 
        options={RESIDUO_TYPES} 
        onSelect={setSelectedResiduo}
        title="Selecione o Tipo de Resíduo"
      />
      <CustomPicker 
        visible={showFreqPicker} 
        onClose={() => setShowFreqPicker(false)} 
        options={FREQUENCY_TYPES} 
        onSelect={setSelectedFreq}
        title="Selecione a Frequência"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: primaryRed,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: 'white', fontSize: 16, marginLeft: 5, fontWeight: '500' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },

  content: { flex: 1 },

  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 6, marginTop: 15 },
  
  // ESTILO PARA CAMPOS BLOQUEADOS (CINZA ESCURO)
  inputDisabledContainer: {
    backgroundColor: '#E0E0E0', // Cor cinza para o fundo
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D0D0D0', // Borda cinza
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  inputDisabledText: { color: '#555', fontSize: 15 },

  // ESTILO PARA CAMPOS EDITÁVEIS (BRANCO PURO)
  input: {
    backgroundColor: '#FFFFFF', // Fundo BRANCO
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#CCCCCC', // Borda mais suave
    elevation: 1, // Leve sombra para destacar o branco
  },

  dropdown: {
    backgroundColor: '#FFFFFF', // Dropdown também branco
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  dropdownText: { fontSize: 15, color: '#333' },

  warningBox: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  warningText: { color: '#C62828', fontSize: 13, flex: 1, lineHeight: 18 },

  submitButton: {
    backgroundColor: primaryRed,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  modalItemText: { fontSize: 16, color: '#333' },
});