import React from 'react';
import {
    Text,
    TouchableOpacity,
    StyleSheet,
    View,
} from 'react-native';
import { colors } from '../../theme';

interface EmptyProps {
    text: string;
    icon?: React.ReactNode;
    onAdd?: () => void;
}

export const Empty: React.FC<EmptyProps> = ({ text, icon, onAdd }) => {
    return (
        <View style={emptyStyles.container}>
            {icon && <View style={emptyStyles.icon}>{icon}</View>}
            <Text style={emptyStyles.text}>{text}</Text>

            {onAdd && (
                <TouchableOpacity onPress={onAdd}>
                    <Text style={emptyStyles.add}>+ List an empty slot</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const emptyStyles = StyleSheet.create({
    container: {
        backgroundColor: "#f9fafb",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderStyle: "dashed",
        paddingVertical: 48,
        alignItems: "center",
        marginTop: 20,
    },
    icon: {
        marginBottom: 12,
    },
    text: {
        color: "#9ca3af",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    add: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: "800",
    },
});
