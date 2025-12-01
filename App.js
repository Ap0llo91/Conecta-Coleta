import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "./utils/supabaseClient";

// --- 1. Telas de Autenticação ---
import WelcomeScreen from "./screens/WelcomeScreen";
import CitizenAuthScreen from "./screens/CitizenAuthScreen";
import CompanyAuthScreen from "./screens/CompanyAuthScreen";
import RegisterChoiceScreen from "./screens/RegisterChoiceScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";

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
import RequestLargeVolumeScreen from "./screens/RequestLargeVolumeScreen"; // <--- NOVO IMPORT

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

// --- ABAS DO CIDADÃO ---
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Coleta de Hoje") {
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            );
          } else if (route.name === "Fazer Pedido") {
            return (
              <MaterialCommunityIcons
                name={focused ? "calendar-plus" : "calendar-plus"}
                size={size}
                color={color}
              />
            );
          } else if (route.name === "Aprender") {
            return (
              <MaterialCommunityIcons
                name={focused ? "tree" : "tree-outline"}
                size={size}
                color={color}
              />
            );
          } else if (route.name === "Meu Perfil") {
            return (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size}
                color={color}
              />
            );
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
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            );
          } else if (route.name === "Meu Perfil") {
            return (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size}
                color={color}
              />
            );
          }
        },
        tabBarActiveTintColor: "#F0B90B", // Amarelo da Empresa
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
  const [userType, setUserType] = useState(null); // 'CPF' ou 'CNPJ'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await fetchUserType(session.user.id);
      } else {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setLoading(true);
        await fetchUserType(session.user.id);
      } else {
        setUserType(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserType = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("tipo_usuario")
        .eq("usuario_id", userId)
        .single();

      if (data) {
        setUserType(data.tipo_usuario);
      }
    } catch (error) {
      console.log("Erro ao buscar tipo de usuário:", error);
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
      <NavigationContainer>
        <Stack.Navigator>
          {!session ? (
            // Não Logado
            <>
              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CitizenAuth"
                component={CitizenAuthScreen}
                options={{ headerShown: true }}
              />
              <Stack.Screen
                name="CompanyAuth"
                component={CompanyAuthScreen}
                options={{ headerShown: true }}
              />
              <Stack.Screen
                name="RegisterChoice"
                component={RegisterChoiceScreen}
                options={{ headerShown: true }}
              />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{ headerShown: true }}
              />
            </>
          ) : (
            // Logado
            <>
              {userType === "CNPJ" ? (
                <Stack.Screen
                  name="AppTabs"
                  component={CompanyTabs}
                  options={{ headerShown: false }}
                />
              ) : (
                <Stack.Screen
                  name="AppTabs"
                  component={AppTabs}
                  options={{ headerShown: false }}
                />
              )}

              {/* Telas Comuns */}
              <Stack.Screen
                name="MapScreen"
                component={MapScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Ecopoints"
                component={EcopointsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="FindDisposalSite"
                component={FindDisposalSiteScreen}
                options={{ headerShown: false }}
              />

              {/* --- TELAS DA EMPRESA --- */}
              <Stack.Screen
                name="ServicesEmpresa"
                component={ServicesEmpresaScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RequestHealthService"
                component={RequestHealthServiceScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RequestOilService"
                component={RequestOilServiceScreen}
                options={{ headerShown: false }}
              />
              {/* --- NOVA TELA DE GRANDE VOLUME --- */}
              <Stack.Screen
                name="RequestLargeVolume"
                component={RequestLargeVolumeScreen}
                options={{ headerShown: false }}
              />

              {/* Telas Extras Cidadão */}
              <Stack.Screen
                name="ReportProblem"
                component={ReportProblemScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ScheduleService"
                component={ScheduleServiceScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RequestDumpster"
                component={RequestDumpsterScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RequestCataTreco"
                component={RequestCataTrecoScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RequestUncollected"
                component={RequestUncollectedScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="HowItWorks"
                component={HowItWorksScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RecyclingBenefits"
                component={RecyclingBenefitsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DisposalTips"
                component={DisposalTipsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="FAQ"
                component={FAQScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RequestDetails"
                component={RequestDetailsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ headerShown: false }}
              />

              {/* --- TELA DE TUTORIAL REGISTRADA --- */}
              <Stack.Screen
                name="Tutorial"
                component={TutorialScreen}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
