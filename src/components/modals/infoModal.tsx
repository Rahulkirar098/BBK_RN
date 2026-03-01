import React from 'react'
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, horizontalScale } from '../../theme';
import { X } from 'lucide-react-native';

export const InfoModal = ({ onClose, label }: { onClose?: () => void, label: string }) => {
    return (
        <Modal visible={true}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text>{label}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={20} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                    <Text>
                        When you book this slot 
                    </Text>
                </View>
            </View>
        </Modal>
    )
}


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: horizontalScale(20),
    },
    container: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        maxHeight: '90%',
        overflow: 'hidden',
        padding: horizontalScale(20)
    },
    closeBtn: {
        width: horizontalScale(30),
        height: horizontalScale(30),
        backgroundColor: colors.gray900,
        borderRadius: horizontalScale(20),
        justifyContent: "center",
        alignItems: "center",
    },
});