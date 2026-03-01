import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    Image,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import {
    MapPin,
    GalleryHorizontal
} from 'lucide-react-native';

import { Button, Input, Select } from '../atoms';
import { AddSlotOptions } from '../../utils';
import { colors, typography, verticalScale } from '../../theme';
import LocationPickerModal from './mapModal';

interface CreateSessionModalProps {
    visible: boolean;
    onClose: () => void;

    boatOptions: any;
    captainOptions: any;

    boats: any;
    captains: any;

    handleSubmitAddSlot: () => void;
    isUploading: boolean;

    sessionForm: any;
    handleChangeAddSlot: (key: string, value: any) => void;

    showDatePicker: boolean;
    showTimePicker: boolean;
    setShowDatePicker: (value: any) => void;
    setShowTimePicker: (value: any) => void;

    formatDate: (value: any) => any;
    formatTime: (value: any) => any;

    pickImage: () => void;
}

export const CreateSessionModal = ({
    visible,
    onClose,
    boatOptions,
    captainOptions,
    boats,
    captains,
    handleSubmitAddSlot,
    isUploading,
    sessionForm,
    handleChangeAddSlot,
    formatTime,
    formatDate,
    setShowDatePicker,
    showDatePicker,
    showTimePicker,
    setShowTimePicker,
    pickImage,
}: CreateSessionModalProps) => {
    const [mapVisible, setMapVisible] = useState(false);

    console.log(sessionForm?.locationDetails?.name)

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* HEADER */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>List Available Slot</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={{ fontWeight: 'bold' }}>X</Text>
                        </TouchableOpacity>
                    </View>

                    {/* BODY */}
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Input
                            placeholder="Title"
                            value={sessionForm.title}
                            onChangeText={v => handleChangeAddSlot('title', v)}
                        />

                        <Select
                            label="Activity"
                            options={AddSlotOptions}
                            value={sessionForm.activity}
                            onChange={v => handleChangeAddSlot('activity', v)}
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

                        {/* BOAT & CAPTAIN */}
                        <View style={styles.row}>
                            <Select
                                label="Boat"
                                options={boatOptions}
                                value={sessionForm.boat?.id}
                                onChange={id => {
                                    const boat = boats.find((b: any) => b.id === id);
                                    if (boat) handleChangeAddSlot('boat', boat);
                                }}
                            />

                            <Select
                                label="Captain"
                                options={captainOptions}
                                value={sessionForm.captain?.id}
                                onChange={id => {
                                    const captain = captains.find((c: any) => c.id === id);
                                    if (captain) handleChangeAddSlot('captain', captain);
                                }}
                            />
                        </View>

                        {/* IMAGE */}
                        <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                            <GalleryHorizontal size={16} />
                            <Text>Select Image</Text>
                        </TouchableOpacity>

                        {sessionForm.image?.uri && (
                            <Image
                                source={{ uri: sessionForm.image.uri }}
                                style={styles.image}
                            />
                        )}

                        <TouchableOpacity
                            style={styles.imageBtn}
                            onPress={() => setMapVisible(true)}
                        >
                            <MapPin size={16} />
                            <Text>{sessionForm?.locationDetails?.name ? sessionForm.locationDetails.name : "Add location"}</Text>
                        </TouchableOpacity>

                        {/* REVENUE FLOOR */}
                        <View style={styles.revenueBox}>
                            <Text style={styles.revenueTitle}>Guaranteed Revenue Floor</Text>

                            <View style={styles.row}>
                                <TextInput
                                    keyboardType="numeric"
                                    style={styles.number}
                                    placeholder="Seats"
                                    value={String(sessionForm.totalSeats)}
                                    onChangeText={v =>
                                        handleChangeAddSlot('totalSeats', Number(v))
                                    }
                                />
                                <TextInput
                                    keyboardType="numeric"
                                    style={styles.number}
                                    placeholder="Min Riders"
                                    value={String(sessionForm.minRiders)}
                                    onChangeText={v =>
                                        handleChangeAddSlot('minRiders', Number(v))
                                    }
                                />
                                <TextInput
                                    keyboardType="numeric"
                                    style={styles.number}
                                    placeholder="Price"
                                    value={String(sessionForm.pricePerSeat)}
                                    onChangeText={v =>
                                        handleChangeAddSlot('pricePerSeat', Number(v))
                                    }
                                />
                            </View>

                            <Text style={styles.revenueText}>
                                Trip confirms automatically when revenue hits AED{' '}
                                {sessionForm.minRiders * sessionForm.pricePerSeat}
                            </Text>
                        </View>

                        <Button
                            label={isUploading ? 'Listing...' : 'List Session'}
                            onPress={handleSubmitAddSlot}
                            disabled={isUploading}
                        />
                    </ScrollView>
                </View>
            </View>

            <LocationPickerModal
                visible={mapVisible}
                onClose={() => setMapVisible(false)}
                onSelectLocation={(loc, googlePlace) => {
                    handleChangeAddSlot('locationDetails', googlePlace);
                    handleChangeAddSlot('location', loc);
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
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10
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
        paddingVertical: 10,
        textAlign: 'center',
        fontWeight: '700',
        backgroundColor: colors.white,
    },
});
