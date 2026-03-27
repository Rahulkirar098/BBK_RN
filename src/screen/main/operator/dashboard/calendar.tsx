import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { IconBtn } from '../../../../components/atoms';
import {
  colors,
  horizontalScale,
  verticalScale,
  typography,
} from '../../../../theme';

type Props = {
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  weekDays: Date[];
  onAddPress: () => void;
};

const DashboardCalendar: React.FC<Props> = ({
  selectedDate,
  setSelectedDate,
  weekDays,
  onAddPress,
}) => {
  return (
    <View style={styles.calendarCard}>
      {/* HEADER */}
      <View style={styles.calendarHeader}>
        <View>
          <Text style={styles.monthText}>
            {selectedDate.toLocaleDateString('en-US', { month: 'long' })}
          </Text>
          <Text style={styles.monthText}>
            {selectedDate.toLocaleDateString('en-US', { year: 'numeric' })}
          </Text>
        </View>

        {/* NAVIGATION */}
        <View style={styles.nav}>
          <IconBtn
            icon={<ChevronLeft />}
            onPress={() =>
              setSelectedDate(d => {
                const x = new Date(d);
                x.setDate(x.getDate() - 7);
                return x;
              })
            }
          />

          <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
            <Text style={styles.todayBtn}>Today</Text>
          </TouchableOpacity>

          <IconBtn
            icon={<ChevronRight />}
            onPress={() =>
              setSelectedDate(d => {
                const x = new Date(d);
                x.setDate(x.getDate() + 7);
                return x;
              })
            }
          />
        </View>

        {/* ADD BUTTON */}
        <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
          <Plus size={16} color={colors.white} />
          <Text style={styles.addText}>Add Slot</Text>
        </TouchableOpacity>
      </View>

      {/* WEEK DAYS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {weekDays.map((d, i) => {
          const selected =
            d.toDateString() === selectedDate.toDateString();

          return (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedDate(d)}
              style={[styles.dayBtn, selected && styles.daySelected]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  { color: selected ? colors.white : '#6b7280' },
                ]}
              >
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>

              <Text
                style={[
                  styles.dayNumber,
                  { color: selected ? colors.white : '#6b7280' },
                ]}
              >
                {d.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default DashboardCalendar;

const styles = StyleSheet.create({
  calendarCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: verticalScale(10),
  },

  monthText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },

  todayBtn: {
    ...typography.boldSmall,
    color: colors.primary,
  },

  addBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },

  addText: {
    color: colors.white,
    fontWeight: '700',
  },

  dayBtn: {
    padding: 12,
    alignItems: 'center',
    minWidth: horizontalScale(50),
    maxWidth: horizontalScale(50),
    minHeight: verticalScale(50),
    maxHeight: verticalScale(50),
    gap: horizontalScale(8),
  },

  daySelected: {
    backgroundColor: colors.primary,
    borderRadius: 12,
  },

  dayLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  dayNumber: {
    ...typography.cardTitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});