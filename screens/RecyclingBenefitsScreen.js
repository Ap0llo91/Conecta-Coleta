import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const RecyclingBenefitsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Benefícios da Reciclagem</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card 1: Meio Ambiente (Verde) */}
        {/* CORREÇÃO: Trocado 'tree' por 'leaf-outline' */}
        <BenefitCard
          color="#00A859"
          iconLibrary="Ionicons"
          iconName="leaf-outline"
          title="Meio Ambiente"
          items={[
            "Reduz a extração de recursos naturais",
            "Diminui poluição do solo e água",
            "Preserva florestas e biodiversidade",
            "Reduz emissão de gases do efeito estufa",
          ]}
        />

        {/* Card 2: Economia de Recursos (Azul) */}
        <BenefitCard
          color="#2979FF"
          iconLibrary="Ionicons"
          iconName="water-outline"
          title="Economia de Recursos"
          items={[
            "1 ton de papel reciclado = 20 árvores poupadas",
            "Economia de 95% de energia no alumínio",
            "Redução de 70% no consumo de água",
            "Menor uso de energia em geral",
          ]}
        />

        {/* Card 3: Benefícios Sociais (Roxo) */}
        <BenefitCard
          color="#9C27B0"
          iconLibrary="Ionicons"
          iconName="people-outline"
          title="Benefícios Sociais"
          items={[
            "Geração de empregos",
            "Renda para cooperativas",
            "Inclusão social",
            "Educação ambiental",
          ]}
        />

        {/* Card 4: Para a Cidade (Laranja) */}
        <BenefitCard
          color="#EF6C00"
          iconLibrary="MaterialCommunityIcons"
          iconName="city-variant-outline"
          title="Para a Cidade"
          items={[
            "Reduz volume em aterros",
            "Menor custo de coleta",
            "Cidade mais limpa",
            "Melhora qualidade de vida",
          ]}
        />

        {/* Card Extra: Call to Action */}
        <View style={styles.actionCard}>
          <Ionicons
            name="earth"
            size={40}
            color="#4CAF50"
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.actionTitle}>Faça sua parte!</Text>
          <Text style={styles.actionText}>
            Cada ação individual contribui para um planeta mais sustentável.
            Separar o lixo é o primeiro passo!
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const BenefitCard = ({ color, iconLibrary, iconName, title, items }) => {
  const IconComponent =
    iconLibrary === "MaterialCommunityIcons"
      ? MaterialCommunityIcons
      : Ionicons;

  return (
    <View style={[styles.card, { borderColor: color }]}>
      <View style={styles.cardHeader}>
        <IconComponent
          name={iconName}
          size={28}
          color={color}
          style={{ marginRight: 10 }}
        />
        <Text style={[styles.cardTitle, { color: color }]}>{title}</Text>
      </View>
      <View style={styles.listContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5" },
  header: {
    backgroundColor: "#00897B",
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  backText: { color: "white", fontSize: 16, marginLeft: 5, fontWeight: "500" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "white" },

  content: { padding: 20 },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  listContainer: { paddingLeft: 5 },
  listItem: { flexDirection: "row", marginBottom: 8, alignItems: "flex-start" },
  bullet: { fontSize: 16, color: "#666", marginRight: 8, lineHeight: 22 },
  itemText: { fontSize: 15, color: "#444", lineHeight: 22, flex: 1 },
  actionCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    color: "#1B5E20",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default RecyclingBenefitsScreen;
