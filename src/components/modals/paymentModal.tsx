import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lock, X, ShieldCheck, CreditCard } from 'lucide-react-native';
import { CardField } from '@stripe/stripe-react-native';

import {
  colors,
  typography,
  horizontalScale,
  verticalScale,
} from '../../theme';

import { CustomCheckbox } from '../atoms/checkbox';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface PaymentModalProps {
  session: any;
  onClose: () => void;
  onConfirm: (data: any, stripeData: any) => void;
  visible: boolean;

  setCardDetails: (data: any) => void;

  saveCardDetails: boolean;
  toggleSaveCard: () => void;
}

export const PaymentModal = ({
  session,
  onClose,
  onConfirm,
  visible,
  setCardDetails,
  saveCardDetails,
  toggleSaveCard,
}: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [isCardComplete, setIsCardComplete] = useState(false);

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

      const liveURL = 'https://bbk-be-1smn.vercel.app';

      const response = await fetch(`${liveURL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session?.id,
          operatorUid: session?.operator_id,
          riderUid: user?.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      onConfirm(session, data);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* ---------- HEADER ---------- */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Lock size={16} color={colors.textSecondary} />
                <Text style={styles.headerTitle}>Checkout</Text>
              </View>

              <TouchableOpacity onPress={onClose}>
                <X size={20} color={colors.gray400} />
              </TouchableOpacity>
            </View>

            {/* ---------- BODY ---------- */}
            <KeyboardAwareScrollView
              contentContainerStyle={styles.content}
              enableOnAndroid
              enableAutomaticScroll
              extraScrollHeight={20}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              {/* TOTAL */}
              <View style={styles.totalRow}>
                <View>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                  <Text style={styles.totalPrice}>
                    {session?.currency} {session?.pricePerSeat}
                  </Text>
                </View>

                <View style={styles.preAuthBadge}>
                  <Text style={styles.preAuthText}>PRE-AUTH</Text>
                </View>
              </View>

              {/* CARD */}
              <View style={styles.cardContainer}>
                <View style={styles.cardLabelRow}>
                  <CreditCard size={16} color={colors.primary} />
                  <Text style={styles.cardLabel}>Card Details</Text>
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
              </View>

              {/* SAVE CARD */}
              <CustomCheckbox
                checked={saveCardDetails}
                label="Save card details for future bookings"
                onPress={toggleSaveCard}
              />

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
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(20),
  },

  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '85%',
  },

  header: {
    padding: horizontalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
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