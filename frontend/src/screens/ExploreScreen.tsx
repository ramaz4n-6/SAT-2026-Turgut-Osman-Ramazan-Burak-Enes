import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking, Pressable, ScrollView, Image } from 'react-native';
import * as Location from 'expo-location';
import { colors, font, radius, spacing, type } from '../theme';
import { Screen, ScreenHeader, Card, Chip, StatusPill, IconBadge, TonalButton } from '../components/ui';
import { fetchWithFallback, unwrapData } from '../api';
import { API_BASE } from '../config';
import { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

const LOCAL_PLACE_IMAGES: Record<number, any> = {
  1: require('../../assets/places/cekerek_satosu.jpg'),
  2: require('../../assets/places/lavanta_adasi.jpg'),
  4: require('../../assets/places/camlik_milli_parki.jpg'),
  5: require('../../assets/places/saat_kulesi.jpg'),
  6: require('../../assets/places/capanoglu_camii.jpg'),
  7: require('../../assets/places/sarikaya_roma_hamami.jpg'),
  8: require('../../assets/places/nizamoglu_konagi.jpg'),
  9: require('../../assets/places/bozok_universitesi.jpg'),
  10: require('../../assets/places/kazankaya_kanyonu.jpg'),
  11: require('../../assets/places/karslioglu_konagi.jpg'),
  12: require('../../assets/places/akdagmadeni_kilisesi.jpg'),
};

interface Place {
  id: number;
  title: string;
  category: string;
  icon: IconName;
  description: string;
  history?: string;
  address: string;
  latitude: number;
  longitude: number;
  visiting_hours: string;
  entry_fee: string;
  distance_km: number;
  distance_text: string;
  map_url: string;
  website_url?: string;
  image_url?: string;
}

const FALLBACK_PLACES: Place[] = [
  {
    id: 1,
    title: 'Çekerek Şatosu & Seyir Terası',
    category: 'Doğa & Macera',
    icon: 'boat-outline',
    description: 'Çekerek Barajı kıyısında masalsı kule mimarisi ve göl manzarasıyla yükselen seyir terası ve şato temalı turizm merkezidir.',
    address: 'Baraj Mevkii, Çekerek / Yozgat',
    latitude: 40.0682,
    longitude: 35.4950,
    visiting_hours: '09:00 - 21:00',
    entry_fee: 'Ücretsiz',
    distance_km: 74.0,
    distance_text: '74 km',
    map_url: 'https://www.google.com/maps/search/?api=1&query=40.0682,35.4950',
    website_url: 'https://www.facebook.com/cekerek.soto.9/',
    image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Çekerek Barajı Lavanta Adası',
    category: 'Doğa & Park',
    icon: 'flower-outline',
    description: "Türkiye'nin en büyük lavanta adalarından biri. Baraj gölü ortasında mor lavanta tarlaları ve seyir iskeleleri sunar.",
    address: 'Lavanta Adası, Çekerek Barajı, Çekerek / Yozgat',
    latitude: 40.0725,
    longitude: 35.5012,
    visiting_hours: '08:30 - 20:30',
    entry_fee: 'Ücretsiz',
    distance_km: 75.0,
    distance_text: '75 km',
    map_url: 'https://www.google.com/maps/search/?api=1&query=40.0725,35.5012',
    website_url: 'https://www.kulturportali.gov.tr/turkiye/yozgat/gezilecekyer/yozgat-cekerek-lavanta-adasi',
    image_url: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    title: 'Çamlık Milli Parkı',
    category: 'Doğa & Park',
    icon: 'leaf-outline',
    description: "Türkiye'nin ilk milli parkı; asırlık karaçam ormanları ve temiz havasıyla Yozgat'ın akciğeridir.",
    address: 'Köseoğlu Mah. Çamlık Cad. Merkez / Yozgat',
    latitude: 39.8055,
    longitude: 34.8175,
    visiting_hours: '08:00 - 22:00',
    entry_fee: 'Ücretsiz',
    distance_km: 2.1,
    distance_text: '2,1 km',
    map_url: 'https://www.google.com/maps/search/?api=1&query=39.8055,34.8175',
    image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    title: 'Yozgat Saat Kulesi',
    category: 'Tarihi Mekan',
    icon: 'time-outline',
    description: 'Yozgat şehir merkezinin kalbinde yer alan, 1908 yılında kesme taşla inşa edilmiş simge kuledir.',
    address: 'Cumhuriyet Meydanı, Merkez / Yozgat',
    latitude: 39.8211,
    longitude: 34.8083,
    visiting_hours: '7/24 Açık',
    entry_fee: 'Ücretsiz',
    distance_km: 0.8,
    distance_text: '800 m',
    map_url: 'https://www.google.com/maps/search/?api=1&query=39.8211,34.8083',
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    title: 'Çapanoğlu Büyük Camii',
    category: 'Tarihi Mekan',
    icon: 'moon-outline',
    description: 'Osmanlı Barok mimarisinin Anadolu’daki en görkemli şaheseri; 1779 yapımı tarihi cami.',
    address: 'İstanbulluoğlu Mah. Çapanoğlu Cad. Merkez / Yozgat',
    latitude: 39.8219,
    longitude: 34.8091,
    visiting_hours: 'İbadet saatlerinde açık',
    entry_fee: 'Ücretsiz',
    distance_km: 0.9,
    distance_text: '900 m',
    map_url: 'https://www.google.com/maps/search/?api=1&query=39.8219,34.8091',
    image_url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 7,
    title: 'Sarıkaya Roma Hamamı (Basilica Therma)',
    category: 'Tarihi Mekan',
    icon: 'sparkles-outline',
    description: '2000 yıllık şifalı termal suyuyla UNESCO Dünya Mirası Geçici Listesi’ndeki antik Roma hamamı.',
    address: 'Kaplıcalar Mah. Sarıkaya / Yozgat',
    latitude: 39.4952,
    longitude: 35.3789,
    visiting_hours: '08:30 - 17:30',
    entry_fee: 'Ücretsiz',
    distance_km: 78.0,
    distance_text: '78 km',
    map_url: 'https://www.google.com/maps/search/?api=1&query=39.4952,35.3789',
    image_url: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 8,
    title: 'Nizamoğlu Konağı (Etnografya Müzesi)',
    category: 'Kültür & Müze',
    icon: 'home-outline',
    description: '1871 yapımı tarihi konak; Yozgat geleneksel sivil mimarisi ve etnografik eserler koleksiyonu.',
    address: 'İstanbulluoğlu Mah. Nizamoğlu Sok. Merkez / Yozgat',
    latitude: 39.8234,
    longitude: 34.8062,
    visiting_hours: '09:00 - 17:00 (Pazartesi kapalı)',
    entry_fee: 'Ücretsiz',
    distance_km: 1.1,
    distance_text: '1,1 km',
    map_url: 'https://www.google.com/maps/search/?api=1&query=39.8234,34.8062',
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 9,
    title: 'Bozok Üniversitesi Erdoğan Akdağ Kampüsü',
    category: 'Eğitim & Kampüs',
    icon: 'school-outline',
    description: 'Geniş sosyal alanları, fakülteleri, göleti ve modern yerleşkesiyle Bozok Üniversitesi ana kampüsü.',
    address: 'Atatürk Yolu 7. Km, Merkez / Yozgat',
    latitude: 39.7892,
    longitude: 34.7981,
    visiting_hours: '08:00 - 20:00',
    entry_fee: 'Ücretsiz',
    distance_km: 6.5,
    distance_text: '6,5 km',
    map_url: 'https://www.google.com/maps/search/?api=1&query=39.7892,34.7981',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 10,
    title: 'Kazankaya Kanyonu',
    category: 'Doğa & Macera',
    icon: 'trail-sign-outline',
    description: 'Çekerek Irmağı’nın içinden aktığı 10 km’lik eşsiz kanyon ve Helenistik Tanrıça Kibele kabartması.',
    address: 'Kazankaya Köyü, Aydıncık / Yozgat',
    latitude: 40.2321,
    longitude: 35.1852,
    visiting_hours: 'Gün boyu açık',
    entry_fee: 'Ücretsiz',
    distance_km: 92.0,
    distance_text: '92 km',
    map_url: 'https://www.google.com/maps/search/?api=1&query=40.2321,35.1852',
    website_url: 'https://www.kulturportali.gov.tr/turkiye/yozgat/gezilecekyer/kazankaya-kanyonu-kazankaya-vadisi',
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 11,
    title: 'Karslıoğlu Konağı',
    category: 'Kültür & Müze',
    icon: 'business-outline',
    description: 'Atatürk’ün Yozgat ziyaretinde konakladığı, ahşap tavan işlemeli 1883 yapımı tarihi köşk.',
    address: 'Sungurlu Sokak, Merkez / Yozgat',
    latitude: 39.8225,
    longitude: 34.8071,
    visiting_hours: '09:00 - 17:00',
    entry_fee: 'Ücretsiz',
    distance_km: 0.9,
    distance_text: '900 m',
    map_url: 'https://www.google.com/maps/search/?api=1&query=39.8225,34.8071',
    image_url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 12,
    title: 'Akdağmadeni Tarihi Kilise & Ormanları',
    category: 'Tarihi Mekan',
    icon: 'trail-sign-outline',
    description: '1862 yapımı tarihi taş kilise ve çevresindeki yemyeşil sarıçam ormanları ile yürüyüş parkurları.',
    address: 'Yeşildere Mah. Akdağmadeni / Yozgat',
    latitude: 39.6601,
    longitude: 35.8821,
    visiting_hours: '09:00 - 18:00',
    entry_fee: 'Ücretsiz',
    distance_km: 104.0,
    distance_text: '104 km',
    map_url: 'https://www.google.com/maps/search/?api=1&query=39.6601,35.8821',
    website_url: 'https://www.kulturportali.gov.tr/turkiye/yozgat/gezilecekyer/akdagmadeni-kilisesi',
    image_url: 'https://images.unsplash.com/photo-1548625361-1959779df306?w=900&auto=format&fit=crop&q=80',
  },
];

const CATEGORIES = ['Tümü', 'Doğa & Macera', 'Doğa & Park', 'Tarihi Mekan', 'Kültür & Müze', 'Eğitim & Kampüs'];

export default function ExploreScreen() {
  const [places, setPlaces] = useState<Place[]>(FALLBACK_PLACES);
  const [live, setLive] = useState(false);
  const [selectedCat, setSelectedCat] = useState('Tümü');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    (async () => {
      let query = '';
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          query = `?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}`;
          setHasLocation(true);
        }
      } catch {
        // Konum yoksa varsayılan
      }

      fetchWithFallback<{ status: string; data: Place[] } | Place[]>(
        `/api/explore/places${query}`,
        FALLBACK_PLACES
      ).then((res) => {
        const data = unwrapData<Place[]>(res.data);
        if (Array.isArray(data) && data.length > 0) {
          setPlaces(data);
        }
        setLive(res.live);
      });
    })();
  }, []);

  const filteredPlaces = places.filter((p) => {
    if (selectedCat === 'Tümü') return true;
    return p.category.toLowerCase().includes(selectedCat.toLowerCase());
  });

  const openInMap = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Screen>
      <ScreenHeader
        title="Keşfet & Kent Rehberi"
        caption={hasLocation ? 'Anlık konumunuza göre en yakın yerler' : "Yozgat ve ilçelerinde gezilecek yerler"}
        right={<StatusPill live={live} />}
      />

      {/* Kategori Filtreleri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            variant={selectedCat === cat ? 'active' : 'default'}
            onPress={() => setSelectedCat(cat)}
          />
        ))}
      </ScrollView>

      {/* Mekan Kartları */}
      {filteredPlaces.map((place) => {
        const isExpanded = expandedId === place.id;
        const localImg = LOCAL_PLACE_IMAGES[place.id];
        const imageSource = localImg
          ? localImg
          : place.image_url
          ? { uri: place.image_url.startsWith('http') ? place.image_url : `${API_BASE}${place.image_url}` }
          : null;

        return (
          <Card key={place.id} style={styles.placeCard} onPress={() => toggleExpand(place.id)}>
            {/* Fotoğraf Banner */}
            {imageSource ? (
              <View style={styles.imageContainer}>
                <Image
                  source={imageSource}
                  style={styles.placeImage}
                  resizeMode="cover"
                />
                <View style={styles.imageBadges}>
                  <Chip label={place.category} variant="tonal" style={styles.overlayChip} />
                  <Chip
                    label={place.distance_text}
                    icon="navigate-outline"
                    variant="active"
                    style={styles.overlayChip}
                  />
                </View>
              </View>
            ) : null}

            <View style={styles.cardHeader}>
              <IconBadge icon={place.icon || 'location-outline'} />
              <View style={styles.cardHeaderText}>
                <Text style={styles.placeTitle}>{place.title}</Text>
                <Text style={styles.placeCategory}>{place.category}</Text>
              </View>
              {!place.image_url && (
                <Chip
                  label={place.distance_text}
                  icon="navigate-outline"
                  variant="tonal"
                  style={styles.distChip}
                />
              )}
            </View>

            <Text style={styles.placeDesc} numberOfLines={isExpanded ? undefined : 2}>
              {place.description}
            </Text>

            {/* Genişletilmiş Detaylar */}
            {isExpanded && (
              <View style={styles.expandedContent}>
                {place.address ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color={colors.primary} />
                    <Text style={styles.infoText}>{place.address}</Text>
                  </View>
                ) : null}

                {place.visiting_hours ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={16} color={colors.primary} />
                    <Text style={styles.infoText}>Ziyaret Saatleri: {place.visiting_hours}</Text>
                  </View>
                ) : null}

                {place.entry_fee ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="ticket-outline" size={16} color={colors.primary} />
                    <Text style={styles.infoText}>Giriş: {place.entry_fee}</Text>
                  </View>
                ) : null}

                {place.history ? (
                  <View style={styles.historyBox}>
                    <Text style={styles.historyLabel}>Tarihçe & Bilgi</Text>
                    <Text style={styles.historyText}>{place.history}</Text>
                  </View>
                ) : null}
              </View>
            )}

            {/* Alt İşlem Çubuğu */}
            <View style={styles.actionRow}>
              <Pressable style={styles.expandBtn} onPress={() => toggleExpand(place.id)}>
                <Text style={styles.expandText}>{isExpanded ? 'Daha az göster' : 'Detayları gör'}</Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                  size={14}
                  color={colors.primary}
                />
              </Pressable>

              <View style={styles.actionButtonsGroup}>
                {place.website_url && (
                  <TonalButton
                    title="Resmi Sayfa"
                    icon="globe-outline"
                    onPress={() => Linking.openURL(place.website_url!)}
                    style={styles.webBtn}
                  />
                )}
                <TonalButton
                  title="Haritada Aç"
                  icon="map-outline"
                  onPress={() => openInMap(place.map_url)}
                  style={styles.mapBtn}
                />
              </View>
            </View>
          </Card>
        );
      })}

      <Text style={styles.footer}>
        {hasLocation
          ? 'Mesafeler GPS cihaz konumunuz baz alınarak canlı hesaplanmaktadır.'
          : 'Konum izni verildiğinde mesafeler anlık hesaplanır.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  placeCard: {
    padding: spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.xs,
    position: 'relative',
    backgroundColor: colors.surfaceContainerHigh,
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  imageBadges: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlayChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardHeaderText: {
    flex: 1,
  },
  placeTitle: {
    ...type.headlineSm,
    fontFamily: font.bold,
    fontWeight: '700',
    color: colors.onSurface,
  },
  placeCategory: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  distChip: {
    alignSelf: 'center',
  },
  placeDesc: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  expandedContent: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    ...type.bodySm,
    color: colors.onSurface,
    flex: 1,
  },
  historyBox: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  historyLabel: {
    ...type.labelSm,
    color: colors.primary,
    fontFamily: font.bold,
    fontWeight: '700',
    marginBottom: 4,
  },
  historyText: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  expandText: {
    ...type.labelSm,
    color: colors.primary,
    fontFamily: font.medium,
  },
  actionButtonsGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  webBtn: {
    paddingHorizontal: spacing.xs,
  },
  mapBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  footer: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
});

