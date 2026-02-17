import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import {
  colors,
  typography,
  horizontalScale,
  verticalScale,
} from '../../theme';

interface BenefitProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

export const BenefitItem: React.FC<BenefitProps> = ({ icon, title, text }) => (
  <View style={styles.benefitCard}>
    {icon}
    <Text style={styles.benefitTitle}>{title}</Text>
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  benefitsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  benefitCard: {
    width: '48%',
    backgroundColor: colors.white,
    padding: horizontalScale(16),
    borderRadius: horizontalScale(14),
    marginBottom: verticalScale(14),
    borderWidth: 1,
    borderColor: colors.border,
  },

  benefitTitle: {
    ...typography.cardTitle,
    marginVertical: verticalScale(6),
    color: colors.textPrimary,
  },

  benefitText: {
    ...typography.small,
    color: colors.textSecondary,
  },
});
