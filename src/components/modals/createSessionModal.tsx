import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Image,
    Alert,
    TextInput,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { MapPin, GalleryHorizontal } from 'lucide-react-native';

import { Button, Input, Select } from '../atoms';
import {
    colors,
    horizontalScale,
    typography,
    verticalScale,
} from '../../theme';

import LocationPickerModal from './mapModal';

import { getAuth } from '@react-native-firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    Timestamp,
} from '@react-native-firebase/firestore';

import storage from '@react-native-firebase/storage';

import { pickImageFromGallery } from '../../utils/common_logic';
import { SESSION_STATUS } from '../../type';

export const CreateSessionModal = ({
    visible,
    onClose,
    boats,
    captains,
    activities,
    onSuccess,
}: any) => {
    const auth = getAuth();
    const db = getFirestore();

    const [isUploading, setIsUploading] = useState(false);
    const [mapVisible, setMapVisible] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [form, setForm] = useState<any>({
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
        location: {},
        locationDetails: {},
    });

    const handleChange = (key: string, value: any) => {
        setForm((p: any) => ({ ...p, [key]: value }));
    };

    const formatDate = (d: Date) =>
        d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

    const formatTime = (d: Date) =>
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const validate = () => {
        if (!form.title) return 'Title required';
        if (!form.activity) return 'Activity required';
        if (!form.boat) return 'Boat required';
        if (!form.captain) return 'Captain required';
        if (!form.location?.latitude) return 'Location required';

        if (form.totalSeats <= 0) return 'Seats must be > 0';
        if (form.minRiders > form.totalSeats)
            return 'Min riders cannot exceed seats';

        return null;
    };

    const handleSubmit = async () => {
        if (isUploading) return;

        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const error = validate();
        if (error) {
            Alert.alert('Error', error);
            return;
        }

        try {
            setIsUploading(true);

            const start = new Date(form.date);
            start.setHours(form.time.getHours(), form.time.getMinutes());

            let imageUrl = null;

            if (form.image?.uri) {
                const ref = storage().ref(`slots/${uid}/${Date.now()}.jpg`);
                await ref.putFile(form.image.uri);
                imageUrl = await ref.getDownloadURL();
            }

            const selectedActivity = activities.find(
                (a: any) => a.value === form.activity
            );

            await addDoc(collection(db, 'slots'), {
                ...form,
                image: imageUrl,
                durationMinutes: selectedActivity?.durationMinutes || 0,
                timeStart: Timestamp.fromDate(start),
                status: SESSION_STATUS.OPEN,
                bookedSeats: 0,
                createdAt: serverTimestamp(),
                operator_id: uid,
            });

            onSuccess?.();
            onClose();

            setForm({
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
                location: {},
                locationDetails: {},
            });
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'Failed to create session');
        } finally {
            setIsUploading(false);
        }
    };

    const pickImage = async () => {
        const img = await pickImageFromGallery();
        if (img) handleChange('image', img);
    };

    const boatOptions = boats.map((b: any) => ({
        label: b.boatName,
        value: b.id,
    }));

    const captainOptions = captains.map((c: any) => ({
        label: c.name,
        value: c.id,
    }));

    const revenue =
        form.minRiders * form.pricePerSeat || 0;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* HEADER */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Create Session</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.close}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Input
                            placeholder="Session title"
                            value={form.title}
                            onChangeText={v => handleChange('title', v)}
                        />

                        <Select
                            label="Activity"
                            options={activities}
                            value={form.activity}
                            onChange={v => handleChange('activity', v)}
                        />

                        {/* DATE & TIME */}
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={styles.inputBox}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text>{formatDate(form.date)}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.inputBox}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Text>{formatTime(form.time)}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* PICKERS */}
                        {showDatePicker && (
                            <DateTimePicker
                                value={form.date}
                                mode="date"
                                onChange={(_, d) => {
                                    setShowDatePicker(false);
                                    d && handleChange('date', d);
                                }}
                            />
                        )}

                        {showTimePicker && (
                            <DateTimePicker
                                value={form.time}
                                mode="time"
                                onChange={(_, d) => {
                                    setShowTimePicker(false);
                                    d && handleChange('time', d);
                                }}
                            />
                        )}

                        {/* BOAT + CAPTAIN */}
                        <View style={styles.row}>
                            <Select
                                label="Boat"
                                options={boatOptions}
                                value={form.boat?.id}
                                onChange={id =>
                                    handleChange(
                                        'boat',
                                        boats.find((b: any) => b.id === id)
                                    )
                                }
                            />

                            <Select
                                label="Captain"
                                options={captainOptions}
                                value={form.captain?.id}
                                onChange={id =>
                                    handleChange(
                                        'captain',
                                        captains.find((c: any) => c.id === id)
                                    )
                                }
                            />
                        </View>

                        {/* IMAGE */}
                        <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                            <GalleryHorizontal size={16} />
                            <Text>Select Image</Text>
                        </TouchableOpacity>

                        {form.image?.uri && (
                            <Image source={{ uri: form.image.uri }} style={styles.image} />
                        )}

                        {/* LOCATION */}
                        <TouchableOpacity
                            style={styles.imageBtn}
                            onPress={() => setMapVisible(true)}
                        >
                            <MapPin size={16} />
                            <Text>
                                {form.locationDetails?.name || 'Add location'}
                            </Text>
                        </TouchableOpacity>

                        {/* REVENUE */}
                        <View style={styles.revenueBox}>
                            <Text style={styles.revenueTitle}>Revenue Setup</Text>

                            <View style={styles.row}>
                                <TextInput
                                    placeholder="Seats"
                                    keyboardType="numeric"
                                    style={styles.number}
                                    value={String(form.totalSeats)}
                                    onChangeText={v =>
                                        handleChange('totalSeats', Number(v))
                                    }
                                />

                                <TextInput
                                    placeholder="Min Riders"
                                    keyboardType="numeric"
                                    style={styles.number}
                                    value={String(form.minRiders)}
                                    onChangeText={v =>
                                        handleChange('minRiders', Number(v))
                                    }
                                />

                                <TextInput
                                    placeholder="Price"
                                    keyboardType="numeric"
                                    style={styles.number}
                                    value={String(form.pricePerSeat)}
                                    onChangeText={v =>
                                        handleChange('pricePerSeat', Number(v))
                                    }
                                />
                            </View>

                            <Text style={styles.revenueText}>
                                Trip confirms automatically when revenue hits AED{' '}{revenue}
                            </Text>
                        </View>

                        <Button
                            label={isUploading ? 'Creating...' : 'Create Session'}
                            onPress={handleSubmit}
                            disabled={isUploading}
                        />
                    </ScrollView>
                </View>
            </View>

            <LocationPickerModal
                visible={mapVisible}
                onClose={() => setMapVisible(false)}
                onSelectLocation={(loc, place) => {
                    handleChange('location', loc);
                    handleChange('locationDetails', place);
                }}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 16,
    },

    modal: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        maxHeight: '90%',
    },

    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: verticalScale(10),
    },

    modalTitle: {
        ...typography.sectionTitle,
        color: colors.textPrimary,
    },

    close: {
        fontSize: 18,
        fontWeight: '600',
    },

    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },

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

    imageBtn: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingVertical: 12,
        marginBottom: 12,
        backgroundColor: colors.background,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },

    image: {
        width: '100%',
        height: 160,
        borderRadius: 12,
        marginBottom: 12,
    },

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

    number: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.primaryBorder,
        borderRadius: 10,
        textAlign: 'center',
        fontWeight: '700',
        backgroundColor: colors.white,
        padding: horizontalScale(10),
    },
});