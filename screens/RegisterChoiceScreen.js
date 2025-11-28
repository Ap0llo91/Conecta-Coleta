import React, { useLayoutEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import Logo from "../components/Logo";

export default function RegisterChoiceScreen({ navigation }) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Logo style={styles.logo} />

        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Como você deseja se cadastrar?</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.citizenButton}
          onPress={() =>
            navigation.navigate("CitizenAuth", { mode: "register" })
          }
        >
          <MaterialCommunityIcons
            name="account-group"
            size={30}
            color="#FFFFFF"
            style={styles.buttonIcon}
          />
          <View>
            <Text style={styles.buttonTitle}>Sou Cidadão</Text>
            <Text style={styles.buttonSubtitle}>Cadastrar com CPF</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.companyButton}
          onPress={() =>
            navigation.navigate("CompanyAuth", { mode: "register" })
          }
        >
          <FontAwesome5
            name="building"
            size={30}
            color="#FFFFFF"
            style={styles.buttonIcon}
          />
          <View>
            <Text style={styles.buttonTitle}>Sou Empresa</Text>
            <Text style={styles.buttonSubtitle}>Cadastrar com CNPJ</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
        <Text style={styles.loginText}>
          Já tem uma conta? <Text style={styles.loginLink}>Entrar</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 300, // Aumentado drasticamente para compensar as bordas brancas
    height: 300, // Aumentado drasticamente
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  buttonsContainer: {
    width: "90%",
    marginBottom: 40,
  },
  citizenButton: {
    flexDirection: "row",
    backgroundColor: "#3498db",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  companyButton: {
    flexDirection: "row",
    backgroundColor: "#FFD700",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 15,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  buttonSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  loginText: {
    fontSize: 16,
    color: "#666",
  },
  loginLink: {
    color: "#3498db",
    fontWeight: "bold",
  },
});
