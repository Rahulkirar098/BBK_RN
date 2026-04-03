import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import FastImage from 'react-native-fast-image';

import firestore from '@react-native-firebase/firestore';

import {
  colors,
  horizontalScale,
  typography,
  verticalScale,
} from '../../theme';
import { formatDate, mapDirection } from '../../utils/common_logic';
import { apiCallMethod } from '../../api/apiCallMethod';
import { Accordion } from '../atoms';

interface Props {
  visible: boolean;
  session: any;
  onClose: () => void;
  setSession: (prev: any) => void;
}

const DetailRow = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === '') return null;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  );
};

export const SessionDetailModal: React.FC<Props> = ({
  visible,
  session,
  onClose,
  setSession,
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
    minRidersToConfirm,
    bookedSeats,
    durationMinutes,
    timeStart,
    location,
    locationDetails,
    paymentStatus,
  } = session;

  const fillPercent = totalSeats
    ? Math.round((bookedSeats / totalSeats) * 100)
    : 0;

  const mapLink =
    location?.latitude && location?.longitude
      ? mapDirection(location.latitude, location.longitude)
      : null;

  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (!visible || !session?.id) return;

    setLoadingBookings(true);

    const unsubscribe = firestore()
      .collection('slots')
      .doc(session.id)
      .collection('booking')
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBookings(list);
        setLoadingBookings(false);
      });

    return () => unsubscribe();
  }, [visible, session?.id]);

  //////////Claim
  const [claimLoading, setClaimLoading] = useState(false);

  const handleClaim = async () => {
    try {
      setClaimLoading(true);

      const response = await apiCallMethod.captureAll({
        sessionId: session?.id,
      });
      if (response.status == 200) {
        if (response?.data?.success) {
          Alert.alert('Success', 'Amount claimed successfully 💰');

          // 🔥 Update local state
          setSession((prev: any) => ({
            ...prev,
            paymentStatus: 'captured',
            status: 'claimed', // ✅ ADD THIS
          }));

          await firestore().collection('slots').doc(session.id).update({
            paymentStatus: 'captured',
            status: 'claimed',
            claimedAt: firestore.Timestamp.now(),
          });
        } else {
          throw new Error(response?.data?.message || 'Failed to claim');
        }
      }
    } catch (error: any) {
      console.log('error', error);

      const message =
        error?.response?.data?.message || // backend error
        error?.message || // fallback
        'Something went wrong';

      Alert.alert('Error', message);
    } finally {
      setClaimLoading(false);
    }
  };

  const canClaim =
    paymentStatus === 'pending' &&
    (status === 'min_reached' || status === 'full');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal]}>
          {/* IMAGE */}
          <View style={styles.imageContainer}>
            <FastImage source={{ uri: imageUrl }} style={styles.image} />

            <View style={styles.headerOverlay}>
              <Text style={styles.titleWhite}>{title}</Text>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={18} color={colors.white} />
              </TouchableOpacity>
            </View>

            {paymentStatus === 'captured' && status === 'claimed' && (
              <View style={styles.claimedBadge}>
                <Text style={styles.claimedText}>
                  Claimed & Amount Captured
                </Text>
              </View>
            )}
          </View>

          <ScrollView>
            {/* PRICE + LOCATION */}
            <View style={[styles.section, { gap: horizontalScale(10) }]}>
              <Text style={styles.price}>AED {pricePerSeat}</Text>

              {/* MAP LINK */}
              {mapLink && (
                <TouchableOpacity onPress={() => Linking.openURL(mapLink)}>
                  <Text style={styles.link}>Open in Google Maps</Text>
                </TouchableOpacity>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: horizontalScale(10),
                }}
              >
                {/* ✅ LOCATION IMAGE */}
                {locationDetails?.image ? (
                  <FastImage
                    source={{ uri: locationDetails?.image }}
                    style={styles.locationImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : null}

                <View style={{ width: horizontalScale(300) }}>
                  <Text style={styles.sub}>
                    {locationDetails?.formatted_address ||
                      locationDetails?.name ||
                      'No location'}
                  </Text>
                </View>
              </View>

              <View style={{ width: horizontalScale(300) }}>
                <Text style={styles.sub}>
                  {formatDate(timeStart, 'full')}
                </Text>
              </View>
            </View>

            {/* SESSION INFO */}
            <Accordion title="Session Info">
              <DetailRow label="Activity" value={activity} />
              <DetailRow label="Slot Status" value={status} />
              <DetailRow
                label="Duration"
                value={`${durationMinutes || 0} mins`}
              />
            </Accordion>

            {/* CAPACITY */}
            <Accordion title="Capacity">
              <DetailRow label="Total Seats" value={totalSeats} />
              <DetailRow label="Booked Seats" value={bookedSeats} />
              <DetailRow label="Min Riders" value={minRidersToConfirm} />
              <DetailRow label="Fill Rate" value={`${fillPercent}%`} />
            </Accordion>

            {/* BOAT */}
            <Accordion title="Boat">
              <DetailRow label="Name" value={boat?.boatName} />
              <DetailRow label="Model Year" value={boat?.boatModel} />
              <DetailRow label="Company" value={boat?.boatCompany} />
              <DetailRow label="Capacity" value={boat?.boatCapacity} />

              {boat?.imageUrl && (
                <FastImage
                  source={{ uri: boat.imageUrl }}
                  style={styles.subImage}
                />
              )}
            </Accordion>

            {/* CAPTAIN */}
            <Accordion title="Captain">
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
            </Accordion>

            {/* META */}
            <Accordion title="Meta">
              <DetailRow label="Session ID" value={session?.id} />
              <DetailRow
                label="Created At"
                value={formatDate(session?.createdAt)}
              />
            </Accordion>

            {/* RIDERS */}
            <Accordion title={`Riders (${bookings.length})`}>
              {loadingBookings ? (
                <Text>Loading...</Text>
              ) : bookings.length === 0 ? (
                <Text>No riders yet</Text>
              ) : (
                bookings.map((r: any) => {
                  return (
                    <View key={r.id} style={styles.riderCard}>
                      <View style={styles.riderRow}>
                        <FastImage
                          source={{
                            uri:
                              r.photoURL || 'https://via.placeholder.com/100',
                          }}
                          style={styles.avatar}
                        />

                        <View style={{ flex: 1 }}>
                          <Text style={styles.riderName}>
                            {r.displayName || r.name || 'Unknown'}
                          </Text>

                          {r.email && (
                            <Text style={styles.riderSub}>{r.email}</Text>
                          )}

                          <Text style={styles.riderStatus}>{r.status}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </Accordion>

            {canClaim && (
              <TouchableOpacity
                style={{
                  backgroundColor: claimLoading
                    ? colors.gray400
                    : colors.primary,
                  paddingVertical: 16,
                  borderRadius: 14,
                  alignItems: 'center',
                  margin: horizontalScale(10),
                  opacity: claimLoading ? 0.7 : 1,
                }}
                onPress={handleClaim}
                disabled={claimLoading}
              >
                {claimLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={{ color: colors.white }}>
                    Claim session amount
                  </Text>
                )}
              </TouchableOpacity>
            )}
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
    top: verticalScale(10),
    width: '100%',
    paddingHorizontal: horizontalScale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  claimedBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  claimedText: {
    color: colors.success,
    ...typography.cardTitle,
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
  },

  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  accordionIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },

  price: {
    ...typography.sectionTitle,
    color: colors.primary,
  },

  sub: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
    flexWrap: 'wrap',
  },

  locationImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },

  link: {
    color: colors.primary,
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

  riderCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },

  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 10,
  },

  riderName: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.textPrimary,
  },

  riderSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  riderStatus: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
});
