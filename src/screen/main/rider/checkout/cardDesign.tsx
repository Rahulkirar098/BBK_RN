import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, horizontalScale, verticalScale } from '../../../../theme';

type Props = {
    cardNumber?: string;
    name?: string;
    expiry?: string;
};

const PaymentCardPreview: React.FC<Props> = ({
    cardNumber = '2233 4422 2244 2233',
    name = 'Ali Adel',
    expiry = '08/28',
}) => {
    return (
        <View style={styles.card}>
            {/* Decorative Circles */}
            <View style={styles.circleLarge} />
            <View style={styles.circleSmall} />

            {/* Card Content */}
            <Text style={styles.number}>{cardNumber}</Text>

            <View style={styles.bottomRow}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.expiry}>{expiry}</Text>
            </View>
        </View>
    );
};

export default PaymentCardPreview;

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.primary, // closer to your image
        borderRadius: 16,
        padding: horizontalScale(16),
        height: verticalScale(140),
        justifyContent: 'space-between',
        overflow: 'hidden',
    },

    number: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 2,
    },

    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    name: {
        color: colors.white,
        ...typography.caption,
    },

    expiry: {
        color: colors.white,
        ...typography.caption,
    },

    /* Decorative shapes */
    circleLarge: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.08)',
        top: -40,
        right: -40,
    },

    circleSmall: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.06)',
        top: 10,
        right: 10,
    },
});