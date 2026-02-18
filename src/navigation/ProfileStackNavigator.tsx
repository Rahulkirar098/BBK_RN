import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from '../screen/main/Profile';
import { Setting } from '../screen/main/rider/setting';

const NavigateStack = createNativeStackNavigator();

export const ProfileStackNavigator = () => {
  return (
    <NavigateStack.Navigator
      initialRouteName="profile_home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <NavigateStack.Screen name="profile_home" component={Profile} />
      <NavigateStack.Screen name="setting" component={Setting} />
    </NavigateStack.Navigator>
  );
};
