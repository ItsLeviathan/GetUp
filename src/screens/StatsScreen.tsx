import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useStore } from '@/store';
import { EmptyState, ScreenHeader, Card } from '@/components/UI';
import { COLORS, BATHROOM_ITEMS, RADIUS, SPACING } from '@/constants';

export function StatsScreen() {
  const { records, getStats } = useStore();
  const stats = getStats();

  if (!records.length) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Stats" />
        <EmptyState
          emoji="📊"
          title="No stats yet"
          subtitle="Complete your first Bathroom Roulette challenge to start tracking your wake-up stats."
        />
      </SafeAreaView>
    );
  }

  const successRate = stats.totalCompleted > 0
    ? Math.round((stats.totalCompleted / records.length) * 100)
    : 0;

  // Top 3 items seen
  const itemCounts = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.item] = (acc[r.item] ?? 0) + 1;
    return acc;
  }, {});
  const topItems = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, count]) => ({
      id,
      count,
      info: BATHROOM_ITEMS.find((i) => i.id === id),
    }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Stats" subtitle="Your wake-up performance" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak + rate row */}
        <View style={styles.topRow}>
          <Card
            style={styles.streakCard}
            accessibilityLabel={`${stats.currentStreak} day streak${stats.longestStreak > 0 ? `, best ${stats.longestStreak} days` : ''}`}
          >
            <Text style={styles.streakFire} importantForAccessibility="no">🔥</Text>
            <Text style={styles.bigNumber}>{stats.currentStreak}</Text>
            <Text style={styles.bigLabel}>day streak</Text>
            {stats.longestStreak > 0 && (
              <Text style={styles.bestStreak}>Best: {stats.longestStreak}</Text>
            )}
          </Card>

          <Card style={styles.rateCard} accessibilityLabel={`${successRate} percent success rate`}>
            <View style={styles.rateRing}>
              <Text style={styles.rateNumber}>{successRate}%</Text>
            </View>
            <Text style={styles.bigLabel}>success rate</Text>
          </Card>
        </View>

        {/* Summary row */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard} accessibilityLabel={`${records.length} total challenges`}>
            <Text style={styles.summaryNumber}>{records.length}</Text>
            <Text style={styles.summaryLabel}>Total{'\n'}challenges</Text>
          </Card>
          <Card style={styles.summaryCard} accessibilityLabel={`${stats.averageMinutes} minute average wake up time`}>
            <Text style={styles.summaryNumber}>{stats.averageMinutes}m</Text>
            <Text style={styles.summaryLabel}>Avg wake-up{'\n'}time</Text>
          </Card>
          <Card style={styles.summaryCard} accessibilityLabel={`${stats.totalCompleted} missions completed`}>
            <Text style={styles.summaryNumber}>{stats.totalCompleted}</Text>
            <Text style={styles.summaryLabel}>Missions{'\n'}complete</Text>
          </Card>
        </View>

        {/* Top items */}
        {topItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel} accessibilityRole="header">Most Assigned Items</Text>
            <Card style={styles.itemsCard}>
              {topItems.map(({ id, count, info }, idx) => (
                <View
                  key={id}
                  style={[styles.itemRow, idx < topItems.length - 1 && styles.itemRowBorder]}
                  accessible
                  accessibilityLabel={`Rank ${idx + 1}: ${info?.label ?? id}, assigned ${count} time${count !== 1 ? 's' : ''}`}
                >
                  <View style={styles.itemRank}>
                    <Text style={styles.itemRankText}>#{idx + 1}</Text>
                  </View>
                  <View style={styles.itemEmojiWrap}>
                    <Text style={styles.itemEmoji} importantForAccessibility="no">{info?.emoji ?? '🚿'}</Text>
                  </View>
                  <Text style={styles.itemName}>{info?.label ?? id}</Text>
                  <View style={styles.itemCountWrap}>
                    <Text style={styles.itemCount}>{count}×</Text>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {stats.totalCompleted} mission{stats.totalCompleted !== 1 ? 's' : ''} completed
            out of {records.length} challenge{records.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.xxl, gap: SPACING.lg },

  topRow: { flexDirection: 'row', gap: SPACING.md },
  streakCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 24,
  },
  streakFire: { fontSize: 32, marginBottom: 4 },
  bigNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -2,
  },
  bigLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bestStreak: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: '600',
    marginTop: 2,
  },

  rateCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 24,
  },
  rateRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: COLORS.primaryDim,
  },
  rateNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },

  summaryRow: { flexDirection: 'row', gap: SPACING.md },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    gap: 6,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },

  section: { gap: SPACING.sm },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  itemsCard: { padding: 0, overflow: 'hidden' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemRank: {
    width: 28,
    alignItems: 'center',
  },
  itemRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  itemEmojiWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: { fontSize: 20 },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  itemCountWrap: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  itemCount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});