import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, shadow, spacing, type } from '../theme';

type IconName = keyof typeof Ionicons.glyphMap;

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView
      style={styles.screenScroll}
      contentContainerStyle={[styles.screenContent, style]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function ScreenHeader({ title, caption, right }: { title: string; caption?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderText}>
        <Text style={styles.screenHeaderTitle}>{title}</Text>
        {caption ? <Text style={styles.screenHeaderCaption}>{caption}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function IconBadge({ icon, size = 44, tonal = true }: { icon: IconName; size?: number; tonal?: boolean }) {
  return (
    <View
      style={[
        styles.iconBadge,
        { width: size, height: size, borderRadius: size * 0.3 },
        tonal ? styles.iconBadgeTonal : styles.iconBadgeSolid,
      ]}
    >
      <Ionicons name={icon} size={size / 2} color={tonal ? colors.primary : colors.onPrimary} />
    </View>
  );
}

export function ServiceCard({
  icon,
  title,
  subtitle,
  right,
  children,
  style,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  return (
    <Card style={style} onPress={onPress}>
      <View style={styles.serviceCardTop}>
        <IconBadge icon={icon} />
        <View style={styles.serviceCardInfo}>
          <Text style={styles.serviceCardTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.serviceCardSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
      {children}
    </Card>
  );
}

export function QuickActionTile({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickActionTile, pressed && styles.tilePressed]}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.quickActionLabel} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SectionHeader({ title, caption, action }: { title: string; caption?: string; action?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {caption ? <Text style={styles.sectionCaption}>{caption}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function LeaderRow({
  label,
  value,
  trailing,
  emphasized,
  style,
}: {
  label: string;
  value: string;
  trailing?: React.ReactNode;
  emphasized?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.leaderRow, emphasized && styles.leaderRowEmphasized, style]}>
      <Text style={[styles.leaderLabel, emphasized && styles.leaderTextEmphasized]}>{label}</Text>
      <View style={styles.leaderLine} />
      <Text style={[styles.leaderValue, emphasized && styles.leaderTextEmphasized]}>{value}</Text>
      {trailing}
    </View>
  );
}

export function TrendPill({ trend, percent }: { trend: string; percent?: string }) {
  const up = trend.trim().startsWith('+');
  return (
    <View style={[styles.trendPill, up ? styles.trendPillUp : styles.trendPillDown]}>
      <Ionicons
        name={up ? 'trending-up-outline' : 'trending-down-outline'}
        size={12}
        color={up ? colors.primary : colors.onSurfaceVariant}
      />
      <Text style={[styles.trendText, { color: up ? colors.primary : colors.onSurfaceVariant }]}>
        {up ? '+' : '−'}
        {percent ?? ''}
      </Text>
    </View>
  );
}

export function Chip({
  label,
  variant = 'default',
  icon,
  onPress,
  style,
}: {
  label: string;
  variant?: 'default' | 'active' | 'tonal';
  icon?: IconName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const chipStyle =
    variant === 'active' ? styles.chipActive : variant === 'tonal' ? styles.chipTonal : styles.chipDefault;
  const textStyle =
    variant === 'active' ? styles.chipActiveText : variant === 'tonal' ? styles.chipTonalText : styles.chipDefaultText;
  const iconColor =
    variant === 'active' ? colors.onPrimary : variant === 'tonal' ? colors.primary : colors.onSurfaceVariant;
  const content = (
    <View style={[styles.chip, chipStyle, style]}>
      {icon ? <Ionicons name={icon} size={14} color={iconColor} /> : null}
      <Text style={[styles.chipText, textStyle]}>{label}</Text>
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={4}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export function PrimaryButton({
  title,
  icon,
  onPress,
  style,
}: {
  title: string;
  icon?: IconName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, style]}>
      {icon ? <Ionicons name={icon} size={18} color={colors.onPrimary} /> : null}
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  title,
  icon,
  onPress,
  style,
}: {
  title: string;
  icon?: IconName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed, style]}
    >
      {icon ? <Ionicons name={icon} size={18} color={colors.onSurface} /> : null}
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function TonalButton({
  title,
  icon,
  onPress,
  style,
}: {
  title: string;
  icon?: IconName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tonalButton, pressed && styles.tonalPressed, style]}>
      {icon ? <Ionicons name={icon} size={18} color={colors.primary} /> : null}
      <Text style={styles.tonalButtonText}>{title}</Text>
    </Pressable>
  );
}

export function AppInput({ label, style, ...inputProps }: { label?: string; style?: StyleProp<ViewStyle> } & TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={style}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <View style={[styles.inputRing, focused && styles.inputRingFocused]}>
        <View style={[styles.inputBorder, focused && styles.inputBorderFocused]}>
          <TextInput
            style={styles.inputText}
            placeholderTextColor={colors.outlineVariant}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...inputProps}
          />
        </View>
      </View>
    </View>
  );
}

export function AlertBanner({ message }: { message: string }) {
  return (
    <View style={styles.alertBanner}>
      <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
      <Text style={styles.alertText}>{message}</Text>
    </View>
  );
}

export function StatusPill({ live }: { live: boolean }) {
  return null;
}

export function ActionRow({
  icon,
  title,
  caption,
  onPress,
  last,
}: {
  icon: IconName;
  title: string;
  caption?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
      <IconBadge icon={icon} size={36} />
      <View style={styles.actionRowInfo}>
        <Text style={styles.actionRowTitle}>{title}</Text>
        {caption ? <Text style={styles.actionRowCaption}>{caption}</Text> : null}
      </View>
      <Ionicons name="chevron-forward-outline" size={18} color={colors.outlineVariant} />
      {!last ? <View style={[styles.actionRowDivider, last && { opacity: 0 }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenScroll: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  screenContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  screenHeaderText: {
    flex: 1,
  },
  screenHeaderTitle: {
    ...type.headlineLgMobile,
    color: colors.onSurface,
  },
  screenHeaderCaption: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: 20,
    ...shadow.card,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  iconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeTonal: {
    backgroundColor: colors.primaryFixed,
  },
  iconBadgeSolid: {
    backgroundColor: colors.primaryContainer,
  },
  serviceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  serviceCardInfo: {
    flex: 1,
  },
  serviceCardTitle: {
    ...type.headlineSm,
    color: colors.onSurface,
  },
  serviceCardSubtitle: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  quickActionTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadow.card,
  },
  tilePressed: {
    transform: [{ scale: 0.95 }],
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    ...type.labelSm,
    color: colors.onSurface,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    ...type.headlineSm,
    color: colors.onSurface,
  },
  sectionCaption: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  leaderRowEmphasized: {
    backgroundColor: colors.primaryFixed,
    paddingHorizontal: spacing.sm,
  },
  leaderLabel: {
    ...type.bodyMd,
    color: colors.onSurface,
  },
  leaderTextEmphasized: {
    color: colors.primary,
    fontFamily: font.semibold,
    fontWeight: '600',
  },
  leaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceContainerHighest,
    marginHorizontal: 10,
    marginBottom: 6,
  },
  leaderValue: {
    ...type.headlineSm,
    color: colors.onSurface,
    fontVariant: ['tabular-nums'],
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
    marginBottom: 2,
  },
  trendPillUp: {
    backgroundColor: colors.primaryFixed,
  },
  trendPillDown: {
    backgroundColor: colors.surfaceContainer,
  },
  trendText: {
    ...type.bodySm,
    fontFamily: font.semibold,
    fontWeight: '600',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipDefault: {
    backgroundColor: colors.surfaceContainerLowest,
    ...shadow.card,
  },
  chipDefaultText: {
    color: colors.onSurfaceVariant,
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
  },
  chipActiveText: {
    color: colors.onPrimary,
  },
  chipTonal: {
    backgroundColor: colors.primaryFixed,
  },
  chipTonalText: {
    color: colors.primary,
  },
  chipText: {
    ...type.labelMd,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    ...type.labelLg,
    color: colors.onPrimary,
  },
  buttonPressed: {
    backgroundColor: colors.onPrimaryFixedVariant,
    transform: [{ scale: 0.98 }],
  },
  secondaryButton: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    height: 52,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    ...type.labelLg,
    color: colors.onSurface,
  },
  secondaryPressed: {
    backgroundColor: colors.surfaceContainerLow,
    transform: [{ scale: 0.98 }],
  },
  tonalButton: {
    backgroundColor: colors.primaryFixed,
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tonalButtonText: {
    ...type.labelLg,
    color: colors.primary,
  },
  tonalPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  inputLabel: {
    ...type.labelSm,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputRing: {
    borderRadius: 17,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  inputRingFocused: {
    borderColor: colors.focusRing,
  },
  inputBorder: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  inputBorderFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  inputText: {
    ...type.bodyLg,
    color: colors.onSurface,
    paddingVertical: 0,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.errorContainer,
    borderRadius: 14,
    padding: 14,
  },
  alertText: {
    ...type.bodyMd,
    color: colors.onErrorContainer,
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...type.labelSm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  actionRowPressed: {
    opacity: 0.7,
  },
  actionRowInfo: {
    flex: 1,
  },
  actionRowTitle: {
    ...type.bodyLg,
    fontFamily: font.semibold,
    fontWeight: '600',
    color: colors.onSurface,
  },
  actionRowCaption: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  actionRowDivider: {
    position: 'absolute',
    left: 20 + 36 + spacing.md,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: colors.surfaceContainerHighest,
  },
});
