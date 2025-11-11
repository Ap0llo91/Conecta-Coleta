// screens/LearnScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Componente de Link (os cards brancos de navegação)
// É parecido com o InfoCard, mas mais simples
const LinkCard = ({ icon, iconBgColor, iconColor, title, onPress }) => (
  <TouchableOpacity style={styles.linkCard} onPress={onPress}>
    <View style={[styles.linkIconContainer, { backgroundColor: iconBgColor }]}>
      {icon}
    </View>
    <View style={styles.linkTextContainer}>
      <Text style={styles.linkTitle}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#ccc" />
  </TouchableOpacity>
);

// Componente de Card de Estatística (para o Impacto)
const StatCard = ({ icon, value, label, iconColor, iconBgColor }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: iconBgColor }]}>
      {icon}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function LearnScreen({ navigation }) {
  
  // Funções de placeholder para onde os botões levarão
  const onColetaSeletiva = () => {};
  const onBeneficios = () => {};
  const onDicas = () => {};
  const onFAQ = () => {};

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Cabeçalho Verde */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Informações e Educação</Text>
        <Text style={styles.headerSubtitle}>Aprenda sobre coleta seletiva e sustentabilidade</Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Lista de Links */}
        <LinkCard 
          icon={<MaterialCommunityIcons name="recycle-variant" size={24} color="#27AE60" />}
          iconBgColor="#D4EFDF"
          title="Como Funciona a Coleta Seletiva"
          onPress={onColetaSeletiva}
        />
        <LinkCard 
          icon={<Ionicons name="leaf-outline" size={24} color="#2ECC71" />}
          iconBgColor="#D5F5E3"
          title="Benefícios da Reciclagem"
          onPress={onBeneficios}
        />
        <LinkCard 
          icon={<Ionicons name="book-outline" size={24} color="#3498DB" />}
          iconBgColor="#D6EAF8"
          title="Dicas de Descarte Correto"
          onPress={onDicas}
        />
        <LinkCard 
          icon={<Ionicons name="help-circle-outline" size={24} color="#8E44AD" />}
          iconBgColor="#EBDEF0"
          title="Perguntas Frequentes"
          onPress={onFAQ}
        />

        {/* Card "Recife Mais Limpa" */}
        <View style={styles.promoCard}>
          <View style={[styles.promoIconContainer, { backgroundColor: '#27AE60' }]}>
            <MaterialCommunityIcons name="recycle-variant" size={30} color="#fff" />
          </View>
          <Text style={styles.promoTitle}>Recife Mais Limpa</Text>
          <Text style={styles.promoText}>
            Juntos podemos fazer a diferença! Aprenda, pratique e compartilhe conhecimento sobre reciclagem e sustentabilidade.
          </Text>
        </View>

        {/* Seção "Impacto da Comunidade" */}
        <Text style={styles.sectionTitle}>Impacto da Comunidade</Text>
        <View style={styles.statsContainer}>
          <StatCard
            icon={<MaterialCommunityIcons name="recycle-variant" size={24} color="#27AE60" />}
            iconBgColor="#D4EFDF"
            value="12,5 ton"
            label="Recicladas"
          />
          <StatCard
            icon={<Ionicons name="people-outline" size={24} color="#3498DB" />}
            iconBgColor="#D6EAF8"
            value="8.547"
            label="Participantes"
          />
        </View>

      </ScrollView>
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00695C', // Verde escuro para o header (ajuste a cor)
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20, 
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
    flex: 1, 
    backgroundColor: '#F0F2F5', // Fundo cinza claro
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  scrollContent: {
    padding: 20, 
  },
  // Cards de Link
  linkCard: {
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
  linkIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  linkTextContainer: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  // Card Promoção "Recife Mais Limpa"
  promoCard: {
    backgroundColor: '#E6F7F0', // Verde bem claro
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  promoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004D40', // Verde escuro
    marginBottom: 10,
  },
  promoText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
  // Cards de Estatística
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '48%', // Quase metade da tela
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});