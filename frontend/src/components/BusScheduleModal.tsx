import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, type } from '../theme';
import { fetchWithFallback, unwrapData } from '../api';
import UniversalModal from './UniversalModal';

export interface BusRoute {
  id: number;
  line_number: string;
  route_name: string;
  direction: string;
  first_departure: string;
  last_departure: string;
  interval_mins: number;
  stops: string[];
  schedule: string[];
  current_slot: string;
  next_departure: string;
  eta_minutes: number;
  eta_text: string;
  status: string;
  is_active_now: boolean;
}

const FALLBACK_ROUTES: BusRoute[] = [
  {
    id: 1,
    line_number: '1',
    route_name: 'Kampüs - Cumhuriyet Meydanı - Otogar',
    direction: 'Kampüs ➔ Otogar',
    first_departure: '06:30',
    last_departure: '23:30',
    interval_mins: 30,
    stops: ['Erdoğan Akdağ Kampüsü', 'Tıp Fakültesi', 'Sarıhacılı', 'Lise Caddesi', 'Saat Kulesi Meydanı', 'Otogar'],
    schedule: [
      '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
      '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00',
      '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
      '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
    ],
    current_slot: '21:30',
    next_departure: '22:00',
    eta_minutes: 15,
    eta_text: '15 dk sonra',
    status: 'Yolda (Yakında)',
    is_active_now: true,
  },
  {
    id: 2,
    line_number: '2',
    route_name: 'Şehir Hastanesi - Çamlık - Kent Merkezi',
    direction: 'Şehir Hastanesi ➔ Kent Merkezi',
    first_departure: '06:45',
    last_departure: '23:15',
    interval_mins: 30,
    stops: ['Yozgat Şehir Hastanesi', 'Adliye', 'Valilik', 'Cumhuriyet Meydanı', 'Çamlık Parkı', 'Köseoğlu'],
    schedule: [
      '06:45', '07:15', '07:45', '08:15', '08:45', '09:15', '09:45',
      '10:15', '10:45', '11:15', '11:45', '12:15', '12:45', '13:15',
      '13:45', '14:15', '14:45', '15:15', '15:45', '16:15', '16:45',
      '17:15', '17:45', '18:15', '18:45', '19:15', '19:45', '20:15',
      '20:45', '21:15', '21:45', '22:15', '22:45', '23:15',
    ],
    current_slot: '21:45',
    next_departure: '22:15',
    eta_minutes: 20,
    eta_text: '20 dk sonra',
    status: 'Seferde',
    is_active_now: true,
  },
  {
    id: 3,
    line_number: '3',
    route_name: 'KYK Yurtları - Bilal Şahin - Rektörlük',
    direction: 'KYK Yurtlar ➔ Rektörlük',
    first_departure: '07:00',
    last_departure: '23:00',
    interval_mins: 30,
    stops: ['Bozok Kız KYK', 'Sürmeli Erkek KYK', 'Bilal Şahin İlahiyat', 'Kapalı Spor Salonu', 'İİBF', 'Rektörlük'],
    schedule: [
      '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00',
      '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
      '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
      '21:00', '21:30', '22:00', '22:30', '23:00',
    ],
    current_slot: '21:30',
    next_departure: '22:00',
    eta_minutes: 10,
    eta_text: '10 dk sonra',
    status: 'Yolda (Yakında)',
    is_active_now: true,
  },
  {
    id: 4,
    line_number: '4',
    route_name: 'Eski Sanayi - Bilal Şahin Mah. - Üniversite',
    direction: 'Sanayi ➔ Kampüs',
    first_departure: '07:15',
    last_departure: '22:45',
    interval_mins: 30,
    stops: ['Eski Sanayi Sitesi', 'Dörtyol', 'Medrese', 'Cumhuriyet Meydanı', 'Eğitim Fakültesi', 'Merkezi Kütüphane'],
    schedule: [
      '07:15', '07:45', '08:15', '08:45', '09:15', '09:45', '10:15',
      '10:45', '11:15', '11:45', '12:15', '12:45', '13:15', '13:45',
      '14:15', '14:45', '15:15', '15:45', '16:15', '16:45', '17:15',
      '17:45', '18:15', '18:45', '19:15', '19:45', '20:15', '20:45',
      '21:15', '21:45', '22:15', '22:45',
    ],
    current_slot: '21:45',
    next_departure: '22:15',
    eta_minutes: 25,
    eta_text: '25 dk sonra',
    status: 'Seferde',
    is_active_now: true,
  },
];

