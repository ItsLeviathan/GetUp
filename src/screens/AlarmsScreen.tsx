import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '@/store';
import { AlarmCard } from '@/components/AlarmCard';
import { EmptyState, ScreenHeader } from '@/components/UI';
import { COLORS, RADIUS, SPACING } from '@/constants';
import { RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function AlarmsScreen() {
  const navigation = useNavigation<Nav>();
  const { alarms } = useStore();

  const sorted = [...alarms].sort((a, b) => a.time.localeCompare(b.time));
  const activeCount = sorted.filter((a) => a.enabled).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="GetUp"
        subtitle="Turn waking up into a mission"
        right={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AlarmEditor', {})}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Add new alarm"
          >
            <LinearGradient colors={['#EAFF6B', '#D7FF3D']} style={styles.addBtnGradient}>
              <Text style={styles.addBtnText} importantForAccessibility="no">+</Text>
            </LinearGradient>
          </TouchableOpacity>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          emoji="⏰"
          title="No alarms yet"
          subtitle="Set your first alarm, then complete a Bathroom Roulette challenge each morning to stop it."
          action={
            <TouchableOpacity
              style={styles.emptyAddBtnWrap}
              onPress={() => navigation.navigate('AlarmEditor', {})}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Set your first alarm"
            >
              <LinearGradient colors={['#EAFF6B', '#D7FF3D']} style={styles.emptyAddBtn}>
                <Text style={styles.emptyAddText}>Set your first alarm</Text>
              </LinearGradient>
            </TouchableOpacity>
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel} accessibilityRole="header">
            {activeCount} active alarm{activeCount !== 1 ? 's' : ''}
          </Text>
          {sorted.map((alarm) => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              onEdit={(id) => navigation.navigate('AlarmEditor', { alarmId: id })}
            />
          ))}
          <View style={styles.spacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  addBtn: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  addBtnGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
  },
  addBtnText: {
    fontSize: 28,
    color: COLORS.onPrimary,
    fontWeight: '600',
    lineHeight: 32,
  },
  list: {
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  spacer: {
    height: 100,
  },
  emptyAddBtnWrap: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    minWidth: 220,
  },
  emptyAddBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  emptyAddText: {
    color: COLORS.onPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});