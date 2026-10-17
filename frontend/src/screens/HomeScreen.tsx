import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Linking, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, shadow, spacing, type } from '../theme';
import {
  Screen,
  ScreenHeader,
  Card,
  ServiceCard,
  SectionHeader,
  LeaderRow,
  Chip,
  TrendPill,
  AlertBanner,
  StatusPill,
  IconBadge,
  QuickActionTile,
} from '../components/ui';
import { fetchWithFallback, unwrapData } from '../api';
import BusScheduleModal, { BusRoute } from '../components/BusScheduleModal';
import PharmacyModal, { PharmacyItem } from '../components/PharmacyModal';

interface MarketRow {
  label: string;
  value: string;
  trend: string;
  percent: string;
}

export interface HomePharmacy {
  id?: number;
  name: string;
  dist: string;
  phone: string;
  address?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  maps_url?: string;
  is_on_duty?: boolean;
}

interface HomeSummary {
  weather: { temp: number | string; condition: string; windspeed: string; icon: string };
  markets: MarketRow[];
  active_alert: { type: string; msg: string };
  pharmacies: HomePharmacy[];
  latest_news: { id: number; title: string; img: string }[];
}

interface PrayerTimes {
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
  current_prayer?: string;
  current_prayer_label?: string;
  next_prayer?: string;
  next_prayer_label?: string;
}

interface GeneralNewsItem {
  title: string;
  link: string;
  image?: string;
  date?: string;
  source?: string;
}

interface UniversityNewsItem {
  title: string;
  link: string;
  category?: string;
  date?: string;
}

interface NewsApiResponse {
  status: string;
  general_news: GeneralNewsItem[];
  university_news: UniversityNewsItem[];
}

const MOCK_SUMMARY: HomeSummary = {
  weather: { temp: 18, condition: 'Parçalı Bulutlu', windspeed: '10 km/s', icon: 'cloudy' },
  markets: [
    { label: 'USD/TRY', value: '49.33 ₺', trend: '+', percent: '%0.13' },
    { label: 'EUR/TRY', value: '55.08 ₺', trend: '-', percent: '%0.21' },
    { label: 'Gram Altın', value: '6.652 ₺', trend: '-', percent: '%0.51' },
    { label: 'Çeyrek Altın', value: '10.843 ₺', trend: '-', percent: '%0.51' },
  ],
  active_alert: { type: 'warning', msg: 'Su Kesintisi: Çapanoğlu Mah.' },
  pharmacies: [{ name: 'Bozok Eczanesi', dist: '1.2 km', phone: '0354 111 22 33' }],
  latest_news: [{ id: 45, title: 'Çamlık Milli Parkı Yenileniyor', img: 'url' }],
};

const MOCK_PRAYER: PrayerTimes = {
  imsak: '05:10',
  gunes: '06:30',
  ogle: '12:45',
  ikindi: '15:55',
  aksam: '18:40',
  yatsi: '20:00',
};

const MOCK_GENERAL_NEWS: GeneralNewsItem[] = [
  {
    title: 'Yozgat ve Çevresinde Tarımsal Destekleme Ödemeleri Başladı',
    link: 'https://www.trthaber.com',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    date: 'Bugün',
    source: 'TRT Haber · Canlı',
  },
  {
    title: 'Hızlı Tren Hattında Sefer Sayıları Artırılıyor',
    link: 'https://www.trthaber.com',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800',
    date: 'Bugün',
    source: 'TRT Haber · Canlı',
  },
  {
    title: 'Çekerek Barajı ve Lavanta Adası Ziyaretçi Rekoruna Koşuyor',
    link: 'https://www.trthaber.com',
    image: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=800',
    date: 'Bugün',
    source: 'TRT Haber · Canlı',
  },
];

