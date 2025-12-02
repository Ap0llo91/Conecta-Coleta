import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const DisposalTipsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho Azul (Padrão da tela de Dicas) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dicas de Descarte Correto</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Card: Papel e Papelão */}
        <TipCard 
          title="Papel e Papelão"
          titleColor="#3F51B5"
          backgroundColor="#E8EAF6"
          items={[
            { text: "Limpe e seque antes de descartar", type: "check" },
            { text: "Dobre caixas para ocupar menos espaço", type: "check" },
            { text: "Remova fitas adesivas e grampos", type: "check" },
            { text: "Não recicle papel sujo ou engordurado", type: "cross" }
          ]}
        />

        {/* Card: Plástico */}
        <TipCard 
          title="Plástico"
          titleColor="#2E7D32"
          backgroundColor="#E8F5E9"
          items={[
            { text: "Lave embalagens antes", type: "check" },
            { text: "Amasse garrafas PET", type: "check" },
            { text: "Tampe com a própria tampa", type: "check" },
            { text: "Não misture com restos de comida", type: "cross" }
          ]}
        />

        {/* Card: Vidro */}
        <TipCard 
          title="Vidro"
          titleColor="#E65100"
          backgroundColor="#FFF3E0"
          items={[
            { text: "Lave e seque", type: "check" },
            { text: "Embale pedaços quebrados em jornal", type: "check" },
            { text: "Remova tampas metálicas", type: "check" },
            { text: "Espelhos e vidros planos não são recicláveis", type: "cross" }
          ]}
        />

        {/* Card: Metal */}
        <TipCard 
          title="Metal"
          titleColor="#455A64"
          backgroundColor="#ECEFF1"
          items={[
            { text: "Lave latas", type: "check" },
            { text: "Amasse para reduzir volume", type: "check" },
            { text: "Latas de alumínio são 100% recicláveis", type: "check" },
            { text: "Tampinhas também podem ser recicladas", type: "check" }
          ]}
        />

        {/* Card: Orgânicos */}
        <TipCard 
          title="Orgânicos"
          titleColor="#795548"
          backgroundColor="#EFEBE9"
          items={[
            { text: "Separe restos de alimentos", type: "check" },
            { text: "Pode virar adubo em composteira", type: "check" },
            { text: "Embale bem para evitar vazamentos", type: "check" },
            { text: "Descarte em sacola separada", type: "check" }
          ]}
        />

        {/* Card: Especiais */}
        <View style={[styles.card, { backgroundColor: '#FFEBEE' }]}>
          <Text style={[styles.cardTitle, { color: '#C62828' }]}>Especiais</Text>
          
          <View style={styles.specialItem}>
            <MaterialCommunityIcons name="battery" size={20} color="#666" style={{marginRight: 8}} />
            <Text style={styles.itemText}>Pilhas e baterias → Ecopontos</Text>
          </View>
          <View style={styles.specialItem}>
            <MaterialCommunityIcons name="lightbulb-on" size={20} color="#FBC02D" style={{marginRight: 8}} />
            <Text style={styles.itemText}>Lâmpadas → Ecopontos</Text>
          </View>
          <View style={styles.specialItem}>
            <MaterialCommunityIcons name="monitor" size={20} color="#666" style={{marginRight: 8}} />
            <Text style={styles.itemText}>Eletrônicos → Ecopontos</Text>
          </View>
          <View style={styles.specialItem}>
            <MaterialCommunityIcons name="oil" size={20} color="#1976D2" style={{marginRight: 8}} />
            <Text style={styles.itemText}>Óleo de cozinha → Ecopontos (em garrafa PET)</Text>
          </View>
        </View>

        {/* Card Final: Lembre-se */}
        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Lembre-se</Text>
          <Text style={styles.footerText}>
            O descarte correto começa em casa! Separe, limpe e destine adequadamente cada tipo de resíduo.
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Componente Reutilizável para os Cards de Dicas
const TipCard = ({ title, titleColor, backgroundColor, items }) => {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Text style={[styles.cardTitle, { color: titleColor }]}>{title}</Text>
      <View style={styles.listContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            {item.type === 'check' ? (
              <Ionicons name="checkmark" size={18} color="#333" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="close" size={18} color="#D32F2F" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.itemText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: {
    backgroundColor: '#0066FF',
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backText: { color: 'white', fontSize: 16, marginLeft: 5, fontWeight: '500' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  
  content: { padding: 20 },

  // Estilo do Card de Dicas
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    // Sombra leve
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  listContainer: {
    marginTop: 5,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    flex: 1,
  },

  // Estilo Especiais
  specialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  // Estilo Footer
  footerCard: {
    backgroundColor: '#1565C0',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
  },
});

export default DisposalTipsScreen;