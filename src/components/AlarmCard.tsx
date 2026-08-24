import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert, Pressable } from 'react-native';
import { Alarm } from '@/types';
import { COLORS, RADIUS, SPACING, TOUCH_TARGET } from '@/constants';
import { useStore } from '@/store';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKEND = [0, 6];

interface Props {
  alarm: Alarm;
  onEdit: (id: string) => void;
}

function describeDays(days: number[]): string {
  if (days.length === 7) return 'Every day';
  if (days.length === 0) return 'Once';
  const sorted = [...days].sort();
  if (sorted.length === 5 && WEEKDAYS.every((d) => sorted.includes(d))) return 'Weekdays';
  if (sorted.length === 2 && WEEKEND.every((d) => sorted.includes(d))) return 'Weekends';
  return sorted.map((d) => DAY_LABELS[d]).join(' ');
}

export function AlarmCard({ alarm, onEdit }: Props) {
  const { toggleAlarm, deleteAlarm } = useStore();
  const [pressed, setPressed] = useState(false);

  const confirmDelete = () => {
    Alert.alert(
      'Delete alarm',
      `Delete "${alarm.label || alarm.time}"? This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAlarm(alarm.id) },
      ]
    );
  };

  const [h, m] = alarm.time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  const displayM = m.toString().padStart(2, '0');
  const alarmName = alarm.label || `${displayH}:${displayM} ${ampm}`;

  return (
    <Pressable
      onPress={() => onEdit(alarm.id)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.card,
        !alarm.enabled && styles.cardDisabled,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${alarmName} alarm, ${alarm.enabled ? describeDays(alarm.days) : 'off'}`}
      accessibilityHint="Double tap to edit this alarm"
    >
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          {alarm.label ? <Text style={styles.label} numberOfLines={1}>{alarm.label}</Text> : null}
          <View style={styles.timeRow} importantForAccessibility="no-hide-descendants">
            <Text style={[styles.time, !alarm.enabled && styles.timeDim]}>
              {displayH}:{displayM}
            </Text>
            <Text style={[styles.ampm, !alarm.enabled && styles.timeDim]}>{ampm}</Text>
          </View>
          <Text style={[styles.daysText, !alarm.enabled && styles.timeDim]}>
            {alarm.enabled ? describeDays(alarm.days) : 'Off'}
          </Text>
        </View>
        <Switch
          value={alarm.enabled}
          onValueChange={() => toggleAlarm(alarm.id)}
          trackColor={{ false: COLORS.bgElevated, true: COLORS.primaryDim }}
          thumbColor={alarm.enabled ? COLORS.primary : COLORS.textMuted}
          accessibilityLabel={`${alarmName} alarm`}
          accessibilityHint={alarm.enabled ? 'Double tap to turn off' : 'Double tap to turn on'}
        />
      </View>

      <View style={styles.bottom}>
        <View style={styles.days} importantForAccessibility="no-hide-descendants">
          {DAY_LABELS.map((d, i) => (
            <View key={i} style={[styles.day, alarm.days.includes(i) && styles.dayActive]}>
              <Text style={[styles.dayText, alarm.days.includes(i) && styles.dayTextActive]}>
                {d}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.badge} importantForAccessibility="no-hide-descendants">
            <Text style={styles.badgeText}>🚿 Roulette</Text>
          </View>
          <TouchableOpacity
            onPress={confirmDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.deleteBtn}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${alarmName} alarm`}
          >
            <Text style={styles.deleteIcon} importantForAccessibility="no">🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  cardPressed: {
    backgroundColor: COLORS.bgElevated,
    borderColor: COLORS.borderLight,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  label: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  time: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  timeDim: {
    color: COLORS.textMuted,
  },
  ampm: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  daysText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  days: {
    flexDirection: 'row',
    gap: 6,
  },
  day: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgElevated,
  },
  dayActive: {
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  dayTextActive: {
    color: COLORS.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  deleteBtn: {
    width: TOUCH_TARGET.min,
    height: TOUCH_TARGET.min,
    borderRadius: TOUCH_TARGET.min / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgElevated,
  },
  deleteIcon: {
    fontSize: 15,
  },
});