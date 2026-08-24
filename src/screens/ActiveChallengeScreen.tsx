import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  TouchableOpacity,
  AccessibilityInfo,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '@/store';
import { COLORS } from '@/constants';
import { RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ActiveChallenge'>;

export function ActiveChallengeScreen() {
  const navigation = useNavigation<Nav>();
  const { activeSession } = useStore();

  // Pulse animation on the emoji
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.16,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();
    glowLoop.start();
    return () => {
      pulseLoop.stop();
      glowLoop.stop();
    };
  }, [reduceMotion]);

  if (!activeSession) {
    return null;
  }

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] });

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#050505', '#0F0608', '#050505']}
        style={styles.bg}
      >
        {/* Alert header — coral marks the urgent/live state */}
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>🚨  ALARM ACTIVE  🚨</Text>
        </View>

        {/* Challenge card */}
        <View style={styles.center}>
          <Text style={styles.missionLabel} accessibilityRole="header">YOUR MISSION</Text>

          {/* Glowing volt orb behind emoji — target-lock energy */}
          <View style={styles.emojiWrap} importantForAccessibility="no-hide-descendants">
            <Animated.View style={[styles.glowOrb, { opacity: reduceMotion ? 0.5 : glowOpacity }]} />
            <Animated.Text style={[styles.itemEmoji, { transform: [{ scale: reduceMotion ? 1 : pulse }] }]}>
              {activeSession.itemEmoji}
            </Animated.Text>
          </View>

          <Text style={styles.itemLabel}>{activeSession.itemLabel}</Text>
          <Text style={styles.instruction}>
            Find this in your bathroom and take a photo to stop the alarm.
          </Text>
        </View>

        {/* CTA */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={() => navigation.navigate('ChallengeCamera', { sessionId: 'active' })}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Open camera"
            accessibilityHint={`Take a photo of the ${activeSession.itemLabel.toLowerCase()} to stop the alarm`}
          >
            <LinearGradient
              colors={['#EAFF6B', '#D7FF3D', '#B9E600']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cameraBtnGradient}
            >
              <Text style={styles.cameraBtnIcon} importantForAccessibility="no">📷</Text>
              <Text style={styles.cameraBtnText}>Open Camera</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.hint}>The alarm won't stop until you complete the challenge.</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  bg: { flex: 1 },
  alertBanner: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    alignItems: 'center',
  },
  alertText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  missionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    color: COLORS.primary,
    marginBottom: 8,
  },
  emojiWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
  },
  glowOrb: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary,
  },
  itemEmoji: {
    fontSize: 80,
    zIndex: 1,
  },
  itemLabel: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  instruction: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
  bottom: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    gap: 14,
    alignItems: 'center',
  },
  cameraBtn: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 10,
  },
  cameraBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
    borderRadius: 18,
  },
  cameraBtnIcon: { fontSize: 22 },
  cameraBtnText: {
    color: COLORS.onPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});