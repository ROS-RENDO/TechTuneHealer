import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

interface DaySchedule {
  day: string;
  shortDay: string;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
}

interface TimeSlot {
  id: string;
  time: string;
  isBooked: boolean;
  customerName?: string;
  service?: string;
}

const DAYS_OF_WEEK: DaySchedule[] = [
  { day: 'Monday', shortDay: 'Mon', isEnabled: true, startTime: '08:00', endTime: '18:00' },
  { day: 'Tuesday', shortDay: 'Tue', isEnabled: true, startTime: '08:00', endTime: '18:00' },
  { day: 'Wednesday', shortDay: 'Wed', isEnabled: true, startTime: '08:00', endTime: '18:00' },
  { day: 'Thursday', shortDay: 'Thu', isEnabled: true, startTime: '08:00', endTime: '18:00' },
  { day: 'Friday', shortDay: 'Fri', isEnabled: true, startTime: '08:00', endTime: '18:00' },
  { day: 'Saturday', shortDay: 'Sat', isEnabled: true, startTime: '09:00', endTime: '15:00' },
  { day: 'Sunday', shortDay: 'Sun', isEnabled: false, startTime: '09:00', endTime: '15:00' },
];

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 8; hour < 18; hour++) {
    slots.push({
      id: `${hour}:00`,
      time: `${hour.toString().padStart(2, '0')}:00`,
      isBooked: Math.random() > 0.7,
      customerName: Math.random() > 0.7 ? 'John Doe' : undefined,
      service: Math.random() > 0.7 ? 'Oil Change' : undefined,
    });
  }
  return slots;
};

export default function ScheduleScreen() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(DAYS_OF_WEEK);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showWeeklyView, setShowWeeklyView] = useState(false);
  const [timeSlots] = useState<TimeSlot[]>(generateTimeSlots());

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].isEnabled = !newSchedule[index].isEnabled;
    setSchedule(newSchedule);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setShowWeeklyView(!showWeeklyView)}
          >
            <Ionicons
              name={showWeeklyView ? 'calendar' : 'list'}
              size={20}
              color={colors.primary[500]}
            />
            <Text style={styles.viewToggleText}>
              {showWeeklyView ? 'Daily' : 'Weekly'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarStrip}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 7);
              setSelectedDate(newDate);
            }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.weekDays}>
            {weekDates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  isSelected(date) && styles.dayButtonSelected,
                  isToday(date) && styles.dayButtonToday,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text
                  style={[
                    styles.dayName,
                    isSelected(date) && styles.dayNameSelected,
                  ]}
                >
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    isSelected(date) && styles.dayNumberSelected,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 7);
              setSelectedDate(newDate);
            }}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {showWeeklyView ? (
          <View style={styles.weeklySchedule}>
            <Text style={styles.sectionTitle}>Working Hours</Text>
            {schedule.map((day, index) => (
              <View key={day.day} style={styles.dayScheduleItem}>
                <View style={styles.dayInfo}>
                  <Text
                    style={[
                      styles.dayLabel,
                      !day.isEnabled && styles.dayLabelDisabled,
                    ]}
                  >
                    {day.day}
                  </Text>
                  {day.isEnabled && (
                    <Text style={styles.hoursText}>
                      {day.startTime} - {day.endTime}
                    </Text>
                  )}
                </View>
                <Switch
                  value={day.isEnabled}
                  onValueChange={() => toggleDay(index)}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={day.isEnabled ? colors.primary[500] : colors.textSecondary}
                />
              </View>
            ))}

            <View style={styles.breakSection}>
              <Text style={styles.sectionTitle}>Break Times</Text>
              <TouchableOpacity style={styles.addBreakButton}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary[500]} />
                <Text style={styles.addBreakText}>Add Break Time</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.dailySchedule}>
            <View style={styles.dateHeader}>
              <Text style={styles.selectedDateText}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <View style={styles.availabilityToggle}>
                <Text style={styles.availabilityLabel}>Available</Text>
                <Switch
                  value={true}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={colors.primary[500]}
                />
              </View>
            </View>

            <View style={styles.timeSlotsContainer}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlot,
                    slot.isBooked && styles.timeSlotBooked,
                  ]}
                >
                  <View style={styles.timeSlotTime}>
                    <Text
                      style={[
                        styles.slotTimeText,
                        slot.isBooked && styles.slotTimeTextBooked,
                      ]}
                    >
                      {slot.time}
                    </Text>
                  </View>
                  <View style={styles.timeSlotContent}>
                    {slot.isBooked ? (
                      <>
                        <Text style={styles.bookedCustomer}>{slot.customerName}</Text>
                        <Text style={styles.bookedService}>{slot.service}</Text>
                      </>
                    ) : (
                      <Text style={styles.availableText}>Available</Text>
                    )}
                  </View>
                  {slot.isBooked && (
                    <View style={styles.bookedBadge}>
                      <Text style={styles.bookedBadgeText}>Booked</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.specialDates}>
          <Text style={styles.sectionTitle}>Time Off</Text>
          <View style={styles.timeOffItem}>
            <View style={styles.timeOffIcon}>
              <Ionicons name="calendar-outline" size={20} color={colors.error[500]} />
            </View>
            <View style={styles.timeOffInfo}>
              <Text style={styles.timeOffDate}>Jan 25 - Jan 26, 2024</Text>
              <Text style={styles.timeOffReason}>Personal Leave</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addTimeOffButton}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary[500]} />
            <Text style={styles.addTimeOffText}>Request Time Off</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
  },
  viewToggleText: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  calendarStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  navButton: {
    padding: spacing.sm,
  },
  weekDays: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary[500],
  },
  dayButtonToday: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  dayName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dayNameSelected: {
    color: colors.white,
  },
  dayNumber: {
    ...typography.bodyBold,
    color: colors.text,
  },
  dayNumberSelected: {
    color: colors.white,
  },
  weeklySchedule: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  dayScheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  dayInfo: {
    flex: 1,
  },
  dayLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  dayLabelDisabled: {
    color: colors.textSecondary,
  },
  hoursText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  breakSection: {
    marginTop: spacing.lg,
  },
  addBreakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    borderStyle: 'dashed',
  },
  addBreakText: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: '600',
  },
  dailySchedule: {
    padding: spacing.lg,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  selectedDateText: {
    ...typography.h3,
    color: colors.text,
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  availabilityLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  timeSlotsContainer: {
    gap: spacing.sm,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success[500],
    ...shadows.small,
  },
  timeSlotBooked: {
    borderLeftColor: colors.warning[500],
  },
  timeSlotTime: {
    width: 60,
  },
  slotTimeText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  slotTimeTextBooked: {
    color: colors.textSecondary,
  },
  timeSlotContent: {
    flex: 1,
  },
  availableText: {
    ...typography.body,
    color: colors.success[500],
  },
  bookedCustomer: {
    ...typography.bodyBold,
    color: colors.text,
  },
  bookedService: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bookedBadge: {
    backgroundColor: `${colors.warning[500]}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  bookedBadgeText: {
    ...typography.caption,
    color: colors.warning[500],
    fontWeight: '600',
  },
  specialDates: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  timeOffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  timeOffIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.error[500]}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeOffInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  timeOffDate: {
    ...typography.bodyBold,
    color: colors.text,
  },
  timeOffReason: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  addTimeOffButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    borderStyle: 'dashed',
  },
  addTimeOffText: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: '600',
  },
});
