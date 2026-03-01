import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ship, Settings } from 'lucide-react-native';
import { colors, horizontalScale, typography } from '../../../../theme';
import FastImage from 'react-native-fast-image';

interface Props {
  riderData: any;
  navigateSetting: () => void;
}

export const RiderProfileCard = ({ riderData, navigateSetting }: Props) => {
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp?.seconds) return '';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Profile Image */}
        <FastImage source={{ uri: riderData?.photoURL, priority: FastImage.priority.normal, }} style={styles.avatar} />

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{riderData?.displayName}</Text>

          <Text style={styles.memberSince}>
            Member Since: {formatTimestamp(riderData?.userProfile?.createdAt)}
          </Text>

          {/* Trips Badge */}
          <View style={styles.badge}>
            <Ship size={14} color={colors.primary} />
            <Text style={styles.badgeText}>
              {riderData?.userProfile?.totalTrips} Trips
            </Text>
          </View>
        </View>

        {/* Settings Button */}
        <TouchableOpacity
          onPress={navigateSetting}
          style={styles.settingsButton}
        >
          <Settings size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: horizontalScale(20),
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.gray100,
  },

  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },

  name: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    marginBottom: 4,
  },

  memberSince: {
    ...typography.caption,
    color: colors.gray400,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignSelf: 'flex-start',
  },

  badgeText: {
    ...typography.boldSmall,
    color: colors.primary,
    marginLeft: 6,
  },

  settingsButton: {
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: colors.gray100,
    borderRadius: 999,
  },
});
