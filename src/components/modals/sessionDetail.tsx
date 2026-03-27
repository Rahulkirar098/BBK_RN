import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
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
  value: any;
}) => {
  if (value === undefined || value === null || value === '') return null;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  );
};

const formatDate = (value: any) => {
  try {
    if (!value) return '';

    if (value?.toDate) {
      return value.toDate().toLocaleString();
    }

    return new Date(value).toLocaleString();
  } catch {
    return 'Invalid date';
  }
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
    activity,
    status,

    boat,
    captain,

    totalSeats,
    minRiders,
    bookedSeats,
    ridersProfile,

    durationMinutes,
    timeStart,

    location,
    locationDetails,
  } = session;

  const fillPercent = totalSeats
    ? Math.round((bookedSeats / totalSeats) * 100)
    : 0;

  const mapLink =
    location?.latitude && location?.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
      : null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* HERO IMAGE */}
          <View style={styles.imageContainer}>
            <FastImage
              source={{
                uri: imageUrl,
                priority: FastImage.priority.high,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />

            <View style={styles.headerOverlay}>
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

              <Text style={styles.sub}>
                {locationDetails?.formatted_address ||
                  locationDetails?.name ||
                  'No location'}
              </Text>

              {mapLink && (
                <TouchableOpacity onPress={() => Linking.openURL(mapLink)}>
                  <Text style={styles.link}>Open in Google Maps</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* BASIC INFO */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session Info</Text>

              <DetailRow label="Activity" value={activity} />
              <DetailRow label="Status" value={status} />
              <DetailRow label="Start Time" value={formatDate(timeStart)} />
              <DetailRow
                label="Duration"
                value={`${durationMinutes || 0} mins`}
              />
            </View>

            {/* CAPACITY */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Capacity</Text>

              <DetailRow label="Total Seats" value={totalSeats} />
              <DetailRow label="Booked Seats" value={bookedSeats} />
              <DetailRow label="Min Riders" value={minRiders} />
              <DetailRow label="Fill Rate" value={`${fillPercent}%`} />
            </View>

            {/* RIDERS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Riders</Text>

              <DetailRow
                label="Total Riders"
                value={ridersProfile?.length || 0}
              />

              {ridersProfile?.map((r: any, i: number) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <DetailRow label="User ID" value={r.uid} />
                  <DetailRow label="Status" value={r.status} />
                </View>
              ))}
            </View>

            {/* BOAT */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Boat</Text>

              <DetailRow label="Name" value={boat?.boatName} />
              <DetailRow label="Model" value={boat?.boatModel} />
              <DetailRow label="Company" value={boat?.boatCompany} />
              <DetailRow label="Capacity" value={boat?.boatCapacity} />

              {boat?.imageUrl && (
                <FastImage
                  source={{ uri: boat.imageUrl }}
                  style={styles.subImage}
                />
              )}
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
                  style={styles.subImage}
                />
              )}
            </View>

            {/* META */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meta</Text>

              <DetailRow label="Session ID" value={session?.id} />
              <DetailRow
                label="Created At"
                value={formatDate(session?.createdAt)}
              />
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

  headerOverlay: {
    position: 'absolute',
    top: 12,
    width: '100%',
    paddingHorizontal: horizontalScale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  closeBtn: {
    width: 25,
    height: 25,
    backgroundColor: colors.black,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  titleWhite: {
    ...typography.cardTitle,
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 5,
    borderRadius: 5,
  },

  section: {
    padding: horizontalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  sectionTitle: {
    ...typography.cardTitle,
    marginBottom: verticalScale(6),
  },

  price: {
    ...typography.sectionTitle,
    color: colors.primary,
  },

  sub: {
    ...typography.small,
    color: colors.textSecondary,
  },

  link: {
    color: colors.primary,
    marginTop: 6,
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  label: {
    ...typography.small,
    color: colors.textSecondary,
  },

  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },

  subImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },
});