interface BusScheduleModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BusScheduleModal({ visible, onClose }: BusScheduleModalProps) {
  const insets = useSafeAreaInsets();
  const [routes, setRoutes] = useState<BusRoute[]>(FALLBACK_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithFallback<any>('/api/transport/buses', {
        status: 'fallback',
        current_time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        data: FALLBACK_ROUTES,
      });

      if (res.data) {
        if (res.data.current_time) {
          setCurrentTime(res.data.current_time);
        }
        const dataList = unwrapData<BusRoute[]>(res.data);
        if (Array.isArray(dataList) && dataList.length > 0) {
          setRoutes(dataList);
        }
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, loadData]);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <UniversalModal visible={visible} onClose={onClose} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Kapat" />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.grabber} />

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="bus" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Otobüs Saatleri & Canlı Takip</Text>
                <Text style={styles.subtitle}>
                  Yozgat Şehir İçi Hatları {currentTime ? `· Saat: ${currentTime}` : ''}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Line Selector Pills */}
          <View style={styles.selectorWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectorScroll}
            >
              {routes.map((route) => {
                const isSelected = route.id === selectedRouteId;
                return (
                  <TouchableOpacity
                    key={route.id}
                    onPress={() => setSelectedRouteId(route.id)}
                    style={[styles.linePill, isSelected && styles.linePillActive]}
                  >
                    <View style={[styles.lineNumberBadge, isSelected && styles.lineNumberBadgeActive]}>
                      <Text style={[styles.lineNumberText, isSelected && styles.lineNumberTextActive]}>
                        HAT {route.line_number}
                      </Text>
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[styles.linePillName, isSelected && styles.linePillNameActive]}
                    >
                      {route.direction.split('➔')[1]?.trim() || route.route_name.split('-')[0].trim()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Main Scroll Content */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />
            }
          >
            {activeRoute ? (
              <>
                {/* Live Status Card */}
                <View style={styles.liveCard}>
                  <View style={styles.liveCardTop}>
                    <View style={styles.routeHeaderInfo}>
                      <View style={styles.largeLineBadge}>
                        <Text style={styles.largeLineBadgeText}>HAT {activeRoute.line_number}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.routeFullName}>{activeRoute.route_name}</Text>
                        <Text style={styles.routeDirection}>
                          <Ionicons name="swap-horizontal" size={13} color={colors.outline} /> {activeRoute.direction}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.statusPillBadge}>
                      <Ionicons name="pulse" size={13} color={colors.primary} />
                      <Text style={styles.statusPillText}>{activeRoute.status}</Text>
                    </View>
                  </View>

                  <View style={styles.liveDivider} />

                  <View style={styles.liveMetricsRow}>
                    <View style={styles.metricCol}>
                      <Text style={styles.metricLabel}>Şu Anki Sefer Dilimi</Text>
                      <View style={styles.currentSlotHighlight}>
                        <Text style={styles.currentSlotHighlightText}>{activeRoute.current_slot}</Text>
                      </View>
                    </View>
                    <View style={styles.metricCol}>
                      <Text style={styles.metricLabel}>Bir Sonraki Sefer</Text>
                      <Text style={styles.metricValueLarge}>{activeRoute.next_departure}</Text>
                      <Text style={styles.metricEta}>{activeRoute.eta_text}</Text>
                    </View>
                    <View style={styles.metricCol}>
                      <Text style={styles.metricLabel}>Sefer Aralığı</Text>
                      <Text style={styles.metricValue}>{activeRoute.interval_mins} dk</Text>
                      <Text style={styles.metricSub}>06:30 - 23:30</Text>
                    </View>
                  </View>
                </View>

                {/* Route Stops Flow */}
                <View style={styles.stopsSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    <Ionicons name="trail-sign-outline" size={15} color={colors.primary} /> Güzergah Durakları
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stopsScroll}>
                    {activeRoute.stops.map((stop, index) => (
                      <View key={index} style={styles.stopNode}>
                        <View style={styles.stopCircle}>
                          <Text style={styles.stopIndexText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.stopName} numberOfLines={2}>{stop}</Text>
                        {index < activeRoute.stops.length - 1 && (
                          <View style={styles.stopConnector} />
                        )}
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* All Schedules Grid (Active slot highlighted in RED) */}
                <View style={styles.scheduleSection}>
                  <View style={styles.scheduleHeaderRow}>
                    <View>
                      <Text style={styles.sectionHeaderTitle}>
                        <Ionicons name="time-outline" size={16} color={colors.primary} /> Günlük Sefer Saatleri
                      </Text>
                      <Text style={styles.scheduleHint}>
                        Şu an geçerli olan sefer saati kırmızı ile vurgulanmıştır
                      </Text>
                    </View>
                  </View>

                  <View style={styles.timeGrid}>
                    {activeRoute.schedule.map((timeStr) => {
                      const isCurrent = timeStr === activeRoute.current_slot;
                      const isNext = timeStr === activeRoute.next_departure;

                      return (
                        <View
                          key={timeStr}
                          style={[
                            styles.timeSlotCard,
                            isCurrent && styles.timeSlotCardCurrent,
                            isNext && !isCurrent && styles.timeSlotCardNext,
                          ]}
                        >
                          <Text
                            style={[
                              styles.timeSlotText,
                              isCurrent && styles.timeSlotTextCurrent,
                              isNext && !isCurrent && styles.timeSlotTextNext,
                            ]}
                          >
                            {timeStr}
                          </Text>

                          {isCurrent && (
                            <View style={styles.slotActiveBadge}>
                              <Ionicons name="radio-button-on" size={10} color="#FFFFFF" />
                              <Text style={styles.slotActiveBadgeText}>ŞU AN</Text>
                            </View>
                          )}

                          {isNext && !isCurrent && (
                            <View style={styles.slotNextBadge}>
                              <Text style={styles.slotNextBadgeText}>SIRADAKİ</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              </>
            ) : (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            )}
          </ScrollView>
        </View>
      </View>
    </UniversalModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    maxHeight: '90%',
    ...shadow.modal,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceContainerHighest,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...type.headlineSm,
    color: colors.onSurface,
    fontWeight: '700',
  },
  subtitle: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
    paddingBottom: 8,
  },
  selectorScroll: {
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  linePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  linePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  lineNumberBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lineNumberBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  lineNumberText: {
    ...type.labelSm,
    color: colors.primary,
    fontWeight: '700',
  },
  lineNumberTextActive: {
    color: '#FFFFFF',
  },
  linePillName: {
    ...type.labelMd,
    color: colors.onSurface,
    maxWidth: 120,
  },
  linePillNameActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 30,
    gap: 16,
  },
  liveCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadow.card,
  },
  liveCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  routeHeaderInfo: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
    alignItems: 'flex-start',
  },
  largeLineBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  largeLineBadgeText: {
    ...type.labelMd,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  routeFullName: {
    ...type.headlineSm,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: '700',
  },
  routeDirection: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  statusPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusPillText: {
    ...type.labelSm,
    color: colors.primary,
  },
  liveDivider: {
    height: 1,
    backgroundColor: colors.surfaceContainer,
    marginVertical: 12,
  },
  liveMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricCol: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    ...type.bodySm,
    fontSize: 11,
    color: colors.outline,
    marginBottom: 4,
    textAlign: 'center',
  },
  currentSlotHighlight: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  currentSlotHighlightText: {
    ...type.headlineSm,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricValueLarge: {
    ...type.headlineSm,
    fontSize: 17,
    fontWeight: '700',
    color: colors.onSurface,
  },
  metricEta: {
    ...type.labelSm,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  metricValue: {
    ...type.headlineSm,
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
  },
  metricSub: {
    ...type.bodySm,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  stopsSection: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: 12,
  },
  sectionHeaderTitle: {
    ...type.labelLg,
    color: colors.onSurface,
    fontWeight: '700',
    marginBottom: 8,
  },
  stopsScroll: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 12,
  },
  stopNode: {
    alignItems: 'center',
    width: 80,
    position: 'relative',
  },
  stopCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stopIndexText: {
    ...type.labelSm,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stopName: {
    ...type.bodySm,
    fontSize: 10,
    color: colors.onSurface,
    textAlign: 'center',
    lineHeight: 13,
  },
  stopConnector: {
    position: 'absolute',
    top: 11,
    left: 52,
    width: 40,
    height: 2,
    backgroundColor: colors.outlineVariant,
    zIndex: -1,
  },
  scheduleSection: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadow.card,
  },
  scheduleHeaderRow: {
    marginBottom: 12,
  },
  scheduleHint: {
    ...type.bodySm,
    color: colors.outline,
    marginTop: 2,
    fontSize: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  timeSlotCard: {
    width: '23%',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    position: 'relative',
  },
  timeSlotCardCurrent: {
    backgroundColor: colors.primary, // RED background
    borderColor: '#FFDAD7',
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  timeSlotCardNext: {
    backgroundColor: colors.primaryFixed,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  timeSlotText: {
    ...type.labelMd,
    fontSize: 13,
    color: colors.onSurface,
    fontWeight: '600',
  },
  timeSlotTextCurrent: {
    color: '#FFFFFF', // White text on RED
    fontWeight: '700',
    fontSize: 14,
  },
  timeSlotTextNext: {
    color: colors.primary,
    fontWeight: '700',
  },
  slotActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  slotActiveBadgeText: {
    ...type.labelSm,
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  slotNextBadge: {
    marginTop: 2,
  },
  slotNextBadgeText: {
    ...type.labelSm,
    fontSize: 8,
    color: colors.primary,
    fontWeight: '700',
  },
});
