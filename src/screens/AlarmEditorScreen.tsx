import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useStore } from '@/store';
import { Button, SectionLabel } from '@/components/UI';
import { COLORS, ALARM_SOUNDS, RADIUS, SPACING } from '@/constants';
import { Alarm, RootStackParamList } from '@/types';
import { scheduleAlarm } from '@/services/notifications';

type Route = RouteProp<RootStackParamList, 'AlarmEditor'>;

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => i);
const ITEM_HEIGHT = 52;
const WHEEL_VISIBLE_PADDING = 74; // (200 wheel height - 52 item height) / 2

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
  const [dirty, setDirty] = useState(false);

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  const toggleDay = (d: number) => {
    setDirty(true);
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  };

  const applyPreset = (preset: number[]) => {
    setDirty(true);
    setDays(preset);
  };

  const handleHourScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(HOUR_OPTIONS.length - 1, index));
    setHour((prevHour) => {
      // preserve AM/PM when selecting via the 12-hour-displayed wheel
      const isPM = prevHour >= 12;
      const newHour = isPM ? (clamped % 12) + 12 : clamped % 12;
      return newHour;
    });
    setDirty(true);
  }, []);

  const handleMinuteScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    setMinute(Math.max(0, Math.min(MINUTE_OPTIONS.length - 1, index)));
    setDirty(true);
  }, []);

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

  const handleCancel = () => {
    if (!dirty) {
      navigation.goBack();
      return;
    }
    Alert.alert('Discard changes?', 'Your edits to this alarm will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour12 = hour % 12 || 12;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{editingId ? 'Edit Alarm' : 'New Alarm'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Time picker */}
        <View style={styles.timePicker}>
          <View style={styles.timeWheelGroup}>
            <View style={styles.wheelSelectionBar} pointerEvents="none" />

            <ScrollView
              ref={hourScrollRef}
              style={styles.wheel}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              contentContainerStyle={styles.wheelContent}
              contentOffset={{ x: 0, y: (hour % 12 || 12) === 12 ? 0 : (hour % 12) * ITEM_HEIGHT }}
              onMomentumScrollEnd={handleHourScrollEnd}
            >
              {HOUR_OPTIONS.slice(0, 12).map((h) => {
                const displayValue = h === 0 ? 12 : h;
                const isActive = displayValue === displayHour12;
                return (
                  <TouchableOpacity
                    key={h}
                    style={[styles.wheelItem, isActive && styles.wheelItemActive]}
                    onPress={() => {
                      setDirty(true);
                      const isPM = hour >= 12;
                      setHour(isPM ? (h % 12) + 12 : h % 12);
                      hourScrollRef.current?.scrollTo({ y: h * ITEM_HEIGHT, animated: true });
                    }}
                  >
                    <Text style={[styles.wheelText, isActive && styles.wheelTextActive]}>
                      {pad(displayValue)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.timeColon}>:</Text>

            <ScrollView
              ref={minuteScrollRef}
              style={styles.wheel}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              contentContainerStyle={styles.wheelContent}
              contentOffset={{ x: 0, y: minute * ITEM_HEIGHT }}
              onMomentumScrollEnd={handleMinuteScrollEnd}
            >
              {MINUTE_OPTIONS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.wheelItem, m === minute && styles.wheelItemActive]}
                  onPress={() => {
                    setDirty(true);
                    setMinute(m);
                    minuteScrollRef.current?.scrollTo({ y: m * ITEM_HEIGHT, animated: true });
                  }}
                >
                  <Text style={[styles.wheelText, m === minute && styles.wheelTextActive]}>
                    {pad(m)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.ampmGroup}>
              {(['AM', 'PM'] as const).map((ap) => (
                <TouchableOpacity
                  key={ap}
                  style={[styles.ampmBtn, ampm === ap && styles.ampmBtnActive]}
                  onPress={() => {
                    setDirty(true);
                    if (ap === 'AM' && hour >= 12) setHour(hour - 12);
                    if (ap === 'PM' && hour < 12) setHour(hour + 12);
                  }}
                >
                  <Text style={[styles.ampmText, ampm === ap && styles.ampmTextActive]}>{ap}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Days */}
        <View style={styles.section}>
          <SectionLabel text="Repeat" />
          <View style={styles.presetRow}>
            <TouchableOpacity style={styles.presetChip} onPress={() => applyPreset([1, 2, 3, 4, 5])}>
              <Text style={styles.presetChipText}>Weekdays</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetChip} onPress={() => applyPreset([0, 6])}>
              <Text style={styles.presetChipText}>Weekends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetChip} onPress={() => applyPreset([0, 1, 2, 3, 4, 5, 6])}>
              <Text style={styles.presetChipText}>Every day</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.daysRow}>
            {DAY_LABELS.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dayBtn, days.includes(i) && styles.dayBtnActive]}
                onPress={() => toggleDay(i)}
              >
                <Text style={[styles.dayBtnText, days.includes(i) && styles.dayBtnTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {!days.length && (
            <Text style={styles.warnText}>Pick at least one day to save this alarm.</Text>
          )}
        </View>

        {/* Label */}
        <View style={styles.section}>
          <SectionLabel text="Label" hint="optional" />
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={(v) => {
              setDirty(true);
              setLabel(v);
            }}
            placeholder="Morning mission..."
            placeholderTextColor={COLORS.textMuted}
            maxLength={40}
          />
        </View>

        {/* Challenge mode — always Bathroom Roulette, shown as info */}
        <View style={styles.section}>
          <SectionLabel text="Challenge" />
          <View style={styles.challengeCard}>
            <View style={styles.challengeEmojiWrap}>
              <Text style={styles.challengeEmoji}>🚿</Text>
            </View>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>Bathroom Roulette</Text>
              <Text style={styles.challengeDesc}>
                We'll pick a random bathroom item. Find it and snap a photo to stop the alarm.
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
                onPress={() => {
                  setDirty(true);
                  setSoundId(s.id);
                }}
              >
                <Text style={[styles.soundText, soundId === s.id && styles.soundTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 8 }} />
        <Button
          label={saving ? 'Saving...' : editingId ? 'Update Alarm' : 'Set Alarm'}
          onPress={handleSave}
          loading={saving}
          disabled={!days.length}
          size="lg"
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancel: { color: COLORS.textSecondary, fontSize: 16 },
  navTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  scroll: { padding: SPACING.xxl, gap: 28 },
  timePicker: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeWheelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 200,
    gap: 8,
  },
  wheelSelectionBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 74,
    height: ITEM_HEIGHT,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgElevated,
    zIndex: -1,
  },
  wheel: { width: 70, height: 200 },
  wheelContent: { paddingVertical: WHEEL_VISIBLE_PADDING },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
  wheelItemActive: { backgroundColor: COLORS.primaryDim },
  wheelText: { fontSize: 24, fontWeight: '500', color: COLORS.textMuted },
  wheelTextActive: { color: COLORS.primary, fontWeight: '700' },
  timeColon: { fontSize: 32, fontWeight: '700', color: COLORS.textSecondary },
  ampmGroup: { gap: 8 },
  ampmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgElevated,
  },
  ampmBtnActive: { backgroundColor: COLORS.primaryDim },
  ampmText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  ampmTextActive: { color: COLORS.primary },
  section: { gap: SPACING.sm },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 2 },
  presetChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.bgElevated,
  },
  presetChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  daysRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  dayBtn: {
    flex: 1,
    minWidth: 44,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayBtnActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  dayBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  dayBtnTextActive: { color: COLORS.primary },
  warnText: { fontSize: 12, color: COLORS.warning, marginTop: 2 },
  input: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
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
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  challengeEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeEmoji: { fontSize: 24 },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  challengeDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, lineHeight: 18 },
  soundRow: { flexDirection: 'row', gap: 10 },
  soundBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  soundBtnActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  soundText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  soundTextActive: { color: COLORS.primary },
});