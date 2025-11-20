import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Alert, Modal } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// --- 1. COMPONENTE PARA ESTABILIZAR ÍCONES ---
const StableMarker = ({ coordinate, onPress, children }) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Marker coordinate={coordinate} onPress={onPress} tracksViewChanges={tracksViewChanges}>
      {children}
    </Marker>
  );
};

// --- 2. ESTILO DO MAPA (CLEAN & WHITE) ---
const MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9e7f8" }] }, 
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
];

// --- DADOS REAIS (RECIFE - ZONA NORTE E SUL) ---

// Ponto médio para mostrar o mapa geral de Recife
const INITIAL_REGION = {
  latitude: -8.0849, 
  longitude: -34.9027,
  latitudeDelta: 0.12, // Zoom mais aberto para ver Norte e Sul
  longitudeDelta: 0.12,
};

// Rota simulada (Caminhão na Zona Sul - Boa Viagem)
const TRUCK_ROUTE = [
  { latitude: -8.112000, longitude: -34.895000 },
  { latitude: -8.114500, longitude: -34.896000 }, 
  { latitude: -8.117000, longitude: -34.897000 },
  { latitude: -8.119500, longitude: -34.898000 },
  { latitude: -8.122000, longitude: -34.899000 }, 
  { latitude: -8.119500, longitude: -34.898000 }, 
  { latitude: -8.117000, longitude: -34.897000 },
];

const FIXED_POINTS = [
  // --- ZONA SUL ---
  { 
    id: 1, 
    type: 'ecoponto', 
    title: 'Ecoponto Boa Viagem', 
    address: 'Praça de Boa Viagem, s/n', 
    hours: 'Aberto 24h', 
    coords: { latitude: -8.127500, longitude: -34.902000 }, 
    materials: ['Papel', 'Plástico', 'Metal', 'Vidro'] 
  },
  { 
    id: 2, 
    type: 'reciclagem', 
    title: 'Ponto Shopping Recife', 
    address: 'Rua Padre Carapuceiro, 777', 
    hours: 'Seg-Sáb: 10h-22h', 
    coords: { latitude: -8.118500, longitude: -34.904500 }, 
    materials: ['Eletrônicos', 'Pilhas', 'Baterias'] 
  },
  { 
    id: 3, 
    type: 'proibido', 
    title: 'Canal Setúbal (Margem)', 
    address: 'Rua Cosmorama, próximo à ponte', 
    warning: 'Área de proteção ambiental. Proibido descarte.', 
    coords: { latitude: -8.135000, longitude: -34.908000 } 
  },

  // --- ZONA NORTE ---
  { 
    id: 4, 
    type: 'ecoponto', 
    title: 'Ecoponto Jaqueira', 
    address: 'Parque da Jaqueira (Entrada Norte)', 
    hours: 'Diariamente: 5h às 22h', 
    coords: { latitude: -8.037500, longitude: -34.906500 }, 
    materials: ['Papel', 'Plástico', 'Metal', 'Óleo'] 
  },
  { 
    id: 5, 
    type: 'reciclagem', 
    title: 'Coleta Plaza Casa Forte', 
    address: 'Rua Dr. João Santos Filho, 255', 
    hours: 'Seg-Sáb: 10h-22h', 
    coords: { latitude: -8.036000, longitude: -34.912000 }, 
    materials: ['Vidro', 'Eletrônicos'] 
  },
  { 
    id: 6, 
    type: 'proibido', 
    title: 'Margem Rio Capibaribe', 
    address: 'Av. Beira Rio (Trecho Graças)', 
    warning: 'Área de preservação permanente. Sujeito a multa.', 
    coords: { latitude: -8.045000, longitude: -34.900000 } 
  }
];

