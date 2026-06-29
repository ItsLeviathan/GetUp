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
import { EmptyState } from '@/components/UI';
import { COLORS } from '@/constants';
import { RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function AlarmsScreen() {
  const navigation = useNavigation<Nav>();
  const { alarms } = useStore();

  const sorted = [...alarms].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>GetUp</Text>
          <Text style={styles.tagline}>Turn waking up into a mission</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AlarmEditor', {})}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF7A40', '#FF5F1F']}
            style={styles.addBtnGradient}
          >
            <Text style={styles.addBtnText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {sorted.length === 0 ? (
        <EmptyState
          emoji="⏰"
          title="No alarms yet"
          subtitle="Set your first alarm and complete a Bathroom Roulette challenge to stop it."
          action={
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => navigation.navigate('AlarmEditor', {})}
            >
              <Text style={styles.emptyAddText}>Set an alarm</Text>
            </TouchableOpacity>
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>
            {sorted.filter((a) => a.enabled).length} active alarm{sorted.filter((a) => a.enabled).length !== 1 ? 's' : ''}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  addBtnGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  addBtnText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 32,
  },
  list: {
    paddingHorizontal: 24,
    gap: 12,
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
  emptyAddBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  emptyAddText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});