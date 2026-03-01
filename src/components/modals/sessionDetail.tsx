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
import { colors, typography, verticalScale } from '../../theme';

interface SessionDetailProps {
    visible: boolean;
    session: any;
    onClose: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailProps> = ({
    visible,
    session,
    onClose,
}) => {
    if (!session) return null;

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
                        <Text style={styles.modalTitle}>
                            {session?.title || 'Session Details'}
                        </Text>

                        <TouchableOpacity onPress={onClose}>
                            <X size={20} />
                        </TouchableOpacity>
                    </View>

                    {/* BODY */}
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {Object.entries(session).map(([key, value]: any) => {
                            let displayValue = value;

                            // Firestore Timestamp
                            if (value?.toDate) {
                                displayValue = value.toDate().toLocaleString();
                            }

                            // Array
                            if (Array.isArray(value)) {
                                displayValue = value.length
                                    ? JSON.stringify(value, null, 2)
                                    : '[]';
                            }

                            // Object
                            if (
                                typeof value === 'object' &&
                                value !== null &&
                                !Array.isArray(value) &&
                                !value?.toDate
                            ) {
                                displayValue = JSON.stringify(value, null, 2);
                            }

                            return (
                                <View key={key} style={styles.detailRow}>
                                    <Text style={styles.detailKey}>{key}</Text>
                                    <Text style={styles.detailValue}>
                                        {String(displayValue)}
                                    </Text>
                                </View>
                            );
                        })}
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
        padding: 16,
    },

    modal: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        maxHeight: 500,
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

    detailRow: {
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    detailKey: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textTransform: 'capitalize',
    },

    detailValue: {
        fontSize: 14,
        color: '#111',
        marginTop: 4,
    },
});
