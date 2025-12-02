import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { supabase } from "../utils/supabaseClient";

const primaryYellow = "#F0B90B";

export default function CertificatesScreen({ navigation }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Buscar dados da Empresa
      const { data: profile } = await supabase
        .from("usuarios")
        .select("nome_razao_social, cpf_cnpj")
        .eq("usuario_id", user.id)
        .single();

      if (profile) setCompanyData(profile);

      // 2. Buscar Chamados CONCLUÍDOS
      const { data: chamados, error } = await supabase
        .from("chamados")
        .select("*")
        .eq("usuario_id", user.id)
        .in("status", [
          "Concluído",
          "Finalizado",
          "FINALIZADO",
          "concluido",
          "finalizado",
        ])
        .order("data_criacao", { ascending: false });

      if (error) throw error;

      setCertificates(chamados || []);
    } catch (error) {
      console.log("Erro ao buscar certificados:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Data n/d";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const handleDownload = async (item) => {
    // CORREÇÃO 1: Usar chamado_id
    setDownloading(item.chamado_id);

    try {
      const empresaNome = companyData?.nome_razao_social || "Empresa Parceira";
      const empresaCnpj = companyData?.cpf_cnpj || "Não informado";
      const dataEmissao = formatDate(item.data_criacao);
      const tipoResiduo = item.tipo_problema || "Resíduos Gerais";
      const detalhes =
        item.descricao || "Coleta realizada conforme solicitação.";

      // CORREÇÃO 2: Usar chamado_id para gerar o hash
      const hash =
        item.chamado_id.split("-")[0].toUpperCase() +
        Math.floor(Math.random() * 10000);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
              .border-box { border: 10px solid #F0B90B; padding: 40px; height: 900px; position: relative; }
              .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }
              .logo { color: #F0B90B; font-size: 32px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; }
              .title { font-size: 36px; font-weight: bold; margin-top: 20px; color: #222; }
              .subtitle { font-size: 18px; color: #666; font-weight: normal; text-transform: uppercase; letter-spacing: 1px; }
              
              .content { font-size: 18px; line-height: 1.8; text-align: justify; margin: 40px 20px; }
              .highlight { font-weight: bold; color: #000; background-color: #FFFDE7; padding: 2px 5px; }
              
              .details { margin: 40px 20px; background: #f9f9f9; padding: 20px; border-radius: 8px; font-size: 16px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dotted #ccc; padding-bottom: 5px; }
              
              .signatures { margin-top: 80px; display: flex; justify-content: space-around; }
              .sign-box { text-align: center; }
              .line { width: 200px; border-top: 1px solid #333; margin-bottom: 10px; }
              
              .footer { position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="border-box">
              <div class="header">
                <div class="logo">CONECTA COLETA</div>
                <h1 class="title">CERTIFICADO DE DESTINAÇÃO FINAL</h1>
                <div class="subtitle">Resíduos Sólidos e Líquidos</div>
              </div>

              <div class="content">
                Certificamos para os devidos fins ambientais e legais que a empresa 
                <span class="highlight">${empresaNome}</span>, inscrita no CNPJ sob nº 
                <span class="highlight">${empresaCnpj}</span>, realizou a destinação ambientalmente adequada dos resíduos descritos abaixo.
              </div>

              <div class="details">
                <div class="row"><strong>Tipo de Resíduo:</strong> <span>${tipoResiduo}</span></div>
                <div class="row"><strong>Data da Coleta:</strong> <span>${dataEmissao}</span></div>
                <div class="row"><strong>Protocolo:</strong> <span>${
                  item.chamado_id
                }</span></div>
                <div class="row" style="border: none;"><strong>Detalhes:</strong></div>
                <div style="font-size: 14px; color: #555; margin-top: 5px;">${detalhes}</div>
              </div>

              <div class="content" style="font-size: 14px; text-align: center; color: #666;">
                A destinação foi realizada em conformidade com a Política Nacional de Resíduos Sólidos (Lei nº 12.305/2010).
              </div>

              <div class="signatures">
                <div class="sign-box">
                  <div class="line"></div>
                  <strong>Responsável Técnico</strong><br>CRQ 0423412
                </div>
                <div class="sign-box">
                  <div class="line"></div>
                  <strong>Conecta Coleta Operações</strong>
                </div>
              </div>

              <div class="footer">
                Autenticação Digital: ${hash}<br>
                Documento gerado eletronicamente em ${new Date().toLocaleString(
                  "pt-BR"
                )}
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
        });
      } else {
        Alert.alert("Erro", "Compartilhamento indisponível.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao gerar PDF: " + error.message);
    } finally {
      setDownloading(null);
    }
  };

  const renderCertificateItem = ({ item }) => (
    <View style={styles.certCard}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="file-pdf-box" size={40} color="#D32F2F" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.certTitle}>
          {item.tipo_problema || "Coleta Realizada"}
        </Text>
        <Text style={styles.certPeriod}>
          Data: {formatDate(item.data_criacao)}
        </Text>
        <Text style={styles.certMeta}>Status: {item.status}</Text>
      </View>

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => handleDownload(item)}
        // CORREÇÃO 3: Usar chamado_id no loading
        disabled={downloading === item.chamado_id}
      >
        {downloading === item.chamado_id ? (
          <ActivityIndicator size="small" color="#007BFF" />
        ) : (
          <Ionicons name="cloud-download-outline" size={24} color="#007BFF" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Meus Certificados</Text>
        <Text style={styles.headerSubtitle}>
          Comprovantes de destinação correta
        </Text>
      </SafeAreaView>

      <View style={styles.content}>
        {loading ? (
          <View style={{ marginTop: 50 }}>
            <ActivityIndicator size="large" color={primaryYellow} />
          </View>
        ) : certificates.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={60}
              color="#CCC"
            />
            <Text style={styles.emptyText}>Nenhum certificado disponível.</Text>
            <Text style={styles.emptySubText}>
              Os certificados aparecem aqui após a conclusão das coletas.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.infoBox}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#2E7D32"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.infoText}>
                Documentos oficiais gerados a partir das suas solicitações
                concluídas.
              </Text>
            </View>

            <FlatList
              data={certificates}
              // CORREÇÃO 4: Usar chamado_id no keyExtractor
              keyExtractor={(item) => item.chamado_id.toString()}
              renderItem={renderCertificateItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[primaryYellow]}
                />
              }
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    backgroundColor: primaryYellow,
    paddingHorizontal: 20,
    paddingBottom: 25,
    paddingTop: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  backButton: { flexDirection: "row", alignItems: "center" },
  backText: { color: "#333", fontSize: 16, marginLeft: 5, fontWeight: "500" },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  headerSubtitle: { fontSize: 14, color: "#444", opacity: 0.9 },
  content: { flex: 1, padding: 20 },
  infoBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  infoText: { color: "#2E7D32", fontSize: 13, flex: 1, lineHeight: 18 },
  certCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  certTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  certPeriod: { fontSize: 13, color: "#666", marginBottom: 2 },
  certMeta: { fontSize: 11, color: "#999", fontWeight: "600" },
  downloadButton: {
    padding: 10,
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
    marginLeft: 10,
  },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 50 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#555", marginTop: 15 },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 40,
  },
});
