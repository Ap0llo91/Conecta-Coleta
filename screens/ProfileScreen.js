// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../utils/supabaseClient'; 
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Componente para os itens do menu (Histórico, Notificações, etc.)
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
  const [loading, setLoading] = useState(true);

  // Busca os dados do usuário e endereço quando a tela carrega
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Pega os dados da nossa tabela 'usuarios'
        const { data: profileData, error: profileError } = await supabase
          .from('usuarios')
          .select('nome_razao_social, cpf_cnpj, email') 
          .eq('usuario_id', user.id)
          .single(); 

        if (profileError) console.error('Erro ao buscar perfil:', profileError.message);
        else setProfile(profileData);

        // Pega o endereço padrão da tabela 'enderecos'
        const { data: addressData, error: addressError } = await supabase
          .from('enderecos')
          .select('rua') 
          .eq('usuario_id', user.id)
          .eq('is_padrao', true) 
          .single(); 

        if (addressError) console.error('Erro ao buscar endereço:', addressError.message);
        else setAddress(addressData);
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  // Função de Logout
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
            const { error } = await supabase.auth.signOut();
            if (error) Alert.alert('Erro ao sair', error.message);
          }
        }
      ]
    );
  };

  // Loader
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' }}>
        <Text>Carregando Perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Cabeçalho Azul */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="person" size={24} color="#007BFF" />
        </View>
        <View>
          <Text style={styles.headerName}>{profile?.nome_razao_social || 'Nome não encontrado'}</Text>
          <Text style={styles.headerIdentifier}>{profile?.cpf_cnpj || '---'}</Text>
        </View>
      </View>

      {/* O ScrollView agora começa ABAIXO do header */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* View principal para empurrar o 'versionText' para baixo */}
        <View style={styles.mainContent}>
          {/* Card de Informações de Contato */}
          <View style={styles.contactCard}>
            <Text style={styles.cardTitle}>Informações de Contato</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{profile?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.infoText}>(81) 99999-9999</Text> {/* Placeholder */}
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{address?.rua || 'Endereço não cadastrado'}</Text>
            </View>

            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Editar Informações</Text>
            </TouchableOpacity>
          </View>

          {/* Seção Minha Conta */}
          <Text style={styles.sectionTitle}>Minha Conta</Text>
          <MenuItem
            icon={<Ionicons name="time-outline" size={20} color="#007BFF" />}
            title="Histórico"
            subtitle="Seus pedidos e solicitações"
            onPress={() => {}}
          />
          <MenuItem
            icon={<Ionicons name="notifications-outline" size={20} color="#007BFF" />}
            title="Notificações"
            subtitle="3 notificações não lidas"
            onPress={() => {}}
            badgeCount={3}
          />
          <MenuItem
            icon={<Ionicons name="settings-outline" size={20} color="#007BFF" />}
            title="Configurações"
            subtitle="Preferências do aplicativo"
            onPress={() => {}}
          />

          {/* Seção Ajuda e Suporte */}
          <Text style={styles.sectionTitle}>Ajuda e Suporte</Text>
          <MenuItem
            icon={<Ionicons name="help-circle-outline" size={20} color="#007BFF" />}
            title="Central de Ajuda"
            subtitle="Perguntas frequentes"
            onPress={() => {}}
          />
          <MenuItem
            icon={<Ionicons name="document-text-outline" size={20} color="#007BFF" />}
            title="Termos e Privacidade"
            subtitle="Políticas do aplicativo"
            onPress={() => {}}
          />

          {/* Botão Sair */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#E74C3C" />
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        {/* Versão */}
        <Text style={styles.versionText}>Conecta Coleta v1.0.0</Text>

      </ScrollView>
    </View>
  );
}

// --- Estilos Corrigidos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Fundo cinza claro
  },
  header: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 30, // Reduzido
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF', // Header azul
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
  headerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerIdentifier: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  scrollContainer: {
    flex: 1, 
    // Removemos o marginTop negativo
  },
  scrollContent: {
    padding: 20, 
    flexGrow: 1, // <--- Faz o conteúdo esticar para preencher o espaço
  },
  mainContent: {
    flex: 1, // <--- Esta View ocupa todo o espaço, empurrando "versionText" para baixo
  },
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 15,
    flex: 1, 
  },
  editButton: {
    backgroundColor: '#e6f2ff', 
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#007BFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 10,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  badge: {
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  logoutButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#E74C3C',
    marginLeft: 15,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20, // Garante espaço
    paddingBottom: 10, // Garante que não cole na barra de abas
  },
});