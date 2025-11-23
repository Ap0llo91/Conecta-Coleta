import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabaseClient';

const EditProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dados do Usuário
  const [userId, setUserId] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [doc, setDoc] = useState(''); // CPF ou CNPJ
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');

  // 1. Buscar dados atuais ao abrir
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        // Buscar dados pessoais
        const { data: profile } = await supabase
          .from('usuarios')
          .select('nome_razao_social, cpf_cnpj, email, telefone') // Supondo que tenha telefone na tabela usuarios, se não tiver, ajustamos
          .eq('usuario_id', user.id)
          .single();

        if (profile) {
          setNome(profile.nome_razao_social);
          setEmail(profile.email);
          setDoc(profile.cpf_cnpj);
          setTelefone(profile.telefone || ''); // Se não tiver coluna telefone, fica vazio
        }

        // Buscar endereço
        const { data: address } = await supabase
          .from('enderecos')
          .select('rua')
          .eq('usuario_id', user.id)
          .eq('is_padrao', true)
          .single();

        if (address) {
          setEndereco(address.rua);
        }

      } catch (error) {
        console.log('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // 2. Salvar Alterações
  const handleSave = async () => {
    if (!nome || !endereco) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha seu nome e endereço.");
      return;
    }

    setSaving(true);
    try {
      // Atualiza tabela USUARIOS (Nome e Telefone)
      // Nota: Se sua tabela 'usuarios' não tem coluna 'telefone', você precisará criar no Supabase ou remover daqui.
      const { error: userError } = await supabase
        .from('usuarios')
        .update({ 
            nome_razao_social: nome,
            // telefone: telefone -- Descomente se tiver criado a coluna telefone
        })
        .eq('usuario_id', userId);

      if (userError) throw userError;

      // Atualiza tabela ENDERECOS (Rua)
      const { error: addrError } = await supabase
        .from('enderecos')
        .update({ rua: endereco })
        .eq('usuario_id', userId)
        .eq('is_padrao', true);

      if (addrError) throw addrError;

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() }
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Informações</Text>
        {/* Botão Salvar no Header (Opcional, mas comum) */}
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={styles.saveTextHeader}>Salvar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
             <Ionicons name="person" size={40} color="#FFF" />
          </View>
          <Text style={styles.changePhotoText}>Toque para alterar foto (Em breve)</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          
          <Text style={styles.label}>Nome Completo / Razão Social</Text>
          <TextInput 
            style={styles.input} 
            value={nome} 
            onChangeText={setNome} 
            placeholder="Seu nome"
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput 
            style={styles.input} 
            value={telefone} 
            onChangeText={setTelefone} 
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
          />

          {/* Campos Read-Only (Cinza) */}
          <Text style={styles.label}>E-mail (Não editável)</Text>
          <TextInput style={[styles.input, styles.readOnly]} value={email} editable={false} />

          <Text style={styles.label}>CPF / CNPJ (Não editável)</Text>
          <TextInput style={[styles.input, styles.readOnly]} value={doc} editable={false} />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Endereço Principal</Text>
          
          <Text style={styles.label}>Logradouro</Text>
          <TextInput 
            style={styles.input} 
            value={endereco} 
            onChangeText={setEndereco} 
            placeholder="Rua, número, bairro"
          />
        </View>

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
        
        <View style={{height: 40}} />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  saveTextHeader: { color: '#007BFF', fontSize: 16, fontWeight: '600' },

  content: { padding: 20 },

  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  changePhotoText: { color: '#007BFF', fontSize: 14 },

  formSection: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },

  label: { fontSize: 14, color: '#666', marginBottom: 6, marginLeft: 2 },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  readOnly: {
    backgroundColor: '#F0F0F0',
    color: '#999',
    borderColor: '#EEE',
  },

  saveButton: {
    backgroundColor: '#007BFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default EditProfileScreen;