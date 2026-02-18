import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, horizontalScale } from '../../../../theme';

const Header = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>You</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  title: {
    ...typography.screenTitle, // 👈 using your design system
    color: colors.textPrimary, // 👈 theme color
  },
});
