import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  colors,
  typography,
  horizontalScale,
  verticalScale,
} from '../../../../theme';

interface Props {
  goBack: () => void;
}

export const SettingsHeader = ({ goBack }: Props) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={goBack}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <ArrowLeft size={20} color={colors.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>{'Settings'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    padding: horizontalScale(8),
    borderRadius: 999,
    backgroundColor: 'transparent',
    marginRight: horizontalScale(12),
  },

  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
});
