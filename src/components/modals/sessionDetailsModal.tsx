import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Sun,
  Cloud,
  Wind,
  AlertTriangle,
  X,
  Star,
  Languages,
  Calendar,
} from 'lucide-react-native';
import FastImage from 'react-native-fast-image';

import {
  colors,
  horizontalScale,
  typography,
  verticalScale,
} from '../../theme';

interface SessionDetailCardProps {
  visible: boolean;
  session: any;
  onClose: () => void;
  onBook: () => void;
  onWaitlist: () => void;
}

export const SessionDetailCard: React.FC<SessionDetailCardProps> = ({
  visible,
  session,
  onClose,
  onBook,
  onWaitlist,
}) => {
  if (!session) return null;

  const progressPercent = (session.bookedSeats / session.totalSeats) * 100;

  const isFull = session.bookedSeats >= session.totalSeats;

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'Sunny':
        return <Sun size={16} color={colors.orange500} />;
      case 'Cloudy':
        return <Cloud size={16} color={colors.gray400} />;
      case 'Windy':
        return <Wind size={16} color={colors.primary} />;
      case 'Risky':
        return <AlertTriangle size={16} color={colors.orange500} />;
      default:
        return <Sun size={16} color={colors.orange500} />;
    }
  };

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* CLOSE */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={colors.white} />
          </TouchableOpacity>

          {/* IMAGE HEADER */}
          <View style={styles.imageContainer}>
            <FastImage
              source={{
                uri: session.image,
                priority: FastImage.priority.high,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />

            <View style={styles.weatherBadge}>
              {getWeatherIcon(session.weather)}
              <Text style={styles.weatherText}>{session.weather}</Text>
            </View>
          </View>

          {/* CONTENT */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* TITLE + PRICE */}
            <View style={styles.headerRow}>
              <Text style={styles.title}>{session.title}</Text>

              <Text style={styles.price}>
                {session.currency} {session.pricePerSeat}
              </Text>
            </View>

            {/* CAPACITY */}
            <View style={styles.capacityBox}>
              <Text style={styles.capacityText}>
                {session.bookedSeats}/{session.totalSeats} Seats
              </Text>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
            </View>

            {/* TIME + LOCATION */}
            <View style={styles.infoRow}>
              <View style={styles.infoCard}>
                <MapPin size={16} color={colors.primary} />
                <Text style={styles.infoText}>{session.location}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoCard}>
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.infoText}>
                  {new Date(session.timeStart).toLocaleDateString([], {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <Clock size={16} color={colors.primary} />
                <Text style={styles.infoText}>
                  {new Date(session.timeStart).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            {/* CAPTAIN */}
            <View style={styles.captainCard}>
              <FastImage
                source={{
                  uri: session?.captain?.imageUrl,
                  priority: FastImage.priority.normal,
                }}
                style={styles.avatar}
                resizeMode={FastImage.resizeMode.cover}
              />

              <View style={{ flex: 1, gap: verticalScale(6) }}>
                <Text style={styles.captainName}>{session?.captain?.name}</Text>
                <View style={styles.languageContainer}>
                  <Languages size={16} color={colors.primary} />
                  <Text style={styles.languageText}>
                    {session?.captain?.language}
                  </Text>
                </View>

                {session?.captain?.verified && (
                  <View style={styles.verifiedRow}>
                    <ShieldCheck size={14} color={colors.primary} />
                    <Text style={styles.verifiedText}>Verified Captain</Text>
                  </View>
                )}
              </View>

              {session?.captain?.rating > 0 && (
                <View style={styles.rating}>
                  <Star size={14} color={colors.orange500} />
                  <Text style={styles.ratingText}>
                    {session.captain.rating}
                  </Text>
                </View>
              )}
            </View>

            {/* BUTTON */}
            {isFull ? (
              <TouchableOpacity style={styles.waitlistBtn} onPress={onWaitlist}>
                <Text style={styles.btnText}>Join Waitlist</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.bookBtn} onPress={onBook}>
                <Text style={styles.btnText}>Book Seat</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.footerNote}>
              No charge until session is confirmed.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: horizontalScale(20),
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(20),
    maxHeight: '90%',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: colors.gray900,
    padding: 8,
    borderRadius: 20,
  },
  imageContainer: {
    height: 220,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  weatherBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  weatherText: {
    ...typography.boldSmall,
    color: colors.textPrimary,
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    flex: 1,
  },
  price: {
    ...typography.sectionTitle,
    color: colors.primary,
  },
  capacityBox: {
    marginBottom: 20,
  },
  capacityText: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: verticalScale(10),
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.gray100,
    padding: horizontalScale(12),
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  captainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  avatar: {
    width: horizontalScale(50),
    height: horizontalScale(50),
    borderRadius: horizontalScale(25),
  },
  captainName: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  languageText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    ...typography.small,
    color: colors.primary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...typography.small,
    color: colors.textPrimary,
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  waitlistBtn: {
    backgroundColor: colors.orange500,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnText: {
    ...typography.cardTitle,
    color: colors.white,
  },
  footerNote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
});
