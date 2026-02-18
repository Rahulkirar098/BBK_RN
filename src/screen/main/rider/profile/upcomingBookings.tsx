import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { colors, typography } from '../../../../theme';

interface Props {
  upcomingBookings: any[];
  onBrowse: () => void;
}

export const UpcomingBookings = ({ upcomingBookings, onBrowse }: Props) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Calendar size={16} color={colors.primary} />
        <Text style={styles.headerTitle}>Upcoming</Text>
      </View>

      {/* Content */}
      {upcomingBookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No upcoming trips planned.</Text>

          <TouchableOpacity onPress={onBrowse}>
            <Text style={styles.browseText}>Browse Sessions</Text>
          </TouchableOpacity>
        </View>
      ) : (
        upcomingBookings.map(session => (
          <View key={session.id} style={styles.bookingCard}>
            {/* Image */}
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: session?.image }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            {/* Info */}
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingTitle} numberOfLines={1}>
                {session?.title}
              </Text>
              <Text style={styles.bookingDate}>
                {session?.timeStart?.toDate
                  ? session.timeStart.toDate().toLocaleDateString()
                  : new Date(session.timeStart).toLocaleDateString()}
              </Text>
            </View>

            {/* Status Badge */}
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  headerTitle: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  /* Empty State */

  emptyCard: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.gray200,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },

  emptyText: {
    ...typography.small,
    color: colors.gray400,
    marginBottom: 12,
  },

  browseText: {
    ...typography.boldSmall,
    color: colors.primary,
  },

  /* Booking Card */

  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  imageWrapper: {
    width: 48,
    height: 48,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },

  bookingTitle: {
    ...typography.boldSmall,
    color: colors.textPrimary,
  },

  bookingDate: {
    ...typography.small,
    color: colors.gray400,
    marginTop: 4,
  },

  activeBadge: {
    backgroundColor: '#ECFDF5', // light green
    borderWidth: 1,
    borderColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  activeText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#10B981', // success green
  },
});
