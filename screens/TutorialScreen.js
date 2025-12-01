import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  useWindowDimensions, 
  TouchableOpacity, 
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

// --- DADOS DOS SLIDES ---
const SLIDES = [
  {
    id: '1',
    title: 'Bem-vindo ao Conecta Coleta!',
    description: 'A solução completa para gerenciar seus resíduos em Recife. \n\nVamos fazer um tour rápido pelo app?',
    icon: 'recycle',
    color: '#00A859', // Verde Principal
    lib: MaterialCommunityIcons,
  },
  {
    id: '2',
    title: 'Nunca Mais Perca o Caminhão',
    description: 'Na tela inicial, você vê um cronômetro em tempo real dizendo exatamente quando o caminhão vai passar na sua porta.',
    icon: 'clock-fast', 
    color: '#007BFF', // Azul
    lib: MaterialCommunityIcons
  },
  {
    id: '3',
    title: 'Mapa Inteligente',
    description: 'Acompanhe o trajeto do caminhão ao vivo e encontre os Ecopontos e locais de reciclagem mais próximos de você.',
    icon: 'map-search-outline',
    color: '#F0B90B', // Amarelo
    lib: MaterialCommunityIcons
  },
  {
    id: '4',
    title: 'Solicite Serviços na Palma da Mão',
    description: 'Precisa descartar um sofá velho ou entulho?\nAgende o Cata-Treco, solicite Caçambas ou reporte problemas na sua rua.',
    icon: 'calendar-check',
    color: '#8E44AD', // Roxo
    lib: MaterialCommunityIcons
  },
  {
    id: '5',
    title: 'Aprenda e Recicle',
    description: 'Acesse dicas de descarte, tire dúvidas e veja como separar seu lixo corretamente na aba "Aprender".',
    icon: 'school-outline',
    color: '#2ECC71', // Verde Claro
    lib: Ionicons
  },
];

export default function TutorialScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    // Força a navegação para a Home (AppTabs), limpando o histórico para não voltar ao tutorial
    navigation.reset({
        index: 0,
        routes: [{ name: 'AppTabs' }], 
    });
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
                      backgroundColor: SLIDES[i].color 
                  }
              ]} 
              key={i.toString()} 
            />
          );
        })}
      </View>
    );
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Botão Pular no Topo */}
      {!isLastSlide && (
          <TouchableOpacity onPress={handleFinish} style={styles.topSkipButton}>
              <Text style={styles.topSkipText}>Pular</Text>
          </TouchableOpacity>
      )}

      <View style={{ flex: 3 }}>
        <FlatList
          data={SLIDES}
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
        <Paginator data={SLIDES} scrollX={scrollX} />

        {/* Botão Principal com Largura Dinâmica */}
        <TouchableOpacity 
            style={[
                styles.nextButton, 
                { backgroundColor: SLIDES[currentIndex].color },
                // Se for o último slide, usa padding para caber o texto. Se não, largura fixa para ficar redondo.
                isLastSlide ? { paddingHorizontal: 30, width: 'auto' } : { width: 70 }
            ]} 
            onPress={handleNext}
        >
            {isLastSlide ? (
                <Text style={styles.nextButtonText}>Começar</Text>
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
    fontSize: 26,
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
  
  // Estilo Base do Botão
  nextButton: {
      borderRadius: 35,
      height: 70,
      // width: removido daqui e controlado dinamicamente no componente
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
      fontSize: 18, // Aumentei um pouco a fonte
      letterSpacing: 1,
  },
});