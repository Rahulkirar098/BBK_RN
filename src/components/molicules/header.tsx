import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { HelpCircle } from 'lucide-react-native';
import { colors, typography } from '../../theme';
import { StyleSheet } from 'react-native';

export const Header = ({ onPressHelp }: { onPressHelp: () => void }) => {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Left Section */}
        <View style={styles.left}>
          {/* Logo Box */}
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>BBS</Text>
          </View>

          {/* Brand Text */}
          <View>
            <Text style={styles.brandText}>BookBySeat</Text>
            <Text style={styles.locationText}>Dubai</Text>
          </View>
        </View>

        {/* Help Button */}
        <TouchableOpacity
          style={styles.helpButton}
          onPress={onPressHelp}
          activeOpacity={0.7}
        >
          <HelpCircle size={20} color={colors.gray400} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },

  container: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },

  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 16,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,

    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  logoText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: -0.5,
  },

  brandText: {
    ...typography.sectionTitle,
    color: colors.primary,
  },

  locationText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  helpButton: {
    padding: 10,
    backgroundColor: colors.gray100,
    borderRadius: 20,
  },
});
