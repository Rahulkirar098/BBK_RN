import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Calendar,
  ArrowRight,
  MapPin,
  CalendarPlus,
  Navigation,
  Clock3,
  RotateCcw,
  Star,
} from 'lucide-react-native';

import {
  colors,
  typography,
  horizontalScale,
  verticalScale,
} from '../../../../theme';

interface Props {
  bookings: any[];
  type?: 'upcoming' | 'past';
}

export const BookingHistory = ({
  bookings,
  type = 'upcoming',
}: Props) => {
  const isUpcoming = type === 'upcoming';

  return (
    <View>
      {/* HEADER */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {isUpcoming
            ? 'UPCOMING BOOKINGS'
            : 'PREVIOUS BOOKINGS'}
        </Text>
      </View>

      {/* EMPTY */}
      {bookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconBox}>
            <Calendar size={28} color={colors.gray400} />
          </View>

          <Text style={styles.emptyTitle}>
            {isUpcoming
              ? 'No upcoming trips'
              : 'No previous bookings'}
          </Text>

          <Text style={styles.emptySubtitle}>
            {isUpcoming
              ? "You don't have any scheduled sessions."
              : 'Completed bookings will appear here.'}
          </Text>

          {isUpcoming && (
            <TouchableOpacity style={styles.exploreButton}>
              <Text style={styles.exploreText}>
                Explore Sessions
              </Text>
              <ArrowRight
                size={16}
                color={colors.white}
              />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={{ gap: verticalScale(16) }}>
          {bookings.map((session, index) => {
            const date = new Date(session.timeStart);

            return (
              <View
                key={`${session.id}-${index}`}
                style={styles.sessionCard}
              >
                {/* TOP */}
                <View style={styles.topRow}>
                  <View style={styles.sessionLeft}>
                    <Image
                      source={{
                        uri: session.image,
                      }}
                      style={styles.sessionImage}
                    />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.sessionTitle}>
                        {session.title}
                      </Text>

                      <Text style={styles.operatorName}>
                        {session.operatorName}
                      </Text>

                      <View style={styles.dateRow}>
                        <View style={styles.dateBadge}>
                          <Text
                            style={
                              styles.dateBadgeText
                            }
                          >
                            {date.toLocaleDateString(
                              [],
                              {
                                weekday: 'short',
                                day: 'numeric',
                              }
                            )}
                          </Text>
                        </View>

                        <Text style={styles.timeText}>
                          {date.toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          isUpcoming
                            ? '#DCFCE7'
                            : '#E5E7EB',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: isUpcoming
                            ? '#16A34A'
                            : '#374151',
                        },
                      ]}
                    >
                      {isUpcoming
                        ? 'CONFIRMED'
                        : 'COMPLETED'}
                    </Text>
                  </View>
                </View>

                {/* LOCATION */}
                <View style={styles.locationRow}>
                  <MapPin
                    size={14}
                    color={colors.gray400}
                  />
                  <Text
                    style={styles.locationText}
                    numberOfLines={1}
                  >
                    {session.meetingPoint}
                  </Text>
                </View>

                {/* ACTIONS */}
                {isUpcoming ? (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={
                        styles.secondaryButton
                      }
                    >
                      <CalendarPlus
                        size={14}
                        color={colors.primary}
                      />
                      <Text
                        style={
                          styles.secondaryButtonText
                        }
                      >
                        Calendar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.primaryButton}
                    >
                      <Navigation
                        size={14}
                        color={colors.white}
                      />
                      <Text
                        style={
                          styles.primaryButtonText
                        }
                      >
                        Directions
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={
                        styles.secondaryButton
                      }
                    >
                      <RotateCcw
                        size={14}
                        color={
                          colors.textPrimary
                        }
                      />
                      <Text
                        style={
                          styles.secondaryButtonText
                        }
                      >
                        Rebook
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.primaryButton}
                    >
                      <Star
                        size={14}
                        color={colors.white}
                      />
                      <Text
                        style={
                          styles.primaryButtonText
                        }
                      >
                        Review
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: verticalScale(14),
    marginTop: verticalScale(10),
  },

  sectionTitle: {
    ...typography.boldSmall,
    color: colors.gray400,
    fontSize: 11,
    letterSpacing: 1,
  },

  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: horizontalScale(28),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 40,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    marginBottom: 8,
  },

  emptySubtitle: {
    ...typography.body,
    color: colors.gray400,
    textAlign: 'center',
    marginBottom: 18,
  },

  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },

  exploreText: {
    ...typography.boldSmall,
    color: colors.white,
  },

  sessionCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: horizontalScale(16),
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sessionLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },

  sessionImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },

  sessionTitle: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  operatorName: {
    ...typography.caption,
    color: colors.gray400,
    marginTop: 4,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },

  dateBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  dateBadgeText: {
    ...typography.boldSmall,
    fontSize: 10,
    color: colors.primary,
  },

  timeText: {
    ...typography.boldSmall,
    color: colors.textPrimary,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gray100,
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },

  locationText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },

  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingVertical: 11,
    borderRadius: 12,
  },

  secondaryButtonText: {
    ...typography.boldSmall,
    color: colors.textPrimary,
  },

  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: 12,
  },

  primaryButtonText: {
    ...typography.boldSmall,
    color: colors.white,
  },
});