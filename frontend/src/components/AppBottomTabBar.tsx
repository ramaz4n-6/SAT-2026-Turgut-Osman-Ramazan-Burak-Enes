import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, shadow, spacing } from '../theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface TabConfig {
  activeIcon: IconName;
  inactiveIcon: IconName;
  label: string;
}

const TAB_CONFIG: Record<string, TabConfig> = {
  'Ana Ekran': {
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
    label: 'Ana Ekran',
  },
  Finans: {
    activeIcon: 'wallet',
    inactiveIcon: 'wallet-outline',
    label: 'Finans',
  },
  Vakitler: {
    activeIcon: 'calendar',
    inactiveIcon: 'calendar-outline',
    label: 'Vakit & Takvim',
  },
  Keşfet: {
    activeIcon: 'map',
    inactiveIcon: 'map-outline',
    label: 'Keşfet',
  },
  Pusula: {
    activeIcon: 'compass',
    inactiveIcon: 'compass-outline',
    label: 'Pusula',
  },
  Sağlık: {
    activeIcon: 'medkit',
    inactiveIcon: 'medkit-outline',
    label: 'Sağlık',
  },
};

export default function AppBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bottomTabBar,
        {
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name] || {
          activeIcon: 'ellipse',
          inactiveIcon: 'ellipse-outline',
          label: route.name,
        };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const iconName = isFocused ? config.activeIcon : config.inactiveIcon;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel || config.label}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.navItem}
          >
            {isFocused ? (
              <View style={styles.activeBubble}>
                <Ionicons name={iconName} size={24} color={colors.onPrimary} />
              </View>
            ) : (
              <View style={styles.inactiveIconWrap}>
                <Ionicons name={iconName} size={22} color={colors.onSurfaceVariant} />
              </View>
            )}
            <Text style={[styles.navText, isFocused && styles.navTextActive]} numberOfLines={1}>
              {config.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomTabBar: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
    paddingTop: spacing.sm,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    ...shadow.tabBubble,
  },
  inactiveIconWrap: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: font.medium,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    marginTop: 3,
  },
  navTextActive: {
    color: colors.onSurface,
    fontFamily: font.semibold,
    fontWeight: '600',
  },
});
