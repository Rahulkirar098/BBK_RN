import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CreditCard, X } from 'lucide-react-native';
import {
  colors,
  typography,
  horizontalScale,
  verticalScale,
} from '../../../../theme';

interface Props {
  onAdd?: () => void;
  onRemove?: () => void;
}

export const PaymentMethodsSection = ({ onAdd, onRemove }: Props) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CreditCard size={16} color={colors.primary} />
          <Text style={styles.headerTitle}>{'Payment Methods'}</Text>
        </View>

        <TouchableOpacity onPress={onAdd}>
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.paymentItem}>
          <View style={styles.paymentLeft}>
            {/* Card Brand */}
            <View style={styles.cardBrand}>
              <Text style={styles.cardBrandText}>VISA</Text>
            </View>

            {/* Masked Number */}
            <Text style={styles.cardNumber}>•••• 4242</Text>
          </View>

          {/* Remove Button */}
          <TouchableOpacity onPress={onRemove}>
            <X size={16} color={colors.gray400} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray200,
    overflow: 'hidden',
  },

  header: {
    padding: horizontalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },

  headerTitle: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  addText: {
    ...typography.boldSmall,
    color: colors.primary,
  },

  body: {
    padding: horizontalScale(16),
    backgroundColor: colors.gray100,
  },

  paymentItem: {
    backgroundColor: colors.white,
    padding: horizontalScale(12),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.gray200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(12),
  },

  cardBrand: {
    width: 40,
    height: 24,
    backgroundColor: '#1F2937', // dark gray like Tailwind gray-800
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardBrandText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },

  cardNumber: {
    ...typography.body,
    color: colors.gray400,
    fontWeight: '500',
  },
});
