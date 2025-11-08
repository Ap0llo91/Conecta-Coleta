// screens/HomeScreen.js
import React, { useState, useEffect } from 'react'; // 1. Importar useState e useEffect
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../utils/supabaseClient'; // 2. Importar o Supabase

// --- Os componentes EtaCard, InfoCard, e DicaCard continuam os mesmos ---
// (Você pode colar os componentes que eu te dei antes aqui)
const EtaCard = () => (
  <View style={styles.etaCard}>
    <View style={styles.etaHeader}>
      <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#fff" />
      <Text style={styles.etaHeaderText}>Coleta Comum</Text>
    </View>
    <Text style={styles.etaTitle}>Previsão de Chegada</Text>
    <Text style={styles.etaTime}>8</Text>
    <Text style={styles.etaMinutes}>MINUTOS</Text>
    <View style={styles.etaStatus}>
      <Ionicons name="time-outline" size={20} color="#fff" />
      <View style={{marginLeft: 10}}>
        <Text style={styles.etaStatusTitle}>O caminhão está chegando!</Text>
        <Text style={styles.etaStatusSubtitle}>Deixe seu lixo na calçada agora</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.mapButton}>
      <Ionicons name="location-outline" size={20} color="#007BFF" />
      <Text style={styles.mapButtonText}>Ver Caminhão no Mapa</Text>
    </TouchableOpacity>
  </View>
);
const InfoCard = ({ icon, iconBgColor, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.infoCard} onPress={onPress}>
    <View style={[styles.infoIconContainer, { backgroundColor: iconBgColor }]}>
      {icon}
    </View>
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#ccc" />
  </TouchableOpacity>
);
const DicaCard = () => (
  <View style={styles.dicaCard}>
    <Ionicons name="bulb-outline" size={24} color="#2E8B57" style={styles.dicaIcon} />
    <View style={styles.infoTextContainer}>
      <Text style={styles.dicaTitle}>Dica do Dia</Text>
      <Text style={styles.dicaSubtitle}>Lave as embalagens recicláveis antes de descartar. Isso facilita o processo de reciclagem!</Text>
    </View>
  </View>
);
// --- Fim dos componentes copiados ---


export default function HomeScreen() {
  // 3. Criar estados para o nome do usuário e para o carregamento
  const [userName, setUserName] = useState('Visitante');
  const [loading, setLoading] = useState(true);

  // 4. Criar função para buscar os dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      // 4a. Pega o usuário logado (do Supabase Auth)
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('Erro ao buscar usuário:', authError.message);
        setLoading(false);
        return;
      }

      if (user) {
        // 4b. Usa o ID do usuário para buscar o nome na nossa tabela 'usuarios'
        const { data: profile, error: dbError } = await supabase
          .from('usuarios')
          .select('nome_razao_social') // Pega só a coluna do nome
          .eq('usuario_id', user.id) // Onde o ID bate
          .single(); // Esperamos apenas um resultado

        if (dbError) {
          console.error('Erro ao buscar perfil:', dbError.message);
        } else if (profile) {
          setUserName(profile.nome_razao_social); // 4c. Atualiza o nome!
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []); // O array vazio [] faz isso rodar apenas uma vez, quando a tela abre

  // 5. (Opcional) Mostrar um loader enquanto busca o nome
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 6. Cabeçalho agora usa o nome dinâmico */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Olá, {userName}! 👋</Text>
        <Text style={styles.headerSubtitle}>Veja quando o caminhão passa na sua rua</Text>
      </View>

      {/* Card Principal de ETA */}
      <EtaCard />

      {/* Seção de Informações Rápidas */}
      <Text style={styles.sectionTitle}>Informações Rápidas</Text>

      <InfoCard 
        icon={<FontAwesome name="check" size={20} color="#28a745" />}
        iconBgColor="#e0f8e6"
        title="Coleta Seletiva"
        subtitle="Às quartas-feiras"
        onPress={() => {}}
      />
      <InfoCard 
        icon={<Ionicons name="location-sharp" size={20} color="#8A2BE2" />}
        iconBgColor="#f0e6ff"
        title="Ecoponto Mais Próximo"
        subtitle="A 850m da sua casa"
        onPress={() => {}}
      />

      {/* Card de Dica */}
      <DicaCard />

    </ScrollView>
  );
}

// --- Estilos da Tela Home ---
// (Eu adicionei 'loadingContainer')
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Fundo cinza claro
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60, // Espaço para a status bar
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  // Card Azul
  etaCard: {
    backgroundColor: '#007BFF', // Azul
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  etaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    opacity: 0.8,
  },
  etaHeaderText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
  },
  etaTitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    marginTop: 15,
  },
  etaTime: {
    color: '#fff',
    fontSize: 100,
    fontWeight: 'bold',
    lineHeight: 120, // Ajuste de altura da linha
  },
  etaMinutes: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: -15, // Puxa para perto do número
  },
  etaStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Azul mais claro
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    width: '100%',
  },
  etaStatusTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  etaStatusSubtitle: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 3,
  },
  mapButtonText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // Cards Brancos
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
    marginBottom: 15,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  infoIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1, // Ocupa o espaço disponível
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  // Card de Dica
  dicaCard: {
    flexDirection: 'row',
    backgroundColor: '#f0fff8', // Verde bem claro
    borderRadius: 15,
    padding: 15,
    alignItems: 'flex-start',
    marginBottom: 40, // Espaço no final
    borderWidth: 1,
    borderColor: '#2E8B57', // Borda verde
  },
  dicaIcon: {
    marginRight: 15,
    marginTop: 3,
  },
  dicaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57', // Verde escuro
  },
  dicaSubtitle: {
    fontSize: 14,
    color: '#333',
    flexWrap: 'wrap', // Quebra de linha
  },
});