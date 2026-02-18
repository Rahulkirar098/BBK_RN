import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Languages, Bell } from 'lucide-react-native';
import {
  colors,
  typography,
  horizontalScale,
  verticalScale,
} from '../../../../theme';
import { language as languageList } from '../../../../utils/constants';

interface Props {
  language: string;
  setLanguage: (lang: string) => void;
}

export const LanguageNotificationsSection = ({
  language,
  setLanguage,
}: Props) => {
  return (
    <View style={styles.card}>
      {/* LANGUAGE ROW */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Languages size={16} color={colors.primary} />
            <Text style={styles.title}>{'Language'}</Text>
          </View>

          <View style={styles.languageSelector}>
            {languageList.map(lang => {
              const isSelected = language === lang.value;

              return (
                <TouchableOpacity
                  key={lang.value}
                  onPress={() => setLanguage(lang.value)}
                  style={[
                    styles.languageButton,
                    isSelected && styles.languageButtonSelected,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.languageText,
                      isSelected && styles.languageTextSelected,
                    ]}
                  >
                    {lang.value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* NOTIFICATIONS ROW */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Bell size={16} color={colors.primary} />
            <Text style={styles.title}>{'Notifications'}</Text>
          </View>

          <TouchableOpacity
            onPress={() => {}}
            activeOpacity={0.8}
            style={[
              styles.toggle,
              //   notifications.push && styles.toggleActive,
            ]}
          >
            <View
              style={[
                styles.toggleCircle,
                // notifications.push && styles.toggleCircleActive,
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray200,
    overflow: 'hidden',
  },

  section: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(18),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },

  /* ---------- Language Selector ---------- */

  languageSelector: {
    flexDirection: 'row',
    backgroundColor: colors.gray100,
    borderRadius: 8,
    padding: 4,
  },

  languageButton: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 6,
  },

  languageButtonSelected: {
    backgroundColor: colors.white,
  },

  languageText: {
    ...typography.boldSmall,
    color: colors.gray400,
  },

  languageTextSelected: {
    color: colors.primary,
  },

  /* ---------- Toggle ---------- */

  toggle: {
    width: 40,
    height: 20,
    borderRadius: 999,
    backgroundColor: colors.gray400,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  toggleActive: {
    backgroundColor: colors.success, // make sure success exists in theme
  },

  toggleCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.white,
  },

  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
});
