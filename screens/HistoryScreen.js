import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../utils/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';

const HistoryScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chamados')
        .select(`*, chamadotipos ( nome_servico )`)
        .eq('usuario_id', user.id)
        .order('data_criacao', { ascending: false });

      if (!error) setReports(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'RESOLVIDO': return { bg: 'black', text: 'Resolvido', color: 'white' };
      case 'CANCELADO': return { bg: '#EEE', text: 'Cancelado', color: '#666' };
      default: return { bg: '#E6F2FF', text: 'Em análise', color: '#0056b3' };
    }
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    const serviceName = item.chamadotipos?.nome_servico || 'Solicitação';
    
    // CORREÇÃO: Usando 'chamado_id' em vez de 'id'
    // Se o ID existir, converte para string e pega os 4 primeiros chars
    const idParaMostrar = item.chamado_id 
      ? item.chamado_id.toString().substring(0, 4).toUpperCase() 
      : '---';

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('RequestDetails', { report: item })}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="clock-time-four-outline" size={24} color="#007BFF" />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.serviceTitle}>{serviceName}</Text>
              <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.badgeText, { color: statusStyle.color }]}>{statusStyle.text}</Text>
              </View>
            </View>
            <Text style={styles.addressText} numberOfLines={1}>
              {item.descricao_usuario || 'Sem descrição'}
            </Text>
            <Text style={styles.metaText}>
              ID: #{idParaMostrar}  •  {formatDate(item.data_criacao)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" style={{ alignSelf: 'center' }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Reportes</Text>
      </View>
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>{reports.length} reportes realizados</Text>
      </View>

      {loading ? (
        <View style={{flex: 1, justifyContent:'center'}}><ActivityIndicator size="large" color="#007BFF" /></View>
      ) : (
        <FlatList
          data={reports}
          // CORREÇÃO: Usando 'chamado_id' como chave única
          keyExtractor={(item, index) => (item.chamado_id ? item.chamado_id.toString() : index.toString())}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="file-document-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>Nenhum pedido realizado ainda.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  subHeader: { padding: 20, paddingBottom: 10 },
  subHeaderText: { fontSize: 14, color: '#666' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 15, padding: 15, borderWidth: 1, borderColor: '#EEE', elevation: 2 },
  cardContent: { flexDirection: 'row', alignItems: 'flex-start' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  textContainer: { flex: 1, marginRight: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  serviceTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  addressText: { fontSize: 14, color: '#666', marginBottom: 8 },
  metaText: { fontSize: 12, color: '#999' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: '#999', fontSize: 16 },
});

export default HistoryScreen;