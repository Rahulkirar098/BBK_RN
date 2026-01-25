import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from '../screen/main/Dashboard';

const Tab = createBottomTabNavigator();



export const BottomNavigation = () => {
  return (
    <SafeAreaProvider>
        <Tab.Navigator>
            <Tab.Screen name="dashboard" component={Dashboard} />
        </Tab.Navigator>
    </SafeAreaProvider>
  
)
}
