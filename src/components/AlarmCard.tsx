import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Alarm } from '@/types';
import { COLORS } from '@/constants';
import { useStore } from '@/store';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Props {
  alarm: Alarm;
  onEdit: (id: string) => void;
}

export function AlarmCard({ alarm, onEdit }: Props) {
  const { toggleAlarm, deleteAlarm } = useStore();

  const handleLongPress = () => {
    Alert.alert(
      'Delete Alarm',
      `Delete "${alarm.label || alarm.time}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAlarm(alarm.id),
        },
      ]
    );
  };

  const [h, m] = alarm.time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  const displayM = m.toString().padStart(2, '0');

  return (
    <TouchableOpacity
      onPress={() => onEdit(alarm.id)}
      onLongPress={handleLongPress}
      style={[styles.card, !alarm.enabled && styles.cardDisabled]}
      activeOpacity={0.8}
    >
      <View style={styles.top}>
        <View>
          {alarm.label ? <Text style={styles.label}>{alarm.label}</Text> : null}
          <View style={styles.timeRow}>
            <Text style={[styles.time, !alarm.enabled && styles.timeDim]}>
              {displayH}:{displayM}
            </Text>
            <Text style={[styles.ampm, !alarm.enabled && styles.timeDim]}>{ampm}</Text>
          </View>
        </View>
        <Switch
          value={alarm.enabled}
          onValueChange={() => toggleAlarm(alarm.id)}
          trackColor={{ false: COLORS.bgElevated, true: COLORS.primaryDim }}
          thumbColor={alarm.enabled ? COLORS.primary : COLORS.textMuted}
        />
      </View>

      <View style={styles.bottom}>
        <View style={styles.days}>
          {DAY_LABELS.map((d, i) => (
            <View
              key={i}
              style={[styles.day, alarm.days.includes(i) && styles.dayActive]}
            >
              <Text style={[styles.dayText, alarm.days.includes(i) && styles.dayTextActive]}>
                {d}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🚿 Roulette</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 16,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    width: 28,
    height: 28,
    borderRadius: 14,
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
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  dayTextActive: {
    color: COLORS.primary,
  },
  badge: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});