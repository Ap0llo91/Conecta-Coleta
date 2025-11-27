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

const primaryOrange = '#E65100';

const OIL_TYPES = [
  'Óleo vegetal (soja, girassol, etc.)',
  'Gordura animal',
  'Misto (Óleo e Gordura)',
];

const STORAGE_TYPES = [
  'Recipientes plásticos (bombonas)',
  'Barris metálicos',
  'Galões',
  'Garrafas PET',
  'Tanque estacionário'
];

export default function RequestOilServiceScreen({ navigation }) {
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  
  const [volume, setVolume] = useState('');
  const [dataDesejada, setDataDesejada] = useState('');
  const [telefone, setTelefone] = useState('');

  const [selectedOil, setSelectedOil] = useState(OIL_TYPES[0]);
  const [showOilPicker, setShowOilPicker] = useState(false);

  const [selectedStorage, setSelectedStorage] = useState(STORAGE_TYPES[0]);
  const [showStoragePicker, setShowStoragePicker] = useState(false);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- MÁSCARA DE TELEFONE CORRIGIDA (SEM TRAÇO FANTASMA) ---
  const handlePhoneChange = (text) => {
    let v = text.replace(/\D/g, ""); // Limpa tudo que não é número
    v = v.substring(0, 11); // Limite de 11 dígitos

    if (v.length > 10) {
      // Celular com 9 dígitos: (XX) 9 XXXX-XXXX
      v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
    } else if (v.length > 6) {
      // Fixo ou Celular incompleto: (XX) XXXX-XXXX
      // CORREÇÃO: Só adiciona o traço se tiver mais de 6 dígitos (o 7º dígito empurra o traço)
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (v.length > 2) {
      // Apenas DDD + Prefixo: (XX) XXXX
      v = v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    } else {
      // Apenas DDD: (XX
      if (v.length > 0) {
          v = v.replace(/^(\d*)/, "($1");
      }
    }
    setTelefone(v);
  };

  const handleDateChange = (text) => {
    let v = text.replace(/\D/g, "");
    if (v.length > 8) v = v.substring(0, 8); 
    if (v.length >= 5) {
        v = v.replace(/^(\d{2})(\d{2})(\d{1,4})$/, "$1/$2/$3");
    } else if (v.length >= 3) {
        v = v.replace(/^(\d{2})(\d{1,2})$/, "$1/$2");
    }
    setDataDesejada(v);
  };

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
        setNomeEstabelecimento(profile.nome_razao_social || '');
        setCnpj(profile.cpf_cnpj || '');
        if (profile.telefone) {
            let tel = profile.telefone.replace(/\D/g, "");
            // Aplica formatação inicial
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
    if (!volume || !dataDesejada || !telefone) {
      Alert.alert('Campos obrigatórios', 'Preencha volume, data e telefone.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('chamados').insert({
        usuario_id: user.id,
        tipo_chamado_id: 5, 
        descricao: `Coleta de Óleo/Gordura. Tipo: ${selectedOil}. Armazenamento: ${selectedStorage}. Vol: ${volume}L. Data: ${dataDesejada}. Tel: ${telefone}`,
        status: 'Em Análise',
        endereco_local: endereco, 
        foto_url: null
      });

      if (error) throw error;

      Alert.alert('Agendamento Realizado!', 'Sua solicitação de coleta de óleo foi enviada com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      Alert.alert('Erro', 'Falha ao agendar: ' + error.message);
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
        <ActivityIndicator size="large" color={primaryOrange} />
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
        <Text style={styles.headerTitle}>Óleos e Gorduras</Text>
        <Text style={styles.headerSubtitle}>Coleta para reciclagem e biodiesel</Text>
      </SafeAreaView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
          
          <Text style={styles.label}>Nome do Estabelecimento</Text>
          <View style={styles.inputDisabledContainer}>
            <Text style={styles.inputDisabledText}>{nomeEstabelecimento}</Text>
            <Ionicons name="lock-closed-outline" size={16} color="#888" />
          </View>

          <Text style={styles.label}>CNPJ</Text>
          <View style={styles.inputDisabledContainer}>
            <Text style={styles.inputDisabledText}>{cnpj}</Text>
            <Ionicons name="lock-closed-outline" size={16} color="#888" />
          </View>

          <Text style={styles.label}>Endereço</Text>
          <View style={styles.inputDisabledContainer}>
            <Text style={styles.inputDisabledText}>{endereco}</Text>
            <Ionicons name="lock-closed-outline" size={16} color="#888" />
          </View>

          <Text style={styles.label}>Volume Mensal Estimado (litros)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: 100" 
            keyboardType="numeric"
            value={volume}
            onChangeText={setVolume}
          />

          <Text style={styles.label}>Tipo de Óleo</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowOilPicker(true)}>
            <Text style={styles.dropdownText}>{selectedOil}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Text style={styles.label}>Forma de Armazenamento</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowStoragePicker(true)}>
            <Text style={styles.dropdownText}>{selectedStorage}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Text style={styles.label}>Data Desejada</Text>
          <TextInput 
            style={styles.input} 
            placeholder="dd/mm/aaaa" 
            keyboardType="numeric"
            value={dataDesejada}
            onChangeText={handleDateChange}
            maxLength={10}
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput 
            style={styles.input} 
            placeholder="(00) 00000-0000" 
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={handlePhoneChange}
            maxLength={16} 
          />

          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="water-outline" size={24} color="#E65100" style={{marginRight: 10}} />
            <View style={{flex: 1}}>
              <Text style={styles.infoText}>
                O óleo será transformado em biodiesel e outros produtos.
              </Text>
              <Text style={[styles.infoText, {marginTop: 5, fontSize: 12, color: '#8D6E63'}]}>
                Contribua com o meio ambiente e evite entupimentos na rede de esgoto.
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Agendar Coleta</Text>
            )}
          </TouchableOpacity>

          <View style={{height: 30}} />
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomPicker 
        visible={showOilPicker} 
        onClose={() => setShowOilPicker(false)} 
        options={OIL_TYPES} 
        onSelect={setSelectedOil}
        title="Tipo de Óleo"
      />
      <CustomPicker 
        visible={showStoragePicker} 
        onClose={() => setShowStoragePicker(false)} 
        options={STORAGE_TYPES} 
        onSelect={setSelectedStorage}
        title="Armazenamento"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: primaryOrange,
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
  
  inputDisabledContainer: {
    backgroundColor: '#E0E0E0', 
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  inputDisabledText: { color: '#555', fontSize: 15 },

  input: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    elevation: 1,
  },

  dropdown: {
    backgroundColor: '#FFFFFF', 
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

  infoBox: {
    backgroundColor: '#FFF3E0', 
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  infoText: { color: '#E65100', fontSize: 13, lineHeight: 18, fontWeight: '500' },

  submitButton: {
    backgroundColor: primaryOrange,
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