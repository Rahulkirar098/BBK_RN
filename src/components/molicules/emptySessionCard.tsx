import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  Calendar,
  ArrowRight,
} from 'lucide-react-native';

import {
  colors,
  horizontalScale,
  typography,
  verticalScale,
} from '../../theme';

interface Props {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onPress?: () => void;
}

export const EmptySessionCard: React.FC<Props> = ({
  title = 'No Sessions Available',
  subtitle = 'There are currently no active sessions available for booking. Please check back later for upcoming trips and new experiences.',
  buttonText = 'Refresh Sessions',
  onPress,
}) => {
  return (
    <View style={styles.emptyCard}>
      {/* ICON */}
      <View style={styles.emptyIconBox}>
        <Calendar
          size={32}
          color={colors.primary}
        />
      </View>

      {/* TITLE */}
      <Text style={styles.emptyTitle}>
        {title}
      </Text>

      {/* SUBTITLE */}
      <Text style={styles.emptySubtitle}>
        {subtitle}
      </Text>

      {/* BUTTON */}
      {onPress && (
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.exploreText}>
            {buttonText}
          </Text>

          <ArrowRight
            size={16}
            color={colors.white}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: colors.white,

    borderRadius: horizontalScale(24),

    paddingVertical: verticalScale(40),
    paddingHorizontal: horizontalScale(24),

    alignItems: 'center',

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation: 5,
  },

  emptyIconBox: {
    width: horizontalScale(72),
    height: horizontalScale(72),

    borderRadius: horizontalScale(36),

    backgroundColor: colors.primary + '15',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: verticalScale(18),
  },

  emptyTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,

    marginBottom: verticalScale(10),

    textAlign: 'center',
  },

  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,

    textAlign: 'center',

    lineHeight: verticalScale(24),

    marginBottom: verticalScale(28),
  },

  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: horizontalScale(8),

    backgroundColor: colors.primary,

    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(22),

    borderRadius: horizontalScale(14),
  },

  exploreText: {
    ...typography.cardTitle,
    color: colors.white,
  },
});