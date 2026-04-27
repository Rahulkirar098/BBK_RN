import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import {
  colors,
  horizontalScale,
  verticalScale,
} from '../../../../theme';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { useNavigation } from '@react-navigation/native';

import { TripsHeader } from './header';
import { BookingHistory } from './bookingHistory';

/* ---------------- REAL-TIME BOOKINGS LISTENER ---------------- */
const subscribeUserBookings = (
  uid: string,
  callback: (data: any[]) => void,
  onError: () => void
) => {
  return firestore()
    .collection('bookings')
    .where('riderId', '==', uid)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => {
        const bookings = snapshot.docs.map(doc => {
          const data = doc.data();

          return {
            id: doc.id,
            ...data,
            timeStart:
              data.timeStart?.toDate?.() || new Date(data.timeStart),
          };
        });

        callback(bookings);
      },
      error => {
        console.log('Booking listener error:', error);
        onError(); // 🔥 VERY IMPORTANT
      }
    );
};

/* ---------------- MAIN COMPONENT ---------------- */
export const Trip = () => {
  // const navigation = useNavigation<any>();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeUserBookings(
      currentUser.uid,
      data => {
        setBookings(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* ---------------- LOADING UI ---------------- */
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Loading trips...</Text>
      </SafeAreaView>
    );
  }

  /* ---------------- SPLIT BOOKINGS ---------------- */
  const now = new Date();

  const upcomingBookings = bookings.filter(
    b => b.timeStart && b.timeStart > now
  );

  const pastBookings = bookings.filter(
    b => b.timeStart && b.timeStart <= now
  );

  /* ---------------- MAIN UI ---------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <TripsHeader />

        {/* <StatsCards bookings={bookings} /> */}

        <BookingHistory
          type="upcoming"
          bookings={upcomingBookings}
        />

        <BookingHistory
          type="past"
          bookings={pastBookings}
        />


      </ScrollView>
    </SafeAreaView>
  );
};

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    paddingHorizontal: horizontalScale(20),
    gap: verticalScale(10),
    paddingBottom: verticalScale(70)
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});