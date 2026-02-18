import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, verticalScale, typography } from '../../theme';

import { BadgeCheck, Clock } from 'lucide-react-native';

interface StatCardProps {
  icon: React.ReactNode;
  count: number | string;
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  count,
  label,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, style]}>
      {/* Icon */}
      <View style={styles.iconWrapper}>{icon}</View>

      {/* Count */}
      <Text style={styles.count}>{count}</Text>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

export const ProfileCard = ({ operatorData }: any) => {
  const isPending = operatorData.complianceStatus === 'PENDING';
  return (
    <View style={profileStyle.profileCard}>
      {/* HEADER */}
      <View style={profileStyle.profileHeader}>
        <View>
          <Text style={profileStyle.companyName}>
            {operatorData.companyName}
          </Text>
          <Text style={profileStyle.license}>
            Lic: {operatorData.tradeLicense}
          </Text>
        </View>

        {/* STATUS BADGE */}
        <View
          style={[
            profileStyle.statusBadge,
            isPending ? profileStyle.pendingBadge : profileStyle.verifiedBadge,
          ]}
        >
          {isPending ? (
            <Clock size={12} color="#DC2626" />
          ) : (
            <BadgeCheck size={12} color="#16A34A" />
          )}
          <Text
            style={[
              profileStyle.statusText,
              isPending ? profileStyle.pendingText : profileStyle.verifiedText,
            ]}
          >
            {isPending ? 'Pending' : 'Verified'}
          </Text>
        </View>
      </View>

      {/* PAYOUT CARD */}
      <View style={profileStyle.payoutCard}>
        {/* Decorative glow */}
        <View style={profileStyle.glow} />

        <Text style={profileStyle.payoutLabel}>Available Payout</Text>

        <View style={profileStyle.amountRow}>
          <Text style={profileStyle.amount}>
            AED {operatorData.payoutBalance.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={profileStyle.payoutButton}
          activeOpacity={0.85}
        >
          <Text style={profileStyle.payoutButtonText}>Manage Payouts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
  },

  count: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    marginBottom: 4,
  },

  label: {
    ...typography.small,
    color: colors.textSecondary,
  },
});

const profileStyle = StyleSheet.create({
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  companyName: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    marginBottom: 4,
  },

  license: {
    ...typography.caption,
    color: colors.gray400,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },

  pendingBadge: {
    backgroundColor: colors.errorLight,
    borderColor: '#FECACA',
  },

  verifiedBadge: {
    backgroundColor: colors.successLight,
    borderColor: '#BBF7D0',
  },

  statusText: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  pendingText: {
    color: colors.error,
  },

  verifiedText: {
    color: colors.success,
  },

  payoutCard: {
    backgroundColor: colors.gray900,
    borderRadius: 12,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },

  glow: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 128,
    height: 128,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
  },

  payoutLabel: {
    ...typography.caption,
    color: colors.gray400,
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },

  amount: {
    ...typography.screenTitle,
    color: colors.white,
  },

  payoutButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  payoutButtonText: {
    ...typography.boldSmall,
    color: colors.white,
    textAlign: 'center',
  },
});

