import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing, type } from '../theme';
import { Screen, ScreenHeader, Card, ServiceCard, SectionHeader, StatusPill } from '../components/ui';
import { fetchWithFallback, unwrapData } from '../api';

interface EmergencyContact {
  id: string;
  title: string;
  subtitle: string;
  phone: string;
  icon: string;
  badge: string;
  is_primary: boolean;
}

interface DutyPharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  duty_date?: string;
  hours?: string;
  notes?: string;
  dist?: string;
  maps_url?: string;
}

interface UrgentBlood {
  id: number;
  hospital: string;
  blood_group: string;
  patient_note: string;
  contact_phone: string;
  created_at: string;
}

interface HealthSummary {
  emergency_contacts: EmergencyContact[];
  urgent_blood_requests: UrgentBlood[];
  urgent_blood_count: number;
}

const FALLBACK_HEALTH: HealthSummary = {
  emergency_contacts: [
    {
      id: '112',
      title: '112 Acil Çağrı Merkezi',
      subtitle: 'Ambulans, Polis, İtfaiye, Jandarma',
      phone: '112',
      icon: 'call',
      badge: 'Ücretsiz / 7/24',
      is_primary: true,
    },
    {
      id: '114',
      title: 'Zehir Danışma Merkezi',
      subtitle: 'Zehirlenme vakaları ve ilk yardım',
      phone: '114',
      icon: 'alert-circle',
      badge: '7/24 Danışma',
      is_primary: false,
    },
    {
      id: '182',
      title: 'MHRS Randevu Hattı',
      subtitle: 'Merkezi Hekim Randevu Sistemi',
      phone: '182',
      icon: 'calendar',
      badge: 'Randevu Hattı',
      is_primary: false,
    },
  ],
  urgent_blood_requests: [
    {
      id: 1,
      hospital: 'Yozgat Şehir Hastanesi',
      blood_group: 'A Rh(+)',
      patient_note: 'Genel Cerrahi servisi için acil kan aranıyor',
      contact_phone: '03542190010',
      created_at: 'Bugün',
    },
  ],
  urgent_blood_count: 1,
};

const FALLBACK_PHARMACIES: DutyPharmacy[] = [
  {
    id: 1,
    name: 'Bozok Eczanesi',
    address: 'Lise Caddesi No:12, Merkez / Yozgat',
    phone: '0354 212 11 22',
    duty_date: 'Bugün (24 Saat Açık)',
    hours: '7/24 Nöbetçi',
    notes: 'Valilik ve Saat Kulesi civarı',
  },
  {
    id: 2,
    name: 'Çamlık Eczanesi',
    address: 'Meydan Çarşısı No:4, Merkez / Yozgat',
    phone: '0354 217 33 44',
    duty_date: 'Bugün (24 Saat Açık)',
    hours: '7/24 Nöbetçi',
    notes: 'Cumhuriyet Meydanı karşısı',
  },
];

