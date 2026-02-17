import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import {
  colors,
  typography,
  horizontalScale,
  verticalScale,
} from '../../theme';

interface StepCardProps {
  badgeStyle: object;
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const StepCard: React.FC<StepCardProps> = ({
  badgeStyle,
  number,
  title,
  description,
  icon,
}) => (
  <View style={styles.card}>
    <View style={[styles.badgeBase, badgeStyle]}>
      <Text style={styles.badgeText}>{number}</Text>
    </View>

    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDescription}>{description}</Text>

    <View style={styles.icon}>{icon}</View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(16),
    marginVertical: verticalScale(5),
    borderWidth: horizontalScale(1),
    borderColor: colors.border,
    padding: horizontalScale(20),
  },

  badgeBase: {
    width: horizontalScale(30),
    height: horizontalScale(30),
    borderRadius: horizontalScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgePrimary: {
    backgroundColor: colors.primary,
  },

  badgeOrange: {
    backgroundColor: colors.orange500,
  },

  badgeBlue: {
    backgroundColor: colors.blue600,
  },

  badgeText: {
    ...typography.cardTitle,
    color: colors.white,
    
  },

  cardTitle: {
    ...typography.cardTitle,
    color: colors.textPrimary,
    marginVertical: verticalScale(12),
  },

  cardDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },

  icon: {
    alignSelf: 'flex-end',
  },
});
