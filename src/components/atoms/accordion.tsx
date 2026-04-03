import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, horizontalScale, typography } from '../../theme';

export const Accordion = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setOpen(!open)}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.accordionIcon}>{open ? '−' : '+'}</Text>
      </TouchableOpacity>

      {open && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: horizontalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  sectionTitle: {
    ...typography.cardTitle,
  },

  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  accordionIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },

  content: {
    marginTop: 10,
  },
});