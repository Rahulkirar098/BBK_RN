import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  BellRing,
  MapPin,
} from 'lucide-react-native';
import {
  IconBtn,
  Stat,
  Empty,
  Select,
  Input,
  Button,
} from '../../../components/atoms';
import { SessionCard } from '../../../components/molicules';

import {
  colors,
  horizontalScale,
  verticalScale,
  typography,
} from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

//Firebase
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  serverTimestamp,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  updateDoc,
  getDocs,
  Timestamp,
} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import { AddSlotOptions } from '../../../utils';
import { ActiveStatus, SESSION_STATUS } from '../../../type';
import { pickImageFromGallery } from '../../../utils/common_logic';
import { CreateSessionModal, SessionDetailModal } from '../../../components/modals';



const OperatorDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<ActiveStatus>('SCHEDULE');
  const [showAddSession, setShowAddSession] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [sessionForm, setSessionForm] = useState<any>({
    title: '',
    activity: '',
    date: new Date(),
    time: new Date(),
    boat: null,
    captain: null,
    image: null,
    totalSeats: 0,
    minRiders: 0,
    pricePerSeat: 0,
    durationMinutes: 0,
    location: {},
    locationDetails: {}
  });

  const handleChangeAddSlot = (key: string, value: any) => {
    setSessionForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const image = await pickImageFromGallery();
    if (image) {
      setSessionForm((prev: any) => ({
        ...prev,
        image,
      }));
    }
  };

  const handleResetSessionForm = () => {
    setSessionForm({
      title: '',
      activity: '',
      date: new Date(),
      time: new Date(),
      boat: null,
      captain: null,
      image: null,
      totalSeats: 0,
      minRiders: 0,
      pricePerSeat: 0,
      durationMinutes: 0,
      location: {},
      locationDetails: {}
    })
  }

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const validateSlot = () => {
    if (!sessionForm.title) return 'Title required';
    if (!sessionForm.activity) return 'Activity required';
    if (!sessionForm.boat) return 'Boat required';
    if (!sessionForm.captain) return 'Captain required';
    if (!sessionForm.date) return 'Date required';
    if (!sessionForm.time) return 'Time required';
    if (!sessionForm.location) return 'location required';

    if (sessionForm.totalSeats <= 0)
      return 'Total seats must be greater than 0';

    if (sessionForm.minRiders > sessionForm.totalSeats)
      return 'Min riders cannot exceed total seats';

    return null;
  };

  const handleSubmitAddSlot = async () => {
    if (isUploading) return;

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const error = validateSlot();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    try {
      setIsUploading(true);

      // ⏰ Merge Date + Time
      const start = new Date(sessionForm.date);
      start.setHours(
        sessionForm.time.getHours(),
        sessionForm.time.getMinutes(),
        0,
        0,
      );

      const now = new Date();
      const GRACE = 60 * 1000;

      // 🚫 Prevent past session
      if (start.getTime() < now.getTime() - GRACE) {
        Alert.alert('Invalid Time', 'Cannot create a session in the past.');
        return;
      }

      let imageUrl: string | null = null;

      // 📤 Upload image (if selected)
      if (sessionForm.image?.uri) {
        const imageRef = storage().ref(`slots/${uid}/${Date.now()}.jpg`);

        await imageRef.putFile(sessionForm.image.uri);
        imageUrl = await imageRef.getDownloadURL();
      }

      const selectedOption = AddSlotOptions.find(
        item => item.value === sessionForm.activity
      );

      const payload = {
        title: sessionForm.title,
        activity: sessionForm.activity,
        image: imageUrl,
        totalSeats: sessionForm.totalSeats,
        minRidersToConfirm: sessionForm.minRiders,
        pricePerSeat: sessionForm.pricePerSeat,

        // ✅ Duration calculated here
        durationMinutes: selectedOption?.durationMinutes || 0,

        boat: sessionForm.boat,
        captain: sessionForm.captain,

        timeStart: Timestamp.fromDate(start),

        date: start.toISOString(),
        time: start.toISOString(),

        userId: uid,

        bookedSeats: 0,
        ridersProfile: [],

        status: SESSION_STATUS.OPEN, // ✅ NEW

        createdAt: serverTimestamp(),
        location: sessionForm.location,
        locationDetails: sessionForm.locationDetails
      };

      await addDoc(collection(db, 'slots', uid, 'slots'), payload);

      // 🔄 Reset form
      setShowAddSession(false);

      handleResetSessionForm();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save slot');
    } finally {
      setIsUploading(false);
    }
  };

  /* -------------------- FIREBASE -------------------- */
  const [sessions, setSessions] = useState<any[]>([]);
  const [boats, setBoats] = useState<any[]>([]);
  const [captains, setCaptains] = useState<any[]>([]);
  const [requests, setRequests] = useState<any>([]);

  const app = getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, 'slots', uid, 'slots'),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map((docSnap: any) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          ...d,
          createdAt: d.createdAt?.toDate?.() ?? null,
          timeStart: d.timeStart?.toDate?.() ?? null,
        };
      });
      setSessions(data);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsubBoats = onSnapshot(
      collection(db, 'users', uid, 'boats'),
      snap => {
        setBoats(
          snap.docs.map((d: any) => ({
            id: d.data()?.id,
            ...d?.data(),
            label: d.data()?.boatName,
            value: d.data()?.id,
          })),
        );
      },
    );
    const unsubCaptains = onSnapshot(
      collection(db, 'users', uid, 'captains'),
      snap => {
        setCaptains(
          snap.docs.map((d: any) => ({
            id: d.id,
            ...d.data(),
            label: d.data().name,
            value: d.id,
          })),
        );
      },
    );
    return () => {
      unsubBoats();
      unsubCaptains();
    };
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const fetchRequests = async () => {
      const q = query(
        collection(db, 'sessions'),
        where('operatorId', '==', uid),
      );

      const snap = await getDocs(q);
      setRequests(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
    };

    fetchRequests();
  }, []);

  const boatOptions = boats.map(boat => ({
    label: boat.boatName,
    value: boat.id,
  }));

  const captainOptions = captains.map(captain => ({
    label: captain.name,
    value: captain.id,
  }));

  const onClaimRequest = async (sessionId: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await updateDoc(doc(db, 'slots', uid, 'slots', sessionId), {
      requestStatus: 'CLAIMED',
      isRequested: false,
    });
  };

  /* -------------------- FILTERS -------------------- */

  const requestedSessions = useMemo(
    () =>
      sessions.filter(
        s =>
          s.status === 'min_reached' ||
          s.status === 'full'
      ),
    [sessions],
  );

  const scheduledSessions = useMemo(
    () =>
      sessions.filter(s => {
        const d = new Date(s.timeStart);
        return (
          s.status !== SESSION_STATUS.CLAIMED &&
          s.status !== SESSION_STATUS.CANCELLED &&
          d.toDateString() === selectedDate.toDateString()
        );
      }),
    [sessions, selectedDate]
  );


  /* -------------------- WEEK DAYS -------------------- */

  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return [...Array(7)].map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(selectedDate);

  /* -------------------- STATS -------------------- */

  const totalRevenue = scheduledSessions.reduce(
    (acc, s) => acc + s.bookedSeats * s.pricePerSeat,
    0,
  );

  const avgFillRate =
    scheduledSessions.length === 0
      ? 0
      : Math.round(
        (scheduledSessions.reduce(
          (acc, s) => acc + s.bookedSeats / s.totalSeats,
          0,
        ) /
          scheduledSessions.length) *
        100,
      );

  /* -------------------- RENDER -------------------- */

  /* -------------------- MODAL -------------------- */

  const handleCloseSlotModal = () => {
    setShowAddSession(false);
    handleResetSessionForm();
  };

  /* -------------------- MODAL FOR SESSION SETAILS -------------------- */

  const [showSessionDetails, setShowSessionDetails] = useState<boolean>(false)
  const [selectedSession, setSelectedSession] = useState<any>({})

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ paddingHorizontal: horizontalScale(20) }}
        contentContainerStyle={{ paddingBottom: 120 }}
        nestedScrollEnabled
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ gap: verticalScale(5) }}>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Overview & Schedule</Text>
          </View>

          <View style={styles.tabSwitch}>
            {['SCHEDULE', 'REQUESTS'].map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab as any)}
                style={[styles.tabBtn, activeTab === tab && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
                {tab === 'REQUESTS' && requestedSessions.length > 0 && (
                  <View style={styles.dot} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <Stat
            icon={<Calendar size={14} />}
            label="Today"
            value={scheduledSessions.length}
          />
          <Stat
            icon={<DollarSign size={14} />}
            label="Revenue"
            value={`AED ${totalRevenue}`}
            primary
          />
          <Stat
            icon={<Users size={14} />}
            label="Fill Rate"
            value={`${avgFillRate}%`}
          />
          <Stat
            icon={<TrendingUp size={14} />}
            label="Requests"
            value={requestedSessions.length}
          />
        </View>

        {/* SCHEDULE */}
        {activeTab === 'SCHEDULE' && (
          <>
            {/* CALENDAR */}
            <View style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <View>
                  <Text style={styles.monthText}>
                    {selectedDate.toLocaleDateString('en-US', {
                      month: 'long',
                    })}
                  </Text>
                  <Text style={styles.monthText}>
                    {selectedDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <View style={styles.nav}>
                  <IconBtn
                    icon={<ChevronLeft />}
                    onPress={() =>
                      setSelectedDate(d => {
                        const x = new Date(d);
                        x.setDate(x.getDate() - 7);
                        return x;
                      })
                    }
                  />
                  <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
                    <Text style={styles.todayBtn}>Today</Text>
                  </TouchableOpacity>
                  <IconBtn
                    icon={<ChevronRight />}
                    onPress={() =>
                      setSelectedDate(d => {
                        const x = new Date(d);
                        x.setDate(x.getDate() + 7);
                        return x;
                      })
                    }
                  />
                </View>

                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => setShowAddSession(true)}
                >
                  <Plus size={16} color={colors.white} />
                  <Text style={styles.addText}>Add Slot</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {weekDays.map((d, i) => {
                  const selected =
                    d.toDateString() === selectedDate.toDateString();
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setSelectedDate(d)}
                      style={[styles.dayBtn, selected && styles.daySelected]}
                    >
                      <Text
                        style={[
                          styles.dayLabel,
                          { color: selected ? colors.white : '#6b7280' },
                        ]}
                      >
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Text
                        style={[
                          styles.dayNumber,
                          { color: selected ? colors.white : '#6b7280' },
                        ]}
                      >
                        {d.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* SESSIONS */}
            {scheduledSessions.length === 0 ? (
              <Empty
                text="No sessions scheduled."
                onAdd={() => setShowAddSession(true)}
              />
            ) : (
              scheduledSessions.map(session => {
                const confirmed =
                  session.bookedSeats >= session.minRidersToConfirm;
                const fill = (session.bookedSeats / session.totalSeats) * 100;
                return (
                  <SessionCard
                    key={session.id}
                    title={session.title}
                    time={
                      session.timeStart
                        ? session.timeStart.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : '--'
                    }
                    durationHours={session.durationMinutes / 60}
                    bookedSeats={session.bookedSeats}
                    totalSeats={session.totalSeats}
                    pricePerSeat={session.pricePerSeat}
                    confirmed={confirmed}
                    fillPercent={fill}
                    onPress={() => {
                      setSelectedSession(session)
                      setShowSessionDetails(true)

                    }}
                  // onEdit={() => {console.log(session)   }}
                  // onCopy={() => console.log('copy session', session.id)}
                  />
                );
              })
            )}
          </>
        )}

        {/* REQUESTS */}
        {activeTab === 'REQUESTS' &&
          (requestedSessions.length === 0 ? (
            <Empty
              icon={<BellRing size={40} />}
              text="No active rider requests."
            />
          ) : (
            requestedSessions.map(s => (
              <View key={s.id} style={styles.requestCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionTitle}>{s.title}</Text>
                  <View style={styles.requestMeta}>
                    <MapPin size={14} />
                    <Text>{s.locationDetails?.name}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.claimBtn}
                  onPress={() => onClaimRequest?.(s.id)}
                >
                  <Text style={styles.claimText}>Claim Trip</Text>
                </TouchableOpacity>
              </View>
            ))
          ))}
      </ScrollView>

      {/* MOVE MODAL HERE */}
      <SessionDetailModal
        visible={showSessionDetails}
        onClose={() => setShowSessionDetails(false)}
        session={selectedSession}
      />

      <CreateSessionModal
        visible={showAddSession}
        onClose={handleCloseSlotModal}
        boatOptions={boatOptions}
        captainOptions={captainOptions}
        boats={boats}
        captains={captains}
        handleSubmitAddSlot={handleSubmitAddSlot}
        isUploading={isUploading}
        sessionForm={sessionForm}
        handleChangeAddSlot={handleChangeAddSlot}
        formatDate={formatDate}
        formatTime={formatTime}
        pickImage={pickImage}
        showDatePicker={showDatePicker}
        showTimePicker={showTimePicker}
        setShowDatePicker={setShowDatePicker}
        setShowTimePicker={setShowTimePicker}
      />
    </SafeAreaView>
  );
};

export default OperatorDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },

  subtitle: {
    ...typography.small,
    color: colors.textSecondary,
  },

  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.gray200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabBtn: {
    padding: horizontalScale(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  tabText: {
    ...typography.boldSmall,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange500,
    marginLeft: 4,
  },

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 16,
  },

  calendarCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: verticalScale(10),
  },
  monthText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  todayBtn: {
    ...typography.boldSmall,
    color: colors.primary,
  },

  addBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  addText: {
    color: colors.white,
    fontWeight: '700',
  },

  dayBtn: {
    padding: 12,
    alignItems: 'center',
    minWidth: horizontalScale(50),
    maxWidth: horizontalScale(50),
    minHeight: verticalScale(50),
    maxHeight: verticalScale(50),
    gap: horizontalScale(8),
  },
  daySelected: {
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  dayLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  dayNumber: {
    ...typography.cardTitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  sessionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    flexDirection: 'row',
    gap: 12,
  },
  sessionTitle: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  sessionMeta: {
    ...typography.small,
    color: colors.textSecondary,
  },

  progressBar: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    marginVertical: 6,
  },

  progressFill: { height: '100%', borderRadius: 4 },

  actions: { justifyContent: 'space-between' },

  requestCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 8,
  },

  requestMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  claimBtn: {
    backgroundColor: colors.blue600,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 12,
  },

  claimText: {
    ...typography.boldSmall,
    color: colors.white,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modal: { backgroundColor: colors.white, borderRadius: 16, padding: 16 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: verticalScale(10),
  },
  modalTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },

  /* ---------- INPUTS ---------- */

  inputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },

  number: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 10,
    paddingVertical: 10,
    textAlign: 'center',
    fontWeight: '700',
    backgroundColor: colors.white,
  },

  /* ---------- ROW ---------- */
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  /* ---------- IMAGE ---------- */
  imageBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: colors.background,
  },

  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },

  /* ---------- REVENUE ---------- */
  revenueBox: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 14,
    padding: 12,
    marginVertical: 12,
  },

  revenueTitle: {
    ...typography.small,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: verticalScale(10),
    textTransform: 'uppercase',
  },

  revenueText: {
    ...typography.small,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },

  ////////// details modal

  detailRow: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  detailKey: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textTransform: "capitalize",
  },

  detailValue: {
    fontSize: 14,
    color: "#111",
    marginTop: 4,
  },

});
