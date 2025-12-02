import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "./utils/supabaseClient";
import * as Linking from 'expo-linking';

// --- 1. Telas de Autenticação ---
import WelcomeScreen from "./screens/WelcomeScreen";
import CitizenAuthScreen from "./screens/CitizenAuthScreen";
import CompanyAuthScreen from "./screens/CompanyAuthScreen";
import RegisterChoiceScreen from "./screens/RegisterChoiceScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import UpdatePasswordScreen from "./screens/UpdatePasswordScreen";

// --- 2. Telas Principais (CIDADÃO) ---
import HomeScreen from "./screens/HomeScreen";
import RequestScreen from "./screens/RequestScreen";
import LearnScreen from "./screens/LearnScreen";
import ProfileScreen from "./screens/ProfileScreen";

// --- 3. Telas Principais (EMPRESA) ---
import CompanyHomeScreen from "./screens/CompanyHomeScreen";
import ServicesEmpresaScreen from "./screens/ServicesEmpresaScreen";
import RequestHealthServiceScreen from "./screens/RequestHealthServiceScreen";
import RequestOilServiceScreen from "./screens/RequestOilServiceScreen";
import RequestLargeVolumeScreen from "./screens/RequestLargeVolumeScreen";
import CertificatesScreen from "./screens/CertificatesScreen";

// --- 4. Telas de Serviço/Extras ---
import ReportProblemScreen from "./screens/ReportProblemScreen";
import ScheduleServiceScreen from "./screens/ScheduleServiceScreen";
import RequestDumpsterScreen from "./screens/RequestDumpsterScreen";
import RequestCataTrecoScreen from "./screens/RequestCataTrecoScreen";
import RequestUncollectedScreen from "./screens/RequestUncollectedScreen";
import HowItWorksScreen from "./screens/HowItWorksScreen";
import RecyclingBenefitsScreen from "./screens/RecyclingBenefitsScreen";
import DisposalTipsScreen from "./screens/DisposalTipsScreen";
import FAQScreen from "./screens/FAQScreen";
import MapScreen from "./screens/MapScreen";
import HistoryScreen from "./screens/HistoryScreen";
import RequestDetailsScreen from "./screens/RequestDetailsScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import EcopointsScreen from "./screens/EcopointsScreen";
import FindDisposalSiteScreen from "./screens/FindDisposalSiteScreen";

// --- 5. Tela de Tutorial ---
import TutorialScreen from "./screens/TutorialScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- CONFIGURAÇÃO DE DEEP LINKING ---
const linking = {
  prefixes: [Linking.createURL('/'), 'conectacoleta://'],
  config: {
    screens: {
      UpdatePassword: 'reset-password',
    },
  },
};

// --- ABAS DO CIDADÃO ---
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Coleta de Hoje") {
            return <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />;
          } else if (route.name === "Fazer Pedido") {
            return <MaterialCommunityIcons name={focused ? "calendar-plus" : "calendar-plus"} size={size} color={color} />;
          } else if (route.name === "Aprender") {
            return <MaterialCommunityIcons name={focused ? "tree" : "tree-outline"} size={size} color={color} />;
          } else if (route.name === "Meu Perfil") {
            return <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: "#007BFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { height: 60, paddingBottom: 5 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Coleta de Hoje" component={HomeScreen} />
      <Tab.Screen name="Fazer Pedido" component={RequestScreen} />
      <Tab.Screen name="Aprender" component={LearnScreen} />
      <Tab.Screen name="Meu Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// --- ABAS DA EMPRESA ---
function CompanyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Início") {
            return <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />;
          } else if (route.name === "Meu Perfil") {
            return <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: "#F0B90B",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { height: 60, paddingBottom: 5 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Início" component={CompanyHomeScreen} />
      <Tab.Screen name="Meu Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// --- Componente Raiz ---
export default function App() {
  const [session, setSession] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar fluxo de recuperação de senha
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    // 1. Verifica sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserType(session.user);
      } else {
        setLoading(false);
      }
    });

    // 2. Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        setSession(session);
        setLoading(false);
      } else if (event === 'SIGNED_IN') {
        setSession(session);
        if (!isPasswordRecovery) { 
            setLoading(true);
            await fetchUserType(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUserType(null);
        setIsPasswordRecovery(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isPasswordRecovery]);

  const fetchUserType = async (user) => {
    try {
      if (user.user_metadata?.tipo_usuario) {
        setUserType(user.user_metadata.tipo_usuario);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("usuarios")
        .select("tipo_usuario")
        .eq("usuario_id", user.id)
        .single();

      if (data) {
        setUserType(data.tipo_usuario);
      }
    } catch (error) {
      console.log("Erro ao buscar tipo:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {/* 'linking' para lidar com URLs externas */}
      <NavigationContainer linking={linking}>
        <Stack.Navigator>
          
          {/* FLUXO DE RECUPERAÇÃO DE SENHA (Prioridade Alta) */}
          {isPasswordRecovery ? (
             <Stack.Screen 
                name="UpdatePassword" 
                component={UpdatePasswordScreen} 
                options={{ headerShown: false }} 
             />
          ) : !session ? (
            // NÃO LOGADO
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="CitizenAuth" component={CitizenAuthScreen} options={{ headerShown: true }} />
              <Stack.Screen name="CompanyAuth" component={CompanyAuthScreen} options={{ headerShown: true }} />
              <Stack.Screen name="RegisterChoice" component={RegisterChoiceScreen} options={{ headerShown: true }} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true }} />
            </>
          ) : (
            // LOGADO (Fluxo Normal)
            <>
              {userType === "CNPJ" ? (
                <Stack.Screen name="AppTabs" component={CompanyTabs} options={{ headerShown: false }} />
              ) : (
                <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
              )}

              {/* Telas Comuns */}
              <Stack.Screen name="MapScreen" component={MapScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Ecopoints" component={EcopointsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="FindDisposalSite" component={FindDisposalSiteScreen} options={{ headerShown: false }} />
              
              {/* Telas Empresa */}
              <Stack.Screen name="ServicesEmpresa" component={ServicesEmpresaScreen} options={{ headerShown: false }} />
              <Stack.Screen name="RequestHealthService" component={RequestHealthServiceScreen} options={{ headerShown: false }} />
              <Stack.Screen name="RequestOilService" component={RequestOilServiceScreen} options={{ headerShown: false }} />
              <Stack.Screen name="RequestLargeVolume" component={RequestLargeVolumeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Certificates" component={CertificatesScreen} options={{ headerShown: false }} />

              {/* Telas Cidadão */}
              <Stack.Screen name="ReportProblem" component={ReportProblemScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ScheduleService" component={ScheduleServiceScreen} options={{ headerShown: false }} />
              <Stack.Screen name="RequestDumpster" component={RequestDumpsterScreen} options={{ headerShown: false }} />
              <Stack.Screen name="RequestCataTreco" component={RequestCataTrecoScreen} options={{ headerShown: false }} />
              <Stack.Screen name="RequestUncollected" component={RequestUncollectedScreen} options={{ headerShown: false }} />
              <Stack.Screen name="HowItWorks" component={HowItWorksScreen} options={{ headerShown: false }} />
              <Stack.Screen name="RecyclingBenefits" component={RecyclingBenefitsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="DisposalTips" component={DisposalTipsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="FAQ" component={FAQScreen} options={{ headerShown: false }} />
              <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
              <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Tutorial" component={TutorialScreen} options={{ headerShown: false }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}