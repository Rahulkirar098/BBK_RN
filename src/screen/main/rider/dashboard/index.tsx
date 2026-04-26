import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  colors,
  horizontalScale,
  typography,
  verticalScale,
} from '../../../../theme';
import { TimeFilter } from '../../../../type';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Map } from 'lucide-react-native';

// ---------- Components ----------
import Header from './header';
import SearchBar from './search';
import TimeFilterBar from './timeLineTabs';
import { SessionCardRider } from '../../../../components/molicules';
import {
  PaymentModal,
  SessionDetailsRider,
  WaiverModal,
} from '../../../../components/modals';

// ---------- Firestore ---------- //
import {
  getFirestore,
  onSnapshot,
  query,
  Timestamp,
  collectionGroup,
} from '@react-native-firebase/firestore';

import { getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { where } from '@react-native-firebase/firestore';

import RNCalendarEvents from 'react-native-calendar-events';

// ---------- Stripe ---------- //
import { useStripe, initStripe } from '@stripe/stripe-react-native';

import { getApp } from '@react-native-firebase/app';
import { mapDirection } from '../../../../utils/common_logic';
import { stripKey } from '../../../../config';

export const RiderDashboard = () => {
  // Firebase //
  const app = getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const uid: any = auth.currentUser?.uid;

  const navigation = useNavigation<any>();

  // ---------- State ---------- //
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<TimeFilter>('NOW');

  // ---------- State ---------- //
  const [sessionDetailModal, setSessionDetailModal] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);

  const [saveCardDetails, setSaveCardDetails] = useState(false);

  const toggleSaveCard = () => {
    setSaveCardDetails(prev => !prev);
  };

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
    const q = query(
      collectionGroup(db, 'slots'),
      // where('status', '==', 'open'),
      // where('paymentStatus', '==', 'pending'),
    );
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
        setLoading(false);
      },
      error => {
        console.error('Firestore error:', error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  // ---------- Filtered Sessions ---------- //
  const filteredSessions = useMemo(() => {
    if (!sessions?.length) return [];

    const now = new Date();

    const sorted = [...sessions].sort(
      (a, b) => new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime()
    );

    return sorted.filter(session => {
      const sessionDate = new Date(session.timeStart);

      const matchesSearch =
        session.title?.toLowerCase?.().includes(searchQuery.toLowerCase()) ||
        session.locationDetails?.name
          ?.toLowerCase?.()
          .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedTab === 'NOW') {
        // Show only today's future sessions (not past sessions)
        const isToday =
          sessionDate.getDate() === now.getDate() &&
          sessionDate.getMonth() === now.getMonth() &&
          sessionDate.getFullYear() === now.getFullYear();

        return isToday && sessionDate >= now;
      }

      if (selectedTab === 'TOMORROW') {
        // Show only tomorrow's future sessions (not past)
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);

        const isTomorrow =
          sessionDate.getDate() === tomorrow.getDate() &&
          sessionDate.getMonth() === tomorrow.getMonth() &&
          sessionDate.getFullYear() === tomorrow.getFullYear();

        return isTomorrow && sessionDate >= now;
      }

      if (selectedTab === 'THIS_WEEK') {
        // Show upcoming 7 days future sessions (not past)
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + 7);
        endOfWeek.setHours(23, 59, 59, 999);

        return sessionDate >= now && sessionDate <= endOfWeek;
      }

      return true;
    });
  }, [sessions, selectedTab, searchQuery]);

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

  const saveCardToFirestore = async (cardData: any) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // ✅ Only save if checkbox enabled
      if (!saveCardDetails) return;

      // ✅ Only save if card is complete
      if (!cardData?.complete) {
        Alert.alert('Card is not complete');
        return;
      }

      await firestore()
        .collection('users')
        .doc(uid)
        .collection('paymentMethods')
        .add({
          brand: cardData.brand,
          last4: cardData.last4,
          expMonth: cardData.expiryMonth,
          expYear: cardData.expiryYear,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert('Card saved successfully ✅');
    } catch (error) {
      console.log(error);
      Alert.alert('Failed to save card');
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

  const handlePaymentConfirmed = async (session: any, stripeData: any) => {
    if (!session) return;

    const sessionId = session?.id;
    const operatorUid = session?.operator_id;
    const riderUid = uid;

    if (!sessionId || !operatorUid) {
      Alert.alert('Error', 'Invalid session data');
      return;
    }

    try {
      setLoading(true);

      const clientSecret = stripeData.clientSecret;

      if (!clientSecret) {
        throw new Error('Missing client secret');
      }

      await initStripe({
        publishableKey: stripKey,
        stripeAccountId: session?.stripeAccountId, // 🔥 KEY FIX
      });

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment(
        clientSecret,
        { paymentMethodType: 'Card' },
      );

      if (error) {
        Alert.alert('Payment failed', error.message || 'Try again');
        console.log(error.message);
        return;
      }

      if (!paymentIntent) {
        throw new Error('Payment confirmation failed');
      }

      // 🔥 Call backend to finalize booking
      const liveURL = 'https://bbk-be-1smn.vercel.app';

      const finalizeResponse = await fetch(`${liveURL}/finalize-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          operatorUid,
          riderUid: riderUid,
          paymentIntentId: paymentIntent.id,
        }),
      });

      const finalizeData = await finalizeResponse.json();

      if (!finalizeResponse.ok) {
        console.log('error', '===@@@');
        throw new Error(finalizeData.error || 'Booking failed');
      }

      Alert.alert('Success', 'Seat reserved successfully');

      saveCardToFirestore(cardDetails);

      try {
        const permission = await RNCalendarEvents.requestPermissions();

        if (permission === 'authorized') {
          const startDate = new Date(session?.timeStart);

          const duration = session?.durationMinutes || 0;

          const endDate = new Date(startDate.getTime() + duration * 60000);

          const lat = session?.location?.latitude;
          const lng = session?.location?.longitude;

          const mapLink = mapDirection(lat, lng);

          await RNCalendarEvents.saveEvent('Boat Riding Session', {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            location: session?.locationDetails?.name,
            notes: `Your booked session\n\nNavigate: ${mapLink}`,
          });
        } else {
          Alert.alert('Please allow permission');
        }
      } catch (error) {
        console.log(error, '===@@@');
      }

      setPaymentModal(false);
      setSelectedSession(null);
      handleWaiverClear();
    } catch (err: any) {
      console.log(err.message);
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>Loading sessions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Render ---------- //
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onPressHelp={() => navigation.navigate('explanation')} />

      <TouchableOpacity
        onPress={() => navigation.navigate('map')}
        style={{
          width: horizontalScale(100),
          height: verticalScale(50),
          borderRadius: verticalScale(10),
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.primary,
          position: 'absolute',
          bottom: verticalScale(90),
          alignSelf: 'center',
          zIndex: 99,
          flexDirection: 'row',
          gap: horizontalScale(5),
        }}
      >
        <Map size={20} color={colors.white} />
        <Text style={{ ...typography.sectionTitle, color: colors.white }}>
          Map
        </Text>
      </TouchableOpacity>

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

            {/* <RequestTripCard onPress={() => Alert.alert('Request a trip is not available yet')} /> */}
          </View>
        }
        renderItem={({ item }) => (
          <SessionCardRider
            session={item}
            onPress={() => {
              // setSessionDetailModal(true);
              // setSelectedSession(item);
              navigation.navigate("session-booking", {
                session: item,
                uid: uid,
              })
            }}
            uid={uid}
          />
        )}
      />

      <SessionDetailsRider
        visible={sessionDetailModal}
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onBook={() => handleBookSession()}
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
        onConfirm={(session, stripeData) =>
          handlePaymentConfirmed(session, stripeData)
        }
        setCardDetails={setCardDetails}
        saveCardDetails={saveCardDetails}
        toggleSaveCard={toggleSaveCard}
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
