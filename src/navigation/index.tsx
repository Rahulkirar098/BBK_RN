import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StackNavigation } from './stack';

export const Navigation = () => {
  return (
    <NavigationContainer>
      <StackNavigation />
    </NavigationContainer>
  );
};
