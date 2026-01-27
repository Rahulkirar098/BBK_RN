import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Pressable,
    TextInput,
    Alert,
    Image
} from "react-native";
import {
    Calendar,
    Users,
    TrendingUp,
    DollarSign,
    Plus,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Copy,
    X,
    BellRing,
    MapPin,
} from "lucide-react-native";
import { IconBtn, Stat, Empty, SessionCard, Select } from "../../../components/atoms";
import { colors, horizontalScale, verticalScale } from "../../../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';


//Firebase
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
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

const OperatorDashboard: React.FC = () => {

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<"SCHEDULE" | "REQUESTS">("SCHEDULE");
    const [showAddSession, setShowAddSession] = useState(false);

    const AddSlotOptions = [
        { label: 'Fishing', value: 'FISHING' },
        { label: 'Cruise', value: 'CRUISE' },
        { label: 'Diving', value: 'DIVING' },
    ];

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
        totalSeats: 5,
        minRiders: 3,
        pricePerSeat: 200,
    });

    const handleChangeAddSlot = (key: string, value: any) => {
        setSessionForm((prev: any) => ({ ...prev, [key]: value }));
    };

    const pickImage = async () => {
        const res = await launchImageLibrary({ mediaType: 'photo' });
        if (res.assets?.[0]) {
            setSessionForm((p: any) => ({ ...p, image: res.assets![0] }));
        }
    };

    const formatDate = (d: Date) =>
        d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

    const formatTime = (d: Date) =>
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const validateSlot = () => {
        if (!sessionForm.title) return 'Title required';
        if (!sessionForm.boat) return 'Boat required';
        if (!sessionForm.captain) return 'Captain required';
        if (sessionForm.minRiders > sessionForm.totalSeats)
            return 'Min riders cannot exceed seats';
        return null;
    };

    const handleSubmitAddSlot = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const error = validateSlot();
        if (error) {
            Alert.alert(error);
            return;
        }

        try {
            setIsUploading(true);

            let imageUrl = null;

            if (sessionForm.image?.uri) {
                const ref = storage().ref(
                    `slots/${uid}/${Date.now()}.jpg`
                );
                await ref.putFile(sessionForm.image.uri);
                imageUrl = await ref.getDownloadURL();
            }

            const start = new Date(sessionForm.date);
            start.setHours(
                sessionForm.time.getHours(),
                sessionForm.time.getMinutes()
            );

            await addDoc(collection(db, 'slots', uid, 'slots'), {
                title: sessionForm.title,
                activity: sessionForm.activity,
                image: imageUrl,
                totalSeats: sessionForm.totalSeats,
                minRidersToConfirm: sessionForm.minRiders,
                pricePerSeat: sessionForm.pricePerSeat,
                bookedSeats: 0,
                durationMinutes: 120,
                isRequested: false,
                requestStatus: 'OPEN',
                boat: sessionForm.boat,
                captain: sessionForm.captain,
                timeStart: Timestamp.fromDate(start),
                createdAt: serverTimestamp(),
                ridersProfile: [],
                location:""
                //date
                //time
                //durationMinutes
                //
            });

            setShowAddSession(false);
            setSessionForm({
                title: '',
                activity: '',
                date: new Date(),
                time: new Date(),
                boat: null,
                captain: null,
                image: null,
                totalSeats: 5,
                minRiders: 3,
                pricePerSeat: 200,
            });
        } catch (e) {
            console.error(e);
            Alert.alert('Failed to create slot');
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
            orderBy('createdAt', 'desc')
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
                    }))
                );
            }
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
                    }))
                );
            }
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
                where('operatorId', '==', uid)
            );

            const snap = await getDocs(q);
            setRequests(
                snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
            );
        };

        fetchRequests();
    }, []);

    const boatOptions = boats.map(b => ({
        label: b.boatName,
        value: b.id,
    }));

    const captainOptions = captains.map(c => ({
        label: c.name,
        value: c.id,
    }));

    const onClaimRequest = async (sessionId: string) => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        await updateDoc(
            doc(db, 'slots', uid, 'slots', sessionId),
            {
                requestStatus: 'CLAIMED',
                isRequested: false,
            }
        );
    };

    /* -------------------- FILTERS -------------------- */

    const requestedSessions = useMemo(
        () => sessions.filter(s => s.isRequested && s.requestStatus === "OPEN"),
        [sessions]
    );

    const scheduledSessions = useMemo(
        () =>
            sessions.filter(s => {
                const d = new Date(s.timeStart);
                return (
                    !s.isRequested &&
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

    /* -------------------- RENDER -------------------- */

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={{ paddingHorizontal: horizontalScale(20) }}
                contentContainerStyle={{ paddingBottom: 120 }}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Dashboard</Text>
                        <Text style={styles.subtitle}>Overview & Schedule</Text>
                    </View>

                    <View style={styles.tabSwitch}>
                        {["SCHEDULE", "REQUESTS"].map(tab => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab as any)}
                                style={[
                                    styles.tabBtn,
                                    activeTab === tab && styles.tabActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === tab && styles.tabTextActive,
                                    ]}
                                >
                                    {tab}
                                </Text>
                                {tab === "REQUESTS" && requestedSessions.length > 0 && (
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
                        value={scheduledSessions.length} />
                    <Stat
                        icon={<DollarSign size={14} />}
                        label="Revenue"
                        value={`AED ${totalRevenue}`}
                        primary
                    />
                    <Stat
                        icon={<Users size={14} />}
                        label="Fill Rate"
                        value={`${avgFillRate}%`} />
                    <Stat
                        icon={<TrendingUp size={14} />}
                        label="Requests"
                        value={requestedSessions.length}
                    />
                </View>

                {/* SCHEDULE */}
                {activeTab === "SCHEDULE" && (
                    <>
                        {/* CALENDAR */}
                        <View style={styles.calendarCard}>
                            <View style={styles.calendarHeader}>
                                <View>
                                    <Text style={styles.monthText}>
                                        {selectedDate.toLocaleDateString("en-US", {
                                            month: "long",
                                        })}
                                    </Text>
                                    <Text style={styles.monthText}>
                                        {selectedDate.toLocaleDateString("en-US", {
                                            year: "numeric",
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
                                    <Plus size={16} color="#fff" />
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
                                            style={[
                                                styles.dayBtn,
                                                selected && styles.daySelected,
                                            ]}
                                        >
                                            <Text style={[styles.dayLabel, { color: selected ? colors.white : "#6b7280" }]}>
                                                {d.toLocaleDateString("en-US", { weekday: "short" })}
                                            </Text>
                                            <Text style={[styles.dayNumber, { color: selected ? colors.white : "#6b7280" }]}>{d.getDate()}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* SESSIONS */}
                        {scheduledSessions.length === 0 ? (
                            <Empty text="No sessions scheduled." onAdd={() => setShowAddSession(true)} />
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
                                        // onEdit={() => onEditSession(session)}
                                    // onCopy={() => console.log('copy session', session.id)}
                                    />
                                );
                            })
                        )}
                    </>
                )}

                {/* REQUESTS */}
                {activeTab === "REQUESTS" &&
                    (requestedSessions.length === 0 ? (
                        <Empty icon={<BellRing size={40} />} text="No active rider requests." />
                    ) : (
                        requestedSessions.map(s => (
                            <View key={s.id} style={styles.requestCard}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.sessionTitle}>{s.title}</Text>
                                    <View style={styles.requestMeta}>
                                        <MapPin size={14} />
                                        <Text>{s.location}</Text>
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

                {/* ADD SESSION MODAL */}
                <Modal visible={showAddSession} transparent animationType="fade">
                    <Pressable
                        style={styles.overlay}
                        onPress={() => setShowAddSession(false)}
                    >
                        <Pressable style={styles.modal} onPress={() => { }}>

                            {/* HEADER */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>List Available Slot</Text>
                                <TouchableOpacity onPress={() => setShowAddSession(false)}>
                                    <X size={20} />
                                </TouchableOpacity>
                            </View>

                            {/* BODY */}
                            <ScrollView showsVerticalScrollIndicator={false}>

                                {/* TITLE */}
                                <TextInput
                                    placeholder="Title"
                                    style={styles.input}
                                    value={sessionForm.title}
                                    onChangeText={(v) => handleChangeAddSlot('title', v)}
                                />

                                {/* ACTIVITY */}
                                <Select
                                    label="Activity"
                                    options={AddSlotOptions}
                                    value={sessionForm.activity}
                                    onChange={(v) => handleChangeAddSlot('activity', v)}
                                />

                                {/* DATE & TIME */}
                                <View style={styles.row}>
                                    <TouchableOpacity
                                        style={styles.inputBox}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text>{formatDate(sessionForm.date)}</Text>
                                    </TouchableOpacity>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={sessionForm.date}
                                            mode="date"
                                            onChange={(_, d) => {
                                                setShowDatePicker(false);
                                                d && handleChangeAddSlot('date', d);
                                            }}
                                        />
                                    )}

                                    {showTimePicker && (
                                        <DateTimePicker
                                            value={sessionForm.time}
                                            mode="time"
                                            onChange={(_, d) => {
                                                setShowTimePicker(false);
                                                d && handleChangeAddSlot('time', d);
                                            }}
                                        />
                                    )}

                                    <TouchableOpacity
                                        style={styles.inputBox}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <Text>{formatTime(sessionForm.time)}</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* BOAT */}
                                <Select
                                    label="Boat"
                                    options={boatOptions}
                                    value={sessionForm.boat?.label}
                                    onChange={(v) => {
                                        const boat = boats.find(b => b.id === v);
                                        boat && handleChangeAddSlot('boat', {
                                            ...boat,
                                            label: boat.boatName,
                                        });
                                    }}
                                />

                                {/* CAPTAIN */}
                                <Select
                                    label="Captain"
                                    options={captainOptions}
                                    value={sessionForm.captain?.label}
                                    onChange={(v) => {
                                        const captain = captains.find(c => c.id === v);
                                        captain && handleChangeAddSlot('captain', {
                                            ...captain,
                                            label: captain.name,
                                        });
                                    }}
                                />


                                {/* IMAGE */}
                                <TouchableOpacity
                                    style={styles.imageBtn}
                                    onPress={pickImage}
                                >
                                    <Text>Select Image</Text>
                                </TouchableOpacity>

                                {sessionForm.image?.uri && (
                                    <Image
                                        source={{ uri: sessionForm.image.uri }}
                                        style={styles.image}
                                    />
                                )}

                                {/* REVENUE FLOOR */}
                                <View style={styles.revenueBox}>
                                    <Text style={styles.revenueTitle}>
                                        Guaranteed Revenue Floor
                                    </Text>

                                    <View style={styles.row}>
                                        <TextInput
                                            keyboardType="numeric"
                                            style={styles.number}
                                            placeholder="Seats"
                                            value={String(sessionForm.totalSeats)}
                                            onChangeText={(v) =>
                                                handleChangeAddSlot('totalSeats', Number(v))
                                            }
                                        />
                                        <TextInput
                                            keyboardType="numeric"
                                            style={styles.number}
                                            placeholder="Min Riders"
                                            value={String(sessionForm.minRiders)}
                                            onChangeText={(v) =>
                                                handleChangeAddSlot('minRiders', Number(v))
                                            }
                                        />
                                        <TextInput
                                            keyboardType="numeric"
                                            style={styles.number}
                                            placeholder="Price"
                                            value={String(sessionForm.pricePerSeat)}
                                            onChangeText={(v) =>
                                                handleChangeAddSlot('pricePerSeat', Number(v))
                                            }
                                        />
                                    </View>

                                    <Text style={styles.revenueText}>
                                        Trip confirms automatically when revenue hits AED{' '}
                                        {sessionForm.minRiders * sessionForm.pricePerSeat}
                                    </Text>
                                </View>

                                {/* SUBMIT */}
                                <TouchableOpacity
                                    style={[
                                        styles.primaryBtn,
                                        isUploading && { opacity: 0.6 },
                                    ]}
                                    disabled={isUploading}
                                    onPress={handleSubmitAddSlot}
                                >
                                    <Text style={styles.primaryText}>
                                        {isUploading ? 'Listing...' : 'List Session'}
                                    </Text>
                                </TouchableOpacity>

                            </ScrollView>
                        </Pressable>
                    </Pressable>
                </Modal>

            </ScrollView>
        </SafeAreaView>
    );
};

export default OperatorDashboard;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    header: { flexDirection: "row", justifyContent: "space-between" },
    title: { fontSize: 22, fontWeight: "800" },
    subtitle: { color: "#6b7280", fontSize: 12 },

    tabSwitch: {
        flexDirection: "row",
        backgroundColor: "#e5e7eb",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    tabBtn: { padding: 8, flexDirection: "row", alignItems: "center" },
    tabActive: { backgroundColor: colors.white, borderRadius: 10 },
    tabText: { fontSize: 12, color: "#6b7280", fontWeight: "700" },
    tabTextActive: { color: "#111827" },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#f97316", marginLeft: 4 },

    statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginVertical: 16 },

    calendarCard: {
        backgroundColor: colors.white, borderRadius: 16, padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    calendarHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        marginVertical: verticalScale(10)
    },
    monthText: { fontWeight: "800" },
    nav: { flexDirection: "row", alignItems: "center", gap: 8 },
    todayBtn: { fontSize: 12, fontWeight: "700" },
    addBtn: {
        flexDirection: "row",
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 12,
        alignItems: "center",
        gap: 6,
    },
    addText: { color: colors.white, fontWeight: "700" },

    dayBtn: { padding: 12, alignItems: "center", minWidth: 50 },
    daySelected: { backgroundColor: colors.primary, borderRadius: 12 },
    dayLabel: { fontSize: 10, color: "#6b7280" },
    dayNumber: { fontSize: 16, fontWeight: "800", color: "#6b7280" },

    sessionCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginVertical: 6,
        flexDirection: "row",
        gap: 12,
    },
    sessionTitle: { fontWeight: "800", fontSize: 16 },
    sessionMeta: { fontSize: 12, color: "#6b7280" },

    progressBar: {
        height: 6,
        backgroundColor: "#e5e7eb",
        borderRadius: 4,
        marginVertical: 6,
    },
    progressFill: { height: "100%", borderRadius: 4 },

    actions: { justifyContent: "space-between" },

    requestCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        marginBottom: 8,
    },

    requestMeta: { flexDirection: "row", alignItems: "center", gap: 4 },

    claimBtn: {
        backgroundColor: "#2563eb",
        paddingHorizontal: 16,
        justifyContent: "center",
        borderRadius: 12,
    },
    claimText: { color: colors.white, fontWeight: "800" },

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        padding: 16,
    },
    modal: { backgroundColor: colors.white, borderRadius: 16, padding: 16 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between" },
    modalTitle: { fontWeight: "800", fontSize: 18 },

    primaryBtn: {
        backgroundColor: "#2563eb",
        padding: 14,
        borderRadius: 14,
        marginTop: 20,
    },
    primaryText: { color: colors.white, textAlign: "center", fontWeight: "800" },


    /* ---------- INPUTS ---------- */
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
        backgroundColor: colors.white,
    },

    inputBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },

    number: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#BFDBFE',
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
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#F9FAFB',
    },

    image: {
        width: '100%',
        height: 160,
        borderRadius: 12,
        marginBottom: 12,
    },

    /* ---------- REVENUE ---------- */
    revenueBox: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#DBEAFE',
        borderRadius: 14,
        padding: 12,
        marginVertical: 12,
    },

    revenueTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: 8,
        textTransform: 'uppercase',
    },

    revenueText: {
        fontSize: 11,
        color: colors.primary,
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '600',
    },

    /* ---------- BUTTON ---------- */

});
