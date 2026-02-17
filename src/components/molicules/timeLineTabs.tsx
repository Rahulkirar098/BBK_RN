import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography } from '../../theme';

type TimeFilter = 'NOW' | 'TOMORROW' | 'THIS_WEEK';

interface Props {
  selectedTab: TimeFilter;
  setSelectedTab: (tab: TimeFilter) => void;
  t: {
    now: string;
    tomorrow: string;
    thisWeek: string;
  };
}

export const TimeFilterBar: React.FC<Props> = ({
  selectedTab,
  setSelectedTab,
  t,
}) => {
  const tabs: TimeFilter[] = ['NOW', 'TOMORROW', 'THIS_WEEK'];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map(tab => {
          const isActive = selectedTab === tab;

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[
                styles.tabButton,
                isActive ? styles.activeTab : styles.inactiveTab,
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive ? styles.activeText : styles.inactiveText,
                ]}
              >
                {tab === 'NOW'
                  ? t.now
                  : tab === 'TOMORROW'
                  ? t.tomorrow
                  : t.thisWeek}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  tabsContainer: {
    paddingVertical: 4,
    paddingRight: 10,
  },

  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
  },

  tabText: {
    ...typography.boldSmall,
  },

  activeTab: {
    backgroundColor: colors.primary
  },

  inactiveTab: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  activeText: {
    color: colors.white,
  },

  inactiveText: {
    color: colors.textSecondary,
  },
});
