import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import FastImage from 'react-native-fast-image';

import {
  colors,
  horizontalScale,
  typography,
  verticalScale,
} from '../../theme';

interface Props {
  visible: boolean;
  session: any;
  onClose: () => void;
}

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => {
  if (!value && value !== 0) return null;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

export const SessionDetailModal: React.FC<Props> = ({
  visible,
  session,
  onClose,
}) => {
  if (!session) return null;

  const {
    title,
    imageUrl,
    pricePerSeat,
    locationName,

    boat,
    captain,

    totalSeats,
    minRidersToConfirm,
    bookedSeats,

    durationMinutes,
    timeStart,
  } = session;

  const fillPercent = totalSeats
    ? Math.round((bookedSeats / totalSeats) * 100)
    : 0;

  console.log(session);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* HERO IMAGE */}
          <View style={styles.imageContainer}>
            <FastImage
              source={{
                uri: session.image,
                priority: FastImage.priority.high,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />

            <View
              style={{
                width: '100%',
                position: 'absolute',
                top: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: horizontalScale(10),
              }}
            >
              <Text style={styles.titleWhite}>{title}</Text>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={18} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* PRICE + LOCATION */}
            <View style={styles.section}>
              <Text style={styles.price}>AED {pricePerSeat}</Text>
              <Text style={styles.sub}>{locationName}</Text>
            </View>

            {/* SESSION INFO */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session Info</Text>

              <DetailRow
                label="Start Time"
                value={timeStart?.toDate?.().toLocaleString?.()}
              />
              <DetailRow label="Duration" value={`${durationMinutes} mins`} />
            </View>

            {/* CAPACITY */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Capacity</Text>

              <DetailRow label="Seats" value={totalSeats} />
              <DetailRow label="Booked" value={bookedSeats} />
              <DetailRow label="Min Riders" value={minRidersToConfirm} />
              <DetailRow label="Fill Rate" value={`${fillPercent}%`} />
            </View>

            {/* BOAT */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Boat</Text>

              <DetailRow label="Name" value={boat?.boatName} />
              <DetailRow label="manufacturing year" value={boat?.boatModel} />
              <DetailRow label="Company" value={boat?.boatCompany} />
              <DetailRow label="Capacity" value={boat?.boatCapacity} />
            </View>

            {/* CAPTAIN */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Captain</Text>

              <DetailRow label="Name" value={captain?.name} />
              <DetailRow label="Phone" value={captain?.phone_no} />
              <DetailRow label="Language" value={captain?.language} />
              <DetailRow label="Status" value={captain?.status} />

              {captain?.imageUrl && (
                <FastImage
                  source={{ uri: captain.imageUrl }}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: horizontalScale(5),
                    marginTop: verticalScale(5),
                  }}
                />
              )}
            </View>
          </ScrollView>
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
    padding: horizontalScale(15),
  },

  modal: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(20),
    maxHeight: '90%',
    overflow: 'hidden',
  },

  imageContainer: {
    height: verticalScale(200),
  },

  image: {
    width: '100%',
    height: '100%',
  },

  closeBtn: {
    width: horizontalScale(25),
    height: horizontalScale(25),
    backgroundColor: colors.black,
    borderRadius: horizontalScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },

  titleWhite: {
    ...typography.cardTitle,
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: horizontalScale(5),
    borderRadius: horizontalScale(5),
  },

  section: {
    padding: horizontalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  sectionTitle: {
    ...typography.cardTitle,
    marginBottom: verticalScale(5),
  },

  price: {
    ...typography.sectionTitle,
    color: colors.primary,
  },

  sub: {
    ...typography.small,
    color: colors.textSecondary,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    ...typography.small,
    color: colors.textSecondary,
  },

  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
