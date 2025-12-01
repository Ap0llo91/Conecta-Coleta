import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

// Cores do tema
const THEME = {
  citizen: { primary: "#007BFF" },
  company: { primary: "#F0B90B" }
};

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCompany, setIsCompany] = useState(false);

  // Estados do Perfil
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [imageUri, setImageUri] = useState(null);

  // Estados do Endereço
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [addressId, setAddressId] = useState(null);

  // Define a cor primária
  const primaryColor = isCompany ? THEME.company.primary : THEME.citizen.primary;

  // --- MÁSCARAS ---
  const applyPhoneMask = (text) => {
    let v = text.replace(/\D/g, "");
    v = v.substring(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
    } else if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    } else {
      if (v.length > 0) v = v.replace(/^(\d*)/, "($1");
    }
    return v;
  };

  // NOVA MÁSCARA PARA DOCUMENTO (CPF ou CNPJ)
  const applyDocumentMask = (text) => {
    if (!text) return "";
    const cleaned = text.replace(/\D/g, "");
    
    // CPF (até 11 dígitos)
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } 
    // CNPJ (mais de 11 dígitos)
    else {
      return cleaned.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
  };

  const handlePhoneChange = (text) => {
    setTelefone(applyPhoneMask(text));
  };

  const applyCepMask = (text) => {
    let v = text.replace(/\D/g, "");
    v = v.substring(0, 8);
    if (v.length > 5) {
      v = v.replace(/^(\d{5})(\d)/, "$1-$2");
    }
    return v;
  };

  const handleCepChange = (text) => {
    setCep(applyCepMask(text));
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const fillAddressFields = (data) => {
      if (!data) return;
      setAddressId(data.id);

      // CEP
      if (data.cep && data.cep !== '00000-000') {
          setCep(data.cep);
      } else {
          setCep('');
      }

      // Demais campos
      if (data.numero || data.bairro) {
          setRua(data.rua || '');
          setNumero(data.numero ? String(data.numero) : '');
          setBairro(data.bairro || '');
      } else {
          // Fallback legado
          let r = data.rua || '';
          let n = '';
          let b = '';
          if (r.includes(',')) {
              const parts = r.split(',');
              if (parts.length >= 3) {
                  r = parts[0].trim();
                  n = parts[1].trim();
                  b = parts.slice(2).join(',').trim();
              } else if (parts.length === 2) {
                  r = parts[0].trim();
                  const part2 = parts[1].trim();
                  if (part2.includes('-')) {
                      const subParts = part2.split('-');
                      n = subParts[0].trim();
                      b = subParts.slice(1).join('-').trim();
                  } else {
                      n = part2;
                  }
              }
          }
          setRua(r);
          setNumero(n);
          setBairro(b);
      }
  };

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          setLoading(false);
          return;
      }

      // 1. Busca Dados Pessoais e Tipo
      const { data: profile } = await supabase
        .from('usuarios')
        .select('*') 
        .eq('usuario_id', user.id)
        .single();

      if (profile) {
        // Detecta se é empresa
        if (profile.tipo_usuario === 'CNPJ') setIsCompany(true);
        else setIsCompany(false);

        setNome(profile.nome_razao_social || '');
        if (profile.telefone) setTelefone(applyPhoneMask(profile.telefone));
        setEmail(profile.email || '');
        
        // APLICA A MÁSCARA AO CARREGAR O CPF/CNPJ
        setCpf(applyDocumentMask(profile.cpf_cnpj || ''));
        
        if (profile.foto_url) setImageUri(profile.foto_url);
      }

      // 2. Busca o Endereço (TENTATIVA BLINDADA)
      let finalAddress = null;

      try {
        const { data: latest, error: sortError } = await supabase
            .from('enderecos')
            .select('*')
            .eq('usuario_id', user.id)
            .order('created_at', { ascending: false }) 
            .limit(1)
            .maybeSingle();
        
        if (sortError) throw sortError;
        finalAddress = latest;

      } catch (sortErr) {
        const { data: fallback } = await supabase
            .from('enderecos')
            .select('*')
            .eq('usuario_id', user.id)
            .limit(1)
            .maybeSingle();
        
        finalAddress = fallback;
      }

      if (finalAddress) {
          fillAddressFields(finalAddress);
      }

    } catch (error) {
      console.log('Erro fatal no fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- FOTO ---
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handlePhotoOptions = () => {
    Alert.alert(
      "Alterar Foto",
      "Escolha uma opção:",
      [
        { text: "Tirar Foto", onPress: pickFromCamera },
        { text: "Galeria", onPress: pickFromGallery },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  // --- SALVAR ---
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const telefoneLimpo = telefone.replace(/\D/g, "");

      // 1. Atualiza Usuário
      const { error: userError } = await supabase
        .from('usuarios')
        .update({
          nome_razao_social: nome,
          telefone: telefoneLimpo,
          foto_url: imageUri 
        })
        .eq('usuario_id', user.id);

      if (userError) throw userError;

      // 2. Insere Endereço
      const addressDataPayload = {
        rua: rua, 
        numero: numero,
        bairro: bairro,
        cep: cep || '00000-000',
        latitude: 0, 
        longitude: 0, 
        is_padrao: true,
        usuario_id: user.id
      };

      const { error: addrError } = await supabase
        .from('enderecos')
        .insert(addressDataPayload);
        
      if (addrError) throw addrError;

      Alert.alert('Sucesso', 'Informações atualizadas!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.log('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar: ' + (error.message || ''));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Informações</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={primaryColor} />
          ) : (
            <Text style={[styles.saveButtonText, { color: primaryColor }]}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={handlePhotoOptions}>
              {imageUri ? (
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.avatarImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: isCompany ? '#F0B90B' : '#4285F4' }]}>
                  <Ionicons name="person" size={60} color="#FFF" />
                </View>
              )}
              <View style={[styles.editIconBg, { backgroundColor: primaryColor }]}>
                <Ionicons name="camera" size={18} color="#FFF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePhotoOptions}>
              <Text style={[styles.changePhotoText, { color: primaryColor }]}>Toque para alterar foto</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          <Text style={styles.label}>Nome / Razão Social</Text>
          <TextInput 
            style={styles.input} 
            value={nome} 
            onChangeText={setNome} 
            placeholder="Seu nome"
          />

          <Text style={styles.label}>Telefone / Celular</Text>
          <TextInput 
            style={styles.input} 
            value={telefone} 
            onChangeText={handlePhoneChange} 
            keyboardType="phone-pad"
            placeholder="(00) 00000-0000"
            maxLength={16}
          />

          <Text style={styles.label}>E-mail (Não editável)</Text>
          <TextInput 
            style={[styles.input, styles.disabledInput]} 
            value={email} 
            editable={false} 
          />

          <Text style={styles.label}>{isCompany ? "CNPJ" : "CPF"} (Não editável)</Text>
          <TextInput 
            style={[styles.input, styles.disabledInput]} 
            value={cpf} // Agora o valor vem formatado
            editable={false} 
          />

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Endereço Principal</Text>
          
          <Text style={styles.label}>CEP</Text>
          <TextInput 
            style={styles.input} 
            value={cep} 
            onChangeText={handleCepChange} 
            keyboardType="numeric"
            placeholder="00000-000"
            maxLength={9}
          />

          <Text style={styles.label}>Logradouro (Rua, Av.)</Text>
          <TextInput 
            style={styles.input} 
            value={rua} 
            onChangeText={setRua} 
            placeholder="Rua"
          />

          <View style={styles.rowContainer}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Número</Text>
              <TextInput 
                style={styles.input} 
                value={numero} 
                onChangeText={(text) => setNumero(text.replace(/[^0-9]/g, ''))} 
                keyboardType="numeric"
                placeholder="123"
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={styles.label}>Bairro</Text>
              <TextInput 
                style={styles.input} 
                value={bairro} 
                onChangeText={setBairro} 
                placeholder="Bairro"
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  saveButtonText: { fontSize: 16, fontWeight: 'bold' }, // Cor via style dinâmico
  content: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    marginBottom: 10, 
    elevation: 5,
    backgroundColor: '#FFF', 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarImage: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    borderWidth: 3, 
    borderColor: '#FFF', 
    backgroundColor: '#F5F5F5' 
  },
  avatarPlaceholder: {
    width: 110,
    height: 110, 
    borderRadius: 55, 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3, 
    borderColor: '#FFF',
  },
  editIconBg: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  changePhotoText: { fontSize: 15, fontWeight: '600' }, // Cor via style dinâmico
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  label: { fontSize: 14, color: '#666', marginBottom: 5, marginTop: 10 },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: { backgroundColor: '#F0F0F0', color: '#888' },
  rowContainer: { flexDirection: 'row', alignItems: 'center' },
});