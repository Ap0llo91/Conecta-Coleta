import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../utils/supabaseClient'; 
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';

const MenuItem = ({ icon, title, subtitle, onPress, badgeCount }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIconContainer, { backgroundColor: '#e6f2ff' }]}>
      {icon}
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    {badgeCount > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badgeCount}</Text>
      </View>
    )}
    <Ionicons name="chevron-forward" size={24} color="#ccc" />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [address, setAddress] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Função que carrega todos os dados
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Perfil
      const { data: profileData } = await supabase
        .from('usuarios')
        .select('nome_razao_social, cpf_cnpj, email') 
        .eq('usuario_id', user.id)
        .single(); 
      if (profileData) setProfile(profileData);

      // Endereço
      const { data: addressData } = await supabase
        .from('enderecos')
        .select('rua') 
        .eq('usuario_id', user.id)
        .eq('is_padrao', true) 
        .single(); 
      if (addressData) setAddress(addressData);

      // Notificações não lidas
      const { count } = await supabase
        .from('notificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .eq('lida', false);
      setNotificationCount(count || 0);
    }
    setLoading(false);
  };

  // Recarrega sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      "Sair da Conta",
      "Você tem certeza que quer sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Sair", 
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }
        }
      ]
    );
  };

  if (loading && !profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="person" size={24} color="#007BFF" />
        </View>
        <View>
          <Text style={styles.headerName}>{profile?.nome_razao_social || 'Usuário'}</Text>
          <Text style={styles.headerIdentifier}>{profile?.cpf_cnpj || '---'}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainContent}>
          {/* Card de Contato */}
          <View style={styles.contactCard}>
            <Text style={styles.cardTitle}>Informações de Contato</Text>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{profile?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.infoText}>(81) 99999-9999</Text> 
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{address?.rua || 'Endereço não cadastrado'}</Text>
            </View>
            
            {/* BOTÃO EDITAR - LIGADO À TELA DE EDIÇÃO */}
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.editButtonText}>Editar Informações</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Minha Conta</Text>
          
          <MenuItem
            icon={<Ionicons name="time-outline" size={20} color="#007BFF" />}
            title="Histórico"
            subtitle="Seus pedidos e solicitações"
            onPress={() => navigation.navigate('History')} 
          />
          
          <MenuItem
            icon={<Ionicons name="notifications-outline" size={20} color="#007BFF" />}
            title="Notificações"
            subtitle={notificationCount > 0 ? `${notificationCount} não lidas` : 'Nenhuma nova notificação'}
            onPress={() => navigation.navigate('Notifications')}
            badgeCount={notificationCount}
          />
          
          <MenuItem
            icon={<Ionicons name="settings-outline" size={20} color="#007BFF" />}
            title="Configurações"
            subtitle="Preferências do aplicativo"
            onPress={() => navigation.navigate('Settings')} 
          />

          <Text style={styles.sectionTitle}>Ajuda e Suporte</Text>
          <MenuItem
            icon={<Ionicons name="help-circle-outline" size={20} color="#007BFF" />}
            title="Central de Ajuda"
            subtitle="Perguntas frequentes"
            onPress={() => navigation.navigate('FAQ')}
          />
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#E74C3C" />
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Conecta Coleta v1.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#007BFF' }, 
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20, 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerIdentifier: { fontSize: 14, color: '#fff', opacity: 0.9 },
  scrollContainer: { flex: 1, backgroundColor: '#F0F2F5' }, 
  scrollContent: { padding: 20, flexGrow: 1 },
  mainContent: { flex: 1 },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 30,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoText: { fontSize: 15, color: '#333', marginLeft: 15, flex: 1 },
  editButton: { backgroundColor: '#e6f2ff', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  editButtonText: { color: '#007BFF', fontSize: 15, fontWeight: 'bold' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: 10, marginLeft: 10 },
  menuItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 15, alignItems: 'center', marginBottom: 10, elevation: 2 },
  menuIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  menuSubtitle: { fontSize: 14, color: '#666' },
  badge: { backgroundColor: '#E74C3C', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  logoutButton: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 18, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: '#E74C3C' },
  logoutButtonText: { flex: 1, fontSize: 16, color: '#E74C3C', marginLeft: 15, fontWeight: 'bold' },
  versionText: { textAlign: 'center', color: '#999', marginTop: 20, paddingBottom: 10 },
});