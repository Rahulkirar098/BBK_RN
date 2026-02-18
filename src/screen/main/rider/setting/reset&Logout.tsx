import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RefreshCw, LogOut } from 'lucide-react-native';
import { colors, verticalScale } from '../../../../theme';
import { OutlinedButton } from '../../../../components/atoms';

interface Props {
  onResetData?: () => void;
  onLogout?: () => void;
}

export const SettingsActions = ({ onResetData, onLogout }: Props) => {
  return (
    <View style={styles.container}>
      {onResetData && (
        <OutlinedButton
          label="Reset App Data"
          onPress={onResetData}
          Icon={RefreshCw}
          color={colors.gray400}
        />
      )}

      {onLogout && (
        <OutlinedButton
          label="Logout"
          onPress={onLogout}
          Icon={LogOut}
          color={colors.error}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(12),
  },
});
