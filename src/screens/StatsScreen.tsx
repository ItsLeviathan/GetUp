import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '@/store';
import { EmptyState } from '@/components/UI';
import { COLORS, BATHROOM_ITEMS } from '@/constants';

export function StatsScreen() {
  const { records, getStats } = useStore();
  const stats = getStats();

  if (!records.length) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Stats</Text>
        </View>
        <EmptyState
          emoji="📊"
          title="No data yet"
          subtitle="Complete at least one challenge to see your stats."
        />
      </SafeAreaView>
    );
  }

  // Most-seen items
  const itemCounts = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.item] = (acc[r.item] ?? 0) + 1;
    return acc;
  }, {});
  const topItems = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Day-of-week breakdown
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts = new Array(7).fill(0);
  records.forEach((r) => {
    const dow = new Date(r.completedAt).getDay();
    dayCounts[dow]++;
  });
  const maxDay = Math.max(...dayCounts, 1);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Stats</Text>
        </View>

        {/* Streak hero */}
        <LinearGradient
          colors={['#1C1000', '#2D1A00']}
          style={styles.streakHero}
        >
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
          {stats.longestStreak > 0 && (
            <Text style={styles.streakBest}>Best: {stats.longestStreak} days</Text>
          )}
        </LinearGradient>

        {/* KPI grid */}
        <View style={styles.kpiGrid}>
          <StatBox
            label="Total Completed"
            value={stats.totalCompleted.toString()}
            sub="challenges"
            accent={COLORS.primary}
          />
          <StatBox
            label="Avg Time"
            value={stats.averageMinutes > 0 ? `${stats.averageMinutes}m` : '—'}
            sub="to complete"
            accent={COLORS.success}
          />
        </View>

        {/* Day of week */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity by Day</Text>
          <View style={styles.barChart}>
            {dayLabels.map((label, i) => {
              const height = Math.max(4, (dayCounts[i] / maxDay) * 80);
              const isMax = dayCounts[i] === maxDay && maxDay > 0;
              return (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height, backgroundColor: isMax ? COLORS.primary : COLORS.bgElevated },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{label[0]}</Text>
                  <Text style={styles.barCount}>{dayCounts[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Most Challenged Items</Text>
          <View style={styles.itemsList}>
            {topItems.map(([itemId, count], rank) => {
              const item = BATHROOM_ITEMS.find((i) => i.id === itemId);
              const pct = Math.round((count / records.length) * 100);
              return (
                <View key={itemId} style={styles.itemRow}>
                  <Text style={styles.itemRank}>#{rank + 1}</Text>
                  <Text style={styles.itemEmoji}>{item?.emoji ?? '🚿'}</Text>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item?.label ?? itemId}</Text>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.itemCount}>{count}×</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <View style={[statStyles.box, { borderColor: accent + '33' }]}>
      <Text style={[statStyles.value, { color: accent }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={statStyles.sub}>{sub}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 2,
  },
  value: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  label: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '700', textAlign: 'center' },
  sub: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 24, gap: 16 },
  header: { paddingTop: 20, paddingBottom: 4 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  streakHero: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.warning + '55',
    padding: 28,
    alignItems: 'center',
    gap: 4,
  },
  streakEmoji: { fontSize: 40, marginBottom: 4 },
  streakNumber: { fontSize: 64, fontWeight: '800', color: COLORS.warning, letterSpacing: -2 },
  streakLabel: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
  streakBest: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  kpiGrid: { flexDirection: 'row', gap: 12 },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 16,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: 0.2 },
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barCol: { alignItems: 'center', gap: 4, flex: 1 },
  barTrack: { height: 80, justifyContent: 'flex-end', width: 28 },
  barFill: { borderRadius: 6, width: '100%' },
  barLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  barCount: { fontSize: 10, color: COLORS.textMuted },
  itemsList: { gap: 14 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemRank: { fontSize: 12, color: COLORS.textMuted, width: 24, fontWeight: '700' },
  itemEmoji: { fontSize: 22, width: 28 },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  itemCount: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
});