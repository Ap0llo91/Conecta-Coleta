import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// Habilita animações no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQScreen = ({ navigation }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const questions = [
    {
      question: "Qual a diferença entre lixo e resíduo?",
      answer: "Lixo é o que não pode mais ser reaproveitado. Resíduo é material que pode ser reciclado ou reutilizado. A coleta seletiva transforma 'lixo' em 'resíduo'!"
    },
    {
      question: "Por que devo lavar as embalagens antes de reciclar?",
      answer: "Embalagens sujas podem contaminar outros materiais recicláveis e dificultar o processo de reciclagem. Além disso, atraem pragas e geram mau cheiro."
    },
    {
      question: "Isopor é reciclável?",
      answer: "Sim, mas apenas isopor limpo. Isopor sujo de alimentos não deve ir para reciclagem. Leve ao ecoponto quando possível."
    },
    {
      question: "O que fazer com óleo de cozinha usado?",
      answer: "NUNCA jogue óleo no ralo! Armazene em garrafa PET e leve a um ecoponto. 1 litro de óleo polui 1 milhão de litros de água."
    },
    {
      question: "Posso reciclar embalagem de pizza?",
      answer: "Depende. Se a caixa estiver muito engordurada, não é reciclável. Partes limpas podem ser recicladas normalmente."
    },
    {
      question: "Como descartar medicamentos vencidos?",
      answer: "Leve a farmácias ou UBS com ponto de coleta. NUNCA jogue no lixo comum ou vaso sanitário."
    },
    {
      question: "Sacolas plásticas são recicláveis?",
      answer: "Sim! Mas prefira reutilizá-las ou optar por sacolas reutilizáveis para reduzir o consumo."
    },
    {
      question: "E se meu bairro não tem coleta seletiva?",
      answer: "Você pode levar materiais recicláveis aos ecopontos ou pontos de entrega voluntária mais próximos. Use o mapa do app!"
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho Roxo (Baseado no protótipo) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perguntas Frequentes</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Lista de Perguntas (Acordeão) */}
        {questions.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.card} 
            onPress={() => toggleExpand(index)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.questionText}>{item.question}</Text>
              <Ionicons 
                name={expandedIndex === index ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#666" 
              />
            </View>
            {expandedIndex === index && (
              <View style={styles.cardContent}>
                <Text style={styles.answerText}>{item.answer}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Card de Contato / Dúvidas */}
        <View style={styles.contactCard}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="question" size={24} color="#AA00FF" />
          </View>
          <Text style={styles.contactTitle}>Ainda tem dúvidas?</Text>
          <Text style={styles.contactText}>
            Entre em contato com a Emlurb através do SAC ou nas redes sociais.
          </Text>
          
          <View style={styles.contactInfo}>
            <Ionicons name="call" size={18} color="#C2185B" style={{marginRight: 8}} />
            <Text style={styles.contactLink}>0800-081-1078</Text>
          </View>
          <View style={styles.contactInfo}>
            <Ionicons name="logo-instagram" size={18} color="#C2185B" style={{marginRight: 8}} />
            <Text style={styles.contactLink}>@emlurbrecife</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: {
    backgroundColor: '#AA00FF',
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backText: { color: 'white', fontSize: 16, marginLeft: 5, fontWeight: '500' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  
  content: { padding: 20 },

  // Estilo do Card de Pergunta
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // Sombra leve
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  cardContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  answerText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },

  // Estilo Card de Contato
  contactCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#AA00FF',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A148C',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#6A1B9A',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactLink: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default FAQScreen;