import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";

const EditProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dados Pessoais
  const [userId, setUserId] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [doc, setDoc] = useState(""); // CPF ou CNPJ
  const [telefone, setTelefone] = useState("");

  // Dados de Endereço
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [semNumero, setSemNumero] = useState(false);

  // --- MÁSCARAS ---
  const formatTelefone = (text) => {
    let v = text.replace(/\D/g, "");
    v = v.substring(0, 11);
    if (v.length > 10) {
      // Celular (11 dígitos)
      return v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
    } else if (v.length > 5) {
      // Fixo ou incompleto
      return v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (v.length > 2) {
      return v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    }
    return v;
  };

  const formatCPF_CNPJ = (text) => {
    let v = text.replace(/\D/g, "");
    if (v.length <= 11) {
      // CPF
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      // CNPJ
      return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
  };

  const handlePhoneChange = (text) => {
    setTelefone(formatTelefone(text));
  };

  // --- CARREGAR DADOS ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        // 1. Buscar Usuário
        const { data: profile } = await supabase
          .from("usuarios")
          .select("nome_razao_social, cpf_cnpj, email, telefone")
          .eq("usuario_id", user.id)
          .single();

        if (profile) {
          setNome(profile.nome_razao_social);
          setEmail(profile.email || user.email); // Pega do perfil ou do auth
          setDoc(profile.cpf_cnpj);
          setTelefone(formatTelefone(profile.telefone || ""));
        }

        // 2. Buscar Endereço
        const { data: address } = await supabase
          .from("enderecos")
          .select("rua, numero, bairro")
          .eq("usuario_id", user.id)
          .eq("is_padrao", true)
          .maybeSingle();

        if (address) {
          setRua(address.rua || "");
          setBairro(address.bairro || "");

          if (address.numero === "S/N") {
            setSemNumero(true);
            setNumero("");
          } else {
            setNumero(address.numero || "");
          }
        }
      } catch (error) {
        console.log("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // --- SALVAR DADOS ---
  const handleSave = async () => {
    if (!nome || !rua || !bairro) {
      Alert.alert(
        "Campos obrigatórios",
        "Por favor, preencha nome, rua e bairro."
      );
      return;
    }

    setSaving(true);
    try {
      const telefoneLimpo = telefone.replace(/\D/g, "");

      const { error: userError } = await supabase
        .from("usuarios")
        .update({
          nome_razao_social: nome,
          telefone: telefoneLimpo,
        })
        .eq("usuario_id", userId);

      if (userError) throw userError;

      const numeroFinal = semNumero ? "S/N" : numero;

      const { error: addrError } = await supabase
        .from("enderecos")
        .update({
          rua: rua,
          numero: numeroFinal,
          bairro: bairro,
        })
        .eq("usuario_id", userId)
        .eq("is_padrao", true);

      if (addrError) throw addrError;

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar os dados.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header (SEM BOTÃO SALVAR AQUI) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Informações</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#FFF" />
          </View>
          <Text style={styles.changePhotoText}>
            Toque para alterar foto (Em breve)
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>

          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome completo"
          />

          <Text style={styles.label}>Telefone / Celular</Text>
          <TextInput
            style={styles.input}
            value={telefone}
            onChangeText={handlePhoneChange}
            placeholder="(81) 9 0000-0000"
            keyboardType="phone-pad"
            maxLength={15}
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, styles.readOnly]}
            value={email}
            editable={false}
          />

          <Text style={styles.label}>CPF / CNPJ</Text>
          <TextInput
            style={[styles.input, styles.readOnly]}
            value={formatCPF_CNPJ(doc)}
            editable={false}
          />
          <Text style={styles.helperText}>
            CPF e E-mail não podem ser alterados aqui.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Endereço Principal</Text>

          <Text style={styles.label}>Logradouro (Rua, Av.)</Text>
          <TextInput
            style={styles.input}
            value={rua}
            onChangeText={setRua}
            placeholder="Ex: Rua da Aurora"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Número</Text>
              <TextInput
                style={[styles.input, semNumero && styles.disabledInput]}
                value={semNumero ? "S/N" : numero}
                onChangeText={setNumero}
                placeholder="123"
                keyboardType="numeric"
                editable={!semNumero}
              />
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => {
                setSemNumero(!semNumero);
                if (!semNumero) setNumero("");
              }}
            >
              <View
                style={[styles.checkbox, semNumero && styles.checkedCheckbox]}
              >
                {semNumero && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Sem número</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Bairro</Text>
          <TextInput
            style={styles.input}
            value={bairro}
            onChangeText={setBairro}
            placeholder="Ex: Boa Viagem"
          />
        </View>

        {/* Botão Salvar no final */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },

  content: { padding: 20 },

  avatarContainer: { alignItems: "center", marginBottom: 30 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  changePhotoText: { color: "#007BFF", fontSize: 14 },

  formSection: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },

  label: { fontSize: 14, color: "#666", marginBottom: 6, marginLeft: 2 },
  input: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  readOnly: { backgroundColor: "#F0F0F0", color: "#999", borderColor: "#EEE" },
  disabledInput: { backgroundColor: "#EEEEEE", color: "#999" },

  row: { flexDirection: "row", alignItems: "center", marginBottom: 5 },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    marginTop: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#007BFF",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  checkedCheckbox: { backgroundColor: "#007BFF" },
  checkboxLabel: { fontSize: 14, color: "#333" },

  helperText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: -5,
  },

  saveButton: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});

export default EditProfileScreen;
