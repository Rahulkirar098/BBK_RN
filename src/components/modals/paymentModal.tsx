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
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Lock, X, CreditCard, ShieldCheck } from 'lucide-react-native';

import { CardField } from '@stripe/stripe-react-native';

import {
  colors,
  typography,
  horizontalScale,
  verticalScale,
} from '../../theme';

interface PaymentModalProps {
  session: any;
  onClose: () => void;
  onConfirm: (data: any) => void;
  visible: boolean;

  setCardDetails: (data: any) => void;
}

export const PaymentModal = ({
  session,
  onClose,
  onConfirm,
  visible,

  setCardDetails,
}: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const storedUser = await AsyncStorage.getItem('bbs_user');
      if (!storedUser) throw new Error('User not logged in');

      const user = JSON.parse(storedUser);

      const totalSeats = session?.totalSeats ?? 0;
      const bookedSeats = session?.bookedSeats ?? 0;
      const minRidersToConfirm = session?.minRidersToConfirm ?? 0;

      if (bookedSeats >= totalSeats) {
        Alert.alert('All seats are full');
        return;
      }

      const newBookedSeats = bookedSeats + 1;

      const payload = {
        ...session,
        bookedSeats: newBookedSeats,
        ridersProfile: [
          ...(session?.ridersProfile || []).filter(
            (r: any) => r?.uid !== user?.uid,
          ),
          user,
        ],
        isRequested:
          newBookedSeats >= minRidersToConfirm && newBookedSeats < totalSeats,
      };

      onConfirm(payload);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
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

            {/* Card Fields */}
            {/* <View style={styles.cardInput}>
              <CreditCard size={18} color={colors.gray400} />
              <TextInput
                placeholder="Card number"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                placeholder="MM/YY"
                placeholderTextColor={colors.textSecondary}
                style={[styles.inputBox, { flex: 1 }]}
              />
              <TextInput
                placeholder="CVC"
                placeholderTextColor={colors.textSecondary}
                style={[styles.inputBox, { flex: 1 }]}
              />
            </View> */}

            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: '4242 4242 4242 4242' }}
              cardStyle={{
                backgroundColor: colors.white,
                textColor: colors.black,
              }}
              style={{ width: '100%', height: 50, marginVertical: 30 }}
              onCardChange={card => setCardDetails(card)}
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
});
