// App.js
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native'; 
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { supabase } from './utils/supabaseClient'; 

// Telas de Autenticação
import WelcomeScreen from './screens/WelcomeScreen';
import CitizenAuthScreen from './screens/CitizenAuthScreen';
import CompanyAuthScreen from './screens/CompanyAuthScreen';
import RegisterChoiceScreen from './screens/RegisterChoiceScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

// Telas Principais (as 4 Abas)
import HomeScreen from './screens/HomeScreen';
import RequestScreen from './screens/RequestScreen';
import LearnScreen from './screens/LearnScreen';
import ProfileScreen from './screens/ProfileScreen';

// A Nova Tela de Reporte
import ReportProblemScreen from './screens/ReportProblemScreen'; // <-- IMPORTADO

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Grupo de Telas Principais (App com 4 abas) ---
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Coleta de Hoje') {
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
          } else if (route.name === 'Fazer Pedido') {
            return <MaterialCommunityIcons name={focused ? 'calendar-plus' : 'calendar-plus-outline'} size={size} color={color} />;
          } else if (route.name === 'Aprender') {
            return <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={color} />;
          } else if (route.name === 'Meu Perfil') {
            return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#007BFF', 
        tabBarInactiveTintColor: 'gray',
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* É AQUI QUE O STACK.NAVIGATOR FICA.
        Ele é o navegador principal que decide se mostra
        o Login ou o App principal.
      */}
      <Stack.Navigator 
        initialRouteName={session && session.user ? "AppTabs" : "Welcome"}
      >
        {/* Grupo de telas Pós-Login */}
        <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
        
        {/* Grupo de telas de Autenticação */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CitizenAuth" component={CitizenAuthScreen} options={{ headerShown: true, title: 'Acesso do Cidadão' }} />
        <Stack.Screen name="CompanyAuth" component={CompanyAuthScreen} options={{ headerShown: true, title: 'Acesso da Empresa' }} />
        <Stack.Screen name="RegisterChoice" component={RegisterChoiceScreen} options={{ headerShown: true, title: 'Criar uma conta' }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true, title: 'Recuperar Senha' }} />

        {/* Telas que você acessa de dentro do AppTabs (como o Reporte) */}
        <Stack.Screen 
          name="ReportProblem" 
          component={ReportProblemScreen}
          options={{ headerShown: false }} // O cabeçalho é personalizado
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}