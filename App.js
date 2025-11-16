import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// IMPORTANTE: Envolver o app no SafeAreaProvider
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "./utils/supabaseClient";

// Telas de Autenticação
import WelcomeScreen from "./screens/WelcomeScreen";
import CitizenAuthScreen from "./screens/CitizenAuthScreen";
import CompanyAuthScreen from "./screens/CompanyAuthScreen";
import RegisterChoiceScreen from "./screens/RegisterChoiceScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";

// Telas Principais (as 4 Abas)
import HomeScreen from "./screens/HomeScreen";
import RequestScreen from "./screens/RequestScreen";
import LearnScreen from "./screens/LearnScreen";
import ProfileScreen from "./screens/ProfileScreen";

// Telas de Serviço
import ReportProblemScreen from "./screens/ReportProblemScreen";
import ScheduleServiceScreen from "./screens/ScheduleServiceScreen";
import RequestDumpsterScreen from "./screens/RequestDumpsterScreen";
import RequestCataTrecoScreen from "./screens/RequestCataTrecoScreen";
import RequestUncollectedScreen from "./screens/RequestUncollectedScreen"; // <--- (1) NOVO IMPORT

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Grupo de Telas Principais (App com 4 abas) ---
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
                name={focused ? "calendar-plus" : "calendar-plus-outline"}
                size={size}
                color={color}
              />
            );
          } else if (route.name === "Aprender") {
            return (
              <Ionicons
                name={focused ? "book" : "book-outline"}
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

// --- Componente Raiz ---
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    // Envolvendo tudo com SafeAreaProvider para gerir os insets corretamente
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={session && session.user ? "AppTabs" : "Welcome"}
        >
          {/* Grupo de telas Pós-Login */}
          <Stack.Screen
            name="AppTabs"
            component={AppTabs}
            options={{ headerShown: false }}
          />

          {/* Grupo de telas de Autenticação */}
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CitizenAuth"
            component={CitizenAuthScreen}
            options={{ headerShown: true, title: "Acesso do Cidadão" }}
          />
          <Stack.Screen
            name="CompanyAuth"
            component={CompanyAuthScreen}
            options={{ headerShown: true, title: "Acesso da Empresa" }}
          />
          <Stack.Screen
            name="RegisterChoice"
            component={RegisterChoiceScreen}
            options={{ headerShown: true, title: "Criar uma conta" }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: true, title: "Recuperar Senha" }}
          />

          {/* Telas de Serviços */}
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
          {/* (2) NOVA ROTA LIXO NÃO COLETADO REGISTRADA AQUI */}
          <Stack.Screen
            name="RequestUncollected"
            component={RequestUncollectedScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
