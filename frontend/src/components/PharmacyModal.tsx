import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, radius, shadow, spacing, type } from '../theme';
import { fetchWithFallback, unwrapData } from '../api';
import UniversalModal from './UniversalModal';

export interface PharmacyItem {
  id: number;
  name: string;
  is_on_duty: boolean;
  address: string;
  neighborhood?: string;
  phone: string;
  latitude: number;
  longitude: number;
  duty_date?: string;
  hours: string;
  notes?: string;
  distance_km?: number;
  dist: string;
  maps_url?: string;
}

const FALLBACK_PHARMACIES: PharmacyItem[] = [
  {
    id: 1,
    name: 'Bozok Eczanesi',
    is_on_duty: true,
    address: 'Lise Caddesi No:12, Merkez / Yozgat',
    neighborhood: 'Aşağı Nohutlu Mah.',
    phone: '0354 212 11 22',
    latitude: 39.8214,
    longitude: 34.8089,
    duty_date: 'Bugün (24 Saat Açık)',
    hours: '7/24 Nöbetçi',
    notes: 'Valilik ve Saat Kulesi civarı',
    dist: '650 m',
    maps_url: 'https://www.google.com/maps/dir/?api=1&destination=39.8214,34.8089',
  },
  {
    id: 2,
    name: 'Çamlık Eczanesi',
    is_on_duty: true,
    address: 'Meydan Çarşısı No:4, Merkez / Yozgat',
    neighborhood: 'Medrese Mah.',
    phone: '0354 217 33 44',
    latitude: 39.8198,
    longitude: 34.8123,
    duty_date: 'Bugün (24 Saat Açık)',
    hours: '7/24 Nöbetçi',
    notes: 'Cumhuriyet Meydanı Ziraat Bankası karşısı',
    dist: '1.2 km',
    maps_url: 'https://www.google.com/maps/dir/?api=1&destination=39.8198,34.8123',
  },
  {
    id: 3,
    name: 'Şifa Eczanesi',
    is_on_duty: false,
    address: 'Hastane Caddesi No:18, Merkez / Yozgat',
    neighborhood: 'Erdoğan Akdağ Mah.',
    phone: '0354 212 45 67',
    latitude: 39.8260,
    longitude: 34.8250,
    hours: '08:30 - 19:00',
    notes: 'Şehir Hastanesi yakını',
    dist: '2.1 km',
    maps_url: 'https://www.google.com/maps/dir/?api=1&destination=39.8260,34.8250',
  },
  {
    id: 4,
    name: 'Üniversite Eczanesi',
    is_on_duty: false,
    address: 'Erdoğan Akdağ Kampüsü Karşısı No:6, Yozgat',
    neighborhood: 'Sarıhacılı Mah.',
    phone: '0354 214 78 90',
    latitude: 39.8402,
    longitude: 34.8510,
    hours: '08:30 - 19:00',
    notes: 'Bozok Üniversitesi Kampüs Ana Giriş karşısı',
    dist: '4.5 km',
    maps_url: 'https://www.google.com/maps/dir/?api=1&destination=39.8402,34.8510',
  },
  {
    id: 5,
    name: 'Hayat Eczanesi',
    is_on_duty: false,
    address: 'Sivas Caddesi No:24, Merkez / Yozgat',
    neighborhood: 'Köseoğlu Mah.',
    phone: '0354 212 88 99',
    latitude: 39.8175,
    longitude: 34.8050,
    hours: '08:30 - 19:00',
    dist: '1.8 km',
    maps_url: 'https://www.google.com/maps/dir/?api=1&destination=39.8175,34.8050',
  },
];

