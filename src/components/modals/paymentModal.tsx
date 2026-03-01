import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
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

  const handlePayment = async () => {
    try {
      setLoading(true);

      const storedUser = await AsyncStorage.getItem('bbs_user');
      if (!storedUser) throw new Error('User not logged in');

      const user = JSON.parse(storedUser);

      const baseUrl =
        Platform.OS === 'android'
          ? 'http://10.0.2.2:3000'
          : 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session?.id,
          operatorUid: session?.userId,
          riderUid: user?.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      // Pass stripeData only
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
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* ---------- Header ---------- */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Lock size={16} color={colors.textSecondary} />
              <Text style={styles.headerTitle}>Checkout</Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <X size={20} color={colors.gray400} />
            </TouchableOpacity>
          </View>

          {/* ---------- Body ---------- */}
          <View style={styles.content}>
            {/* Total Section */}
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

            {/* Card Section */}
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
                    borderRadius: 12,
                    fontSize: 16,
                  }}
                  style={styles.cardField}
                  onCardChange={card => setCardDetails(card)}
                />
              </View>
            </View>


            <CustomCheckbox
              checked={saveCardDetails}
              label="Save card details for future bookings"
              onPress={toggleSaveCard}
            />

            {/* Pay Button */}
            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.payText}>Pay Now</Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.secureRow}>
              <ShieldCheck size={12} color={colors.textSecondary} />
              <Text style={styles.secureText}>
                Secure 256-bit SSL encrypted
              </Text>
            </View>
          </View>
        </View>
      </View>
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
    paddingBottom: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  totalLabel: {
    ...typography.small,
    color: colors.textSecondary,
    letterSpacing: 1,
  },

  totalPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  preAuthBadge: {
    backgroundColor: colors.gray100,
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: 6,
  },

  preAuthText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  cardInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(14),
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },

  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },

  row: {
    flexDirection: 'row',
    gap: horizontalScale(12),
  },

  inputBox: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(14),
    borderWidth: 1,
    borderColor: colors.border,
    ...typography.body,
    color: colors.textPrimary,
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


  ///////////
  cardContainer: {
    marginTop: verticalScale(20),
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
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(8),

    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardField: {
    width: '100%',
    height: 50,
  },
});
