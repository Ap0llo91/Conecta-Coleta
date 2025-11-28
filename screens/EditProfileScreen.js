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

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // Garante que carrega ao entrar na tela
  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          setLoading(false);
          return;
      }

      // 1. Busca Dados Pessoais
      const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*') 
        .eq('usuario_id', user.id)
        .single();

      if (profile) {
        setNome(profile.nome_razao_social || '');
        if (profile.telefone) setTelefone(applyPhoneMask(profile.telefone));
        setEmail(profile.email || '');
        setCpf(profile.cpf_cnpj || '');
        if (profile.foto_url) setImageUri(profile.foto_url);
      } else if (profileError) {
          console.log("Erro ao buscar usuario:", profileError.message);
      }

      // 2. Busca o Endereço
      let addressData = null;

      const { data: defaultAddr } = await supabase
        .from('enderecos')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('is_padrao', true)
        .limit(1)
        .maybeSingle();

      if (defaultAddr) {
        addressData = defaultAddr;
      } else {
        const { data: latestAddr } = await supabase
            .from('enderecos')
            .select('*')
            .eq('usuario_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (latestAddr) addressData = latestAddr;
      }

      if (addressData) {
        console.log("Endereço carregado para edição (ID):", addressData.id);
        setAddressId(addressData.id);
        
        // Lógica de Preenchimento CORRIGIDA
        if (addressData.numero || addressData.bairro) {
            // Caso já esteja salvo nas colunas corretas (ideal)
            setRua(addressData.rua || '');
            setNumero(addressData.numero ? String(addressData.numero) : '');
            setBairro(addressData.bairro || '');
        } else {
            // Caso esteja salvo tudo junto na coluna 'rua' (legado do cadastro)
            // Formato esperado: "Rua X, 123, Bairro Y"
            let r = addressData.rua || '';
            let n = '';
            let b = '';

            if (r.includes(',')) {
                const parts = r.split(',');
                
                // Se tiver 3 partes: Rua, Numero, Bairro
                if (parts.length >= 3) {
                    r = parts[0].trim();
                    n = parts[1].trim();
                    // Junta o resto caso o bairro tenha vírgulas
                    b = parts.slice(2).join(',').trim();
                } 
                // Se tiver 2 partes: Rua, Numero (e talvez bairro com traço)
                else if (parts.length === 2) {
                    r = parts[0].trim();
                    const part2 = parts[1].trim();
                    
                    if (part2.includes('-')) {
                        // Formato antigo com traço: "123 - Centro"
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
        setCep(addressData.cep || '');
      }

    } catch (error) {
      console.log('Erro geral ao carregar edição:', error);
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

      // 2. Atualiza ou Cria Endereço
      // Agora salvamos separadinho para não ter mais problema de parse
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

      if (addressId) {
        const { error: addrError } = await supabase
          .from('enderecos')
          .update(addressDataPayload)
          .eq('id', addressId);
          
        if (addrError) throw addrError;
      } else {
        const { error: addrError } = await supabase
          .from('enderecos')
          .insert(addressDataPayload);
          
        if (addrError) throw addrError;
      }

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
        <ActivityIndicator size="large" color="#007BFF" />
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
            <ActivityIndicator size="small" color="#007BFF" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar</Text>
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
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={60} color="#FFF" />
                </View>
              )}
              <View style={styles.editIconBg}>
                <Ionicons name="camera" size={18} color="#FFF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePhotoOptions}>
              <Text style={styles.changePhotoText}>Toque para alterar foto</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          <Text style={styles.label}>Nome Completo</Text>
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

          <Text style={styles.label}>CPF / CNPJ (Não editável)</Text>
          <TextInput 
            style={[styles.input, styles.disabledInput]} 
            value={cpf} 
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
                onChangeText={setNumero} 
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
  saveButtonText: { fontSize: 16, color: '#007BFF', fontWeight: 'bold' },

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
    backgroundColor: '#4285F4', 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  editIconBg: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007BFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  changePhotoText: { color: '#007BFF', fontSize: 15, fontWeight: '600' },

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