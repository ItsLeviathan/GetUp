import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/store';
import { COLORS, RADIUS } from '@/constants';
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
      AccessibilityInfo.announceForAccessibility('Mission complete. Alarm stopped.');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      AccessibilityInfo.announceForAccessibility('Not quite. That item did not match, try again.');
    }

    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, []);

  const handleDone = () => {
    clearActiveSession();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const handleCantFind = () => {
    Alert.alert(
      "Can't find it?",
      "The alarm will keep going until the challenge is verified. Check nearby surfaces, or try better lighting and hold the item closer to the camera.",
      [
        { text: 'Keep trying', style: 'cancel' },
        {
          text: 'Try Again',
          onPress: () => navigation.replace('ChallengeCamera', { sessionId: 'active' }),
        },
      ]
    );
  };

  const completedAt = activeSession?.completedAt ? format(new Date(activeSession.completedAt), 'h:mm a') : '';
  const minutesTaken =
    activeSession?.completedAt && activeSession.startedAt
      ? Math.max(1, Math.round((activeSession.completedAt - activeSession.startedAt) / 60000))
      : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={success ? ['#050505', '#08150E', '#050505'] : ['#050505', '#180A0D', '#050505']}
        style={styles.bg}
      >
        <Animated.View style={[styles.center, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.iconWrap, { backgroundColor: success ? COLORS.successDim : COLORS.dangerDim }]} importantForAccessibility="no-hide-descendants">
            <Text style={styles.icon}>{success ? '✅' : '❌'}</Text>
          </View>

          <Text
            style={[styles.headline, { color: success ? COLORS.success : COLORS.danger }]}
            accessibilityRole="header"
          >
            {success ? 'Mission Complete!' : 'Not Quite'}
          </Text>

          {success && activeSession && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Item found</Text>
                <Text style={styles.summaryValue}>
                  {activeSession.itemEmoji} {activeSession.itemLabel}
                </Text>
              </View>
              {completedAt ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Completed</Text>
                  <Text style={styles.summaryValue}>{completedAt}</Text>
                </View>
              ) : null}
              {minutesTaken > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Time taken</Text>
                  <Text style={styles.summaryValue}>{minutesTaken} min</Text>
                </View>
              )}
            </View>
          )}

          {success && stats.currentStreak > 0 && (
            <View
              style={styles.streakBanner}
              accessible
              accessibilityLabel={`${stats.currentStreak} day streak`}
            >
              <Text style={styles.streakFire} importantForAccessibility="no">🔥</Text>
              <Text style={styles.streakText}>{stats.currentStreak} day streak</Text>
            </View>
          )}

          {!success && (
            <Text style={styles.failDesc}>
              That didn't match. Keep the alarm going until the camera confirms the item.
            </Text>
          )}
        </Animated.View>

        <Animated.View style={[styles.bottomActions, { opacity: fadeAnim }]}>
          {!success && (
            <>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => navigation.replace('ChallengeCamera', { sessionId: 'active' })}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Try again"
              >
                <LinearGradient colors={['#FF6B85', '#FF3D5C']} style={styles.retryGradient}>
                  <Text style={styles.retryText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCantFind}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="I can't find it"
              >
                <Text style={styles.cantFindLink}>I can't find it</Text>
              </TouchableOpacity>
            </>
          )}

          {success && (
            <TouchableOpacity
              style={styles.doneBtnFull}
              onPress={handleDone}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Done"
            >
              <LinearGradient colors={['#4DFFA9', '#1FE38A']} style={styles.doneBtnInner}>
                <Text style={styles.doneText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  bg: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 20 },
  iconWrap: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  icon: { fontSize: 56 },
  headline: { fontSize: 32, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center', textTransform: 'uppercase' },
  summaryCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 12,
    width: '100%',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryKey: { color: COLORS.textMuted, fontWeight: '500', fontSize: 15 },
  summaryValue: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryDim,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  streakFire: { fontSize: 22 },
  streakText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  failDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, maxWidth: 260 },
  bottomActions: { paddingHorizontal: 28, paddingBottom: 40, gap: 14, alignItems: 'center' },
  retryBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', width: '100%' },
  retryGradient: { paddingVertical: 18, alignItems: 'center', borderRadius: RADIUS.lg },
  retryText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  cantFindLink: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  doneBtnFull: { borderRadius: RADIUS.lg, overflow: 'hidden', width: '100%' },
  doneBtnInner: { paddingVertical: 16, alignItems: 'center', borderRadius: RADIUS.lg },
  doneText: { color: COLORS.onPrimary, fontSize: 16, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
});