import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  ScrollView,
  View,
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
import { StatsCards } from './stats';
import { UpcomingSessions } from './upcomming';

/* ---------------- REAL-TIME BOOKINGS LISTENER ---------------- */
const subscribeUserBookings = (uid: string, callback: (data: any[]) => void) => {
  return firestore()
    .collection('users')
    .doc(uid)
    .collection('history')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      callback(bookings);
    }, error => {
      console.log('Booking listener error:', error);
    });
};

/* ---------------- MAIN COMPONENT ---------------- */
export const Trip = () => {
  const navigation = useNavigation<any>();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      setLoading(false);
      return;
    }

    // 🔥 Real-time listener
    const unsubscribe = subscribeUserBookings(currentUser.uid, data => {
      setBookings(data);
      setLoading(false);
    });

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

  /* ---------------- EMPTY STATE ---------------- */
  if (!bookings.length) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No trips found 🚤</Text>
      </SafeAreaView>
    );
  }

  console.log(bookings)

  /* ---------------- MAIN UI ---------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <TripsHeader />

        {/* Pass real data */}
        <StatsCards bookings={bookings} />

        <UpcomingSessions
          bookings={bookings}
          // onBrowse={() => navigation.navigate('Explore')}
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
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});