interface PharmacyModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PharmacyModal({ visible, onClose }: PharmacyModalProps) {
  const insets = useSafeAreaInsets();
  const [pharmacies, setPharmacies] = useState<PharmacyItem[]>(FALLBACK_PHARMACIES);
  const [filterType, setFilterType] = useState<'all' | 'duty'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  // GPS Konumunu al
  useEffect(() => {
    if (visible) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          }
        } catch {
          // varsayılan konum kullanılacak
        }
      })();
    }
  }, [visible]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParam = userCoords ? `?lat=${userCoords.lat}&lon=${userCoords.lon}` : '';
      const res = await fetchWithFallback<any>(`/api/pharmacies/${queryParam}`, {
        status: 'fallback',
        data: FALLBACK_PHARMACIES,
      });

      if (res.data) {
        const list = unwrapData<PharmacyItem[]>(res.data);
        if (Array.isArray(list) && list.length > 0) {
          setPharmacies(list);
        }
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  }, [userCoords]);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, loadData]);

  const openNavigation = (pharmacy: PharmacyItem) => {
    const url = pharmacy.maps_url ||
      `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.name + ' Yozgat')}`);
    });
  };

  const callPharmacy = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, '');
    Linking.openURL(`tel:${cleanPhone}`);
  };

  const filteredPharmacies = pharmacies.filter((p) => {
    if (filterType === 'duty' && !p.is_on_duty) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        (p.neighborhood && p.neighborhood.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const onDutyCount = pharmacies.filter((p) => p.is_on_duty).length;

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
                <Ionicons name="medkit" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Yozgat Eczaneleri</Text>
                <Text style={styles.subtitle}>
                  Tüm Eczaneler & Güncel Nöbet Çizelgesi
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, filterType === 'all' && styles.tabBtnActive]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.tabBtnText, filterType === 'all' && styles.tabBtnTextActive]}>
                Tümü ({pharmacies.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtnDuty, filterType === 'duty' && styles.tabBtnDutyActive]}
              onPress={() => setFilterType('duty')}
            >
              <Ionicons
                name="alert-circle"
                size={14}
                color={filterType === 'duty' ? '#FFFFFF' : colors.primary}
              />
              <Text style={[styles.tabBtnDutyText, filterType === 'duty' && styles.tabBtnDutyTextActive]}>
                Nöbetçi Eczaneler ({onDutyCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color={colors.outline} />
            <TextInput
              placeholder="Eczane veya mahalle ara..."
              placeholderTextColor={colors.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.outline} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Pharmacies List */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />
            }
          >
            {filteredPharmacies.map((pharmacy) => {
              const isOnDuty = pharmacy.is_on_duty;

              return (
                <View
                  key={pharmacy.id}
                  style={[
                    styles.pharmacyCard,
                    isOnDuty && styles.pharmacyCardDuty, // Red border and highlight for on-duty!
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[styles.iconCircle, isOnDuty && styles.iconCircleDuty]}>
                        <Ionicons
                          name="medkit"
                          size={18}
                          color={isOnDuty ? '#FFFFFF' : colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.nameRow}>
                          <Text style={[styles.pharmacyName, isOnDuty && styles.pharmacyNameDuty]}>
                            {pharmacy.name}
                          </Text>
                          {isOnDuty && (
                            <View style={styles.dutyBadgeRed}>
                              <Ionicons name="radio-button-on" size={10} color="#FFFFFF" />
                              <Text style={styles.dutyBadgeRedText}>NÖBETÇİ</Text>
                            </View>
                          )}
                        </View>
                        {pharmacy.neighborhood ? (
                          <Text style={styles.neighborhoodText}>{pharmacy.neighborhood}</Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Distance Pill */}
                    <View style={styles.distPill}>
                      <Ionicons name="navigate-outline" size={12} color={colors.primary} />
                      <Text style={styles.distPillText}>{pharmacy.dist}</Text>
                    </View>
                  </View>

                  {/* Address & Working Hours */}
                  <View style={styles.addressBlock}>
                    <Ionicons name="location-outline" size={14} color={colors.outline} style={{ marginTop: 2 }} />
                    <Text style={styles.addressText}>{pharmacy.address}</Text>
                  </View>

                  <View style={styles.hoursBlock}>
                    <Ionicons name="time-outline" size={14} color={isOnDuty ? colors.primary : colors.outline} />
                    <Text style={[styles.hoursText, isOnDuty && styles.hoursTextDuty]}>
                      {pharmacy.hours} {isOnDuty ? '• 24 Saat Kesintisiz Açık' : ''}
                    </Text>
                  </View>

                  {pharmacy.notes ? (
                    <Text style={styles.notesText}>{pharmacy.notes}</Text>
                  ) : null}

                  {/* Actions Row: Yol Tarifi & Ara */}
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.actionBtnNav, isOnDuty && styles.actionBtnNavDuty]}
                      onPress={() => openNavigation(pharmacy)}
                    >
                      <Ionicons name="map-outline" size={15} color="#FFFFFF" />
                      <Text style={styles.actionBtnNavText}>Yol Tarifi Al</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnCall}
                      onPress={() => callPharmacy(pharmacy.phone)}
                    >
                      <Ionicons name="call-outline" size={15} color={colors.primary} />
                      <Text style={styles.actionBtnCallText}>{pharmacy.phone}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {filteredPharmacies.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={36} color={colors.outline} />
                <Text style={styles.emptyText}>Aradığınız kriterlere uygun eczane bulunamadı.</Text>
              </View>
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  tabBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  tabBtnActive: {
    backgroundColor: colors.onSurface,
    borderColor: colors.onSurface,
  },
  tabBtnText: {
    ...type.labelMd,
    color: colors.onSurfaceVariant,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabBtnDuty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryFixed,
    borderWidth: 1,
    borderColor: colors.primaryFixedDim,
  },
  tabBtnDutyActive: {
    backgroundColor: colors.primary, // Red active tab!
    borderColor: colors.primary,
  },
  tabBtnDutyText: {
    ...type.labelMd,
    color: colors.primary,
    fontWeight: '600',
  },
  tabBtnDutyTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: 8,
  },
  searchInput: {
    ...type.bodySm,
    color: colors.onSurface,
    flex: 1,
    padding: 0,
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 30,
    gap: 12,
  },
  pharmacyCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    ...shadow.card,
  },
  pharmacyCardDuty: {
    borderColor: colors.primary, // Red border for on-duty!
    borderWidth: 2,
    backgroundColor: '#FFF9F9',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleDuty: {
    backgroundColor: colors.primary, // Red icon circle
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  pharmacyName: {
    ...type.headlineSm,
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  pharmacyNameDuty: {
    color: colors.primary, // Red text for on-duty
  },
  dutyBadgeRed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary, // Red badge!
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dutyBadgeRedText: {
    ...type.labelSm,
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  neighborhoodText: {
    ...type.bodySm,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  distPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryFixed,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  distPillText: {
    ...type.labelSm,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  addressBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  addressText: {
    ...type.bodySm,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 16,
  },
  hoursBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  hoursText: {
    ...type.bodySm,
    fontSize: 11,
    color: colors.outline,
  },
  hoursTextDuty: {
    color: colors.primary,
    fontWeight: '600',
  },
  notesText: {
    ...type.bodySm,
    fontSize: 10,
    color: colors.outline,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
  },
  actionBtnNav: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.onSurface,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  actionBtnNavDuty: {
    backgroundColor: colors.primary, // Red button for on-duty directions!
  },
  actionBtnNavText: {
    ...type.labelMd,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  actionBtnCall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  actionBtnCallText: {
    ...type.labelMd,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    ...type.bodySm,
    color: colors.outline,
    textAlign: 'center',
  },
});
