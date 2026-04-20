import React, { useEffect, useState } from 'react'
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, horizontalScale, typography, verticalScale } from '../../../../theme';

import { useNavigation, useRoute } from '@react-navigation/native';

import firestore from '@react-native-firebase/firestore';

import {
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Languages,
  Calendar,
} from 'lucide-react-native';

import FastImage from 'react-native-fast-image';

import { formatDuration, mapDirection, getTimeOfDayInfo, formatDate } from '../../../../utils/common_logic';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../../../components/atoms';
import { WaiverModal } from '../../../../components/modals';

export const SessionBooking = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { session, uid } = route.params;

  const { label, color, Icon } = getTimeOfDayInfo(session.timeStart);

  const progressPercent = (session.bookedSeats / session.totalSeats) * 100;

  // ---------- STATE ----------
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBooked, setIsBooked] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);

  const [signature, setSignature] = useState('');
  const [hasScrolled, setHasScrolled] = useState(false);

  const [checks, setChecks] = useState({
    risks: false,
    medical: false,
    liability: false,
    photos: false,
  });

  // ---------- FETCH SESSION ----------
  useEffect(() => {
    if (!session?.id) return;

    const unsubscribe = firestore()
      .collection('slots')
      .doc(session.id)
      .onSnapshot((doc: any) => {
        if (doc.exists) {
          setSessionData({
            id: doc.id,
            ...doc.data(),
          });
        }
        setLoading(false);
      },
        error => {
          console.log('Error fetching session:', error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [session?.id]);

  // ---------- BOOKING LISTENER ----------
  useEffect(() => {
    if (!sessionData?.id) return;

    const unsubscribe = firestore()
      .collection('slots')
      .doc(sessionData.id)
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
  }, [sessionData?.id]);

  // ---------- LOADING UI ----------
  if (loading || !sessionData) {
    return (
      <SafeAreaView style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text>Loading session...</Text>
      </SafeAreaView>
    );
  }

  const isPast = new Date(sessionData?.timeStart).getTime() < Date.now();

  // ✅ Determine booking & direction logic
  const canBook =
    (sessionData?.status === 'open' || sessionData?.status === 'min_reached') &&
    !isBooked &&
    !isPast;

  const isEnded = session?.activityStatus === 'ended';

  // Book session logic
  const handleBookSession = async () => {
    if (sessionData) {
      const storedUser = await AsyncStorage.getItem('bbs_user');
      if (!storedUser) throw new Error('User not logged in');

      const user = JSON.parse(storedUser);
      let isUser = sessionData?.ridersProfile?.filter(
        (item: any) => item?.uid == user?.uid,
      );

      if (isUser?.length) {
        Alert.alert('You have already booked this session');
        return;
      } else {
        setShowWaiverModal(true);
      }
    }
  };

  // Waiver logic
  const handleWaiverClear = () => {
    setSignature('');
    setHasScrolled(false);
    setChecks({
      risks: false,
      medical: false,
      liability: false,
      photos: false,
    });
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: colors.background
    }}>

      {/* IMAGE HEADER */}
      <View style={styles.imageContainer}>
        <FastImage
          source={{
            uri: sessionData?.imageUrl,
            priority: FastImage.priority.high,
          }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />

        <View style={[styles.weatherBadge, { backgroundColor: 'white' }]}>
          <Icon size={16} color={color} />
          <Text style={{ ...styles.weatherText, color: color }}>
            {label}
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
          <Text style={styles.title}>{sessionData?.title}</Text>

          <Text style={styles.price}>
            {sessionData?.currency} {sessionData?.pricePerSeat}
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
            {formatDuration(sessionData?.durationMinutes)}
          </Text>
        </View>

        {/* CAPACITY */}
        <View>
          <Text style={styles.capacityText}>
            {sessionData?.bookedSeats}/{sessionData?.totalSeats} Seats
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

          <View style={{ flexDirection: "row", gap: horizontalScale(5) }}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.infoText}>
              {sessionData?.locationDetails?.name}
            </Text>
          </View>


        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Calendar size={16} color={colors.primary} />
            <Text style={styles.infoText}>
              {formatDate(sessionData?.timeStart, "date")}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Clock size={16} color={colors.primary} />
            <Text style={styles.infoText}>
              {formatDate(sessionData?.timeStart, "time")}
            </Text>
          </View>
        </View>

        {isEnded && <TouchableOpacity style={styles.infoCard}
          onPress={() => {
            navigation.navigate("rating")
          }}
        >
          <Text style={styles.infoText}>⭐ How was the session</Text>
        </TouchableOpacity>}


        {/* Operator */}
        <View>
          <Text style={{ marginVertical: verticalScale(5), ...typography.cardTitle, }}>Operator Details</Text>
          <View style={styles.captainCard}>

            <View style={{ flex: 1, gap: verticalScale(6) }}>
              <Text style={{ ...typography.small }}>Agency Name: {sessionData?.operator?.agencyName}</Text>
              <Text style={{ ...typography.small }}>Agency phone number: {sessionData?.operator?.phone_no}</Text>

              {sessionData?.captain?.verified && (
                <View style={styles.verifiedRow}>
                  <ShieldCheck size={14} color={colors.primary} />
                  <Text style={styles.verifiedText}>Verified Captain</Text>
                </View>
              )}
            </View>

            {sessionData?.captain?.rating > 0 && (
              <View style={styles.rating}>
                <Star size={14} color={colors.orange500} />
                <Text style={styles.ratingText}>
                  {sessionData?.captain.rating}
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
                uri: sessionData?.captain?.imageUrl,
                priority: FastImage.priority.normal,
              }}
              style={styles.avatar}
              resizeMode={FastImage.resizeMode.cover}
            />

            <View style={{ flex: 1, gap: verticalScale(6) }}>
              <Text style={styles.captainName}>{sessionData?.captain?.name}</Text>
              <View style={styles.languageContainer}>
                <Languages size={16} color={colors.primary} />
                <Text style={styles.languageText}>
                  {sessionData?.captain?.language}
                </Text>
              </View>

              {sessionData?.captain?.verified && (
                <View style={styles.verifiedRow}>
                  <ShieldCheck size={14} color={colors.primary} />
                  <Text style={styles.verifiedText}>Verified Captain</Text>
                </View>
              )}
            </View>

            {sessionData?.captain?.rating > 0 && (
              <View style={styles.rating}>
                <Star size={14} color={colors.orange500} />
                <Text style={styles.ratingText}>
                  {sessionData.captain.rating}
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
            <Button label="Book Seat" onPress={handleBookSession} />
          </>
        )}

        {!canBook && isPast && !isEnded && (
          <Text style={styles.footerNote}>
            ⏰ Session has already started or passed.
          </Text>
        )}

        {/* Show direction ONLY if user already booked */}
        {isBooked && !isEnded && (
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                mapDirection(
                  sessionData?.location.latitude,
                  sessionData?.location.longitude,
                ),
              )
            }
          >
            <Text style={styles.link}>📍 Get direction</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <WaiverModal
        visible={showWaiverModal}
        onClose={() => {
          setShowWaiverModal(false);
          handleWaiverClear();
        }}
        onConfirm={() => {
          setShowWaiverModal(false);
          // setPaymentModal(true);
        }}
        signature={signature}
        setSignature={setSignature}
        hasScrolled={hasScrolled}
        setHasScrolled={setHasScrolled}
        checks={checks}
        setChecks={setChecks}
      />

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: horizontalScale(20),
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
    borderRadius: horizontalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.gray400,
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
