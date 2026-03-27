import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  BellRing,
  MapPin,
} from 'lucide-react-native';
import {
  Stat,
  Empty,
} from '../../../../components/atoms';
import { SessionCard } from '../../../../components/molicules';

import {
  colors,
  horizontalScale,
  verticalScale,
  typography,
} from '../../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

// Firebase
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
} from '@react-native-firebase/firestore';

import { ActiveStatus, SESSION_STATUS } from '../../../../type';

import {
  CreateSessionModal,
  SessionDetailModal,
} from '../../../../components/modals';

import { listenUserCollection } from '../../../../services';
import OperatorDashboardHeader from './header';
import DashboardCalendar from './calendar';

const OperatorDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<ActiveStatus>('SCHEDULE');
  const [showAddSession, setShowAddSession] = useState(false);

  /* -------------------- FIREBASE -------------------- */
  const [sessions, setSessions] = useState<any[]>([]);

  const app = getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const uid: any = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, 'slots'),
      where('operator_id', '==', uid)
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const list = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSessions(list);
    });

    return unsubscribe;
  }, [uid]);

  const [activities, setActivities] = useState<any[]>([]);
  const [boats, setBoats] = useState<any[]>([]);
  const [captains, setCaptains] = useState<any[]>([]);

  useEffect(() => {
    if (!uid) return;

    const unsubActivities = listenUserCollection(
      'activities',
      uid,
      setActivities
    );

    const unsubBoats = listenUserCollection(
      'boats',
      uid,
      setBoats
    );

    const unsubCaptains = listenUserCollection(
      'captains',
      uid,
      setCaptains
    );

    return () => {
      unsubActivities();
      unsubBoats();
      unsubCaptains();
    };
  }, [uid]);

  const onClaimRequest = async (sessionId: string) => {
    if (!uid) return;

    await updateDoc(doc(db, 'slots', sessionId), {
      requestStatus: 'CLAIMED',
      isRequested: false,
    });
  };

  /* -------------------- FILTERS -------------------- */

  const requestedSessions = useMemo(
    () =>
      sessions.filter(
        s =>
          s.status === SESSION_STATUS.MIN_REACHED ||
          s.status === SESSION_STATUS.FULL
      ),
    [sessions]
  );

  const scheduledSessions = useMemo(
    () =>
      sessions.filter(s => {
        if (!s.timeStart) return false;

        const d = s.timeStart.toDate();

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

  const weekDays = useMemo(
    () => getWeekDays(selectedDate),
    [selectedDate]
  );

  /* -------------------- STATS -------------------- */

  const totalRevenue = scheduledSessions.reduce(
    (acc, s) => acc + s.bookedSeats * s.pricePerSeat,
    0
  );

  const avgFillRate =
    scheduledSessions.length === 0
      ? 0
      : Math.round(
          (scheduledSessions.reduce(
            (acc, s) => acc + s.bookedSeats / s.totalSeats,
            0
          ) /
            scheduledSessions.length) *
            100
        );

  /* -------------------- SESSION DETAILS -------------------- */

  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>({});

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ paddingHorizontal: horizontalScale(20) }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <OperatorDashboardHeader
          title="Dashboard"
          subtitle="Overview & Schedule"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={['SCHEDULE', 'REQUESTS']}
          showDotOn="REQUESTS"
          dotCount={requestedSessions.length}
        />

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

        {activeTab === 'SCHEDULE' && (
          <>
            <DashboardCalendar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              weekDays={weekDays}
              onAddPress={() => setShowAddSession(true)}
            />

            {scheduledSessions.length === 0 ? (
              <Empty
                text="No sessions scheduled."
                onAdd={() => setShowAddSession(true)}
              />
            ) : (
              scheduledSessions.map(session => {
                const confirmed =
                  session.bookedSeats >= session.minRidersToConfirm;

                const fill =
                  (session.bookedSeats / session.totalSeats) * 100;

                return (
                  <SessionCard
                    key={session.id}
                    title={session.title}
                    time={
                      session.timeStart
                        ? session.timeStart
                            .toDate()
                            .toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                        : '--'
                    }
                    durationHours={session.durationMinutes}
                    bookedSeats={session.bookedSeats}
                    totalSeats={session.totalSeats}
                    pricePerSeat={session.pricePerSeat}
                    confirmed={confirmed}
                    fillPercent={fill}
                    onPress={() => {
                      setSelectedSession(session);
                      setShowSessionDetails(true);
                    }}
                  />
                );
              })
            )}
          </>
        )}

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
                  onPress={() => onClaimRequest(s.id)}
                >
                  <Text style={styles.claimText}>Claim Trip</Text>
                </TouchableOpacity>
              </View>
            ))
          ))}
      </ScrollView>

      <SessionDetailModal
        visible={showSessionDetails}
        onClose={() => setShowSessionDetails(false)}
        session={selectedSession}
      />

      <CreateSessionModal
        visible={showAddSession}
        onClose={() => setShowAddSession(false)}
        boats={boats}
        captains={captains}
        activities={activities}
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

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 16,
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
