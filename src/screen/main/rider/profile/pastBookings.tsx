import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { colors, typography } from '../../../../theme';

interface Props {
  bookings: any[];
  pastBookings: any[];
  onBrowse: () => void;
}

export const PastBookings = ({ bookings, pastBookings, onBrowse }: Props) => {
  const demoPast = [
    {
      id: 'mock-past',
      title: 'Morning Wake Session',
      image:
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
      timeStart: new Date('2024-02-10'),
    },
  ];

  const combined = bookings.length > 0 ? [...pastBookings, ...demoPast] : [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <RefreshCw size={16} color={colors.gray400} />
        <Text style={styles.headerTitle}>Past</Text>
      </View>

      {/* Content */}
      {combined.length > 0 ? (
        combined.map(session => (
          <View key={session.id} style={styles.card}>
            <View style={styles.leftSection}>
              {/* Grayscale Image */}
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: session.image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>

              {/* Info */}
              <View>
                <Text style={styles.title} numberOfLines={1}>
                  {session.title}
                </Text>
                <Text style={styles.date}>
                  {session.timeStart?.toDate
                    ? session.timeStart.toDate().toLocaleDateString()
                    : new Date(session.timeStart).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Rebook Button */}
            <TouchableOpacity
              style={styles.rebookButton}
              onPress={onBrowse}
              activeOpacity={0.8}
            >
              <Text style={styles.rebookText}>Rebook</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No past trips yet.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 80,
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

  /* Card */

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  imageWrapper: {
    width: 48,
    height: 48,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    opacity: 0.7, // faded like grayscale
  },

  image: {
    width: '100%',
    height: '100%',
  },

  title: {
    ...typography.boldSmall,
    color: colors.gray400, // faded text
  },

  date: {
    ...typography.small,
    color: colors.gray400,
    marginTop: 4,
  },

  /* Rebook Button */

  rebookButton: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  rebookText: {
    ...typography.boldSmall,
    color: colors.gray400,
  },

  /* Empty */

  emptyState: {
    alignItems: 'center',
    paddingVertical: 16,
  },

  emptyText: {
    ...typography.small,
    color: colors.gray400,
  },
});
