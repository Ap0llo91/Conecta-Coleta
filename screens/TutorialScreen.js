import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  useWindowDimensions, 
  TouchableOpacity, 
  Animated,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- DADOS DO TUTORIAL CIDADÃO ---
const CITIZEN_SLIDES = [
  {
    id: '1',
    title: 'Bem-vindo ao Conecta Coleta!',
    description: 'A solução completa para gerenciar seus resíduos em Recife. \n\nVamos fazer um tour rápido?',
    icon: 'recycle',
    color: '#00A859',
    lib: MaterialCommunityIcons,
  },
  {
    id: '2',
    title: 'Nunca Mais Perca o Caminhão',
    description: 'Na tela inicial, veja em tempo real quando o caminhão de coleta vai passar na sua porta.',
    icon: 'clock-fast', 
    color: '#007BFF',
    lib: MaterialCommunityIcons
  },
  {
    id: '3',
    title: 'Solicite Serviços',
    description: 'Precisa descartar um sofá velho ou entulho? Agende o Cata-Treco ou solicite Caçambas pelo app.',
    icon: 'calendar-check',
    color: '#8E44AD',
    lib: MaterialCommunityIcons
  },
  {
    id: '4',
    title: 'Aprenda e Recicle',
    description: 'Encontre Ecopontos próximos e veja dicas de como separar seu lixo corretamente.',
    icon: 'map-search-outline',
    color: '#F0B90B',
    lib: MaterialCommunityIcons
  },
];

// --- DADOS DO TUTORIAL EMPRESA ---
const COMPANY_SLIDES = [
  {
    id: '1',
    title: 'Bem-vindo, Parceiro!',
    description: 'Gerencie a logística reversa e os resíduos da sua empresa com eficiência e conformidade legal.',
    icon: 'office-building',
    color: '#F0B90B',
    lib: MaterialCommunityIcons,
  },
  {
    id: '2',
    title: 'Resíduos Especiais',
    description: 'Solicite coleta especializada para óleo de cozinha, resíduos de saúde e materiais perigosos.',
    icon: 'biohazard', 
    color: '#D32F2F',
    lib: MaterialCommunityIcons
  },
  {
    id: '3',
    title: 'Grandes Volumes',
    description: 'Produz muito resíduo? Agende coletas de grande porte e defina a frequência ideal para seu negócio.',
    icon: 'truck-flatbed',
    color: '#2E7D32',
    lib: MaterialCommunityIcons
  },
  {
    id: '4',
    title: 'Certificados (CDF)',
    description: 'Receba automaticamente seus Certificados de Destinação Final após cada coleta concluída.',
    icon: 'file-certificate-outline',
    color: '#1976D2',
    lib: MaterialCommunityIcons
  },
];

export default function TutorialScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState(CITIZEN_SLIDES);
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const isFromSettings = route.params?.fromSettings;

  // --- DETECÇÃO DE TIPO DE USUÁRIO ---
  useEffect(() => {
    const detectUserType = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data } = await supabase
            .from('usuarios')
            .select('tipo_usuario')
            .eq('usuario_id', user.id)
            .single();
          
          if (data && data.tipo_usuario === 'CNPJ') {
            setSlides(COMPANY_SLIDES);
          } else {
            setSlides(CITIZEN_SLIDES);
          }
        }
      } catch (error) {
        console.log("Erro ao detectar usuário para tutorial:", error);
      } finally {
        setLoading(false);
      }
    };

    detectUserType();
  }, []);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (isFromSettings) {
      navigation.goBack();
    } else {
      await AsyncStorage.setItem('hasSeenTutorial', 'true');
      navigation.reset({
        index: 0,
        routes: [{ name: 'AppTabs' }], 
      });
    }
  };

  const Paginator = ({ data, scrollX }) => {
    return (
      <View style={styles.paginatorContainer}>
        {data.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 30, 10],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View 
              style={[
                  styles.dot, 
                  { 
                      width: dotWidth, 
                      opacity, 
                      backgroundColor: data[i].color 
                  }
              ]} 
              key={i.toString()} 
            />
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Botão Pular (Só aparece se não for o último slide) */}
      {!isLastSlide && (
          <TouchableOpacity onPress={handleFinish} style={styles.topSkipButton}>
            <Text style={styles.topSkipText}>
                {isFromSettings ? 'Fechar' : 'Pular'}
            </Text>
          </TouchableOpacity>
      )}

      <View style={{ flex: 3 }}>
        <FlatList
          data={slides}
          renderItem={({ item }) => {
              const IconLib = item.lib;
              return (
                <View style={[styles.slide, { width }]}>
                    <View style={[styles.imageContainer, { backgroundColor: item.color + '15' }]}> 
                        <View style={[styles.circleDeco, { borderColor: item.color, width: 280, height: 280, opacity: 0.1 }]} />
                        <View style={[styles.circleDeco, { borderColor: item.color, width: 220, height: 220, opacity: 0.2 }]} />
                        
                        <IconLib name={item.icon} size={100} color={item.color} />
                    </View>

                    <Text style={[styles.title, { color: item.color }]}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
              );
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View style={styles.bottomContainer}>
        <Paginator data={slides} scrollX={scrollX} />

        {/* Botão Principal */}
        <TouchableOpacity 
            style={[
                styles.nextButton, 
                { backgroundColor: slides[currentIndex].color },
                isLastSlide ? { paddingHorizontal: 30, width: 'auto' } : { width: 70 }
            ]} 
            onPress={handleNext}
        >
            {isLastSlide ? (
                <Text style={styles.nextButtonText}>
                    {isFromSettings ? 'Fechar Tutorial' : 'Começar!'}
                </Text>
            ) : (
                <Ionicons name="arrow-forward" size={28} color="white" />
            )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSkipButton: {
      position: 'absolute',
      top: 20, 
      right: 20,
      zIndex: 10,
      padding: 10,
  },
  topSkipText: {
      color: '#999',
      fontSize: 16,
      fontWeight: '600',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  imageContainer: {
      width: 300,
      height: 300,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 40,
      position: 'relative',
      borderRadius: 150,
  },
  circleDeco: {
      position: 'absolute',
      borderRadius: 200,
      borderWidth: 2,
  },
  title: {
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontWeight: '400',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  bottomContainer: {
      flex: 1, 
      justifyContent: 'space-evenly',
      alignItems: 'center',
      paddingBottom: 20,
  },
  paginatorContainer: {
    flexDirection: 'row',
    height: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
  },
  nextButton: {
      borderRadius: 35,
      height: 70,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      marginBottom: 20,
  },
  nextButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 18,
      letterSpacing: 1,
  },
});