import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import {
  colors,
  horizontalScale,
  verticalScale,
  typography,
} from '../../../../theme';

interface Props {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const SearchBar: React.FC<Props> = ({ searchQuery, setSearchQuery }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, isFocused && styles.focusedContainer]}>
      <Search size={20} color={colors.gray400} />

      <TextInput
        style={styles.input}
        placeholder="Search by marina, activity..."
        placeholderTextColor={colors.gray400}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(14),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,

    // Shadow
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  focusedContainer: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
  },

  input: {
    flex: 1,
    marginLeft: horizontalScale(10),
    backgroundColor: 'transparent',

    ...typography.body,
    color: colors.textPrimary,
  },
});
