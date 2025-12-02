import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import * as Location from 'expo-location';

const PROBLEM_TYPES = [
  "Lixo acumulado na rua",
  "Coleta não realizada",
  "Ecoponto lotado/sujo",
  "Descarte irregular",
  "Boca de lobo entupida",
  "Outros",
];

export default function ReportProblemScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      }
    })();
  }, []);

  // --- 1. FUNÇÃO DE SELEÇÃO DE IMAGEM ---
  const pickImage = async (useCamera) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permissão necessária", "Precisamos de acesso à câmera.");
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permissão necessária", "Precisamos de acesso à galeria.");
          return;
        }
      }

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      };

      let result;
      if (useCamera) {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setImageBase64(result.assets[0].base64);
        setPhotoModalVisible(false);
      }
    } catch (error) {
      console.log("Erro ao capturar imagem:", error);
      Alert.alert("Erro", "Não foi possível carregar a imagem.");
    }
  };

  const uploadImageToSupabase = async () => {
    if (!imageBase64) return null;

    const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
      .from("problem-reports")
      .upload(filePath, decode(imageBase64), {
        contentType: "image/jpeg",
      });

    if (error) {
      console.log("Erro no upload da imagem:", error);
      throw error;
    }

    const { data } = supabase.storage
      .from("problem-reports")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!type || !description || !address) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha tipo, descrição e endereço.");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let finalPhotoUrl = null;

      if (imageBase64) {
        finalPhotoUrl = await uploadImageToSupabase();
      }

      const { error } = await supabase
        .from("chamados")
        .insert({
          usuario_id: user.id,
          tipo_problema: type,
          descricao: description,
          endereco_local: address,
          foto_url: finalPhotoUrl,
          status: "Pendente",
          latitude: userLocation?.latitude || 0,
          longitude: userLocation?.longitude || 0,
        });

      if (error) throw error;

      // Mostra o Modal Bonito em vez do Alert
      setSuccessModalVisible(true);

    } catch (error) {
      console.log("Erro ao enviar:", error);
      Alert.alert("Erro", "Falha ao enviar reporte. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = async () => {
      if (!userLocation) {
          Alert.alert("GPS", "Aguardando sinal de GPS...");
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location.coords);
          }
          return;
      }

      setLoadingAddress(true);
      try {
          const reverseGeocoded = await Location.reverseGeocodeAsync(userLocation);
          if (reverseGeocoded.length > 0) {
              const place = reverseGeocoded[0];
              let addrParts = [];
              if (place.street) addrParts.push(place.street);
              if (place.streetNumber) addrParts.push(place.streetNumber);
              if (place.district) addrParts.push(place.district);
              
              const formattedAddress = addrParts.join(", ");
              
              if (formattedAddress) {
                  setAddress(formattedAddress);
              } else {
                  setAddress("Localização capturada");
              }
          }
      } catch (error) {
          console.log("Erro reverse geocoding:", error);
          setAddress(`Lat: ${userLocation.latitude.toFixed(5)}, Long: ${userLocation.longitude.toFixed(5)}`);
      } finally {
          setLoadingAddress(false);
      }
  };

  const handleSuccessClose = () => {
      setSuccessModalVisible(false);
      navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportar Problema</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.helperText}>
            Identificou algo errado na coleta ou limpeza? Nos conte os detalhes.
          </Text>

          <Text style={styles.label}>Tipo de Problema</Text>
          <TouchableOpacity 
            style={styles.pickerTrigger} 
            onPress={() => setShowTypePicker(!showTypePicker)}
          >
            <Text style={[styles.pickerText, !type && { color: '#999' }]}>
              {type || "Selecione o tipo"}
            </Text>
            <Ionicons name={showTypePicker ? "chevron-up" : "chevron-down"} size={20} color="#666" />
          </TouchableOpacity>
          
          {showTypePicker && (
            <View style={styles.pickerOptions}>
              {PROBLEM_TYPES.map((item) => (
                <TouchableOpacity 
                    key={item} 
                    style={styles.pickerOption}
                    onPress={() => {
                        setType(item);
                        setShowTypePicker(false);
                    }}
                >
                    <Text style={styles.optionText}>{item}</Text>
                    {type === item && <Ionicons name="checkmark" size={18} color="#D32F2F" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva o problema em detalhes..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Endereço / Ponto de Referência</Text>
          <View style={styles.addressRow}>
            <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Rua, número, bairro"
                value={address}
                onChangeText={setAddress}
            />
            <TouchableOpacity 
                style={styles.gpsButton} 
                onPress={useCurrentLocation}
                disabled={loadingAddress}
            >
                {loadingAddress ? (
                    <ActivityIndicator size="small" color="#007BFF" />
                ) : (
                    <Ionicons name="location" size={24} color="#007BFF" />
                )}
            </TouchableOpacity>
          </View>
          <Text style={styles.locationHint}>Toque no botão azul para preencher com sua localização atual</Text>

          <Text style={styles.label}>Foto (Opcional)</Text>
          <TouchableOpacity style={styles.photoButton} onPress={() => setPhotoModalVisible(true)}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={40} color="#999" />
                <Text style={styles.photoText}>Adicionar foto do problema</Text>
              </View>
            )}
            {imageUri && (
                <TouchableOpacity 
                    style={styles.removeIcon} 
                    onPress={() => { setImageUri(null); setImageBase64(null); }}
                >
                    <Ionicons name="close-circle" size={24} color="#D32F2F" />
                </TouchableOpacity>
            )}
          </TouchableOpacity>

          <View style={{ height: 20 }} />

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <>
                    <Ionicons name="paper-plane-outline" size={20} color="white" style={{ marginRight: 10 }} />
                    <Text style={styles.submitText}>Enviar Reporte</Text>
                </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- MODAL DE FOTO --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={photoModalVisible}
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPhotoModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />
          <Text style={styles.bottomSheetTitle}>Adicionar Foto</Text>
          <Text style={styles.bottomSheetSubtitle}>Escolha como deseja enviar a imagem</Text>
          
          <View style={styles.bottomSheetOptions}>
            <TouchableOpacity style={styles.optionButton} onPress={() => pickImage(true)}>
              <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="camera" size={28} color="#007BFF" />
              </View>
              <Text style={styles.optionLabel}>Câmera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={() => pickImage(false)}>
              <View style={[styles.optionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="images" size={28} color="#2E7D32" />
              </View>
              <Text style={styles.optionLabel}>Galeria</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setPhotoModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* --- MODAL DE SUCESSO --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.successOverlay}>
            <View style={styles.successCard}>
                <View style={styles.successIconContainer}>
                    <Ionicons name="checkmark-circle" size={64} color="#2ECC71" />
                </View>
                <Text style={styles.successTitle}>Sucesso!</Text>
                <Text style={styles.successMessage}>Seu reporte foi enviado. Obrigado por colaborar com a limpeza da cidade!</Text>
                
                <TouchableOpacity style={styles.successButton} onPress={handleSuccessClose}>
                    <Text style={styles.successButtonText}>OK, Voltar</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 20,
    backgroundColor: "#D32F2F",
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "white" },
  
  content: { padding: 20 },
  helperText: { color: "#666", marginBottom: 20, fontSize: 14 },

  label: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 8, marginTop: 10 },
  
  pickerTrigger: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#DDD",
      borderRadius: 8,
      padding: 15,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
  },
  pickerText: { fontSize: 16, color: "#333" },
  pickerOptions: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#DDD",
      borderTopWidth: 0,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      overflow: "hidden",
  },
  pickerOption: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#F5F5F5",
      flexDirection: 'row',
      justifyContent: 'space-between'
  },
  optionText: { fontSize: 15, color: "#444" },

  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  textArea: { height: 100 },
  
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  gpsButton: {
      padding: 10,
      backgroundColor: 'white',
      marginLeft: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#DDD',
      height: 50,
      width: 50,
      justifyContent: 'center',
      alignItems: 'center'
  },
  locationHint: { fontSize: 12, color: '#888', marginTop: 5, marginBottom: 15 },

  photoButton: {
      height: 180,
      borderWidth: 2,
      borderColor: "#DDD",
      borderStyle: "dashed",
      borderRadius: 12,
      backgroundColor: "#FAFAFA",
      justifyContent: "center",
      alignItems: "center",
      overflow: 'hidden',
      position: 'relative'
  },
  photoPlaceholder: { alignItems: "center" },
  photoText: { color: "#999", marginTop: 10 },
  previewImage: { width: "100%", height: "100%" },
  removeIcon: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'white',
      borderRadius: 12,
      elevation: 2
  },

  submitButton: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  submitText: { color: "white", fontSize: 18, fontWeight: "bold" },

  // --- ESTILOS DO BOTTOM SHEET (FOTO) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 40,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  bottomSheetOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  optionButton: {
    alignItems: 'center',
    width: 100,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // --- ESTILOS DO MODAL DE SUCESSO ---
  successOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  successCard: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 25,
      width: '90%',
      alignItems: 'center',
      elevation: 10,
  },
  successIconContainer: {
      marginBottom: 15,
  },
  successTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
  },
  successMessage: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 25,
      lineHeight: 22,
  },
  successButton: {
      backgroundColor: '#2ECC71',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 30,
      width: '100%',
      alignItems: 'center',
  },
  successButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  },
});