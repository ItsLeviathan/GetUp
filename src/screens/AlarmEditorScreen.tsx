import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useStore } from '@/store';
import { Button, SectionLabel } from '@/components/UI';
import { COLORS, ALARM_SOUNDS } from '@/constants';
import { Alarm, RootStackParamList } from '@/types';
import { scheduleAlarm, cancelAlarmNotifications } from '@/services/notifications';

type Route = RouteProp<RootStackParamList, 'AlarmEditor'>;

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => i);

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function AlarmEditorScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { alarms, addAlarm, updateAlarm } = useStore();

  const editingId = route.params?.alarmId;
  const existing = editingId ? alarms.find((a) => a.id === editingId) : null;

  const [label, setLabel] = useState(existing?.label ?? '');
  const [hour, setHour] = useState(existing ? parseInt(existing.time.split(':')[0]) : 7);
  const [minute, setMinute] = useState(existing ? parseInt(existing.time.split(':')[1]) : 0);
  const [days, setDays] = useState<number[]>(existing?.days ?? [1, 2, 3, 4, 5]);
  const [soundId, setSoundId] = useState(existing?.soundId ?? 'default');
  const [saving, setSaving] = useState(false);

  const toggleDay = (d: number) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  };

  const handleSave = async () => {
    if (!days.length) return;
    setSaving(true);

    const alarm: Alarm = {
      id: editingId ?? `alarm_${Date.now()}`,
      label: label.trim(),
      time: `${pad(hour)}:${pad(minute)}`,
      days,
      enabled: existing?.enabled ?? true,
      challengeMode: 'bathroom_roulette',
      soundId,
      snoozeMinutes: 0,
      createdAt: existing?.createdAt ?? Date.now(),
    };

    if (editingId) {
      await updateAlarm(editingId, alarm);
    } else {
      await addAlarm(alarm);
    }

    await scheduleAlarm(alarm);
    setSaving(false);
    navigation.goBack();
  };

  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayH = hour % 12 || 12;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{editingId ? 'Edit Alarm' : 'New Alarm'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Time picker */}
        <View style={styles.timePicker}>
          <View style={styles.timeWheelGroup}>
            <ScrollView
              style={styles.wheel}
              showsVerticalScrollIndicator={false}
              snapToInterval={52}
              decelerationRate="fast"
              contentContainerStyle={styles.wheelContent}
            >
              {HOUR_OPTIONS.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.wheelItem, h === hour && styles.wheelItemActive]}
                  onPress={() => setHour(h)}
                >
                  <Text style={[styles.wheelText, h === hour && styles.wheelTextActive]}>
                    {pad(h % 12 || 12)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.timeColon}>:</Text>
            <ScrollView
              style={styles.wheel}
              showsVerticalScrollIndicator={false}
              snapToInterval={52}
              decelerationRate="fast"
              contentContainerStyle={styles.wheelContent}
            >
              {MINUTE_OPTIONS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.wheelItem, m === minute && styles.wheelItemActive]}
                  onPress={() => setMinute(m)}
                >
                  <Text style={[styles.wheelText, m === minute && styles.wheelTextActive]}>
                    {pad(m)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.ampmGroup}>
              {['AM', 'PM'].map((ap) => (
                <TouchableOpacity
                  key={ap}
                  style={[styles.ampmBtn, ampm === ap && styles.ampmBtnActive]}
                  onPress={() => {
                    if (ap === 'AM' && hour >= 12) setHour(hour - 12);
                    if (ap === 'PM' && hour < 12) setHour(hour + 12);
                  }}
                >
                  <Text style={[styles.ampmText, ampm === ap && styles.ampmTextActive]}>
                    {ap}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Days */}
        <View style={styles.section}>
          <SectionLabel text="Repeat" />
          <View style={styles.daysRow}>
            {DAY_LABELS.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dayBtn, days.includes(i) && styles.dayBtnActive]}
                onPress={() => toggleDay(i)}
              >
                <Text style={[styles.dayBtnText, days.includes(i) && styles.dayBtnTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Label */}
        <View style={styles.section}>
          <SectionLabel text="Label" />
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="Morning mission..."
            placeholderTextColor={COLORS.textMuted}
            maxLength={40}
          />
        </View>

        {/* Challenge mode — always Bathroom Roulette, shown as info */}
        <View style={styles.section}>
          <SectionLabel text="Challenge" />
          <View style={styles.challengeCard}>
            <Text style={styles.challengeEmoji}>🚿</Text>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>Bathroom Roulette</Text>
              <Text style={styles.challengeDesc}>
                Find a randomly selected bathroom item to stop the alarm.
              </Text>
            </View>
          </View>
        </View>

        {/* Sound */}
        <View style={styles.section}>
          <SectionLabel text="Sound" />
          <View style={styles.soundRow}>
            {ALARM_SOUNDS.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.soundBtn, soundId === s.id && styles.soundBtnActive]}
                onPress={() => setSoundId(s.id)}
              >
                <Text style={[styles.soundText, soundId === s.id && styles.soundTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
        <Button
          label={saving ? 'Saving...' : editingId ? 'Update Alarm' : 'Set Alarm'}
          onPress={handleSave}
          loading={saving}
          disabled={!days.length}
        />
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancel: { color: COLORS.textSecondary, fontSize: 16 },
  navTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 24, gap: 28 },
  timePicker: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeWheelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 200,
    gap: 8,
  },
  wheel: { width: 70, height: 200 },
  wheelContent: { paddingVertical: 74 },
  wheelItem: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  wheelItemActive: { backgroundColor: COLORS.primaryDim },
  wheelText: { fontSize: 24, fontWeight: '500', color: COLORS.textMuted },
  wheelTextActive: { color: COLORS.primary, fontWeight: '700' },
  timeColon: { fontSize: 32, fontWeight: '700', color: COLORS.textSecondary },
  ampmGroup: { gap: 8 },
  ampmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
  },
  ampmBtnActive: { backgroundColor: COLORS.primaryDim },
  ampmText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  ampmTextActive: { color: COLORS.primary },
  section: { gap: 8 },
  daysRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  dayBtn: {
    flex: 1,
    minWidth: 44,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayBtnActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  dayBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  dayBtnTextActive: { color: COLORS.primary },
  input: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  challengeEmoji: { fontSize: 32 },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  challengeDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, lineHeight: 18 },
  soundRow: { flexDirection: 'row', gap: 10 },
  soundBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  soundBtnActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  soundText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  soundTextActive: { color: COLORS.primary },
});