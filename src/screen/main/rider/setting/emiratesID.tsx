import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BadgeCheck, Camera } from 'lucide-react-native';
import { colors, typography, horizontalScale, verticalScale } from '../../../../theme';

interface Props {
  onUploadFront?: () => void;
  onUploadBack?: () => void;
}

export const EmiratesIdSection = ({ onUploadFront, onUploadBack }: Props) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <BadgeCheck size={16} color={colors.primary} />
        <Text style={styles.headerText}>{'Emirates ID'}</Text>
      </View>

      {/* ID Upload Boxes */}
      <View style={styles.grid}>
        <UploadBox label={'Front'} onPress={onUploadFront} />
        <UploadBox label={'Back'} onPress={onUploadBack} />
      </View>
    </View>
  );
};

const UploadBox = ({ label, onPress }: any) => (
  <TouchableOpacity
    style={styles.uploadBox}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <View style={styles.cameraWrapper}>
      <Camera size={16} color={colors.gray400} />
    </View>

    <Text style={styles.uploadLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: horizontalScale(20),
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    gap: horizontalScale(8),
  },

  headerText: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  uploadBox: {
    width: '48%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.gray100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraWrapper: {
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 999,
    marginBottom: 6,
  },

  uploadLabel: {
    ...typography.caption,
    color: colors.gray400,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
});
