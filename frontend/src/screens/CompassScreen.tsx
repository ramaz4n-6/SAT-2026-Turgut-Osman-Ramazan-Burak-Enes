import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { colors, font, spacing, type } from '../theme';
import { Screen, ScreenHeader, Card, SectionHeader, LeaderRow, Chip, StatusPill } from '../components/ui';
import { fetchWithFallback, unwrapData } from '../api';

const DIAL_SIZE = 260;

const TICKS = Array.from({ length: 36 }, (_, index) => index * 10);

interface QiblaResponse {
  direction: number;
  degree: number;
  direction_text: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  kaaba_distance_km: number;
  updated_at: string;
}

const DEFAULT_QIBLA: QiblaResponse = {
  direction: 165.45,
  degree: 165,
  direction_text: 'Güney-Güneydoğu',
  city: 'Yozgat',
  coordinates: { latitude: 39.8181, longitude: 34.8147 },
  kaaba_distance_km: 2100,
  updated_at: '—',
};

export default function CompassScreen() {
  const [qibla, setQibla] = useState<QiblaResponse>(DEFAULT_QIBLA);
  const [live, setLive] = useState(false);
  const [heading, setHeading] = useState<number>(0);
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lon: number } | null>(null);
  const wobble = useRef(new Animated.Value(0)).current;

  // Kullanıcının anlık GPS konumunu al ve API'den o konuma özel Kıble verisini çek
  useEffect(() => {
    (async () => {
      let lat = 39.8181;
      let lon = 34.8147;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lat = loc.coords.latitude;
          lon = loc.coords.longitude;
          setUserLoc({ lat, lon });
        }
      } catch {
        // Konum izni verilmezse Yozgat varsayılan kullanılır
      }

      fetchWithFallback<{ status: string; data: QiblaResponse } | QiblaResponse>(
        `/api/prayer/qibla?lat=${lat}&lon=${lon}`,
        DEFAULT_QIBLA
      ).then((res) => {
        const parsed = unwrapData<QiblaResponse>(res.data);
        if (parsed && typeof parsed.degree === 'number') {
          setQibla(parsed);
        }
        setLive(res.live);
      });
    })();
  }, []);

  // Cihazın Manyetik Pusula Sensörünü Dinle (Telefonu çevirince anlık döner)
  useEffect(() => {
    let subscription: any = null;

    Magnetometer.isAvailableAsync()
      .then((available) => {
        if (available) {
          setHasSensor(true);
          Magnetometer.setUpdateInterval(40); // 25 fps akıcı dönüş
          subscription = Magnetometer.addListener((data) => {
            // Standart pusula açısı: atan2(-x, y)
            let angle = Math.atan2(-data.x, data.y) * (180 / Math.PI);
            if (angle < 0) {
              angle += 360;
            }
            setHeading(Math.round(angle));
          });
        } else {
          setHasSensor(false);
        }
      })
      .catch(() => {
        setHasSensor(false);
      });

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Sensör yoksa yedek salınım animasyonu
  useEffect(() => {
    if (!hasSensor) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(wobble, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(wobble, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [hasSensor, wobble]);

  const targetDeg = qibla.degree || DEFAULT_QIBLA.degree;

  // Sensör aktifse pusula kadranı telefonu çevirdikçe -heading açısında döner (Kuzey sabit kalır)
  // İbre ise kadran üzerinde tam Kıble açısını (165°) gösterir.
  // Telefon kıbleye çevrilince ibre tam yukarı bakar.
  const dialRotation = hasSensor ? `${-heading}deg` : '0deg';
  
  // Sensör yoksa ibre salınır, sensör varsa kadran içinde sabit kıble açısına kilitlenir
  const needleRotation = hasSensor
    ? `${Number(targetDeg || 163)}deg`
    : wobble.interpolate({
        inputRange: [0, 1],
        outputRange: [`${Number(targetDeg || 163) - 2}deg`, `${Number(targetDeg || 163) + 2}deg`],
      });

  // Kıble hizalanma kontrolü (tolerans +/- 6 derece)
  const angleDiff = Math.abs(((heading - targetDeg + 540) % 360) - 180);
  const isAligned = hasSensor && angleDiff <= 6;

  return (
    <Screen>
      <ScreenHeader
        title="Pusula & Kıble"
        caption={`${qibla.city}'tan Kâbe'ye anlık canlı yön`}
        right={<StatusPill live={live} />}
      />

      <Card style={styles.dialCard}>
        {/* Dönen Pusula Kadranı */}
        <View style={[styles.dial, { transform: [{ rotate: dialRotation }] }]}>
          {TICKS.map((degree) => {
            const major = degree % 90 === 0;
            return (
              <View
                key={degree}
                style={[
                  styles.tickBar,
                  { transform: [{ rotate: `${degree}deg` }] },
                ]}
              >
                <View style={[styles.tick, major ? styles.tickMajor : styles.tickMinor]} />
              </View>
            );
          })}

          <Text style={[styles.cardinal, styles.cardinalNorth]}>K</Text>
          <Text style={[styles.cardinal, styles.cardinalEast]}>D</Text>
          <Text style={[styles.cardinal, styles.cardinalSouth]}>G</Text>
          <Text style={[styles.cardinal, styles.cardinalWest]}>B</Text>

          {/* Kıble İbresi */}
          <Animated.View
            style={[styles.needle, { transform: [{ rotate: needleRotation as any }] }]}
          >
            <View style={[styles.needleNorth, isAligned && styles.needleAligned]} />
            <View style={styles.needleSouth} />
          </Animated.View>

          <View style={styles.needlePin} />
        </View>

        {/* Kıble Durum Rozeti */}
        <View style={[styles.qiblaBadge, isAligned && styles.qiblaBadgeAligned]}>
          <Text style={[styles.qiblaBadgeText, isAligned && styles.qiblaBadgeTextAligned]}>
            {isAligned ? '🎯 KIBLE YÖNÜNDESİNİZ' : `KIBLE ${qibla.degree}°`}
          </Text>
        </View>

        {hasSensor && (
          <Text style={styles.headingIndicator}>
            Pusula Açısı: {heading}° · {isAligned ? 'Hizalandı' : `Kıbleye ${Math.round(angleDiff)}° kaldı`}
          </Text>
        )}
      </Card>

      <Card>
        <SectionHeader title="Canlı Kıble & Konum" caption={`${qibla.city} referans alınmıştır`} />
        <LeaderRow label="Kıble Açısı" value={`${qibla.direction}° (${qibla.degree}°)`} emphasized />
        <LeaderRow label="Pusula Yönü" value={qibla.direction_text} />
        {hasSensor && (
          <LeaderRow label="Telefonun Baktığı Açı" value={`${heading}°`} />
        )}
        <LeaderRow label="Kâbe'ye Kuş Uçuşu Mesafe" value={`~${qibla.kaaba_distance_km.toLocaleString('tr-TR')} km`} />
        <LeaderRow
          label="Koordinat"
          value={`${qibla.coordinates.latitude.toFixed(2)}° K, ${qibla.coordinates.longitude.toFixed(2)}° D`}
        />
        {qibla.updated_at !== '—' && (
          <LeaderRow label="Son Güncelleme" value={qibla.updated_at} />
        )}
      </Card>

      <Card>
        <View style={styles.noteRow}>
          <Chip
            label={hasSensor ? 'Manyetik Sensör Aktif' : 'Sensör Bekleniyor'}
            icon="compass-outline"
          />
          <Text style={styles.noteText}>
            {hasSensor
              ? 'Telefonunuzu yatay tutarak çevirin; kırmızı ibre doğrudan Kâbe yönünü gösterecektir.'
              : 'Manyetik sensör bulunamadı; varsayılan Yozgat koordinatı referans alınmıştır.'}
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dialCard: {
    alignItems: 'center',
  },
  dial: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceContainerLowest,
    marginTop: spacing.sm,
  },
  tickBar: {
    position: 'absolute',
    left: DIAL_SIZE / 2 - 1,
    top: 0,
    width: 2,
    height: DIAL_SIZE,
    alignItems: 'center',
  },
  tick: {
    width: 2,
    borderRadius: 1,
  },
  tickMajor: {
    height: 14,
    backgroundColor: colors.outlineVariant,
  },
  tickMinor: {
    height: 8,
    backgroundColor: colors.surfaceContainerHigh,
  },
  cardinal: {
    position: 'absolute',
    ...type.labelSm,
    fontFamily: font.bold,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  cardinalNorth: {
    top: 20,
    alignSelf: 'center',
    color: colors.primary,
  },
  cardinalEast: {
    right: 20,
    top: DIAL_SIZE / 2 - 7,
  },
  cardinalSouth: {
    bottom: 20,
    alignSelf: 'center',
  },
  cardinalWest: {
    left: 20,
    top: DIAL_SIZE / 2 - 7,
  },
  needle: {
    position: 'absolute',
    left: DIAL_SIZE / 2 - 2,
    top: 10,
    width: 4,
    height: DIAL_SIZE - 20,
    borderRadius: 2,
  },
  needleNorth: {
    flex: 1,
    backgroundColor: colors.primaryContainer,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  needleSouth: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  needlePin: {
    position: 'absolute',
    left: DIAL_SIZE / 2 - 7,
    top: DIAL_SIZE / 2 - 7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: colors.surfaceContainerHigh,
  },
  qiblaBadge: {
    marginTop: spacing.md,
    backgroundColor: colors.primaryFixed,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  qiblaBadgeAligned: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  qiblaBadgeText: {
    ...type.labelSm,
    color: colors.primary,
  },
  qiblaBadgeTextAligned: {
    color: '#2E7D32',
    fontFamily: font.bold,
    fontWeight: '700',
  },
  needleAligned: {
    backgroundColor: '#4CAF50',
  },
  headingIndicator: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
    fontFamily: font.medium,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  noteText: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
    minWidth: '100%',
    lineHeight: 18,
  },
});