export default function MapScreen({ navigation }) {
  const mapRef = useRef(null);
  const [currentTruckPos, setCurrentTruckPos] = useState(TRUCK_ROUTE[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  const [filters, setFilters] = useState({
    ecoponto: true,
    reciclagem: true,
    proibido: true,
    caminhao: true,
  });

  // Simulação GPS
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTruckPos(prev => {
        const currentIndex = TRUCK_ROUTE.indexOf(prev);
        const nextIndex = (currentIndex + 1) % TRUCK_ROUTE.length;
        return TRUCK_ROUTE[nextIndex];
      });
    }, 4000); 
    return () => clearInterval(interval);
  }, []);

  // Função para focar no caminhão (Zona Sul)
  const handleCenterOnTruck = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentTruckPos.latitude,
        longitude: currentTruckPos.longitude,
        latitudeDelta: 0.015, 
        longitudeDelta: 0.015,
      }, 1000);
    }
    setSelectedPoint({ type: 'caminhao', title: 'Caminhão da Coleta' });
  };

  // Foca no caminhão ao abrir (com delay)
  useEffect(() => {
    setTimeout(() => {
        handleCenterOnTruck();
    }, 1000);
  }, []);

  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMenuPress = () => {
    Alert.alert("Opções", "Configurações do mapa e notificações.");
  };

  const renderMarkerIcon = (type) => {
    switch (type) {
      case 'ecoponto': return <MarkerIcon color="#2ECC71" icon="leaf" library="Ionicons" />;
      case 'reciclagem': return <MarkerIcon color="#007BFF" icon="recycle" library="MaterialCommunityIcons" />;
      case 'proibido': return <MarkerIcon color="#FF3B30" icon="alert" library="MaterialCommunityIcons" />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa de Coleta</Text>
        <TouchableOpacity onPress={handleMenuPress}>
          <Ionicons name="menu-outline" size={28} color="#007BFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Mapa Wrapper */}
        <View style={styles.mapWrapper}>
          <MapView
            ref={mapRef}
            style={styles.map}
            customMapStyle={MAP_STYLE}
            provider={PROVIDER_GOOGLE}
            initialRegion={INITIAL_REGION}
            onPress={() => {
                setSelectedPoint(null);
                setShowFilters(false); // Fecha filtros ao tocar no mapa
            }} 
          >
            {FIXED_POINTS.map(point => {
              if (!filters[point.type]) return null;
              return (
                <StableMarker key={point.id} coordinate={point.coords} onPress={() => setSelectedPoint(point)}>
                  {renderMarkerIcon(point.type)}
                </StableMarker>
              );
            })}

            {filters.caminhao && (
              <StableMarker coordinate={currentTruckPos} onPress={() => setSelectedPoint({ type: 'caminhao', title: 'Caminhão da Coleta' })}>
                <View style={styles.truckMarker}>
                  <MaterialCommunityIcons name="truck-delivery" size={18} color="white" />
                </View>
              </StableMarker>
            )}
          </MapView>

          <View style={styles.legendCard}>
            <LegendItem color="#2ECC71" text="Ecopontos" />
            <LegendItem color="#007BFF" text="Reciclagem" />
            <LegendItem color="#FF3B30" text="Proibido" />
          </View>

          {/* Botão Flutuante de Filtro */}
          <View style={styles.floatingButtons}>
            <TouchableOpacity 
                style={[styles.circleBtn, showFilters && { backgroundColor: '#007BFF' }]} 
                onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons name="filter" size={20} color={showFilters ? "white" : "#666"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- ÁREA DE FILTROS MELHORADA --- */}
        {showFilters && (
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Ionicons name="options-outline" size={18} color="#666" style={{marginRight: 6}} />
              <Text style={styles.filterHelperText}>Toque nos botões abaixo para filtrar o mapa:</Text>
            </View>
            <View style={styles.filtersRow}>
              <FilterChip 
                label="Ecopontos" 
                active={filters.ecoponto} 
                onPress={() => toggleFilter('ecoponto')} 
                color="#2ECC71" 
                icon="leaf"
              />
              <FilterChip 
                label="Reciclagem" 
                active={filters.reciclagem} 
                onPress={() => toggleFilter('reciclagem')} 
                color="#007BFF" 
                icon="recycle"
              />
              <FilterChip 
                label="Caminhão" 
                active={filters.caminhao} 
                onPress={() => toggleFilter('caminhao')} 
                color="#007BFF" 
                icon="truck"
              />
              <FilterChip 
                label="Áreas Proibidas" 
                active={filters.proibido} 
                onPress={() => toggleFilter('proibido')} 
                color="#FF3B30" 
                icon="alert"
              />
            </View>
          </View>
        )}

        {/* Card Caminhão */}
        <TouchableOpacity style={styles.truckCard} onPress={handleCenterOnTruck}>
          <View style={styles.truckHeader}>
            <View style={styles.truckIconBg}>
              <MaterialCommunityIcons name="truck-outline" size={24} color="#007BFF" />
            </View>
            <View>
              <Text style={styles.truckTitle}>Caminhão a caminho</Text>
              <Text style={styles.truckSubtitle}>Toque para localizar no mapa</Text>
            </View>
          </View>
          
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={20} color="#007BFF" style={{marginRight: 6}} />
            <Text style={styles.timeText}>15-20 minutos</Text>
          </View>
          <Text style={styles.updateText}>Última atualização: há alguns segundos</Text>
          <View style={styles.divider} />
        </TouchableOpacity>

        {/* Pontos Próximos */}
        <Text style={styles.sectionTitle}>Pontos de Coleta Próximos</Text>
        <View style={styles.pointsRow}>
          <PointCard 
            label="Ecopontos" 
            sub="3 próximos" // Atualizado
            icon="leaf-outline" 
            color="#2ECC71" 
            bgColor="#E8F5E9" 
          />
          <PointCard 
            label="Reciclagem" 
            sub="2.5 km" 
            icon="sync" 
            color="#007BFF" 
            bgColor="#E3F2FD" 
          />
        </View>

        <View style={styles.alertBox}>
          <Ionicons name="warning-outline" size={18} color="#D32F2F" />
          <Text style={styles.alertText}>Áreas de descarte proibido na região</Text>
        </View>

        {/* Modal de Detalhes */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedPoint}
          onRequestClose={() => setSelectedPoint(null)}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setSelectedPoint(null)} 
          >
            <View style={styles.infoPopup} onStartShouldSetResponder={() => true}>
                <View style={styles.popupHeader}>
                  <Text style={styles.popupTitle}>{selectedPoint?.title}</Text>
                  <TouchableOpacity onPress={() => setSelectedPoint(null)}>
                    <Ionicons name="close-circle" size={28} color="#DDD" />
                  </TouchableOpacity>
                </View>

                {selectedPoint?.type === 'caminhao' ? (
                   <View>
                     <Text style={styles.popupText}>O veículo está em movimento na rota de Coleta Comum (Zona Sul).</Text>
                     <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                        <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', marginRight: 8}} />
                        <Text style={{fontWeight: 'bold', color: '#444'}}>Status: Em operação</Text>
                     </View>
                   </View>
                ) : (
                   <>
                     <InfoRow icon="location-outline" text={selectedPoint?.address} />
                     {selectedPoint?.hours && <InfoRow icon="time-outline" text={selectedPoint.hours} color="#007BFF" />}
                     {selectedPoint?.phone && <InfoRow icon="call-outline" text={selectedPoint.phone} />}
                     
                     {selectedPoint?.warning && (
                        <View style={styles.warningBox}>
                          <Ionicons name="warning" size={20} color="#D32F2F" />
                          <Text style={styles.warningText}>{selectedPoint.warning}</Text>
                        </View>
                     )}
                     
                     <TouchableOpacity style={styles.modalButton} onPress={() => Alert.alert("Rota", "Iniciando rota no Google Maps...")}>
                        <Text style={styles.modalButtonText}>Traçar Rota</Text>
                     </TouchableOpacity>
                   </>
                )}
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={{height: 30}} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- VISUAIS ---
const MarkerIcon = ({ color, icon, library }) => {
  const IconLib = library === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
  return (
    <View style={[styles.markerBase, { backgroundColor: 'white' }]}>
      <View style={[styles.markerInner, { backgroundColor: color }]}>
        <IconLib name={icon} size={14} color="white" />
      </View>
    </View>
  );
};

const LegendItem = ({ color, text }) => (
  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
    <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginRight: 6}} />
    <Text style={{fontSize: 10, color: '#333', fontWeight: '600'}}>{text}</Text>
  </View>
);

