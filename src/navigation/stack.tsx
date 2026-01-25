import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authNavigation } from './routes';
import { BottomNavigation } from './bottom';

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

            <NavigateStack.Screen
                name="bottom_tab"
                component={BottomNavigation} />
        </NavigateStack.Navigator>
    );
};
