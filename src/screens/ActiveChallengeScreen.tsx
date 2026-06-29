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

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!activeSession) {
    return null;
  }

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#0A0E1A', '#0F1728', '#0A0E1A']}
        style={styles.bg}
      >
        {/* Alert header */}
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>🚨  ALARM ACTIVE  🚨</Text>
        </View>

        {/* Challenge card */}
        <View style={styles.center}>
          <Text style={styles.missionLabel}>YOUR MISSION</Text>

          {/* Glowing orb behind emoji */}
          <View style={styles.emojiWrap}>
            <Animated.View style={[styles.glowOrb, { opacity: glowOpacity }]} />
            <Animated.Text style={[styles.itemEmoji, { transform: [{ scale: pulse }] }]}>
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
          >
            <LinearGradient
              colors={['#FF7A40', '#FF5F1F', '#E04A10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cameraBtnGradient}
            >
              <Text style={styles.cameraBtnIcon}>📷</Text>
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
    backgroundColor: COLORS.primary,
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
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
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
    shadowOpacity: 0.5,
    shadowRadius: 20,
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
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});