import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
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
import { ShieldCheck, CreditCard } from 'lucide-react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { apiCallMethod } from '../../../../api/apiCallMethod';
import PaymentCardPreview from './cardDesign';

import { useStripe } from '@stripe/stripe-react-native';

export const Checkout = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { session } = route.params;

  const { createPaymentMethod } = useStripe();

  const [loading, setLoading] = useState(false);

  // FORM STATE
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // ERROR STATE
  const [errors, setErrors] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  // VALIDATION
  const validateFields = () => {
    let valid = true;
    const newErrors = { name: '', number: '', expiry: '', cvv: '' };

    if (!cardName.trim()) {
      newErrors.name = 'Cardholder name is required';
      valid = false;
    }

    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.number = 'Enter valid card number';
      valid = false;
    }

    if (!expiry || expiry.length !== 5) {
      newErrors.expiry = 'Enter valid expiry (MM/YY)';
      valid = false;
    } else {
      const [month, year] = expiry.split('/').map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      if (month < 1 || month > 12) {
        newErrors.expiry = 'Invalid month';
        valid = false;
      } else if (
        year < currentYear ||
        (year === currentYear && month < currentMonth)
      ) {
        newErrors.expiry = 'Card expired';
        valid = false;
      }
    }

    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Enter valid CVV';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // PAYMENT
  const handlePayment = async () => {
    try {
      if (!validateFields()) return;

      setLoading(true);

      const storedUser = await AsyncStorage.getItem('bbs_user');
      if (!storedUser) throw new Error('User not logged in');

      const user = JSON.parse(storedUser);

      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: { name: cardName },
        },
      });

      if (error) {
        console.log(error,"===@@@")
        Alert.alert('Payment Error', error.message);
        return;
      }

      const response = await apiCallMethod.createPaymentIntent({
        sessionId: session?.id,
        operatorUid: session?.operator_id,
        riderUid: user?.uid,
        operatorStripeAccountId: session?.stripeAccountId,
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Payment initiated successfully');
      } else {
        throw new Error(response.data.error);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Checkout" onBack={() => navigation.goBack()} />

      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        {/* CARD PREVIEW */}
        <PaymentCardPreview
          cardNumber={cardNumber || '•••• •••• •••• ••••'}
          name={cardName || 'Your Name'}
          expiry={expiry || '••/••'}
        />

        {/* TOTAL */}
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalPrice}>
              {session?.currency} {session?.pricePerSeat}
            </Text>
          </View>
        </View>

        {/* FORM */}
        <View>
          <View style={styles.cardLabelRow}>
            <CreditCard size={16} color={colors.primary} />
            <Text style={styles.cardLabel}>Card Details</Text>
          </View>

          {/* NAME */}
          <TextInput
            placeholder="Cardholder Name"
            value={cardName}
            onChangeText={(t) => {
              setCardName(t);
              setErrors((p) => ({ ...p, name: '' }));
            }}
            style={[styles.input, errors.name && styles.inputError]}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          {/* NUMBER */}
          <TextInput
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            keyboardType="number-pad"
            maxLength={19}
            onChangeText={(text) => {
              const formatted = text
                .replace(/\D/g, '')
                .replace(/(.{4})/g, '$1 ')
                .trim();
              setCardNumber(formatted);
              setErrors((p) => ({ ...p, number: '' }));
            }}
            style={[styles.input, errors.number && styles.inputError]}
          />
          {errors.number && (
            <Text style={styles.errorText}>{errors.number}</Text>
          )}

          {/* EXPIRY + CVV */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="MM/YY"
                value={expiry}
                keyboardType="number-pad"
                maxLength={5}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '');
                  let formatted = cleaned;
                  if (cleaned.length >= 3) {
                    formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
                  }
                  setExpiry(formatted);
                  setErrors((p) => ({ ...p, expiry: '' }));
                }}
                style={[styles.input, errors.expiry && styles.inputError]}
              />
              {errors.expiry && (
                <Text style={styles.errorText}>{errors.expiry}</Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="CVV"
                value={cvv}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                onChangeText={(t) => {
                  setCvv(t);
                  setErrors((p) => ({ ...p, cvv: '' }));
                }}
                style={[styles.input, errors.cvv && styles.inputError]}
              />
              {errors.cvv && (
                <Text style={styles.errorText}>{errors.cvv}</Text>
              )}
            </View>
          </View>
        </View>

        {/* PAY BUTTON */}
        <TouchableOpacity
          style={[
            styles.payButton,
            loading && { opacity: 0.5 },
          ]}
          onPress={handlePayment}
          disabled={loading}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
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
    marginTop: 10,
  },

  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },

  cardLabel: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.white,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
  },

  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
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

  inputError: {
    borderColor: colors.error,
  },

  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 8,
    marginTop: -8,
  },
});