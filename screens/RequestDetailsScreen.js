import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Platform, 
  Modal, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../utils/supabaseClient';

const RequestDetailsScreen = ({ navigation, route }) => {
  const { report } = route.params;
  const [canceling, setCanceling] = useState(false);
  
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // --- MAPEAMENTO DE DADOS ---
  const titulo = report.tipo_problema || report.chamadotipos?.nome_servico || 'Solicitação';
  const descricao = report.descricao || report.descricao_usuario || 'Sem descrição informada.';
  const endereco = report.endereco_local || 'Endereço não registrado';
  const dataRaw = report.created_at || report.data_criacao;
  
  const idReal = report.chamado_id || report.id;
  const protocolo = idReal ? idReal.toString().substring(0, 8).toUpperCase() : '---';

  const status = report.status || 'Pendente';
  const foto = report.foto_url;

  const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (st) => {
    const s = st ? st.toUpperCase() : '';
    if (s === 'RESOLVIDO' || s === 'CONCLUÍDO' || s === 'FINALIZADO') return '#2ECC71';
    if (s === 'CANCELADO') return '#999';
    return '#F0B90B';
  };

  const getStatusIcon = (st) => {
    const s = st ? st.toUpperCase() : '';
    if (s === 'CANCELADO') return "close-circle-outline";
    if (s === 'FINALIZADO' || s === 'RESOLVIDO') return "checkbox-marked-circle-outline";
    return "clock-time-four-outline";
  };

  // --- AÇÕES ---
  const handleCancelPress = () => {
    setConfirmModalVisible(true);
  };

  const performCancel = async () => {
    setConfirmModalVisible(false); 
    setCanceling(true);

    try {
        const idToUpdate = report.chamado_id || report.id;
        // Tenta adivinhar a coluna PK. Se sua tabela usa 'chamado_id', perfeito.
        // Se der erro, verifique se a PK é 'id'.
        const pkColumn = report.chamado_id ? 'chamado_id' : 'id';

        const { error } = await supabase
          .from('chamados')
          .update({ status: 'Cancelado' })
          .eq(pkColumn, idToUpdate);

        if (error) throw error;

        setSuccessModalVisible(true);

    } catch (error) {
        console.log("Erro ao cancelar:", error);
        alert("Não foi possível cancelar. Tente novamente.");
    } finally {
        setCanceling(false);
    }
  };

  const handleCloseSuccess = () => {
      setSuccessModalVisible(false);
      navigation.goBack();
  };

  const isCancelable = status.toUpperCase() !== 'CANCELADO' && status.toUpperCase() !== 'FINALIZADO' && status.toUpperCase() !== 'RESOLVIDO';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Pedido</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(status) }]}>
          <MaterialCommunityIcons name={getStatusIcon(status)} size={28} color="white" />
          <Text style={styles.statusText}>{status}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Tipo de Serviço</Text>
            <Text style={styles.value}>{titulo}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoBlock}>
            <Text style={styles.label}>Data da Solicitação</Text>
            <Text style={styles.value}>{formatDate(dataRaw)}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoBlock}>
            <Text style={styles.label}>Endereço / Local</Text>
            <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <Ionicons name="location-outline" size={18} color="#666" style={{marginRight: 5, marginTop: 2}}/>
                <Text style={[styles.value, {flex: 1}]}>{endereco}</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoBlock}>
            <Text style={styles.label}>Descrição e Detalhes</Text>
            <Text style={styles.descriptionText}>{descricao}</Text>
          </View>

          {foto && (
            <View style={styles.photoContainer}>
                <Text style={styles.label}>Foto Anexada</Text>
                <Image 
                    source={{ uri: foto }} 
                    style={styles.attachedPhoto} 
                    resizeMode="cover" 
                />
            </View>
          )}

          <View style={styles.divider} />
          
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Protocolo</Text>
            <Text style={styles.protocolText}>#{protocolo}</Text>
          </View>
        </View>

        {isCancelable && (
            <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancelPress}
                disabled={canceling}
            >
                {canceling ? (
                    <ActivityIndicator color="#D32F2F" />
                ) : (
                    <Text style={styles.cancelButtonText}>Cancelar Solicitação</Text>
                )}
            </TouchableOpacity>
        )}

        <View style={{height: 30}} />
      </ScrollView>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFEBEE' }]}>
               <Ionicons name="alert-circle" size={40} color="#D32F2F" />
            </View>
            
            <Text style={styles.modalTitle}>Cancelar Pedido?</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja cancelar esta solicitação? Esta ação não pode ser desfeita.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.btnSecondary]} 
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.btnSecondaryText}>Não, Voltar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, styles.btnDestructive]} 
                onPress={performCancel}
              >
                <Text style={styles.btnDestructiveText}>Sim, Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL DE SUCESSO (CORRIGIDO) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={handleCloseSuccess}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
               <Ionicons name="checkmark-circle" size={40} color="#2ECC71" />
            </View>
            
            <Text style={styles.modalTitle}>Solicitação Cancelada</Text>
            <Text style={styles.modalMessage}>
              O status do seu pedido foi atualizado para cancelado com sucesso.
            </Text>
            
            {/* Botão OK com estilo dedicado */}
            <TouchableOpacity 
              style={styles.btnSuccess} 
              onPress={handleCloseSuccess}
            >
              <Text style={styles.btnSuccessText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  content: { padding: 20 },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 20,
  },
  infoBlock: { marginBottom: 15 },
  label: { fontSize: 12, color: '#999', textTransform: 'uppercase', marginBottom: 5, fontWeight: '600' },
  value: { fontSize: 16, color: '#333', fontWeight: '500' },
  descriptionText: { fontSize: 15, color: '#444', lineHeight: 22, backgroundColor: '#F9F9F9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#EEE' },
  photoContainer: { marginTop: 10, marginBottom: 15 },
  attachedPhoto: { width: '100%', height: 220, borderRadius: 12, marginTop: 8, backgroundColor: '#EEE' },
  protocolText: { fontSize: 16, color: '#555', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 15 },

  cancelButton: {
      backgroundColor: '#FFEBEE',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#FFCDD2',
      marginBottom: 20
  },
  cancelButtonText: {
      color: '#D32F2F',
      fontWeight: 'bold',
      fontSize: 16
  },

  // --- ESTILOS DOS MODAIS ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    alignItems: 'center',
    elevation: 10,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  btnSecondary: {
    backgroundColor: '#F5F5F5',
  },
  btnSecondaryText: {
    color: '#555',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnDestructive: {
    backgroundColor: '#D32F2F',
  },
  btnDestructiveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // ESTILO NOVO E CORRIGIDO PARA O BOTÃO DE SUCESSO
  btnSuccess: {
    backgroundColor: '#007BFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },
  btnSuccessText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RequestDetailsScreen;