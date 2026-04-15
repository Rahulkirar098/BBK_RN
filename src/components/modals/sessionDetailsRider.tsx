import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Sun,
  Cloud,
  Moon,
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
import { Button } from '../atoms';
import { formatDuration, mapDirection } from '../../utils/common_logic';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface SessionDetailsRiderProps {
  visible: boolean;
  session: any;
  onClose: () => void;
  onBook: () => void;
}

export const SessionDetailsRider: React.FC<SessionDetailsRiderProps> = ({
  visible,
  session,
  onClose,
  onBook,
}) => {
  if (!session) return null;

  const progressPercent = (session.bookedSeats / session.totalSeats) * 100;

  const getTimeOfDayInfo = (timeStart: string | Date) => {
    const date = new Date(timeStart);
    const hour = date.getHours();

    if (hour >= 5 && hour < 12)
      return { label: 'Morning', color: colors.orange500, Icon: Sun };
    if (hour >= 12 && hour < 17)
      return { label: 'Afternoon', color: colors.primary, Icon: Clock };
    if (hour >= 17 && hour < 20)
      return { label: 'Evening', color: colors.gray400, Icon: Cloud };
    return { label: 'Night', color: colors.black, Icon: Moon }; // You can import Moon from lucide
  };

  const {
    label: timeLabel,
    color: timeColor,
    Icon: TimeIcon,
  } = getTimeOfDayInfo(session.timeStart);

  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    if (!visible || !session?.id) return;

    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const unsubscribe = firestore()
      .collection('slots')
      .doc(session.id)
      .collection('booking')
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        const alreadyBooked = list.some((r: any) => r.id === uid);

        setIsBooked(alreadyBooked);
      });

    return () => unsubscribe();
  }, [visible, session?.id]);

  const isPast = new Date(session.timeStart).getTime() < Date.now();

  // ✅ Determine booking & direction logic
  const canBook =
    (session.status === 'open' || session.status === 'min_reached') &&
    !isBooked &&
    !isPast; // ❌ Prevent booking if session is past
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
    >
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
                uri: session?.imageUrl,
                priority: FastImage.priority.high,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />

            <View style={[styles.weatherBadge, { backgroundColor: 'white' }]}>
              <TimeIcon size={16} color={timeColor} />
              <Text style={{ ...styles.weatherText, color: timeColor }}>
                {timeLabel}
              </Text>
            </View>
          </View>

          {/* CONTENT */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* TITLE + PRICE */}
            <View style={styles.headerRow}>
              <Text style={styles.title}>{session.title}</Text>

              <Text style={styles.price}>
                {session.currency} {session.pricePerSeat}
              </Text>
            </View>

            {/* Time */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(5),
              }}
            >
              <Clock size={horizontalScale(12)} color={colors.black} />
              <Text style={{ ...typography.small, color: colors.black }}>
                {formatDuration(session.durationMinutes)}
              </Text>
            </View>

            {/* CAPACITY */}
            <View>
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
                <Text style={styles.infoText}>
                  {session?.locationDetails?.name}
                </Text>
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


            {/* Operator */}
            <View>
              <Text style={{ marginVertical: verticalScale(5), ...typography.cardTitle, }}>Operator Details</Text>
              <View style={styles.captainCard}>

                <View style={{ flex: 1, gap: verticalScale(6) }}>
                  <Text style={{ ...typography.small }}>Agency Name: {session?.operator?.agencyName}</Text>
                  <Text style={{ ...typography.small }}>Agency phone number: {session?.operator?.phone_no}</Text>

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
            </View>


            {/* CAPTAIN */}
            <View>
              <Text style={{ marginVertical: verticalScale(5), ...typography.cardTitle, }}>Captain Details</Text>
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
            </View>

            {canBook && (
              <>
                <Text style={styles.footerNote}>
                  No charge until session is confirmed.
                </Text>
                <Button label="Book Seat" onPress={onBook} />
              </>
            )}

            {!canBook && isPast && (
              <Text style={styles.footerNote}>
                ⏰ Session has already started or passed.
              </Text>
            )}

            {/* Show direction ONLY if user already booked */}
            {isBooked && (
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    mapDirection(
                      session?.location.latitude,
                      session?.location.longitude,
                    ),
                  )
                }
              >
                <Text style={styles.link}>📍 Get direction</Text>
              </TouchableOpacity>
            )}
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
    backgroundColor: colors.black,
    padding: horizontalScale(5),
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  weatherText: {
    ...typography.boldSmall,
  },
  content: {
    padding: horizontalScale(20),
    gap: verticalScale(10),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    justifyContent: 'center',
    gap: 12,
  },
  avatar: {
    width: horizontalScale(50),
    height: horizontalScale(50),
    borderRadius: horizontalScale(5),
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

  link: {
    color: colors.primary,
    marginTop: 6,
    fontWeight: '600',
  },
});
