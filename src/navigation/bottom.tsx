import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Dashboard from '../screen/main/Dashboard';
import { colors, horizontalScale, verticalScale } from '../theme';

import {
  Ticket,
  User,
  LayoutDashboard,
} from 'lucide-react-native';
import Profile from '../screen/main/Profile';

const Tab = createBottomTabNavigator();

/* ---------------- ICON RESOLVER ---------------- */
const getTabIcon = (routeName: string) => {
  switch (routeName) {
    case 'dashboard':
      return LayoutDashboard;
    case 'trips':
      return Ticket;
    case 'profile':
      return User;
    default:
      return LayoutDashboard;
  }
};

const renderTabIcon = (routeName: string, focused: boolean) => {
  const Icon = getTabIcon(routeName);

  return (
    <View style={styles.tabItem}>
      <Icon
        size={24}
        color={focused ? colors.primary : colors.black}
      />
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? colors.primary : colors.black },
        ]}
      >
        {routeName}
      </Text>
    </View>
  );
};

/* ---------------- BOTTOM NAV ---------------- */
export const BottomNavigation = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('bbs_user');
        setRole(JSON.parse(storedRole || '{}').role); // e.g. "rider" | "owner"
      } catch (e) {
        console.log('Error reading role', e);
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, []);

  if (loading) return null;

  return (
    <SafeAreaProvider>
      <Tab.Navigator
        initialRouteName="dashboard"
        screenOptions={({ route }) => ({
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ focused }) =>
            renderTabIcon(route.name, focused),
        })}
      >
        {/* Dashboard - always visible */}
        <Tab.Screen
          name="dashboard"
          component={Dashboard}
          options={{ headerShown: false }}
        />

        {/* Trips - ONLY for rider */}
        {role === 'RIDER' && (
          <Tab.Screen
            name="trips"
            component={Dashboard}
            options={{ headerShown: false }}
          />
        )}

        {/* Profile - always visible */}
        <Tab.Screen
          name="profile"
          component={Profile}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </SafeAreaProvider>
  );
};

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  tabBar: {
    width: '100%',
    height: verticalScale(70),
    borderRadius: horizontalScale(60),
    paddingTop: verticalScale(20),
    position: 'absolute',
  },
  tabItem: {
    width: horizontalScale(70),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: horizontalScale(12),
    marginTop: verticalScale(5),
    textTransform: 'capitalize',
  },
});
