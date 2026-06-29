import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useStore } from '@/store';
import { EmptyState } from '@/components/UI';
import { COLORS, BATHROOM_ITEMS } from '@/constants';
import { WakeRecord } from '@/types';
import { format, parseISO } from 'date-fns';

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
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
        </View>
        <EmptyState
          emoji="📅"
          title="No history yet"
          subtitle="Complete your first Bathroom Roulette challenge to see it here."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>{records.length} completed</Text>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(s) => s.date}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            <Text style={styles.sectionDate}>
              {format(parseISO(section.date), 'EEEE, MMM d')}
            </Text>
            {section.items.map((record, idx) => {
              const item = BATHROOM_ITEMS.find((i) => i.id === record.item);
              return (
                <View key={idx} style={styles.recordCard}>
                  <View style={styles.recordLeft}>
                    <Text style={styles.recordEmoji}>{item?.emoji ?? '🚿'}</Text>
                    <View>
                      <Text style={styles.recordItem}>{item?.label ?? record.item}</Text>
                      <Text style={styles.recordTime}>
                        {format(new Date(record.completedAt), 'h:mm a')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.recordRight}>
                    <View style={styles.successBadge}>
                      <Text style={styles.successText}>✓</Text>
                    </View>
                    <Text style={styles.minutesText}>
                      {record.minutesToComplete}m
                    </Text>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  list: { paddingHorizontal: 24, gap: 24 },
  section: { gap: 10 },
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recordEmoji: { fontSize: 28 },
  recordItem: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  recordTime: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  recordRight: { alignItems: 'flex-end', gap: 4 },
  successBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.successDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: { color: COLORS.success, fontSize: 14, fontWeight: '800' },
  minutesText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
});