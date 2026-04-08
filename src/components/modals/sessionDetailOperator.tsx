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
import { Accordion, ActionButton } from '../atoms';

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
    id,
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

  const fillPercent = Math.min(100, Math.round((bookedSeats / totalSeats) * 100));

  const mapLink =
    location?.latitude && location?.longitude
      ? mapDirection(location.latitude, location.longitude)
      : null;

  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (!visible || !id) return;

    setLoadingBookings(true);

    const unsubscribe = firestore()
      .collection('slots')
      .doc(id)
      .collection('booking')
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBookings(list);
        setLoadingBookings(false);
      });

    return () => {
      unsubscribe();
      setBookings([]); // ✅ reset
    };
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
    session?.activityStatus === 'ended';

  ///////// Activity Start
  const canStart =
    (status === 'min_reached' || status === 'full') &&
    session?.activityStatus === 'not_started'; // 'not_started' | 'started' | 'ended',

  const [startLoading, setActivityStartLoading] = useState(false);

  const handleStartActivity = async () => {
    try {
      setActivityStartLoading(true);

      const startTime = firestore.Timestamp.now();

      // 🔥 Update Firestore
      await firestore().collection('slots').doc(session.id).update({
        activityStatus: 'started',
        activityStartedAt: startTime,
      });

      // 🔥 Update local state
      setSession((prev: any) => ({
        ...prev,
        activityStatus: 'started',
        activityStartedAt: startTime,
      }));

    } catch (error: any) {
      console.log('error', error);
    } finally {
      setActivityStartLoading(false);
    }
  };

  // Remaining Time Logic
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  useEffect(() => {
    if (session?.activityStatus !== 'started' || !session?.activityStartedAt) {
      return;
    }

    const calculateRemaining = () => {
      const start = session.activityStartedAt.seconds * 1000;
      const now = Date.now();

      const elapsed = Math.floor((now - start) / 1000);
      const total = (durationMinutes || 0) * 60;

      return Math.max(total - elapsed, 0);
    };

    // ✅ FIX: set immediately (no flicker)
    setRemainingTime(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();

      if (remaining <= 0) {
        setRemainingTime(0);
        clearInterval(interval);
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.activityStatus, session?.activityStartedAt]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m}m ${s}s`;
  };

  ///////// Activity End
  const [endLoading, setEndLoading] = useState(false);

  const canEnd = session?.activityStatus === 'started' &&
    remainingTime !== null &&
    remainingTime === 0;


  const handleEndActivity = async () => {
    try {
      setEndLoading(true);

      const endTime = firestore.Timestamp.now();

      await firestore().collection('slots').doc(session.id).update({
        activityStatus: 'ended',
        activityEndedAt: endTime,
      });

      setSession((prev: any) => ({
        ...prev,
        activityStatus: 'ended',
        activityEndedAt: endTime,
      }));

    } catch (error) {
      console.log(error);
    } finally {
      setEndLoading(false);
    }
  };
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


            {/* Actions */}
            {session?.activityStatus === 'started' &&
              remainingTime !== null &&
              remainingTime > 0 && (
                <Text style={{ textAlign: 'center', margin: 10 }}>
                  Remaining Time: {formatTime(remainingTime)}
                </Text>
              )}

            {canStart && (
              <ActionButton
                title="Activity start"
                onPress={handleStartActivity}
                loading={startLoading}
              />
            )}

            {canEnd && (
              <ActionButton
                title="End Activity"
                onPress={handleEndActivity}
                loading={endLoading}
              />
            )}

            {canClaim && (
              <ActionButton
                title="Claim session amount"
                onPress={handleClaim}
                loading={claimLoading}
              />
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
