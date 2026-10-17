import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, type } from '../theme';
import { Screen, ScreenHeader, Card, SectionHeader, LeaderRow, TrendPill, StatusPill, IconBadge } from '../components/ui';
import { fetchWithFallback } from '../api';

interface MarketRow {
  label: string;
  value: string;
  trend: string;
  percent: string;
}

const MOCK_MARKETS: MarketRow[] = [
  { label: 'USD/TRY', value: '49.33 ₺', trend: '+', percent: '%0.13' },
  { label: 'EUR/TRY', value: '55.08 ₺', trend: '-', percent: '%0.21' },
  { label: 'Gram Altın', value: '6.652 ₺', trend: '-', percent: '%0.51' },
  { label: 'Çeyrek Altın', value: '10.843 ₺', trend: '-', percent: '%0.51' },
  { label: 'GBP/TRY', value: '65.14 ₺', trend: '-', percent: '%0.13' },
  { label: 'Bitcoin (BTC)', value: '$82,388', trend: '-', percent: '%1.54' },
];

export default function FinanceScreen() {
  const [markets, setMarkets] = useState<MarketRow[]>(MOCK_MARKETS);
  const [live, setLive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string>('—');

  useEffect(() => {
    fetchWithFallback<{ markets: MarketRow[] }>('/api/home/summary', { markets: MOCK_MARKETS }).then((result) => {
      if (result.data?.markets?.length) {
        setMarkets(result.data.markets);
      }
      setLive(result.live);
      setUpdatedAt(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    });
  }, []);

  const hero = markets[0] ?? MOCK_MARKETS[0];

  return (
    <Screen>
      <ScreenHeader title="Canlı Piyasalar" caption="Dolar, Euro, Altın ve Borsa takibi" right={<StatusPill live={live} />} />

      <Card>
        <View style={styles.heroTop}>
          <IconBadge icon="cash-outline" />
          <View>
            <Text style={styles.heroLabel}>DOLAR / TÜRK LİRASI</Text>
            <Text style={styles.heroCaption}>Anlık alış kuru</Text>
          </View>
        </View>
        <View style={styles.heroBody}>
          <Text style={styles.heroValue}>{hero.value}</Text>
          <TrendPill trend={hero.trend} percent={hero.percent} />
        </View>
        <Text style={styles.heroUpdate}>Son güncelleme · {updatedAt}</Text>
      </Card>

      <Card>
        <SectionHeader title="Piyasa Özeti" caption="Döviz ve değerli metaller" />
        {markets.map((market) => (
          <LeaderRow
            key={market.label}
            label={market.label}
            value={market.value}
            trailing={<TrendPill trend={market.trend} percent={market.percent} />}
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroLabel: {
    ...type.labelSm,
    color: colors.onSurfaceVariant,
  },
  heroCaption: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  heroValue: {
    ...type.metric,
    color: colors.onSurface,
  },
  heroUpdate: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  noteText: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
  },
});