const MOCK_NEWS: UniversityNewsItem[] = [
  { title: '2026-2027 Eğitim Öğretim Yılı Bahar Yarıyılı Ders Kayıtları', link: 'https://bozok.edu.tr/', category: 'Duyuru', date: 'Bugün' },
  { title: 'Üniversitemiz Rektöründen Öğrencilere Mesaj', link: 'https://bozok.edu.tr/', category: 'Mesaj', date: 'Bugün' },
  { title: 'Yozgat Bozok Üniversitesi Kütüphane Çalışma Saatleri Güncellendi', link: 'https://bozok.edu.tr/', category: 'Duyuru', date: 'Bugün' },
  { title: 'Kısmi Zamanlı Öğrenci Çalıştırma İlanı Sonuçları', link: 'https://bozok.edu.tr/', category: 'İlan', date: 'Bugün' },
];

const QUICK_ACTIONS = [
  { icon: 'medkit-outline' as const, label: 'Eczaneler' },
  { icon: 'bus-outline' as const, label: 'Otobüs Nerede?' },
  { icon: 'receipt-outline' as const, label: 'Su & Vergi' },
  { icon: 'business-outline' as const, label: 'Tarihi Rehber' },
];

const soonAlert = () => Alert.alert('Bozok 66', 'Bu hizmet yakında aktif olacak.', [{ text: 'Tamam' }]);

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'İyi geceler';
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export default function HomeScreen() {
  const [summary, setSummary] = useState<HomeSummary>(MOCK_SUMMARY);
  const [prayerData, setPrayerData] = useState<PrayerTimes | null>(null);
  const [generalNews, setGeneralNews] = useState<GeneralNewsItem[]>(MOCK_GENERAL_NEWS);
  const [universityNews, setUniversityNews] = useState<UniversityNewsItem[]>(MOCK_NEWS);
  const [live, setLive] = useState(false);
  const [prayerLive, setPrayerLive] = useState(false);
  const [newsLive, setNewsLive] = useState(false);
  const [busModalVisible, setBusModalVisible] = useState(false);
  const [busPreview, setBusPreview] = useState<BusRoute | null>(null);
  const [pharmacyModalVisible, setPharmacyModalVisible] = useState(false);

  useEffect(() => {
    fetchWithFallback<HomeSummary>('/api/home/summary', MOCK_SUMMARY).then((result) => {
      setSummary(result.data);
      setLive(result.live);
    });

    fetchWithFallback<PrayerTimes | { status: string; data: PrayerTimes }>('/api/prayer/', MOCK_PRAYER).then(
      (result) => {
        setPrayerData(unwrapData(result.data));
        setPrayerLive(result.live);
      }
    );

    // Canlı Otobüs Sefer Saatleri
    fetchWithFallback<any>('/api/transport/buses', null).then((result) => {
      if (result.data) {
        const list = unwrapData<BusRoute[]>(result.data);
        if (Array.isArray(list) && list.length > 0) {
          setBusPreview(list[0]);
        }
      }
    });

    // Günün Canlı Haberleri ve Canlı Bozok Duyuruları
    fetchWithFallback<NewsApiResponse>('/api/news/', {
      status: 'fallback',
      general_news: MOCK_GENERAL_NEWS,
      university_news: MOCK_NEWS,
    }).then((result) => {
      const resp = result.data;
      if (resp?.general_news && Array.isArray(resp.general_news) && resp.general_news.length > 0) {
        setGeneralNews(resp.general_news);
      }
      if (resp?.university_news && Array.isArray(resp.university_news) && resp.university_news.length > 0) {
        setUniversityNews(resp.university_news);
      }
      setNewsLive(result.live);
    });
  }, []);

  const pharmacy = summary.pharmacies?.[0];
  const weatherIcon =
    summary.weather.icon === 'sunny'
      ? 'sunny-outline'
      : summary.weather.icon === 'cloudy'
        ? 'cloudy-outline'
        : 'partly-sunny-outline';
  const dateStr = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  const isAnyLive = live || prayerLive || newsLive;

  return (
    <Screen>
      <ScreenHeader title={`${getGreeting()}, Yozgat`} caption={dateStr} right={<StatusPill live={isAnyLive} />} />

      {summary.active_alert?.msg ? <AlertBanner message={summary.active_alert.msg} /> : null}

      <LinearGradient
        colors={[colors.primary, colors.primaryContainer, colors.onPrimaryFixed]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.kentKart}
      >
        <View style={styles.kentKartTop}>
          <View style={styles.kentKartBrandRow}>
            <View style={styles.kentKartBadge}>
              <Text style={styles.kentKartBadgeText}>Y</Text>
            </View>
            <View>
              <Text style={styles.kentKartInstitution}>T.C. YOZGAT BELEDİYESİ</Text>
              <Text style={styles.kentKartTitle}>Bozok Kent Kart</Text>
            </View>
          </View>
          <View style={styles.kentKartTag}>
            <Ionicons name="hardware-chip-outline" size={13} color={colors.primaryFixedDim} />
            <Text style={styles.kentKartTagText}>Ulaşım & Otopark</Text>
          </View>
        </View>

        <View style={styles.kentKartBottom}>
          <View>
            <Text style={styles.kentKartBalanceLabel}>Kullanılabilir Bakiye</Text>
            <View style={styles.kentKartBalanceRow}>
              <Text style={styles.kentKartBalance}>₺284,50</Text>
              <Text style={styles.kentKartCurrency}>TRY</Text>
            </View>
            <Text style={styles.kentKartNumber}>6601 •••• •••• 4289</Text>
          </View>
          <View style={styles.kentKartActions}>
            <Pressable
              style={({ pressed }) => [styles.kentKartTopUp, pressed && { transform: [{ scale: 0.95 }] }]}
              onPress={soonAlert}
            >
              <Ionicons name="add-circle-outline" size={15} color={colors.primary} />
              <Text style={styles.kentKartTopUpText}>Yükle</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.kentKartMore, pressed && { transform: [{ scale: 0.95 }] }]}
              onPress={soonAlert}
              accessibilityLabel="Kart Detayı"
            >
              <Ionicons name="ellipsis-horizontal" size={16} color={colors.onPrimary} />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {pharmacy ? (
        <Pressable
          style={({ pressed }) => [styles.pharmacyRibbon, pressed && { opacity: 0.95 }]}
          onPress={() => {
            const url = pharmacy.maps_url ||
              `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude || 39.8214},${pharmacy.longitude || 34.8089}`;
            Linking.openURL(url).catch(() => {
              Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.name + ' ' + (pharmacy.address || '') + ' Yozgat')}`);
            });
          }}
          accessibilityRole="button"
          accessibilityLabel={`${pharmacy.name} Yol Tarifi`}
        >
          <View style={styles.pharmacyBadge}>
            <Ionicons name="medkit" size={17} color="#FFFFFF" />
          </View>
          <View style={styles.pharmacyInfo}>
            <View style={styles.pharmacyNameRow}>
              <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
              <View style={styles.pharmacyOpenChip}>
                <Ionicons name="radio-button-on" size={9} color="#FFFFFF" />
                <Text style={styles.pharmacyOpenText}>NÖBETÇİ</Text>
              </View>
            </View>
            <Text style={styles.pharmacyAddress} numberOfLines={1}>
              {[pharmacy.address, pharmacy.dist, pharmacy.phone].filter(Boolean).join(' • ')}
            </Text>
          </View>
          <View style={styles.pharmacyActionRow}>
            <Pressable
              style={({ pressed }) => [styles.pharmacyNavBtn, pressed && { transform: [{ scale: 0.9 }] }]}
              onPress={() => {
                const url = pharmacy.maps_url ||
                  `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude || 39.8214},${pharmacy.longitude || 34.8089}`;
                Linking.openURL(url);
              }}
              accessibilityLabel="Yol Tarifi Al"
            >
              <Ionicons name="navigate" size={13} color="#FFFFFF" />
              <Text style={styles.pharmacyNavBtnText}>Yol Tarifi</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.pharmacyCall, pressed && { transform: [{ scale: 0.9 }] }]}
              onPress={(e) => {
                e.stopPropagation?.();
                Linking.openURL(`tel:${pharmacy.phone.replace(/\s/g, '')}`);
              }}
              accessibilityLabel="Eczaneyi Ara"
            >
              <Ionicons name="call-outline" size={15} color={colors.primary} />
            </Pressable>
          </View>
        </Pressable>
      ) : null}

      <Card style={styles.weatherCard}>
        <View style={styles.weatherHeader}>
          <View style={styles.weatherHeaderLeft}>
            <IconBadge icon={weatherIcon} />
            <View>
              <Text style={styles.weatherTitle}>Yozgat İklimi</Text>
              <Text style={styles.weatherCaption}>Anlık hava durumu</Text>
            </View>
          </View>
          <Chip label={summary.weather.condition} />
        </View>
        <View style={styles.weatherBody}>
          <Text style={styles.weatherTemp}>{summary.weather.temp}°</Text>
          <View style={styles.weatherStats}>
            <View style={styles.weatherStatRow}>
              <Ionicons name="leaf-outline" size={12} color={colors.secondary} />
              <Text style={styles.weatherStatLabel}>RÜZGÂR</Text>
            </View>
            <Text style={styles.weatherStatValue}>{summary.weather.windspeed}</Text>
          </View>
        </View>
      </Card>

      <View>
        <SectionHeader title="Hızlı İşlemler" />
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <QuickActionTile
              key={action.label}
              icon={action.icon}
              label={action.label}
              onPress={() => {
                if (action.label === 'Otobüs Nerede?') {
                  setBusModalVisible(true);
                } else if (action.label === 'Eczaneler' || action.label === 'Nöbetçi Eczane') {
                  setPharmacyModalVisible(true);
                } else {
                  soonAlert();
                }
              }}
            />
          ))}
        </View>

        {busPreview ? (
          <Pressable
            style={styles.busLiveCard}
            onPress={() => setBusModalVisible(true)}
            accessibilityRole="button"
          >
            <View style={styles.busLiveCardHeader}>
              <View style={styles.busLineBadge}>
                <Ionicons name="bus" size={13} color="#FFFFFF" />
                <Text style={styles.busLineBadgeText}>HAT {busPreview.line_number}</Text>
              </View>
              <Text style={styles.busRouteTitle} numberOfLines={1}>
                {busPreview.route_name}
              </Text>
              <View style={styles.busStatusPill}>
                <Text style={styles.busStatusText}>{busPreview.status}</Text>
              </View>
            </View>

            <View style={styles.busLiveCardBody}>
              <View style={styles.busSlotColumn}>
                <Text style={styles.busSlotLabel}>Canlı Sefer Dilimi:</Text>
                <View style={styles.busRedActiveSlot}>
                  <Ionicons name="radio-button-on" size={12} color="#FFFFFF" />
                  <Text style={styles.busRedActiveSlotText}>{busPreview.current_slot}</Text>
                </View>
              </View>

              <View style={styles.busNextColumn}>
                <Text style={styles.busNextLabel}>
                  Sıradaki: {busPreview.next_departure}
                </Text>
                <Text style={styles.busEtaText}>{busPreview.eta_text}</Text>
              </View>

              <View style={styles.busDetailButton}>
                <Text style={styles.busDetailButtonText}>Tüm Saatler</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </View>
            </View>
          </Pressable>
        ) : null}
      </View>

      <Card>
        <SectionHeader title="Canlı Piyasalar" caption="Döviz ve altın kurları" />
        {summary.markets.map((market) => (
          <LeaderRow
            key={market.label}
            label={market.label}
            value={market.value}
            trailing={<TrendPill trend={market.trend} percent={market.percent} />}
          />
        ))}
      </Card>

      <Card>
        <SectionHeader title="Namaz Vakitleri" caption="Yozgat Vakitleri" />
        {prayerData ? (
          <View>
            <LeaderRow
              label="İmsak"
              value={prayerData.imsak}
              emphasized={prayerData.current_prayer === 'imsak'}
              trailing={prayerData.current_prayer === 'imsak' ? <Chip label="Şu an" variant="active" /> : undefined}
            />
            <LeaderRow
              label="Öğle"
              value={prayerData.ogle}
              emphasized={prayerData.current_prayer === 'ogle'}
              trailing={prayerData.current_prayer === 'ogle' ? <Chip label="Şu an" variant="active" /> : undefined}
            />
            <LeaderRow
              label="İkindi"
              value={prayerData.ikindi}
              emphasized={prayerData.current_prayer === 'ikindi'}
              trailing={prayerData.current_prayer === 'ikindi' ? <Chip label="Şu an" variant="active" /> : undefined}
            />
            <LeaderRow
              label="Akşam"
              value={prayerData.aksam}
              emphasized={prayerData.current_prayer === 'aksam'}
              trailing={prayerData.current_prayer === 'aksam' ? <Chip label="Şu an" variant="active" /> : undefined}
            />
            <LeaderRow
              label="Yatsı"
              value={prayerData.yatsi}
              emphasized={prayerData.current_prayer === 'yatsi'}
              trailing={prayerData.current_prayer === 'yatsi' ? <Chip label="Şu an" variant="active" /> : undefined}
            />
          </View>
        ) : (
          <Text style={styles.loadingText}>Vakitler yükleniyor...</Text>
        )}
      </Card>

      {/* Günün Canlı Haberleri */}
      <Card>
        <SectionHeader title="Yozgat & Gündem Haberleri" caption="Yozgat, İlçeler ve Canlı Gündem" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.generalNewsScroll}
        >
          {generalNews.map((item, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [styles.generalNewsCard, pressed && { opacity: 0.85 }]}
              onPress={() => (item.link ? Linking.openURL(item.link).catch(() => {}) : Alert.alert('Haber', item.title))}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.generalNewsImg} resizeMode="cover" />
              ) : (
                <View style={[styles.generalNewsImg, styles.placeholderImg]}>
                  <Ionicons name="newspaper-outline" size={28} color={colors.primary} />
                </View>
              )}
              <View style={styles.generalNewsContent}>
                <View style={styles.newsSourceRow}>
                  <Text style={styles.newsSource}>{item.source || 'TRT Haber'}</Text>
                  {item.date ? <Text style={styles.newsDate}>{item.date}</Text> : null}
                </View>
                <Text style={styles.generalNewsTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </Card>

      {/* Üniversite Duyuruları */}
      <Card>
        <SectionHeader title="Üniversite Duyuruları" caption="Bozok Üniversitesi · Canlı Web" />
        {universityNews.map((item, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.newsRow,
              pressed && styles.newsRowPressed,
              index === universityNews.length - 1 && { borderBottomWidth: 0 },
            ]}
            onPress={() => (item.link ? Linking.openURL(item.link).catch(() => {}) : Alert.alert('Duyuru', item.title))}
          >
            <View style={styles.uniNewsLeft}>
              <Text style={styles.newsTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.uniNewsMeta}>
                {item.category ? (
                  <Chip label={item.category} variant="tonal" style={styles.uniNewsChip} />
                ) : null}
                {item.date ? <Text style={styles.uniNewsDate}>{item.date}</Text> : null}
              </View>
            </View>
            <Ionicons name="chevron-forward-outline" size={16} color={colors.outlineVariant} />
          </Pressable>
        ))}
      </Card>

      <ServiceCard
        icon="headset-outline"
        title="Belediye Beyaz Masa"
        subtitle="Fotoğraflı talep ve şikâyet ilet, anlık takip et."
        style={styles.beyazMasa}
        onPress={soonAlert}
      />

      <BusScheduleModal
        visible={busModalVisible}
        onClose={() => setBusModalVisible(false)}
      />

      <PharmacyModal
        visible={pharmacyModalVisible}
        onClose={() => setPharmacyModalVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kentKart: {
    borderRadius: radius.lg,
    padding: 20,
    minHeight: 176,
    justifyContent: 'space-between',
  },
  kentKartTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  kentKartBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kentKartBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kentKartBadgeText: {
    ...type.headlineSm,
    color: colors.onPrimary,
  },
  kentKartInstitution: {
    ...type.labelSm,
    color: colors.primaryFixedDim,
  },
  kentKartTitle: {
    ...type.headlineSm,
    color: colors.onPrimary,
    marginTop: 2,
  },
  kentKartTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  kentKartTagText: {
    ...type.labelSm,
    color: colors.primaryFixedDim,
  },
  kentKartBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  kentKartBalanceLabel: {
    ...type.labelSm,
    color: colors.primaryFixedDim,
  },
  kentKartBalanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  kentKartBalance: {
    ...type.metric,
    color: colors.onPrimary,
  },
  kentKartCurrency: {
    ...type.labelMd,
    color: colors.primaryFixedDim,
  },
  kentKartNumber: {
    ...type.bodySm,
    color: colors.primaryFixedDim,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  kentKartActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  kentKartTopUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.onPrimary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  kentKartTopUpText: {
    ...type.labelMd,
    color: colors.primary,
  },
  kentKartMore: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pharmacyRibbon: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...shadow.card,
  },
  pharmacyBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary, // Red accent for nöbetçi
    alignItems: 'center',
    justifyContent: 'center',
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pharmacyName: {
    ...type.labelMd,
    color: colors.onSurface,
    fontFamily: font.bold,
    fontWeight: '700',
  },
  pharmacyOpenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary, // Red badge for nöbetçi
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pharmacyOpenText: {
    fontSize: 9,
    lineHeight: 12,
    fontFamily: font.bold,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  pharmacyAddress: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  pharmacyActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pharmacyNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary, // Red button for direct navigation
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  pharmacyNavBtnText: {
    ...type.labelSm,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  pharmacyCall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherCard: {
    padding: spacing.md,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  weatherTitle: {
    ...type.labelLg,
    color: colors.onSurface,
  },
  weatherCaption: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 1,
  },
  weatherBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  weatherTemp: {
    ...type.metric,
    color: colors.onSurface,
  },
  weatherStats: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 10,
    alignItems: 'flex-end',
  },
  weatherStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherStatLabel: {
    ...type.labelSm,
    color: colors.onSurfaceVariant,
    fontSize: 10,
  },
  weatherStatValue: {
    ...type.labelMd,
    color: colors.onSurface,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  loadingText: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    paddingVertical: 8,
  },
  newsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  newsRowPressed: {
    opacity: 0.6,
  },
  newsTitle: {
    ...type.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
  uniNewsLeft: {
    flex: 1,
    gap: 4,
  },
  uniNewsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  uniNewsChip: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  uniNewsDate: {
    ...type.bodySm,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  generalNewsScroll: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  generalNewsCard: {
    width: 240,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  generalNewsImg: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surfaceContainerHigh,
  },
  placeholderImg: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  generalNewsContent: {
    padding: spacing.sm,
    gap: 4,
  },
  newsSourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    ...type.labelSm,
    fontSize: 10,
    color: colors.primary,
    fontFamily: font.bold,
    fontWeight: '700',
  },
  newsDate: {
    ...type.bodySm,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  generalNewsTitle: {
    ...type.bodySm,
    fontFamily: font.medium,
    color: colors.onSurface,
    lineHeight: 18,
  },
  beyazMasa: {
    backgroundColor: colors.surfaceContainerLow,
  },
  busLiveCard: {
    marginTop: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadow.card,
  },
  busLiveCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  busLineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  busLineBadgeText: {
    ...type.labelSm,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  busRouteTitle: {
    ...type.labelMd,
    fontWeight: '600',
    color: colors.onSurface,
    flex: 1,
  },
  busStatusPill: {
    backgroundColor: colors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  busStatusText: {
    ...type.labelSm,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  busLiveCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
  },
  busSlotColumn: {
    gap: 4,
  },
  busSlotLabel: {
    ...type.bodySm,
    fontSize: 11,
    color: colors.outline,
  },
  busRedActiveSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary, // Red slot highlight!
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  busRedActiveSlotText: {
    ...type.labelSm,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  busNextColumn: {
    gap: 2,
  },
  busNextLabel: {
    ...type.bodySm,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  busNextTime: {
    fontWeight: '700',
    color: colors.onSurface,
  },
  busEtaText: {
    ...type.labelSm,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  busDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  busDetailButtonText: {
    ...type.labelSm,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
});
