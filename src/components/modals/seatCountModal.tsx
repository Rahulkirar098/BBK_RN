import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import {
  colors,
  horizontalScale,
  typography,
  verticalScale,
} from '../../theme';

import {
  Clock,
  X,
  Users,
  Wallet,
  CheckCircle2,
} from 'lucide-react-native';

import { formatDate, getTimeOfDayInfo } from '../../utils/common_logic';
import { Button } from '../atoms';

interface Props {
  visible: boolean;
  onClose: () => void;
  session: any;
  onConfirm: (seatCount: number) => void;
}

export const SeatCountModal: React.FC<Props> = ({
  visible,
  onClose,
  session,
  onConfirm,
}) => {
  const [seatCount, setSeatCount] = useState(1);

  /* =========================================================
       ✅ TIME
    ========================================================= */
  const timeStartValue = useMemo(() => {
    if (session?.timeStart?.toDate) {
      return session.timeStart.toDate();
    }

    if (session?.timeStart?._seconds) {
      return new Date(session.timeStart._seconds * 1000);
    }

    return new Date(session?.timeStart);
  }, [session]);

  const { label, color, Icon } = getTimeOfDayInfo(timeStartValue);

  /* =========================================================
       ✅ SEATS
    ========================================================= */
  const totalSeats = session?.totalSeats || 0;
  const bookedSeats = session?.bookedSeats || 0;

  const remainingSeats = Math.max(totalSeats - bookedSeats, 0);

  /* =========================================================
       ✅ PRICE
    ========================================================= */
  const pricePerSeat = session?.pricePerSeat || 0;

  const totalAmount = seatCount * pricePerSeat;

  /* =========================================================
       ✅ HANDLERS
    ========================================================= */
  const decreaseSeat = () => {
    setSeatCount(prev => Math.max(1, prev - 1));
  };

  const increaseSeat = () => {
    setSeatCount(prev => Math.min(remainingSeats, prev + 1));
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            {/* CLOSE */}
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{session?.title}</Text>

                <View style={styles.timeRow}>
                  <Clock size={14} color={colors.textSecondary} />

                  <Text style={styles.timeText}>
                    {formatDate(timeStartValue, 'time')}
                  </Text>
                </View>
              </View>

              <Text style={styles.price}>
                {session?.currency} {totalAmount}
              </Text>
            </View>

            <View style={styles.capacityCard}>
              <View style={styles.capacityHeader}>
                <Text style={styles.capacityTitle}>Session Capacity</Text>

                <View style={styles.remainingBadge}>
                  <CheckCircle2 size={14} color={colors.white} />

                  <Text style={styles.remainingText}>
                    {remainingSeats} Left
                  </Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <View style={{ alignItems: 'center', flexDirection: 'row', gap: 4, justifyContent: "center" }}>
                    <Users size={18} color={colors.primary} />

                    <Text style={styles.statValue}>{totalSeats}</Text>
                  </View>

                  <Text style={styles.statLabel}>Total Seats</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={{ alignItems: 'center', flexDirection: 'row', gap: 4, justifyContent: "center" }}>
                    <Users size={18} color={colors.orange500} />

                    <Text style={styles.statValue}>{bookedSeats}</Text>
                  </View>
                  <Text style={styles.statLabel}>Booked</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={{ alignItems: 'center', flexDirection: 'row', gap: 4, justifyContent: "center" }}>
                    <CheckCircle2 size={18} color={colors.success} />

                    <Text style={styles.statValue}>{remainingSeats}</Text>
                  </View>

                  <Text style={styles.statLabel}>Remaining</Text>
                </View>
              </View>
            </View>

            <View style={styles.selectorCard}>
              <Text style={styles.selectorTitle}>Select Seats</Text>

              <View style={styles.seatContainer}>
                <TouchableOpacity style={styles.seatBtn} onPress={decreaseSeat}>
                  <Text style={styles.seatBtnText}>−</Text>
                </TouchableOpacity>

                <View style={styles.seatCountWrapper}>
                  <Text style={styles.seatCount}>{seatCount}</Text>

                  <Text style={styles.seatCountLabel}>Seats</Text>
                </View>

                <TouchableOpacity
                  style={styles.seatBtn}
                  onPress={increaseSeat}
                  disabled={seatCount >= remainingSeats}
                >
                  <Text style={styles.seatBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Wallet size={18} color={colors.primary} />

                <Text style={styles.summaryTitle}>Payment Summary</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price Per Seat</Text>

                <Text style={styles.summaryValue}>
                  {session?.currency} {pricePerSeat}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Selected Seats</Text>

                <Text style={styles.summaryValue}>{seatCount}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>

                <Text style={styles.totalValue}>
                  {session?.currency} {totalAmount}
                </Text>
              </View>
            </View>

            <Text style={styles.footerText}>
              You can reserve multiple seats for friends or family in one
              booking.
            </Text>

            <Button label="Book Seat" onPress={() => onConfirm(seatCount)} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(20),
  },

  container: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(24),
    overflow: 'hidden',
    maxHeight: '85%',
  },

  imageContainer: {
    height: verticalScale(40),
  },

  image: {
    width: '100%',
    height: '100%',
  },

  closeBtn: {
    position: 'absolute',
    top: verticalScale(18),
    right: horizontalScale(18),
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: horizontalScale(8),
    borderRadius: 999,
  },

  weatherBadge: {
    position: 'absolute',
    left: horizontalScale(18),
    top: verticalScale(18),
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: horizontalScale(999),
  },

  weatherText: {
    ...typography.boldSmall,
  },

  content: {
    padding: horizontalScale(20),
    gap: verticalScale(18),
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: horizontalScale(12),
  },

  title: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },

  price: {
    ...typography.sectionTitle,
    color: colors.primary,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(5),
    marginTop: verticalScale(6),
  },

  timeText: {
    ...typography.small,
    color: colors.textSecondary,
  },

  infoRow: {
    flexDirection: 'row',
    gap: horizontalScale(12),
  },

  infoCard: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: horizontalScale(14),
    padding: horizontalScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },

  infoText: {
    ...typography.body,
    color: colors.textPrimary,
  },

  capacityCard: {
    backgroundColor: colors.gray100,
    borderRadius: horizontalScale(18),
    padding: horizontalScale(16),
    gap: verticalScale(14),
  },

  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  capacityTitle: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  remainingBadge: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(5),
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: 999,
  },

  remainingText: {
    color: colors.white,
    ...typography.small,
  },

  statsRow: {
    flexDirection: 'row',
    gap: horizontalScale(10),
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: horizontalScale(10),
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    gap: verticalScale(4),
  },

  statValue: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },

  statLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },

  selectorCard: {
    backgroundColor: colors.gray100,
    borderRadius: horizontalScale(18),
    padding: horizontalScale(18),
    gap: verticalScale(16),
  },

  selectorTitle: {
    ...typography.cardTitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  seatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(20),
  },

  seatBtn: {
    width: horizontalScale(40),
    height: horizontalScale(40),
    borderRadius: horizontalScale(14),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  seatBtnText: {
    color: colors.white,
    fontSize: horizontalScale(28),
    fontWeight: '700',
  },

  seatCountWrapper: {
    alignItems: 'center',
    minWidth: horizontalScale(80),
  },

  seatCount: {
    ...typography.sectionTitle,
    fontSize: horizontalScale(32),
    color: colors.textPrimary,
  },

  seatCountLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },

  summaryCard: {
    backgroundColor: colors.gray100,
    borderRadius: horizontalScale(18),
    padding: horizontalScale(18),
    gap: verticalScale(14),
  },

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },

  summaryTitle: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },

  summaryValue: {
    ...typography.body,
    color: colors.textPrimary,
  },

  divider: {
    height: 1,
    backgroundColor: colors.gray400,
  },

  totalLabel: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  totalValue: {
    ...typography.sectionTitle,
    color: colors.primary,
  },

  footerText: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
