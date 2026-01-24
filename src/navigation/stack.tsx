import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authNavigation } from './routes';

const NavigateStack = createNativeStackNavigator();
export const StackNavigation = () => {
    return (
        <NavigateStack.Navigator
            initialRouteName={'splash'}
            screenOptions={{
                headerShown: false,
            }}
        >
            {authNavigation.map((route) => (
                <NavigateStack.Screen
                    key={route.name}
                    name={route.name}
                    component={route.component} />
            ))}
        </NavigateStack.Navigator>
    );
};
