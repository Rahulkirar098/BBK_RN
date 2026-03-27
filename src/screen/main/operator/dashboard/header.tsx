import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, horizontalScale, verticalScale } from '../../../../theme';

type Props = {
    title: string;
    subtitle?: string;
    activeTab: string;
    setActiveTab: any;
    tabs: string[];
    showDotOn?: string; // optional: show dot on specific tab
    dotCount?: number;
};

const OperatorDashboardHeader: React.FC<Props> = ({
    title,
    subtitle,
    activeTab,
    setActiveTab,
    tabs,
    showDotOn,
    dotCount = 0,
}) => {
    return (
        <View style={styles.header}>
            {/* LEFT SIDE */}
            <View style={{ gap: verticalScale(5) }}>
                <Text style={styles.title}>{title}</Text>
                {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {/* RIGHT SIDE (TABS) */}
            <View style={styles.tabSwitch}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
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

                        {showDotOn === tab && dotCount > 0 && (
                            <View style={styles.dot} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default OperatorDashboardHeader;

const styles = StyleSheet.create({
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
});