import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const RequestUncollectedScreen = ({ navigation }) => {
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  // Estados do Formulário
  const [endereco, setEndereco] = useState('');
  const [tipoLixo, setTipoLixo] = useState('');
  const [dataColeta, setDataColeta] = useState('');
  const [horario, setHorario] = useState('');
  const [descricao, setDescricao] = useState('');

  // Estado para o Modal de Tipo de Lixo
  const [modalVisible, setModalVisible] = useState(false);

  // Opções do Dropdown (Baseado no seu Figma)
  const tiposDeLixo = [
    "Lixo doméstico",
    "Lixo reciclável",
    "Resíduo orgânico"
  ];

  // Função de Localização
  const handleGetLocation = async () => {
    if (loadingLocation) return;

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Não podemos pegar sua localização sem permissão.');
      return;
    }

    setLoadingLocation(true);
    try {
      let location = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync(location.coords);
      
      if (geocode.length > 0) {
        const g = geocode[0];
        const addressFormatted = `${g.street || ''}, ${g.streetNumber || ''}, ${g.subregion || ''}`;
        setEndereco(addressFormatted);
      } else {
        Alert.alert('Erro', 'Não foi possível encontrar o endereço.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao obter localização.');
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho Vermelho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lixo Não Coletado</Text>
        <Text style={styles.headerSubtitle}>Reporte lixo que não foi coletado</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Campo de Localização com GPS */}
        <Text style={styles.label}>Localização</Text>
        <View style={styles.addressContainer}>
          <TextInput 
            style={styles.inputAddress} 
            placeholder="Rua, número" 
            value={endereco} 
            onChangeText={setEndereco} 
          />
          <TouchableOpacity onPress={handleGetLocation} disabled={loadingLocation}>
            {loadingLocation ? (
              <ActivityIndicator size="small" color="#D92D20" />
            ) : (
              <Ionicons name="location-outline" size={24} color="#D92D20" />
            )}
          </TouchableOpacity>
        </View>

        {/* Dropdown Tipo de Lixo */}
        <Text style={styles.label}>Tipo de Lixo</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setModalVisible(true)}>
          <Text style={tipoLixo ? styles.inputText : styles.placeholderText}>
            {tipoLixo || "Selecione o tipo"}
          </Text>
          <Ionicons name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>Data da Coleta Prevista</Text>
        <TextInput 
          style={styles.input} 
          placeholder="dd/mm/aaaa" 
          value={dataColeta} 
          onChangeText={setDataColeta} 
        />

        <Text style={styles.label}>Horário que foi exposto</Text>
        <TextInput 
          style={styles.input} 
          placeholder="--:--" 
          value={horario} 
          onChangeText={setHorario} 
        />

        <Text style={styles.label}>Descrição da Situação</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Descreva o problema: quantidade de lixo, há quanto tempo está exposto, etc." 
          multiline 
          numberOfLines={4}
          value={descricao} 
          onChangeText={setDescricao} 
        />

        {/* Placeholder de Foto */}
        <Text style={styles.label}>Foto do Local (opcional)</Text>
        <TouchableOpacity style={styles.photoBox} onPress={() => console.log("Abrir Câmera")}>
           {/* Pode-se adicionar lógica de câmera aqui no futuro */}
           <Text style={styles.photoText}>Clique para adicionar foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={() => console.log('Enviando solicitação...')}>
          <Text style={styles.submitButtonText}>Enviar Solicitação</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} /> 
      </ScrollView>

      {/* Modal de Seleção */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tipo de Lixo</Text>
            {tiposDeLixo.map((tipo, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.modalItem} 
                onPress={() => {
                  setTipoLixo(tipo);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{tipo}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: {
    backgroundColor: '#D92D20', // Vermelho igual ao Figma
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backText: { color: 'white', fontSize: 16, marginLeft: 5 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 12 },
  
  input: {
    backgroundColor: '#EEE',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressContainer: {
    flexDirection: "row",
    backgroundColor: "#EEE",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  inputAddress: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#333' },
  
  dropdown: {
    backgroundColor: '#EEE',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputText: { fontSize: 16, color: '#333' },
  placeholderText: { fontSize: 16, color: '#999' },
  textArea: { height: 100, textAlignVertical: 'top' },

  // Box da Foto
  photoBox: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 10,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  photoText: { color: '#aaa', fontSize: 14 },

  submitButton: {
    backgroundColor: '#D92D20', // Vermelho
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // Modal
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalItemText: { fontSize: 16, color: '#333' },
  modalCloseButton: { marginTop: 20, padding: 15, alignItems: 'center', backgroundColor: '#EEE', borderRadius: 10 },
  modalCloseText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
});

export default RequestUncollectedScreen;