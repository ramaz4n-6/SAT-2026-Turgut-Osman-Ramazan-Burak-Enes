import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { colors, font, radius, spacing, type } from '../theme';
import AuthModal from './AuthModal';

export default function AppHeader(_props: BottomTabHeaderProps) {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.headerLeft}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>66</Text>
        </View>
        <View>
          <Text style={styles.appEyebrow}>BOZOK DÜNYASI</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={colors.primary} />
            <Text style={styles.locationText}>Yozgat, Merkez</Text>
            <Ionicons name="chevron-down-outline" size={12} color={colors.onSurfaceVariant} />
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.loginBtn, pressed && styles.loginBtnPressed]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Giriş Yap"
      >
        <Ionicons name={userName ? 'person-outline' : 'log-in-outline'} size={15} color={colors.primary} />
        <Text style={styles.loginBtnText} numberOfLines={1}>
          {userName ? `Merhaba, ${userName}` : 'Giriş Yap'}
        </Text>
      </Pressable>

      <AuthModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLoginSuccess={(user) => setUserName(user.name)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.onPrimary,
    fontFamily: font.bold,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.4,
  },
  appEyebrow: {
    ...type.labelSm,
    color: colors.onSurfaceVariant,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    ...type.labelMd,
    color: colors.onSurface,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFixed,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 5,
    maxWidth: 160,
  },
  loginBtnPressed: {
    opacity: 0.8,
  },
  loginBtnText: {
    ...type.labelMd,
    color: colors.primary,
  },
});
