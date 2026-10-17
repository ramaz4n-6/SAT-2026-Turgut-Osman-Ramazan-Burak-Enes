import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { colors, font, spacing, type } from '../theme';
import { Screen, ScreenHeader, Card, SectionHeader, LeaderRow, StatusPill, Chip } from '../components/ui';
import { fetchWithFallback, unwrapData } from '../api';

interface PrayerTimes {
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
}

interface PrayerApiResponse extends PrayerTimes {
  city?: string;
  date?: string;
  current_prayer?: string;
  current_prayer_label?: string;
  next_prayer?: string;
  next_prayer_label?: string;
  time_remaining?: string;
}

const MOCK_PRAYER: PrayerTimes = {
  imsak: '05:10',
  gunes: '06:30',
  ogle: '12:45',
  ikindi: '15:55',
  aksam: '18:40',
  yatsi: '20:00',
};

const PRAYER_ROWS: { key: keyof PrayerTimes; label: string }[] = [
  { key: 'imsak', label: 'İmsak' },
  { key: 'gunes', label: 'Güneş' },
  { key: 'ogle', label: 'Öğle' },
  { key: 'ikindi', label: 'İkindi' },
  { key: 'aksam', label: 'Akşam' },
  { key: 'yatsi', label: 'Yatsı' },
];

function findFallbackCurrentAndNext(times: PrayerTimes): { current: keyof PrayerTimes; next: keyof PrayerTimes } {
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  
  const parseM = (key: keyof PrayerTimes) => {
    const val = times[key];
    if (!val || !val.includes(':')) return 0;
    const [h, m] = val.split(':').map(Number);
    return h * 60 + m;
  };

  const imsakM = parseM('imsak');
  const gunesM = parseM('gunes');
  const ogleM = parseM('ogle');
  const ikindiM = parseM('ikindi');
  const aksamM = parseM('aksam');
  const yatsiM = parseM('yatsi');

  if (minutesNow < imsakM || minutesNow >= yatsiM) {
    return { current: 'yatsi', next: 'imsak' };
  } else if (minutesNow < gunesM) {
    return { current: 'imsak', next: 'gunes' };
  } else if (minutesNow < ogleM) {
    return { current: 'gunes', next: 'ogle' };
  } else if (minutesNow < ikindiM) {
    return { current: 'ogle', next: 'ikindi' };
  } else if (minutesNow < aksamM) {
    return { current: 'ikindi', next: 'aksam' };
  } else {
    return { current: 'aksam', next: 'yatsi' };
  }
}

export default function PrayerCalendarScreen() {
  const [times, setTimes] = useState<PrayerTimes>(MOCK_PRAYER);
  const [apiMeta, setApiMeta] = useState<PrayerApiResponse | null>(null);
  const [live, setLive] = useState(false);
  const [cityName, setCityName] = useState('Yozgat');

  useEffect(() => {
    (async () => {
      let query = '';
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          query = `?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}`;
          setCityName('Mevcut Konum');
        }
      } catch {
        // İzin yoksa varsayılan Yozgat
      }

      fetchWithFallback<PrayerApiResponse | { status: string; data: PrayerApiResponse }>(
        `/api/prayer/${query}`,
        MOCK_PRAYER
      ).then((result) => {
        const data = unwrapData<PrayerApiResponse>(result.data);
        if (data) {
          setTimes(data);
          setApiMeta(data);
          if (data.city) {
            setCityName(data.city);
          }
        }
        setLive(result.live);
      });
    })();
  }, []);

  const fallbackStatus = findFallbackCurrentAndNext(times);
  const currentKey = (apiMeta?.current_prayer as keyof PrayerTimes) || fallbackStatus.current;
  const nextKey = (apiMeta?.next_prayer as keyof PrayerTimes) || fallbackStatus.next;
  const currentLabel = PRAYER_ROWS.find((r) => r.key === currentKey)?.label || 'Yatsı';
  const nextLabel = PRAYER_ROWS.find((r) => r.key === nextKey)?.label || 'İmsak';
  const dateStr = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Screen>
      <ScreenHeader title="Namaz Vakitleri" caption={`${dateStr} · ${cityName}`} right={<StatusPill live={live} />} />

      {/* Şu Anki Aktif Vakit Kartı */}
      <Card>
        <View style={styles.nextHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nextLabel}>ŞU ANKİ VAKİT</Text>
            <Text style={styles.nextTitle}>{currentLabel} Vakti</Text>
            <Text style={styles.nextCaption}>
              Sıradaki: {nextLabel} ({times[nextKey]}) {apiMeta?.time_remaining ? `· Kalan: ${apiMeta.time_remaining}` : ''}
            </Text>
          </View>
          <View style={styles.nextTimeWrap}>
            <Text style={[styles.nextTime, { color: colors.primary }]}>{times[currentKey]}</Text>
            <Chip label="Aktif Vakit" variant="active" />
          </View>
        </View>
      </Card>

      {/* Günlük Vakitler Listesi - Aktif olan kırmızı/vurgulu */}
      <Card>
        <SectionHeader title="Günlük Vakitler" caption="Yozgat Günlük Vakitleri" />
        {PRAYER_ROWS.map((row) => {
          const isCurrent = row.key === currentKey;
          const isNext = row.key === nextKey;
          return (
            <LeaderRow
              key={row.key}
              label={row.label}
              value={times[row.key]}
              emphasized={isCurrent}
              trailing={
                isCurrent ? (
                  <Chip label="Şu Anki Vakit" variant="active" />
                ) : isNext ? (
                  <Chip label="Sıradaki" variant="tonal" />
                ) : undefined
              }
            />
          );
        })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextLabel: {
    ...type.labelSm,
    color: colors.onSurfaceVariant,
  },
  nextTitle: {
    ...type.headlineMd,
    color: colors.primary,
    fontFamily: font.bold,
    fontWeight: '700',
    marginTop: 4,
  },
  nextCaption: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  nextTimeWrap: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  nextTime: {
    ...type.metric,
    color: colors.onSurface,
  },
  noteRow: {
    flex: 1,
  },
  noteText: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
  },
});
