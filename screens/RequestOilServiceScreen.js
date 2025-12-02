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
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../utils/supabaseClient';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  
  // --- MUDANÇA: Lógica de Data ---
  const [dataDesejada, setDataDesejada] = useState('');
  const [date, setDate] = useState(new Date()); 
  const [showDatePicker, setShowDatePicker] = useState(false); 

  const [telefone, setTelefone] = useState('');

  const [selectedOil, setSelectedOil] = useState(OIL_TYPES[0]);
  const [showOilPicker, setShowOilPicker] = useState(false);

  const [selectedStorage, setSelectedStorage] = useState(STORAGE_TYPES[0]);
  const [showStoragePicker, setShowStoragePicker] = useState(false);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados do Alerta Bonito
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('warning');

  // --- Função Auxiliar de Alerta ---
  const showAlert = (title, message, type = 'warning') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  // --- NOVA FUNÇÃO DE DATA (CALENDÁRIO) ---
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);

    if (selectedDate) {
        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear();
        setDataDesejada(`${day}/${month}/${year}`);
    }
  };

  // --- Formatação de Documento (CNPJ) ---
  const formatDocument = (text) => {
    if (!text) return "";
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 11) {
        return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    return text;
  };

  // --- MÁSCARA DE TELEFONE ---
  const handlePhoneChange = (text) => {
    let v = text.replace(/\D/g, "");
    v = v.substring(0, 11);

    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
    } else if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    } else {
      if (v.length > 0) {
          v = v.replace(/^(\d*)/, "($1");
      }
    }
    setTelefone(v);
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

      // Busca o endereço mais recente
      const { data: address } = await supabase
        .from('enderecos')
        .select('rua, numero, bairro')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (profile) {
        setNomeEstabelecimento(profile.nome_razao_social || '');
        setCnpj(formatDocument(profile.cpf_cnpj || ''));
        
        if (profile.telefone) {
            let tel = profile.telefone.replace(/\D/g, "");
            if (tel.length > 10) tel = tel.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
            else if (tel.length > 5) tel = tel.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
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
      showAlert('Campos obrigatórios', 'Preencha volume, data e telefone.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('chamados').insert({
        usuario_id: user.id,
        tipo_problema: 'Coleta de Óleo',
        descricao: `Coleta de Óleo/Gordura. Tipo: ${selectedOil}. Armazenamento: ${selectedStorage}. Vol: ${volume}L. Data: ${dataDesejada}. Tel: ${telefone}`,
        status: 'Pendente',
        endereco_local: endereco, 
      });

      if (error) throw error;

      showAlert('Agendamento Realizado!', 'Sua solicitação de coleta de óleo foi enviada com sucesso.', 'success');

    } catch (error) {
      console.log('Erro envio:', error);
      showAlert('Erro', 'Falha ao agendar: ' + error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAlertClose = () => {
      setAlertVisible(false);
      if (alertType === 'success') {
          navigation.goBack();
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

  // --- Componente de Alerta ---
  const CustomAlert = ({ visible, title, message, type, onClose }) => {
    let iconName = 'alert-circle';
    let color = '#D32F2F';

    if (type === 'warning') {
        iconName = 'alert';
        color = '#FFA000';
    } else if (type === 'success') {
        iconName = 'check-circle';
        color = '#388E3C';
    }

    return (
        <Modal transparent={true} visible={visible} animationType="fade">
            <View style={styles.alertOverlay}>
                <View style={styles.alertContent}>
                    <MaterialCommunityIcons name={iconName} size={60} color={color} style={{marginBottom: 15}} />
                    <Text style={styles.alertTitle}>{title}</Text>
                    <Text style={styles.alertMessage}>{message}</Text>
                    <TouchableOpacity 
                        style={[styles.alertButton, { backgroundColor: color }]} 
                        onPress={onClose}
                    >
                        <Text style={styles.alertButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
  };

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

          {/* --- CAMPO DE DATA INTELIGENTE --- */}
          <Text style={styles.label}>Data Desejada</Text>
          <TouchableOpacity 
            style={styles.input} 
            onPress={() => setShowDatePicker(true)}
          >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <Text style={dataDesejada ? { fontSize: 15, color: '#333' } : { fontSize: 15, color: '#999' }}>
                    {dataDesejada || "dd/mm/aaaa"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={onChangeDate}
            />
          )}

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

      <CustomAlert 
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={handleAlertClose}
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

  // Estilos do Modal de Picker
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  modalItemText: { fontSize: 16, color: '#333' },

  // Estilos do Alerta
  alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  alertContent: {
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
  alertTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
      textAlign: 'center',
  },
  alertMessage: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 25,
      lineHeight: 22,
  },
  alertButton: {
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 25,
      elevation: 2,
  },
  alertButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  }
});