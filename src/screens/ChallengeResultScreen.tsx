import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/store';
import { COLORS } from '@/constants';
import { RootStackParamList } from '@/types';
import { format } from 'date-fns';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ChallengeResult'>;

export function ChallengeResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { activeSession, clearActiveSession, getStats } = useStore();

  const success = route.params.success;
  const stats = getStats();

  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDone = () => {
    clearActiveSession();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const completedAt = activeSession?.completedAt
    ? format(new Date(activeSession.completedAt), 'h:mm a')
    : '';
  const minutesTaken = activeSession?.completedAt && activeSession.startedAt
    ? Math.max(1, Math.round((activeSession.completedAt - activeSession.startedAt) / 60000))
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={
          success
            ? ['#0A0E1A', '#0D1F14', '#0A0E1A']
            : ['#0A0E1A', '#1A0E0E', '#0A0E1A']
        }
        style={styles.bg}
      >
        <Animated.View
          style={[styles.center, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          {/* Result icon */}
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: success ? COLORS.successDim : COLORS.dangerDim },
            ]}
          >
            <Text style={styles.icon}>{success ? '✅' : '❌'}</Text>
          </View>

          {/* Headline */}
          <Text style={[styles.headline, { color: success ? COLORS.success : COLORS.danger }]}>
            {success ? 'Mission Complete!' : 'Mission Failed'}
          </Text>

          {success && activeSession && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Item found  </Text>
                <Text style={styles.summaryValue}>
                  {activeSession.itemEmoji} {activeSession.itemLabel}
                </Text>
              </Text>
              {completedAt ? (
                <Text style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Completed  </Text>
                  <Text style={styles.summaryValue}>{completedAt}</Text>
                </Text>
              ) : null}
              {minutesTaken > 0 && (
                <Text style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Time taken  </Text>
                  <Text style={styles.summaryValue}>{minutesTaken} min</Text>
                </Text>
              )}
            </View>
          )}

          {/* Streak banner */}
          {success && stats.currentStreak > 0 && (
            <View style={styles.streakBanner}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakText}>
                {stats.currentStreak} day streak
              </Text>
            </View>
          )}

          {!success && (
            <Text style={styles.failDesc}>
              The challenge wasn't verified. Keep the alarm going until you find the item.
            </Text>
          )}
        </Animated.View>

        <Animated.View style={[styles.bottomActions, { opacity: fadeAnim }]}>
          {!success && (
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => navigation.replace('ChallengeCamera', { sessionId: 'active' })}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#FF7A40', '#FF5F1F']}
                style={styles.retryGradient}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.doneBtn, success && styles.doneBtnFull]}
            onPress={handleDone}
            activeOpacity={0.75}
          >
            <LinearGradient
              colors={success ? ['#1E7C3C', '#22C55E'] : ['transparent', 'transparent']}
              style={styles.doneBtnInner}
            >
              <Text style={[styles.doneText, !success && styles.doneTextMuted]}>
                {success ? 'Done' : 'Dismiss Alarm'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  bg: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 20,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: { fontSize: 56 },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 12,
    width: '100%',
  },
  summaryRow: { fontSize: 15 },
  summaryKey: { color: COLORS.textMuted, fontWeight: '500' },
  summaryValue: { color: COLORS.textPrimary, fontWeight: '700' },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2D1A00',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  streakFire: { fontSize: 22 },
  streakText: { fontSize: 16, fontWeight: '700', color: COLORS.warning },
  failDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  bottomActions: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    gap: 12,
  },
  retryBtn: { borderRadius: 16, overflow: 'hidden' },
  retryGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  retryText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  doneBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  doneBtnFull: { borderColor: 'transparent' },
  doneBtnInner: { paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  doneText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  doneTextMuted: { color: COLORS.textSecondary },
});