const PointCard = ({ label, sub, icon, color, bgColor }) => (
  <View style={[styles.pointCard, { backgroundColor: bgColor, borderColor: color + '40' }]}>
    <Ionicons name={icon} size={20} color={color} style={{marginBottom: 5}} />
    <Text style={{fontSize: 14, fontWeight: 'bold', color: '#333'}}>{label}</Text>
    <Text style={{fontSize: 12, color: '#666'}}>{sub}</Text>
  </View>
);

const FilterChip = ({ label, active, onPress, color, icon }) => (
  <TouchableOpacity 
    style={[
        styles.chip, 
        active ? { backgroundColor: color, borderColor: color } : { backgroundColor: 'white', borderColor: '#DDD' }
    ]} 
    onPress={onPress}
  >
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {icon && <MaterialCommunityIcons name={icon} size={12} color={active ? 'white' : '#666'} style={{marginRight: 5}} />}
        <Text style={[styles.chipText, active ? { color: 'white' } : { color: '#666' }]}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const InfoRow = ({ icon, text, color }) => (
  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
    <Ionicons name={icon} size={20} color={color || "#666"} style={{marginRight: 10, width: 24}} />
    <Text style={[styles.bodyText, color && {color: color, fontWeight: 'bold'}]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scrollContainer: { paddingHorizontal: 20 },
  mapWrapper: { height: 350, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F5F5F5', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: {width:0, height: 2} },
  map: { width: '100%', height: '100%' },
  legendCard: { position: 'absolute', top: 15, left: 15, backgroundColor: 'white', padding: 10, borderRadius: 10, elevation: 3 },
  floatingButtons: { position: 'absolute', top: 15, right: 15 },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 3 },
  
  markerBase: { padding: 3, backgroundColor: 'white', borderRadius: 20, elevation: 3 },
  markerInner: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  truckMarker: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#007BFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white', elevation: 4 },

  truckCard: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginTop: 20, borderWidth: 1, borderColor: '#EEE', elevation: 2 },
  truckHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  truckIconBg: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  truckTitle: { fontSize: 16, fontWeight: 'bold', color: '#0D47A1' },
  truckSubtitle: { fontSize: 13, color: '#666' },
  timeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  timeText: { fontSize: 18, fontWeight: 'bold', color: '#007BFF' },
  updateText: { fontSize: 12, color: '#999', marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#F0F0F0', width: '100%' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 10 },
  pointsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pointCard: { width: '48%', borderRadius: 12, padding: 15, borderWidth: 1 },
  alertBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFEBEE', padding: 10, borderRadius: 10, marginTop: 15, borderWidth: 1, borderColor: '#FFCDD2' },
  alertText: { color: '#C62828', fontSize: 12, fontWeight: 'bold', marginLeft: 8 },
  
  // Estilo da Seção de Filtros
  filterSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  filterHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'center' },
  filterHelperText: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  filtersRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  chip: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginRight: 8, 
    marginBottom: 8 
  },
  chipText: { fontSize: 12, fontWeight: 'bold' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  infoPopup: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, elevation: 20 },
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  popupTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', width: '85%' },
  popupText: { fontSize: 15, color: '#555', lineHeight: 22 },
  warningBox: { backgroundColor: '#FFEBEE', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: '#FFCDD2' },
  warningText: { color: '#C62828', fontSize: 14, marginLeft: 10, flex: 1 },
  modalButton: { backgroundColor: '#007BFF', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 25 },
  modalButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  bodyText: { fontSize: 15, color: '#444' },
});