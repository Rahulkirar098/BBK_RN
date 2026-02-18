import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PlusCircle } from 'lucide-react-native';
import {
  colors,
  horizontalScale,
  verticalScale,
  typography,
} from '../../../../theme';

interface Props {
  onPress: () => void;
}

const RequestTripCard: React.FC<Props> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View style={styles.iconWrapper}>
          <PlusCircle size={22} color={colors.white} />
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.title}>Don't see your slot?</Text>
          <Text style={styles.subtitle}>
            Request a trip and we'll notify operators.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Text style={styles.buttonText}>Request a trip</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RequestTripCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray900,
    borderRadius: horizontalScale(16),
    padding: horizontalScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(14),
    flex: 1,
  },

  iconWrapper: {
    width: horizontalScale(40),
    height: horizontalScale(40),
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textWrapper: {
    width: '70%',
    gap: verticalScale(4),
  },

  title: {
    ...typography.boldSmall,
    color: colors.white,
  },

  subtitle: {
    ...typography.small,
    color: colors.gray400,
  },

  button: {
    backgroundColor: colors.white,
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(8),
    borderRadius: horizontalScale(10),
  },

  buttonText: {
    ...typography.boldSmall,
    color: colors.gray900,
  },
});
