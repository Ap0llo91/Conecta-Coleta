import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../utils/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';

// --- FUNÇÕES DE FORMATAÇÃO VISUAL ---
const formatDocument = (text) => {
  if (!text) return 'Sem documento';
  const cleaned = text.replace(/\D/g, '');
  
  if (cleaned.length <= 11) {
    // CPF: 123.456.789-00
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    // CNPJ: 12.345.678/0001-99
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
};

const formatPhone = (text) => {
  if (!text) return 'Telefone não informado';
  const cleaned = text.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
     // Celular: (81) 9 8888-8888
     return cleaned.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, '($1) $2 $3-$4');
  } else if (cleaned.length === 10) {
     // Fixo: (81) 3333-3333
     return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return text; // Retorna original se não casar com padrão
};

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [address, setAddress] = useState(null);
  const [userType, setUserType] = useState(null);

  // --- ATUALIZAÇÃO AUTOMÁTICA AO VOLTAR PARA A TELA ---
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Busca Perfil (Incluindo a foto_url)
      const { data: profileData, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setUserType(profileData.tipo_usuario);

      // 2. Busca Endereço
      const { data: addressData, error: addressError } = await supabase
        .from('enderecos')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('is_padrao', true)
        .maybeSingle();

      if (!addressError) {
        setAddress(addressData);
      }

    } catch (error) {
      console.log('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive',
        onPress: async () => {
            await supabase.auth.signOut();
            // O App.js vai detectar e jogar para o Welcome
        }
      }
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Conecta Coleta - O melhor app de gestão de resíduos de Recife!',
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  // Formatação de endereço
  const fullAddress = address 
    ? `${address.rua}, ${address.numero} - ${address.bairro}`
    : 'Endereço não cadastrado';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER AZUL --- */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
             <View /> 
             {/* Botão de Logout no topo */}
             <TouchableOpacity onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="rgba(255,255,255,0.8)" />
             </TouchableOpacity>
          </View>

          <View style={styles.profileHeaderContent}>
            {/* FOTO DO PERFIL */}
            <View style={styles.avatarContainer}>
              {profile?.foto_url ? (
                <Image 
                  source={{ uri: profile.foto_url }} 
                  style={styles.avatarImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#007BFF" />
                </View>
              )}
            </View>

            <View style={styles.profileTexts}>
              <Text style={styles.userName} numberOfLines={1}>
                {profile?.nome_razao_social || 'Usuário'}
              </Text>
              
              {/* CPF/CNPJ FORMATADO AQUI */}
              <Text style={styles.userId}>
                {formatDocument(profile?.cpf_cnpj)}
              </Text>
            </View>
          </View>
        </View>

        {/* --- CARTÃO DE INFORMAÇÕES --- */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informações de Contato</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText} numberOfLines={1}>{profile?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.infoIcon} />
            {/* TELEFONE FORMATADO AQUI */}
            <Text style={styles.infoText}>
              {formatPhone(profile?.telefone)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText} numberOfLines={2}>{fullAddress}</Text>
          </View>

          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Editar Informações</Text>
          </TouchableOpacity>
        </View>

        {/* --- MENUS --- */}
        <Text style={styles.sectionTitle}>MINHA CONTA</Text>

        <MenuOption 
          icon="time-outline" 
          title="Histórico" 
          subtitle="Seus pedidos e solicitações" 
          color="#007BFF"
          onPress={() => navigation.navigate('History')}
        />

        <MenuOption 
          icon="notifications-outline" 
          title="Notificações" 
          subtitle="Alertas e avisos" 
          color="#007BFF"
          onPress={() => navigation.navigate('Notifications')}
        />

        <MenuOption 
          icon="settings-outline" 
          title="Configurações" 
          subtitle="Preferências do aplicativo" 
          color="#007BFF"
          onPress={() => navigation.navigate('Settings')}
        />

        <Text style={styles.sectionTitle}>AJUDA E SUPORTE</Text>

        <MenuOption 
          icon="help-circle-outline" 
          title="Central de Ajuda" 
          subtitle="Perguntas frequentes" 
          color="#007BFF"
          onPress={() => navigation.navigate('FAQ')}
        />
        
        <MenuOption 
          icon="share-social-outline" 
          title="Compartilhar App" 
          subtitle="Convide amigos e vizinhos" 
          color="#007BFF"
          onPress={handleShare}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Componente de Opção de Menu
const MenuOption = ({ icon, title, subtitle, color, onPress }) => (
  <TouchableOpacity style={styles.menuOption} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#CCC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  scrollContent: { paddingBottom: 20 },

  // Header Azul
  header: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    paddingBottom: 40, // Espaço extra para o card sobrepor
    paddingTop: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  avatarImage: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  avatarPlaceholder: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTexts: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  userId: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  // Card de Informações (Sobreposto)
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -25, // Efeito de sobreposição
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 25,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
    width: 20, 
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#007BFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Menus
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 5,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconCircle: {
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
    fontWeight: '600',
    color: '#333',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});