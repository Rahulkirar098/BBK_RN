import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Alert, FlatList, Platform, StyleSheet, View } from 'react-native';
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

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const db = getFirestore();

// ---------- Stripe ---------- //
import { useStripe } from '@stripe/stripe-react-native';

export const RiderDashboard = () => {
  const navigation = useNavigation<any>();

  // ---------- State ---------- //
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<TimeFilter>('NOW');

  // ---------- State ---------- //
  const [sessionDetailModal, setSessionDetailModal] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);

  // ---------- Stripe ---------- //
  const [cardDetails, setCardDetails] = useState<any>({});
  const stripe = useStripe();

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


const handlePaymentConfirmed = async (session: any) => {
  if (!session) return;

  const sessionId = session?.id;
  const operatorUid = session?.userId;
  const riderUid = auth().currentUser?.uid;

  if (!sessionId || !operatorUid || !riderUid) {
    Alert.alert('Error', 'Invalid session or user data');
    return;
  }

  setLoading(true);

  try {
    console.log('Calling payment intent API...');

    // Use 10.0.2.2 for Android emulator
    const baseUrl =
      Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, operatorUid, riderUid }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create payment intent');
    }

    const clientSecret = data.clientSecret;
    if (!clientSecret) {
      throw new Error('No clientSecret returned from backend');
    }

    console.log('PaymentIntent clientSecret:', clientSecret);

    // Confirm payment with Stripe SDK
    const { error, paymentIntent } = await stripe.confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
    });

    if (error) {
      console.error('Stripe confirmPayment error:', error);
      Alert.alert('Payment failed', error.message || 'Please try again');
    } else if (paymentIntent) {
      console.log('Payment successful:', paymentIntent.id);
      Alert.alert('Payment success', `Payment ID: ${paymentIntent.id}`);
      // 🔥 Update nested slot document
      await updateDoc(doc(db, 'slots', operatorUid, 'slots', sessionId), {
        ...session,
      });

      // ✅ Close modals
      setPaymentModal(false);
      setSelectedSession(null);

    }
  } catch (err: any) {
    console.error('Failed to create or confirm payment intent:', err);
    Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
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
        setCardDetails={setCardDetails}
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
