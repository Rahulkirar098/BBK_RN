import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, horizontalScale, verticalScale } from '../../../../theme';

export const TripsHeader = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Trips</Text>
      <Text style={styles.subtitle}>
        Upcoming adventures & stats
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(8),
  },

  title: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});