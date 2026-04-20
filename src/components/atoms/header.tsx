import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

type Props = {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
};

export const ScreenHeader: React.FC<Props> = ({
  title,
  onBack,
  rightComponent,
}) => {
  return (
    <View style={styles.header}>
      {/* Left */}
      <TouchableOpacity
        onPress={onBack}
        disabled={!onBack}
        style={styles.side}
      >
        {onBack && <ArrowLeft size={22} />}
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>

      {/* Right */}
      <View style={styles.side}>
        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  side: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});