export default function HealthScreen() {
  const [healthData, setHealthData] = useState<HealthSummary>(FALLBACK_HEALTH);
  const [pharmacies, setPharmacies] = useState<DutyPharmacy[]>(FALLBACK_PHARMACIES);
  const [live, setLive] = useState(false);

  const loadHealthData = async () => {
    try {
      const [healthRes, pharmRes] = await Promise.all([
        fetchWithFallback<HealthSummary>('/api/health/summary', FALLBACK_HEALTH),
        fetchWithFallback<{ status: string; data: DutyPharmacy[] }>('/api/pharmacies/on-duty', {
          status: 'fallback',
          data: FALLBACK_PHARMACIES,
        }),
      ]);

      const unwrappedHealth = unwrapData(healthRes.data);
      if (unwrappedHealth && 'emergency_contacts' in unwrappedHealth) {
        setHealthData(unwrappedHealth);
      }

      const dutyPayload = unwrapData(pharmRes.data);
      if (Array.isArray(dutyPayload)) {
        setPharmacies(dutyPayload);
      } else if (dutyPayload && typeof dutyPayload === 'object' && 'data' in dutyPayload && Array.isArray((dutyPayload as any).data)) {
        setPharmacies((dutyPayload as any).data);
      }
      setLive(healthRes.live && pharmRes.live);
    } catch {
      setLive(false);
    }
  };

  useEffect(() => {
    loadHealthData();
  }, []);

  const makeCall = (phone: string, title: string) => {
    const cleaned = phone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleaned}`;
    Alert.alert('Arama Başlatılıyor', `${title} (${phone}) aranıyor...`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Hemen Ara', onPress: () => Linking.openURL(url) },
    ]);
  };

  const openLink = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('Hata', 'Bağlantı açılamadı.'));
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title="Sağlık & Acil Durum"
        caption="Nöbetçi eczaneler, acil hatlar ve kan bağışı"
        right={<StatusPill live={live} />}
      />

      {/* 112 ACİL BUTONU */}
      <ServiceCard
        icon="medkit-outline"
        title="112 Acil Çağrı Merkezi"
        subtitle="Ambulans, İtfaiye, Polis, Jandarma (Ücretsiz)"
      >
        <Pressable
          style={({ pressed }) => [styles.emergencyButton, pressed && styles.emergencyButtonPressed]}
          onPress={() => makeCall('112', '112 Acil Çağrı')}
        >
          <Ionicons name="call" size={22} color={colors.onPrimary} />
          <Text style={styles.emergencyButtonText}>112 Acil Yardım Çağır</Text>
        </Pressable>
      </ServiceCard>

      {/* NÖBETÇİ ECZANELER */}
      <Card style={{ marginTop: spacing.md }}>
        <SectionHeader
          title="Bugünün Nöbetçi Eczaneleri"
          caption="Yozgat 7/24 kesintisiz hizmet veren eczaneler"
        />
        {pharmacies.map((item, idx) => (
          <View
            key={item.id || idx}
            style={[styles.pharmacyItem, idx < pharmacies.length - 1 && styles.borderBottom]}
          >
            <View style={styles.pharmacyHeader}>
              <View style={styles.badgeRow}>
                <View style={styles.dutyBadge}>
                  <Text style={styles.dutyBadgeText}>NÖBETÇİ</Text>
                </View>
                <Text style={styles.pharmacyName}>{item.name}</Text>
              </View>
              {item.dist ? <Text style={styles.distanceText}>{item.dist}</Text> : null}
            </View>

            <Text style={styles.pharmacyAddress}>{item.address}</Text>
            {item.notes ? <Text style={styles.pharmacyNote}>{item.notes}</Text> : null}

            <View style={styles.actionButtonsRow}>
              <Pressable
                style={({ pressed }) => [styles.smallButton, pressed && styles.smallButtonPressed]}
                onPress={() => makeCall(item.phone, item.name)}
              >
                <Ionicons name="call-outline" size={16} color={colors.primary} />
                <Text style={styles.smallButtonText}>{item.phone}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.smallOutlineButton, pressed && styles.smallButtonPressed]}
                onPress={() =>
                  openLink(item.maps_url || `https://maps.google.com/?q=${encodeURIComponent(item.name + ' ' + item.address)}`)
                }
              >
                <Ionicons name="navigate-outline" size={16} color={colors.primary} />
                <Text style={styles.smallOutlineButtonText}>Yol Tarifi</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </Card>

      {/* ACİL KAN BAĞIŞ DUYURULARI (PANELDEN YÖNETİLEN) */}
      {healthData.urgent_blood_requests && healthData.urgent_blood_requests.length > 0 && (
        <Card style={{ marginTop: spacing.md }}>
          <SectionHeader
            title="Acil Kan İhtiyaç Duyuruları"
            caption="Acil kan çağrı panosu"
          />
          {healthData.urgent_blood_requests.map((blood, idx) => (
            <View
              key={blood.id || idx}
              style={[
                styles.bloodCard,
                idx < healthData.urgent_blood_requests.length - 1 && styles.borderBottom,
              ]}
            >
              <View style={styles.bloodTopRow}>
                <View style={styles.bloodGroupBadge}>
                  <Text style={styles.bloodGroupText}>{blood.blood_group}</Text>
                </View>
                <View style={styles.bloodInfo}>
                  <Text style={styles.bloodHospital}>{blood.hospital}</Text>
                  <Text style={styles.bloodNote}>{blood.patient_note}</Text>
                  <Text style={styles.bloodDate}>{blood.created_at}</Text>
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [styles.bloodCallBtn, pressed && styles.bloodCallBtnPressed]}
                onPress={() => makeCall(blood.contact_phone, blood.hospital + ' Kan İletişim')}
              >
                <Ionicons name="call" size={16} color={colors.onPrimary} />
                <Text style={styles.bloodCallBtnText}>İletişime Geç ({blood.contact_phone})</Text>
              </Pressable>
            </View>
          ))}
        </Card>
      )}

      {/* HASTANE VE MHRS SERVİSLERİ */}
      <Card style={{ marginTop: spacing.md, marginBottom: spacing.xl }}>
        <SectionHeader title="Hastaneler & MHRS Randevu" caption="Merkezi sağlık ve poliklinik randevusu" />

        <Pressable
          style={({ pressed }) => [styles.mhrsRow, pressed && styles.mhrsRowPressed]}
          onPress={() => openLink('https://mhrs.gov.tr/')}
        >
          <View style={styles.mhrsIconWrap}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.mhrsContent}>
            <Text style={styles.mhrsTitle}>MHRS İnternet Randevusu Al</Text>
            <Text style={styles.mhrsCaption}>mhrs.gov.tr üzerinden doktor seç ve randevu oluştur</Text>
          </View>
          <Ionicons name="open-outline" size={20} color={colors.onSurfaceVariant} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.mhrsRow, pressed && styles.mhrsRowPressed]}
          onPress={() => makeCall('182', 'MHRS Randevu Çağrı')}
        >
          <View style={styles.mhrsIconWrap}>
            <Ionicons name="call-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.mhrsContent}>
            <Text style={styles.mhrsTitle}>ALO 182 Randevu Hattı</Text>
            <Text style={styles.mhrsCaption}>Telefonla MHRS çağrı merkezinden randevu al</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emergencyButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  emergencyButtonPressed: {
    backgroundColor: '#B91C1C',
  },
  emergencyButtonText: {
    color: colors.onPrimary,
    fontFamily: font.semibold,
    fontSize: type.titleSmall.fontSize,
  },
  pharmacyItem: {
    paddingVertical: spacing.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dutyBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  dutyBadgeText: {
    color: '#DC2626',
    fontFamily: font.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  pharmacyName: {
    fontFamily: font.semibold,
    fontSize: type.bodyLarge.fontSize,
    color: colors.onSurface,
  },
  distanceText: {
    fontFamily: font.medium,
    fontSize: type.labelMedium.fontSize,
    color: colors.primary,
  },
  pharmacyAddress: {
    fontFamily: font.regular,
    fontSize: type.bodyMedium.fontSize,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  pharmacyNote: {
    fontFamily: font.medium,
    fontSize: type.labelSmall.fontSize,
    color: '#059669',
    marginTop: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainer,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  smallButtonPressed: {
    opacity: 0.8,
  },
  smallButtonText: {
    fontFamily: font.medium,
    fontSize: type.labelMedium.fontSize,
    color: colors.primary,
  },
  smallOutlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  smallOutlineButtonText: {
    fontFamily: font.medium,
    fontSize: type.labelMedium.fontSize,
    color: colors.primary,
  },
  bloodCard: {
    paddingVertical: spacing.md,
  },
  bloodTopRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  bloodGroupBadge: {
    backgroundColor: '#DC2626',
    width: 50,
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodGroupText: {
    color: colors.onPrimary,
    fontFamily: font.bold,
    fontSize: 15,
  },
  bloodInfo: {
    flex: 1,
  },
  bloodHospital: {
    fontFamily: font.semibold,
    fontSize: type.bodyLarge.fontSize,
    color: colors.onSurface,
  },
  bloodNote: {
    fontFamily: font.regular,
    fontSize: type.bodyMedium.fontSize,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  bloodDate: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  bloodCallBtn: {
    backgroundColor: '#B91C1C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  bloodCallBtnPressed: {
    backgroundColor: '#991B1B',
  },
  bloodCallBtnText: {
    color: colors.onPrimary,
    fontFamily: font.semibold,
    fontSize: type.labelMedium.fontSize,
  },
  mhrsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  mhrsRowPressed: {
    opacity: 0.7,
  },
  mhrsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mhrsContent: {
    flex: 1,
  },
  mhrsTitle: {
    fontFamily: font.semibold,
    fontSize: type.bodyLarge.fontSize,
    color: colors.onSurface,
  },
  mhrsCaption: {
    fontFamily: font.regular,
    fontSize: type.labelSmall.fontSize,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
});
