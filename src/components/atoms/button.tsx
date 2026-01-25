import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { colors, horizontalScale, verticalScale } from '../../theme';

interface ButtonPropsType {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const Button = ({
  label,
  onPress,
  disabled = false,
  icon,
}: ButtonPropsType) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7} // hover/active feedback
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(12),
    borderRadius: horizontalScale(16),
    marginBottom: verticalScale(5),
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabled: {
    opacity: 0.6,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },

  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    color: colors.white,
    fontWeight: '700',
    fontSize: horizontalScale(14),
  },
});
