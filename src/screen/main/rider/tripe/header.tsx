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
    gap: verticalScale(2),
    marginBottom: verticalScale(10)
  },

  title: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});