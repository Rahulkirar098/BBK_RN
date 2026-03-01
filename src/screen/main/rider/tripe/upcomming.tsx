import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {
  Calendar,
  ArrowRight,
  MapPin,
  CalendarPlus,
  Navigation,
} from 'lucide-react-native';
import {
  colors,
  typography,
  horizontalScale,
  verticalScale,
} from '../../../../theme';

interface Props {
  bookings: any[];
//   onBrowse: () => void;
//   handleAddToCalendar: (session: any) => void;
}

export const UpcomingSessions = ({
  bookings,
//   onBrowse,
//   handleAddToCalendar,
}: Props) => {
  return (
    <View>
      {/* SECTION HEADER */}
      <View style={styles.sectionHeader}>
        <Calendar size={14} color={colors.gray400} />
        <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
      </View>

      {/* CONTENT */}
      {bookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconBox}>
            <Calendar size={28} color={colors.gray400} />
          </View>

          <Text style={styles.emptyTitle}>No upcoming trips</Text>

          <Text style={styles.emptySubtitle}>
            You haven't booked any sessions yet. Check out what's happening!
          </Text>

          <TouchableOpacity onPress={()=>{}} style={styles.exploreButton}>
            <Text style={styles.exploreText}>Explore Sessions</Text>
            <ArrowRight size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: verticalScale(16) }}>
          {bookings.map((session, index) => {
            const date = new Date(session.timeStart);

            return (
              <View key={`${session.id}-${index}`} style={styles.sessionCard}>
                {/* TOP ROW */}
                <View style={styles.topRow}>
                  <View style={styles.sessionLeft}>
                    <Image
                      source={{ uri: session.image }}
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
                          <Text style={styles.dateBadgeText}>
                            {date.toLocaleDateString([], {
                              weekday: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        </View>

                        <Text style={styles.timeText}>
                          {date.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Confirmed</Text>
                  </View>
                </View>

                {/* LOCATION */}
                <View style={styles.locationRow}>
                  <MapPin size={14} color={colors.gray400} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {session.meetingPoint}
                  </Text>
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    // onPress={() => handleAddToCalendar(session)}
                  >
                    <CalendarPlus size={14} color={colors.primary} />
                    <Text style={styles.secondaryButtonText}>
                      Add to Calendar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.primaryButton}>
                    <Navigation size={14} color={colors.white} />
                    <Text style={styles.primaryButtonText}>
                      Directions
                    </Text>
                  </TouchableOpacity>
                </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
    marginBottom: verticalScale(16),
    marginLeft: horizontalScale(8),
  },

  sectionTitle: {
    ...typography.boldSmall,
    fontSize: 11,
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* EMPTY STATE */

  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: horizontalScale(32),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
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
    marginBottom: verticalScale(20),
  },

  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(20),
    borderRadius: 14,
  },

  exploreText: {
    ...typography.boldSmall,
    color: colors.white,
  },

  /* SESSION CARD */

  sessionCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: horizontalScale(16),
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },

  sessionLeft: {
    flexDirection: 'row',
    gap: horizontalScale(12),
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
    textTransform: 'uppercase',
  },

  timeText: {
    ...typography.boldSmall,
    color: colors.textPrimary,
  },

  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    textTransform: 'uppercase',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gray100,
    padding: 8,
    borderRadius: 10,
    marginBottom: verticalScale(12),
  },

  locationText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: horizontalScale(12),
  },

  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingVertical: verticalScale(10),
    borderRadius: 12,
  },

  secondaryButtonText: {
    ...typography.boldSmall,
    color: colors.textPrimary,
  },

  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(10),
    borderRadius: 12,
  },

  primaryButtonText: {
    ...typography.boldSmall,
    color: colors.white,
  },
});