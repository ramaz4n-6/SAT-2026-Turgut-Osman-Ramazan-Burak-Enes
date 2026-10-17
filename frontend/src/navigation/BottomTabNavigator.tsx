import React from 'react';
import { createBottomTabNavigator, BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import FinanceScreen from '../screens/FinanceScreen';
import PrayerCalendarScreen from '../screens/PrayerCalendarScreen';
import ExploreScreen from '../screens/ExploreScreen';
import CompassScreen from '../screens/CompassScreen';
import HealthScreen from '../screens/HealthScreen';
import AppHeader from '../components/AppHeader';
import AppBottomTabBar from '../components/AppBottomTabBar';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AppBottomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        header: (props: BottomTabHeaderProps) => <AppHeader {...props} />,
      }}
    >
      <Tab.Screen name="Ana Ekran" component={HomeScreen} />
      <Tab.Screen name="Finans" component={FinanceScreen} />
      <Tab.Screen name="Vakitler" component={PrayerCalendarScreen} />
      <Tab.Screen name="Keşfet" component={ExploreScreen} />
      <Tab.Screen name="Pusula" component={CompassScreen} />
      <Tab.Screen name="Sağlık" component={HealthScreen} />
    </Tab.Navigator>
  );
}
