import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

interface EntryCalendarProps {
  entries: { createdAt: string }[];
  selectedDate?: string;
  onSelect: (date: string) => void;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export const EntryCalendar: React.FC<EntryCalendarProps> = ({
  entries,
  selectedDate,
  onSelect,
}) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  // Get all entry dates in this month
  const entryDates = useMemo(
    () =>
      new Set(
        entries
          .map(e => e.createdAt.slice(0, 10))
          .filter(date => {
            const d = new Date(date);
            return d.getFullYear() === year && d.getMonth() === month;
          })
      ),
    [entries, year, month]
  );

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDayOfWeek).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) weeks.push([...week, ...Array(7 - week.length).fill(null)]);

  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.header,
          {
            color: theme.colors.onSurface,
            fontSize: theme.typography.fontSize.heading,
            fontFamily: theme.typography.fontFamily,
          },
        ]}
      >
        {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </Text>
      <View style={styles.weekRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <Text
            key={d}
            style={[
              styles.weekDay,
              {
                color: theme.colors.outline,
                fontSize: theme.typography.fontSize.caption,
                fontFamily: theme.typography.fontFamily,
              },
            ]}
          >
            {d}
          </Text>
        ))}
      </View>
      {weeks.map((week, i) => (
        <View key={i} style={styles.weekRow}>
          {week.map((day, j) => {
            if (!day) return <View key={j} style={styles.dayCell} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(
              2,
              '0'
            )}`;
            const hasEntry = entryDates.has(dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === today.toISOString().slice(0, 10);
            return (
              <TouchableOpacity
                key={j}
                style={[
                  styles.dayCell,
                  hasEntry && styles.hasEntry,
                  isSelected && styles.selectedDay,
                  isToday && styles.todayDay,
                ]}
                onPress={() => onSelect(dateStr)}
                accessibilityLabel={`Select ${dateStr}${hasEntry ? ' (has entry)' : ''}${
                  isToday ? ' (today)' : ''
                }`}
                accessibilityRole="button"
                testID={`calendar-day-${dateStr}`}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface,
                      fontSize: theme.typography.fontSize.body,
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: isSelected ? 'bold' : 'normal',
                    },
                  ]}
                >
                  {day}
                </Text>
                {hasEntry && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
  },
  header: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  weekDay: { flex: 1, textAlign: 'center', color: '#888', fontWeight: 'bold', fontSize: 14 },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 8,
  },
  dayText: { fontSize: 16, color: '#222' },
  hasEntry: { backgroundColor: '#E3F2FD' },
  selectedDay: { backgroundColor: '#0288D1', borderColor: '#0288D1', borderWidth: 2 },
  selectedDayText: { textDecorationLine: 'underline' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0288D1', marginTop: 2 },
  todayDay: { borderColor: '#FBC02D', borderWidth: 2 },
  todayDayText: { textDecorationLine: 'underline' },
});
