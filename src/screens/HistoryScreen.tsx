import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useStore } from '@/store';
import { EmptyState, ScreenHeader } from '@/components/UI';
import { COLORS, BATHROOM_ITEMS, RADIUS, SPACING } from '@/constants';
import { WakeRecord } from '@/types';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

function sectionLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEEE, MMM d');
}

export function HistoryScreen() {
  const { records } = useStore();

  const grouped = records.reduce<Record<string, WakeRecord[]>>((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});

  const sections = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }));

  if (!records.length) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="History" />
        <EmptyState
          emoji="📅"
          title="No history yet"
          subtitle="Once you complete a Bathroom Roulette challenge, it'll show up here."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="History" subtitle={`${records.length} challenge${records.length !== 1 ? 's' : ''} completed`} />

      <FlatList
        data={sections}
        keyExtractor={(s) => s.date}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            <Text style={styles.sectionDate}>{sectionLabel(section.date)}</Text>
            {section.items.map((record, idx) => {
              const item = BATHROOM_ITEMS.find((i) => i.id === record.item);
              return (
                <View key={idx} style={styles.recordCard}>
                  <View style={styles.recordIconWrap}>
                    <Text style={styles.recordEmoji}>{item?.emoji ?? '🚿'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recordItem}>{item?.label ?? record.item}</Text>
                    <Text style={styles.recordTime}>{format(new Date(record.completedAt), 'h:mm a')}</Text>
                  </View>
                  <View style={styles.recordRight}>
                    <View style={styles.successBadge}>
                      <Text style={styles.successText}>✓</Text>
                    </View>
                    <Text style={styles.minutesText}>{record.minutesToComplete}m</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  list: { paddingHorizontal: SPACING.xxl, gap: SPACING.xxl },
  section: { gap: SPACING.sm },
  sectionDate: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  recordCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  recordIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordEmoji: { fontSize: 22 },
  recordItem: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  recordTime: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  recordRight: { alignItems: 'flex-end', gap: 4 },
  successBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.successDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: { color: COLORS.success, fontSize: 13, fontWeight: '800' },
  minutesText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
});