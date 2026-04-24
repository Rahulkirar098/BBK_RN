import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  colors,
  horizontalScale,
  typography,
  verticalScale,
} from '../../../../theme';

import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenHeader } from '../../../../components/atoms';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShieldCheck } from 'lucide-react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { apiCallMethod } from '../../../../api/apiCallMethod';
import PaymentCardPreview from './cardDesign';

import RNCalendarEvents from 'react-native-calendar-events';
import { mapDirection } from '../../../../utils/common_logic';


// ---------- Stripe ---------- //
import { useStripe, initStripe, CardField } from '@stripe/stripe-react-native';
import { stripKey } from '../../../../config';


// ---------- firestore ---------- //
import firestore from '@react-native-firebase/firestore';


export const Checkout = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { session, uid } = route.params;

  const { createPaymentMethod } = useStripe();

  const [loading, setLoading] = useState(false);
  const [isCardComplete, setIsCardComplete] = useState(false);

  // ---------- Stripe ---------- //
  const [cardDetails, setCardDetails] = useState<any>({});
  const stripe = useStripe();

  const handlePayment = async () => {
    try {
      if (!isCardComplete) {
        Alert.alert('Error', 'Please enter complete card details');
        return;
      }

      setLoading(true);

      const storedUser = await AsyncStorage.getItem('bbs_user');
      if (!storedUser) throw new Error('User not logged in');

      const user = JSON.parse(storedUser);

      const response = await apiCallMethod.createPaymentIntent({
        sessionId: session?.id,
        operatorUid: session?.operator_id,
        riderUid: user?.uid,
        operatorStripeAccountId: session?.stripeAccountId,
      });

      if (response.status == 200) {
        let data = response.data;
        handlePaymentConfirmed(session, data);
      } else {
        throw new Error(
          response.data.error || 'Failed to create payment intent',
        );
      }
    } catch (err: any) {
      console.error(err?.response?.data?.error);
      Alert.alert('Error', err?.response?.data?.error || 'Something went wrong');
      setLoading(false);
    }
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
        console.log(error.message, "===@@@ payment error");
        setLoading(false);
        return;
      }

      if (!paymentIntent) {
        setLoading(false);
        throw new Error('Payment confirmation failed');
      }

      let body = {
        sessionId,
        operatorUid,
        riderUid: riderUid,
        paymentIntentId: paymentIntent.id,
      }
      const response = await apiCallMethod.finalizeBooking(body)

      if (response.status == 200) {

        Alert.alert('Success', 'Seat reserved successfully');

        try {
          const permission = await RNCalendarEvents.requestPermissions();

          if (permission === 'authorized') {
            let startDate: Date;

            if (!session?.timeStart) {
              throw new Error('Invalid timeStart');
            }

            // Handle Firestore Timestamp
            if (typeof session.timeStart?.toDate === 'function') {
              startDate = session.timeStart.toDate();
            } else {
              startDate = new Date(session.timeStart);
            }

            if (isNaN(startDate.getTime())) {
              throw new Error('Invalid startDate format');
            }

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
          console.log(error, '===@@@ calender');
        }

        navigation.navigate("bottom_tab")

      } else {
        console.log(response.data.error, '===@@@ finalizeResponse');
        setLoading(false);
        throw new Error(
          response.data.error || 'Booking failed',
        );
      }

    } catch (err: any) {
      console.log(err.message);
      Alert.alert('Error', err.message || 'Something went wrong');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Checkout" onBack={() => navigation.goBack()} />

      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        {/* CARD PREVIEW */}
        <PaymentCardPreview />

        {/* TOTAL */}
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalPrice}>
              {session?.currency} {session?.pricePerSeat}
            </Text>
          </View>
        </View>


        <View style={styles.cardWrapper}>
          <CardField
            postalCodeEnabled={false}
            placeholders={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={{
              backgroundColor: colors.white,
              textColor: colors.textPrimary,
              fontSize: 16,
            }}
            style={styles.cardField}
            onCardChange={card => {
              setCardDetails(card);
              setIsCardComplete(card.complete);
            }}
          />
        </View>

        {/* PAY BUTTON */}
        <TouchableOpacity
          style={[
            styles.payButton,
            (!isCardComplete || loading) && { opacity: 0.5 },
          ]}
          onPress={handlePayment}
          disabled={!isCardComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.payText}>Pay Now</Text>
          )}
        </TouchableOpacity>

        {/* FOOTER */}
        <View style={styles.secureRow}>
          <ShieldCheck size={12} color={colors.textSecondary} />
          <Text style={styles.secureText}>
            Secure 256-bit SSL encrypted
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: horizontalScale(20),
    gap: verticalScale(20),
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: verticalScale(10),
  },

  totalLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },

  totalPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  preAuthBadge: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  preAuthText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  cardContainer: {
    marginTop: verticalScale(10),
  },

  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: verticalScale(10),
  },

  cardLabel: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  cardWrapper: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  cardField: {
    width: '100%',
    height: 50,
  },

  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(16),
    borderRadius: 14,
    alignItems: 'center',
  },

  payText: {
    color: colors.white,
    ...typography.cardTitle,
  },

  secureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  secureText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});