import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  CheckCircle2,
  AlertCircle,
  Edit2,
  Copy,
} from 'lucide-react-native';

import { colors, typography } from '../../theme';

interface SessionCardProps {
  title: string;
  time: string;
  durationHours: number;
  bookedSeats: number;
  totalSeats: number;
  pricePerSeat: number;
  confirmed: boolean;
  fillPercent: number;
  onEdit?: () => void;
  onCopy?: () => void;
  onPress?: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  title,
  time,
  durationHours,
  bookedSeats,
  totalSeats,
  pricePerSeat,
  confirmed,
  fillPercent,
  onEdit,
  onCopy,
  onPress
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        {/* HEADER */}
        <TouchableOpacity style={styles.header} onPress={onPress}>
          <View>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.timeBadge}>{time}</Text>
              <Text style={styles.duration}>
                {durationHours} Hours
              </Text>
            </View>
          </View>

          <View style={styles.statusWrapper}>
            <View
              style={[
                styles.statusBadge,
                confirmed
                  ? styles.confirmedContainer
                  : styles.fillingContainer,
              ]}
            >
              {confirmed ? (
                <CheckCircle2
                  size={12}
                  color={colors.primary}
                />
              ) : (
                <AlertCircle
                  size={12}
                  color={colors.orange500}
                />
              )}

              <Text
                style={[
                  styles.statusText,
                  confirmed
                    ? styles.confirmedText
                    : styles.fillingText,
                ]}
              >
                {confirmed ? 'Confirmed' : 'Filling...'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* STATS */}
        <View style={styles.statsRow}>
          <Text style={styles.seatsText}>
            {bookedSeats} / {totalSeats} Seats
          </Text>

          <Text style={styles.revenueText}>
            Revenue: AED {bookedSeats * pricePerSeat}
          </Text>
        </View>

        {/* PROGRESS */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${fillPercent}%`,
                backgroundColor: confirmed
                  ? colors.primary
                  : colors.orange500,
              },
            ]}
          />
        </View>
      </View>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onEdit}
          activeOpacity={0.8}
          style={styles.actionBtn}
        >
          <Edit2 size={18} color={colors.gray500} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCopy}
          activeOpacity={0.8}
          style={styles.actionBtn}
        >
          <Copy size={18} color={colors.gray500} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 12,
  },

  content: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  title: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  timeBadge: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    ...typography.boldSmall,
    color: colors.textPrimary,
    marginRight: 12,
  },

  duration: {
    ...typography.small,
    color: colors.textSecondary,
  },

  statusWrapper: {
    alignItems: 'flex-end',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  confirmedContainer: {
    backgroundColor: colors.primaryLight,
  },

  fillingContainer: {
    backgroundColor: colors.blue100,
  },

  statusText: {
    ...typography.caption,
    textTransform: 'uppercase',
    marginLeft: 6,
  },

  confirmedText: {
    color: colors.primary,
  },

  fillingText: {
    color: colors.orange500,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  seatsText: {
    ...typography.small,
    color: colors.gray400,
  },

  revenueText: {
    ...typography.boldSmall,
    color: colors.textPrimary,
  },

  progressBar: {
    height: 8,
    backgroundColor: colors.gray100,
    borderRadius: 999,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
  },

  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },

  actionBtn: {
    flex: 1,
    backgroundColor: colors.gray100,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
});
