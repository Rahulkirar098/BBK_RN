import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors, horizontalScale, verticalScale } from '../../../../theme';
import { TimeFilter } from '../../../../type';

import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------- Components ----------
import Header from './header';
import SearchBar from './search';
import RequestTripCard from './requestTripCard';
import TimeFilterBar from './timeLineTabs';
import { SessionCardRider } from '../../../../components/molicules';
import {
  PaymentModal,
  SessionDetailCard,
  WaiverModal,
} from '../../../../components/modals';

// ---------- Firestore ---------- //
import {
  getFirestore,
  onSnapshot,
  query,
  Timestamp,
  doc,
  updateDoc,
  collectionGroup,
} from '@react-native-firebase/firestore';

const db = getFirestore();

export const RiderDashboard = () => {
  const navigation = useNavigation<any>();

  // ---------- State ---------- //
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<TimeFilter>('NOW');

  // ---------- State ---------- //
  const [sessionDetailModal, setSessionDetailModal] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);

  const timeLabels = {
    now: 'Now',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
  };
  // ---------- Firestore Listener ----------
  useEffect(() => {
    const q = query(collectionGroup(db, 'slots'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const data = snapshot.docs.map((docSnap: any) => {
          const docData = docSnap.data();

          let timeStart: Date;

          if (docData.timeStart instanceof Timestamp) {
            timeStart = docData.timeStart.toDate();
          } else if (typeof docData.timeStart === 'string') {
            timeStart = new Date(docData.timeStart);
          } else {
            timeStart = new Date();
          }

          return {
            id: docSnap.id,
            ...docData,
            timeStart,
          };
        });

        setSessions(data);
      },
      error => {
        console.error('Firestore error:', error);
      },
    );

    return unsubscribe;
  }, []);

  const labels = {
    waitlist: 'Waitlist',
    book: 'Book Now',
  };

  // ---------- Filtered Sessions ---------- //
  const filteredSessions = useMemo(() => {
    if (!sessions?.length) return [];

    const now = new Date();

    return sessions.filter(session => {
      const sessionDate = new Date(session.timeStart);

      // Time filter
      if (selectedTab === 'NOW') {
        return sessionDate >= now;
      }

      if (selectedTab === 'TOMORROW') {
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);

        return (
          sessionDate.getDate() === tomorrow.getDate() &&
          sessionDate.getMonth() === tomorrow.getMonth() &&
          sessionDate.getFullYear() === tomorrow.getFullYear()
        );
      }

      if (selectedTab === 'THIS_WEEK') {
        const startOfWeek = new Date(now);
        const endOfWeek = new Date(now);

        startOfWeek.setHours(0, 0, 0, 0);
        endOfWeek.setDate(now.getDate() + 7);

        return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
      }

      return true;
    });
  }, [sessions, selectedTab]);

  // ---------- Digital Signature ---------- //
  const [signature, setSignature] = useState('');
  const [hasScrolled, setHasScrolled] = useState(false);

  const [checks, setChecks] = useState({
    risks: false,
    medical: false,
    liability: false,
    photos: false,
  });

  const handleBookSession = async () => {
    if (selectedSession) {
      const storedUser = await AsyncStorage.getItem('bbs_user');
      if (!storedUser) throw new Error('User not logged in');

      const user = JSON.parse(storedUser);
      let isUser = selectedSession?.ridersProfile?.filter(
        (item: any) => item?.uid == user?.uid,
      );

      if (isUser?.length) {
        Alert.alert('You have already booked this session');
        return;
      } else {
        setSessionDetailModal(false);
        setShowWaiverModal(true);
      }
    }
  };

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

  const handlePaymentConfirmed = async (data: any) => {
    if (!selectedSession) return;

    try {
      const sessionId = data?.id;
      const uid = data?.userId; // IMPORTANT: make sure session contains uid

      if (!sessionId || !uid) {
        Alert.alert('Error', 'Invalid session data');
        return;
      }

      // 🔥 Update nested slot document
      await updateDoc(doc(db, 'slots', uid, 'slots', sessionId), {
        ...data,
      });

      // ✅ Close modals
      setPaymentModal(false);
      setSelectedSession(null);

      // 🔥 Check confirmation logic
      const totalSeats = data?.totalSeats ?? 0;
      const bookedSeats = data?.bookedSeats ?? 0;
      const minRidersToConfirm = data?.minRidersToConfirm ?? 0;

      if (bookedSeats >= minRidersToConfirm && bookedSeats <= totalSeats) {
        console.log('🚀 Minimum riders reached → capture Stripe payment here');

        // 👉 THIS is where you call:
        // your Cloud Function to CAPTURE Stripe PaymentIntent
      }

      Alert.alert('Success', 'Seat reserved successfully 🎉');
    } catch (error) {
      console.error('Failed to update slot:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  // ---------- Render ---------- //
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onPressHelp={() => navigation.navigate('explanation')} />

      <FlatList
        data={filteredSessions}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            <TimeFilterBar
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              t={timeLabels}
            />

            <RequestTripCard onPress={() => Alert.alert('Request a trip')} />
          </View>
        }
        renderItem={({ item }) => (
          <SessionCardRider
            session={item}
            labels={labels}
            onPress={() => {
              setSessionDetailModal(true);
              setSelectedSession(item);
            }}
          />
        )}
      />

      <SessionDetailCard
        visible={sessionDetailModal}
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onBook={() => handleBookSession()}
        onWaitlist={() => Alert.alert('Join waitlist')}
      />

      <WaiverModal
        visible={showWaiverModal}
        onClose={() => {
          setSessionDetailModal(true);
          setShowWaiverModal(false);
          handleWaiverClear();
        }}
        onConfirm={() => {
          setShowWaiverModal(false);
          setPaymentModal(true);
        }}
        signature={signature}
        setSignature={setSignature}
        hasScrolled={hasScrolled}
        setHasScrolled={setHasScrolled}
        checks={checks}
        setChecks={setChecks}
      />

      <PaymentModal
        visible={paymentModal}
        session={selectedSession}
        onClose={() => {
          setSessionDetailModal(true);
          setPaymentModal(false);
        }}
        onConfirm={data => handlePaymentConfirmed(data)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  listContent: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(40),
  },

  headerContainer: {
    gap: verticalScale(10),
    marginBottom: verticalScale(10),
  },
});
