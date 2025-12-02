import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const HowItWorksScreen = ({ navigation }) => {
  // Função para abrir o site da prefeitura
  const openOfficialCalendar = () => {
    Linking.openURL("https://recifelimpa.recife.pe.gov.br/coleta-domiciliar");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho Verde */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Como Funciona a Coleta</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card: Em Recife */}
        <View style={styles.card}>
          <Text style={styles.sectionTitleGreen}>Em Recife</Text>
          <Text style={styles.descriptionText}>
            A coleta seletiva em Recife funciona com separação de materiais
            recicláveis dos não recicláveis.
          </Text>

          <View style={styles.legendRow}>
            <View style={[styles.colorBox, { backgroundColor: "#00A859" }]} />
            <View>
              <Text style={styles.legendTitle}>Lixo Reciclável</Text>
              <Text style={styles.legendSubtitle}>
                Papel, papelão, plástico, vidro, metal
              </Text>
            </View>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.colorBox, { backgroundColor: "#555" }]} />
            <View>
              <Text style={styles.legendTitle}>Lixo Comum</Text>
              <Text style={styles.legendSubtitle}>
                Resíduos não recicláveis e orgânicos
              </Text>
            </View>
          </View>
        </View>

        {/* --- Card Modificado: Horários de Coleta --- */}
        <View style={styles.card}>
          <Text style={styles.sectionTitleGreen}>Horários de Coleta</Text>

          <Text style={styles.descriptionText}>
            Os dias e horários da coleta variam de acordo com a sua rua e
            bairro. Para saber exatamente quando o caminhão passa na sua porta,
            consulte o calendário oficial da Prefeitura.
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={openOfficialCalendar}
          >
            <Ionicons
              name="calendar-outline"
              size={24}
              color="white"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.actionButtonText}>
              Consultar Calendário Oficial
            </Text>
            <Ionicons
              name="open-outline"
              size={18}
              color="rgba(255,255,255,0.7)"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
        </View>

        {/* Card: O que Reciclar (Grid) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitleGreen}>O que Reciclar</Text>
          <View style={styles.gridContainer}>
            <GridItem
              icon="file-document-outline"
              label="Papel e Papelão"
              color="#5D4037"
            />
            <GridItem
              icon="bottle-soda-classic-outline"
              label="Plástico"
              color="#E53935"
            />
            <GridItem icon="glass-wine" label="Vidro" color="#43A047" />
            <GridItem
              icon="trash-can-outline"
              label="Metal/Latas"
              color="#FBC02D"
            />
          </View>
        </View>

        {/* Card: Não Reciclar (Lista) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitleGreen}>Não Reciclar</Text>
          <View style={styles.listContainer}>
            <ListItem text="Papel higiênico usado" />
            <ListItem text="Fraldas e absorventes" />
            <ListItem text="Espelhos e vidros planos" />
            <ListItem text="Isopor sujo" />
            <ListItem text="Papel carbono ou plastificado" />
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Componente Auxiliar: Item do Grid (Recicláveis)
const GridItem = ({ icon, label, color }) => (
  <View style={styles.gridItem}>
    <MaterialCommunityIcons name={icon} size={32} color={color} />
    <Text style={styles.gridLabel}>{label}</Text>
  </View>
);

// Componente Auxiliar: Item da Lista (Não Recicláveis)
const ListItem = ({ text }) => (
  <View style={styles.listItem}>
    <Ionicons
      name="close"
      size={20}
      color="#E53935"
      style={{ marginRight: 10 }}
    />
    <Text style={styles.listItemText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5" },
  header: {
    backgroundColor: "#00A859",
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  backText: { color: "white", fontSize: 16, marginLeft: 5, fontWeight: "500" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "white" },

  content: { padding: 20 },

  // Estilo Geral dos Cards
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitleGreen: {
    fontSize: 18,
    color: "#00695C",
    marginBottom: 15,
    fontWeight: "bold",
  },
  descriptionText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 20,
  },

  // Legenda
  legendRow: { flexDirection: "row", marginBottom: 15 },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
  },
  legendTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  legendSubtitle: { fontSize: 13, color: "#666", marginTop: 2 },

  // --- Novos Estilos do Botão ---
  actionButton: {
    backgroundColor: "#00A859",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
    marginTop: 5,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Grid
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  gridLabel: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },

  // Lista
  listContainer: { marginTop: 5 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  listItemText: { fontSize: 15, color: "#555" },
});

export default HowItWorksScreen;
