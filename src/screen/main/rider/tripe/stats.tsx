import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wallet, TrendingUp, Clock } from 'lucide-react-native';

import {
  colors,
  typography,
  horizontalScale,
  verticalScale,
} from '../../../../theme';

interface Props {
  bookings: any[];
}

export const StatsCards = ({ bookings }: Props) => {
  return (
    <View style={styles.container}>
      
      {/* TOTAL SAVINGS */}
      <View style={styles.primaryCard}>
        <View style={styles.glow} />

        <View style={styles.row}>
          <Wallet size={16} color={colors.white} />
          <Text style={styles.primaryLabel}>TOTAL SAVINGS</Text>
        </View>

        <Text style={styles.primaryValue}>4.5k</Text>

        <View style={styles.currencyBadge}>
          <Text style={styles.currencyText}>AED</Text>
        </View>
      </View>

      {/* RIDES */}
      <View style={styles.card}>
        <View style={styles.row}>
          <TrendingUp size={16} color={colors.primary} />
          <Text style={styles.label}>RIDES</Text>
        </View>

        <Text style={styles.value}>{12 + bookings.length}</Text>
      </View>

      {/* HOURS */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Clock size={16} color={'#A855F7'} />
          <Text style={styles.label}>HOURS</Text>
        </View>

        <Text style={styles.value}>24</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(16),
  },

  /* ---------- PRIMARY CARD ---------- */

  primaryCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: horizontalScale(24),
    overflow: 'hidden',

    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  glow: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
  },

  primaryLabel: {
    ...typography.caption,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  primaryValue: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.white,
    marginBottom: verticalScale(10),
  },

  currencyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  currencyText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },

  /* ---------- NORMAL CARD ---------- */

  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: horizontalScale(24),
    borderWidth: 1,
    borderColor: colors.gray200,


    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
    marginBottom: verticalScale(10),
  },

  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  value: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});