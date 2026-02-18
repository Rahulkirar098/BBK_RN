import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, typography } from '../../theme';

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  primary?: boolean;
}

export const Stat: React.FC<StatProps> = ({
  icon,
  label,
  value,
  primary,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon}
        <Text
          style={[
            styles.label,
            primary && styles.primaryText,
          ]}
        >
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.value,
          primary && styles.primaryText,
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: (Dimensions.get('window').width - 55) / 2,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  label: {
    ...typography.caption,
    color: colors.gray400,
    textTransform: 'uppercase',
    marginLeft: 6,
  },

  value: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },

  primaryText: {
    color: colors.primary,
  },
});
