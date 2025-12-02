import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; 
import { supabase } from '../utils/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';

// Cor Principal da Empresa (Amarelo/Laranja)
const primaryYellow = '#F0B90B';

export default function CompanyHomeScreen({ navigation }) {
  const [companyName, setCompanyName] = useState('Carregando...');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 1. Busca Nome E FOTO da Empresa
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('nome_razao_social, foto_url') // <--- foto_url
          .eq('usuario_id', user.id)
          .single();

        if (userData) {
          setCompanyName(userData.nome_razao_social);
          setPhotoUrl(userData.foto_url); // <--- SALVA A FOTO
        }

        // 2. Busca Contagem de Chamados
        const { count: concluidos } = await supabase
          .from('chamados')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', user.id)
          .in('status', ['finalizado', 'FINALIZADO', 'Finalizado', 'Concluído']); 

        const { count: pendentes } = await supabase
          .from('chamados')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', user.id)
          .in('status', ['pendente', 'PENDENTE', 'Pendente', 'Em Análise']);

        setCompletedCount(concluidos || 0);
        setPendingCount(pendentes || 0);
      }
    } catch (error) {
      console.log('Erro ao buscar dados do dashboard:', error);
      setCompanyName('Empresa');
    } finally {
      setLoading(false);
    }
  };

  // --- Componentes Auxiliares Internos ---

  const ActionCard = ({ title, description, icon, color, iconLib, onPress }) => {
    const IconLibrary = iconLib === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}> 
          <IconLibrary name={icon} size={28} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#CCC" />
      </TouchableOpacity>
    );
  };

  const StatusCard = ({ label, count, color, icon, bgColor }) => (
    <View style={[styles.statusCard, { backgroundColor: bgColor }]}>
      <View style={[styles.statusIconBg, { backgroundColor: 'white' }]}>
         <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statusCount, { color: color }]}>{count}</Text>
      <Text style={styles.statusLabel}>{label}</Text>
    </View>
  );

  const InfoItem = ({ text }) => (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name="check" size={16} color="#F57C00" style={{ marginTop: 2 }} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryYellow} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho Amarelo */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          
          {/* LÓGICA DA FOTO AQUI */}
          <TouchableOpacity onPress={() => navigation.navigate('Meu Perfil')}>
            <View style={styles.headerIconBg}>
              {photoUrl ? (
                <Image 
                  source={{ uri: photoUrl }} 
                  style={styles.profileImage} 
                  resizeMode="cover"
                />
              ) : (
                <MaterialCommunityIcons name="office-building" size={24} color="#333" />
              )}
            </View>
          </TouchableOpacity>

          <View>
            <Text style={styles.welcomeLabel}>Bem-vindo</Text>
            <Text style={styles.companyName} numberOfLines={1}>
              {companyName}
            </Text>
          </View>
        </View>
        <Text style={styles.sectionHeader}>O que você precisa fazer hoje?</Text>
      </SafeAreaView>

      {/* Conteúdo com Scroll */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 5 }} />

        {/* 1. Action Cards */}
        <ActionCard 
          title="Resíduos Especiais"
          description="Coleta de resíduos de saúde, óleo de cozinha e materiais tóxicos"
          icon="biohazard"
          color="#E53935" 
          iconLib="MaterialCommunityIcons"
          onPress={() => navigation.navigate('ServicesEmpresa')} 
        />

        <ActionCard 
          title="Grande Volume"
          description="Coleta de recicláveis e resíduos em grande quantidade"
          icon="trash-can-outline" 
          color="#43A047" 
          iconLib="MaterialCommunityIcons"
          onPress={() => navigation.navigate('RequestLargeVolume')} 
        />

        <ActionCard 
          title="Mapas de Descarte"
          description="Encontre pontos de coleta e descarte próximos"
          icon="map-marker-radius"
          color="#1E88E5" 
          iconLib="MaterialCommunityIcons"
          onPress={() => navigation.navigate('MapScreen')} 
        />

        {/* 2. Secção: Status Recentes */}
        <Text style={styles.subSectionTitle}>Status Recentes</Text>
        <View style={styles.statusRow}>
          <StatusCard 
            label="Coletas Realizadas" 
            count={completedCount} 
            color="#43A047"
            icon="file-check-outline" 
            bgColor="#E8F5E9" 
          />
          <View style={{ width: 15 }} />
          <StatusCard 
            label="Pendentes" 
            count={pendingCount} 
            color="#E65100"
            icon="clock-time-four-outline" 
            bgColor="#FFF3E0" 
          />
        </View>

        {/* 3. Cartão: Certificados */}
        <TouchableOpacity style={styles.certCard} onPress={() => navigation.navigate('Certificates')}>
          <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
            <MaterialCommunityIcons name="file-certificate-outline" size={32} color="#ACA183" style={{marginTop: 2}} />
            <View style={{marginLeft: 15, flex: 1}}>
               <Text style={styles.certTitle}>Certificados Disponíveis</Text>
               <Text style={styles.certDesc}>
                 Acesse e baixe seus comprovantes de destinação final (CDF).
               </Text>
               <Text style={styles.certLink}>Ver Certificados →</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 4. Painel: Informações Importantes */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Informações Importantes</Text>
          <InfoItem text="Certificados fornecidos para todas as coletas" />
          <InfoItem text="Atendimento prioritário para empresas" />
          <InfoItem text="Suporte técnico especializado disponível" />
          <InfoItem text="Prazo médio de atendimento: 24-48h úteis" />
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  
  // --- Header ---
  header: {
    backgroundColor: primaryYellow,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  // Estilo da imagem de perfil
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  welcomeLabel: {
    fontSize: 14,
    color: '#333', 
    fontWeight: '500',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  sectionHeader: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    opacity: 0.8,
  },

  // --- Scroll Content ---
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },

  // --- Action Cards ---
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },

  // --- Status Recentes ---
  subSectionTitle: {
    fontSize: 16,
    color: '#444',
    marginBottom: 12,
    marginTop: 10,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  statusIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusCount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // --- Certificados ---
  certCard: {
    backgroundColor: '#FFFDE7', // Amarelo bem clarinho
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: primaryYellow,
  },
  certTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 6,
  },
  certDesc: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 19,
    marginBottom: 10,
    opacity: 0.8,
  },
  certLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
  },

  // --- Informações Importantes ---
  infoBox: {
    backgroundColor: '#FFFBE0', // Creme
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
});