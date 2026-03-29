import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authNavigation } from './routes';
import { BottomNavigation } from './bottom';
import { SessionMapScreen } from '../screen/main/rider/map';

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
                name="map"
                component={SessionMapScreen} />

            <NavigateStack.Screen
                name="bottom_tab"
                component={BottomNavigation} />
        </NavigateStack.Navigator>
    );
};
