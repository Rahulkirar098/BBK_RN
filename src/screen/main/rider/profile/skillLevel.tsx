import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from '../../../../theme';

enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

interface Props {
  skillLevel: string;
  setSkillLevel: (data: string) => void;
}

export const SkillLevelSelector = ({ skillLevel, setSkillLevel }: Props) => {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Skill Level</Text>

      {/* Selector Box */}
      <View style={styles.selectorWrapper}>
        {[
          SkillLevel.BEGINNER,
          SkillLevel.INTERMEDIATE,
          SkillLevel.ADVANCED,
        ].map(level => {
          const isSelected = skillLevel.toUpperCase() === level.toUpperCase();

          return (
            <TouchableOpacity
              key={level}
              onPress={() => setSkillLevel(level)}
              style={[styles.optionButton, isSelected && styles.selectedButton]}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.optionText, isSelected && styles.selectedText]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Helper Text */}
      <Text style={styles.helperText}>
        This helps captains prepare the gear for you.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },

  title: {
    ...typography.cardTitle,
    color: colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  selectorWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  selectedButton: {
    backgroundColor: colors.primary,
  },

  optionText: {
    ...typography.boldSmall,
    color: colors.gray400,
  },

  selectedText: {
    color: colors.white,
  },

  helperText: {
    ...typography.caption,
    color: colors.gray400,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
