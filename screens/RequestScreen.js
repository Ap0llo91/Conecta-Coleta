// screens/RequestScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Componente para os 3 cards grandes de opção
const OptionCard = ({ icon, iconColor, iconBgColor, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.optionCard} onPress={onPress}>
    <View style={[styles.optionIconContainer, { backgroundColor: iconBgColor }]}>
      {icon}
    </View>
    <View style={styles.optionTextContainer}>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#ccc" />
  </TouchableOpacity>
);

// Componente para os 2 cards pequenos de "Mais Usados"
const UsedServiceCard = ({ icon, iconColor, iconBgColor, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.usedServiceCard} onPress={onPress}>
    <View style={[styles.usedIconContainer, { backgroundColor: iconBgColor }]}>
      {icon}
    </View>
    <Text style={styles.usedTitle}>{title}</Text>
    <Text style={styles.usedSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

export default function RequestScreen({ navigation }) {
  
  // (No futuro, você precisará criar essas telas e adicioná-las ao App.js)
  const onReportProblem = () => { navigation.navigate('ReportProblem'); };
  const onScheduleService = () => { /* navigation.navigate('ScheduleService'); */ };
  const onFindDisposalSite = () => { /* navigation.navigate('FindDisposalSite'); */ };
  const onCataTreco = () => { /* navigation.navigate('ScheduleCataTreco'); */ };
  const onCacamba = () => { /* navigation.navigate('ScheduleCacamba'); */ };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Cabeçalho Azul */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Do que você precisa?</Text>
        <Text style={styles.headerSubtitle}>Escolha uma das opções abaixo</Text>
      </View>

      {/* Conteúdo da Página */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cards de Opção */}
        <OptionCard 
          icon={<Ionicons name="camera-outline" size={24} color="#E74C3C" />}
          iconBgColor="#FADBD8"
          title="Reportar um Problema"
          subtitle="Lixo na rua, bueiro entupido ou coleta não realizada"
          onPress={onReportProblem}
        />
        <OptionCard 
          icon={<Ionicons name="calendar-outline" size={24} color="#8E44AD" />}
          iconBgColor="#EBDEF0"
          title="Agendar um Serviço"
          subtitle="Coleta de móveis velhos, entulho ou caçamba"
          onPress={onScheduleService}
        />
        <OptionCard 
          icon={<Ionicons name="location-outline" size={24} color="#27AE60" />}
          iconBgColor="#D4EFDF"
          title="Encontrar Local de Descarte"
          subtitle="Ecopontos, reciclagem e pontos de coleta"
          onPress={onFindDisposalSite}
        />

        {/* Seção "Serviços Mais Usados" */}
        <Text style={styles.sectionTitle}>Serviços Mais Usados</Text>
        <View style={styles.usedContainer}>
          <UsedServiceCard 
            icon={<MaterialCommunityIcons name="sofa-single-outline" size={30} color="#E67E22" />}
            iconBgColor="#FDEBD0"
            title="Cata-Treco"
            subtitle="Móveis grandes"
            onPress={onCataTreco}
          />
          <UsedServiceCard 
            icon={<MaterialCommunityIcons name="delete-outline" size={30} color="#F39C12" />}
            iconBgColor="#FEF9E7"
            title="Caçamba"
            subtitle="Entulho"
            onPress={onCacamba}
          />
        </View>

        {/* Box de "Tempo de Resposta" */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color="#007BFF" />
          <View style={styles.infoBoxTextContainer}>
            <Text style={styles.infoBoxTitle}>Tempo de Resposta</Text>
            <Text style={styles.infoBoxText}>A maioria dos pedidos são atendidos em 48-72 horas úteis. Você receberá notificações sobre o andamento.</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// --- Estilos (screens/RequestScreen.js) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007BFF', // O fundo da tela inteira é azul
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20, // Padding normal, sem mágica
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  scrollContainer: {
    flex: 1, // Ocupa o resto da tela
    backgroundColor: '#F0F2F5', // Fundo cinza claro
    borderTopLeftRadius: 25, // Borda arredondada
    borderTopRightRadius: 25, // Borda arredondada
  },
  scrollContent: {
    padding: 20, // Espaçamento interno normal
  },
  // Cards Grandes
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    flexWrap: 'wrap',
  },
  // Cards Pequenos
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 15,
  },
  usedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  usedServiceCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '48%', 
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  usedIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  usedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  usedSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  // Box de Informação
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e6f2ff', 
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#007BFF',
  },
  infoBoxTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0056b3', 
  },
  infoBoxText: {
    fontSize: 14,
    color: '#333',
    flexWrap: 'wrap',
  },
});