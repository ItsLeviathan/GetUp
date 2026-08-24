import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Linking,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImageManipulator from 'expo-image-manipulator';
import { useStore } from '@/store';
import { verifyBathroomItem } from '@/services/verification';
import { COLORS, RADIUS } from '@/constants';
import { RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ChallengeCameraScreen() {
  const navigation = useNavigation<Nav>();
  const { activeSession, completeChallenge } = useStore();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [verifying, setVerifying] = useState(false);
  const [attemptFeedback, setAttemptFeedback] = useState<string | null>(null);
  const [shutterPressed, setShutterPressed] = useState(false);

  useEffect(() => {
    if (!attemptFeedback) return;
    const t = setTimeout(() => setAttemptFeedback(null), 6000);
    return () => clearTimeout(t);
  }, [attemptFeedback]);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !activeSession || verifying) return;

    setVerifying(true);
    setAttemptFeedback(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        base64: false,
        skipProcessing: true,
      });

      if (!photo?.uri) throw new Error('No photo captured');

      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 640 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (!resized.base64) throw new Error('Base64 encoding failed');

      const result = await verifyBathroomItem(resized.base64, activeSession.item);

      if (result.success) {
        await completeChallenge(activeSession.alarmId, photo.uri);
        navigation.replace('ChallengeResult', { sessionId: 'active', success: true });
      } else {
        setAttemptFeedback(result.message);
        setVerifying(false);
      }
    } catch (err) {
      console.error('Capture error:', err);
      setAttemptFeedback("Couldn't process that photo. Try again.");
      setVerifying(false);
    }
  }, [activeSession, verifying, completeChallenge, navigation]);

  // ── Permissions ──────────────────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    const canAskAgain = permission.canAskAgain;
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <View style={styles.permissionIconWrap} importantForAccessibility="no-hide-descendants">
          <Text style={styles.permissionEmoji}>📷</Text>
        </View>
        <Text style={styles.permissionTitle} accessibilityRole="header">Camera access needed</Text>
        <Text style={styles.permissionDesc}>
          GetUp needs your camera to verify the Bathroom Roulette challenge. Photos are checked
          on-device for the item and never saved or shared.
        </Text>

        {canAskAgain ? (
          <TouchableOpacity
            style={styles.permissionBtn}
            onPress={requestPermission}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Allow camera access"
          >
            <Text style={styles.permissionBtnText}>Allow Camera</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.permissionBtn}
            onPress={() =>
              Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings()
            }
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Open device settings"
          >
            <Text style={styles.permissionBtnText}>Open Settings</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.permissionBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.permissionBackText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!activeSession) return null;

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <SafeAreaView style={styles.overlay}>
          {/* Top HUD */}
          <View style={styles.hud}>
            <View
              style={styles.targetBadge}
              accessible
              accessibilityLabel={`Find and photograph the ${activeSession.itemLabel.toLowerCase()}`}
            >
              <Text style={styles.targetEmoji} importantForAccessibility="no">{activeSession.itemEmoji}</Text>
              <Text style={styles.targetLabel}>Find: {activeSession.itemLabel}</Text>
            </View>
          </View>

          {/* Scan frame */}
          <View style={styles.frameWrap} importantForAccessibility="no-hide-descendants">
            <View style={styles.frame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.frameHint}>
              Point at the {activeSession.itemLabel.toLowerCase()} and hold steady
            </Text>
          </View>

          {/* Bottom controls */}
          <View style={styles.controls}>
            {attemptFeedback && (
              <View
                style={styles.feedbackBanner}
                accessibilityLiveRegion="assertive"
                accessible
              >
                <Text style={styles.feedbackText}>❌  {attemptFeedback}</Text>
              </View>
            )}

            {verifying ? (
              <View style={styles.verifyingWrap} accessibilityLiveRegion="polite" accessible>
                <ActivityIndicator color={COLORS.primary} size="large" />
                <Text style={styles.verifyingText}>Checking your photo...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.shutterWrap}
                onPress={handleCapture}
                onPressIn={() => setShutterPressed(true)}
                onPressOut={() => setShutterPressed(false)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Take photo"
                accessibilityHint={`Captures a photo to verify the ${activeSession.itemLabel.toLowerCase()}`}
              >
                <View style={[styles.shutterRing, shutterPressed && styles.shutterRingPressed]}>
                  <View style={[styles.shutterBtn, shutterPressed && styles.shutterBtnPressed]} />
                </View>
              </TouchableOpacity>
            )}

            {!verifying && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                accessibilityRole="button"
                accessibilityLabel="Cancel and go back"
              >
                <Text style={styles.cancelLink}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const CORNER_SIZE = 28;
const CORNER_WIDTH = 3;
const FRAME_SIZE = 220;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },

  hud: { alignItems: 'center', paddingTop: 16 },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: RADIUS.pill,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  targetEmoji: { fontSize: 20 },
  targetLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },

  frameWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: COLORS.primary,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderBottomRightRadius: 6 },
  frameHint: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center' },

  controls: { paddingBottom: 36, alignItems: 'center', gap: 16 },
  feedbackBanner: {
    backgroundColor: 'rgba(255, 61, 92, 0.92)',
    borderRadius: RADIUS.sm,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 32,
  },
  feedbackText: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  verifyingWrap: { alignItems: 'center', gap: 12, paddingVertical: 14 },
  verifyingText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  shutterWrap: { alignItems: 'center', justifyContent: 'center' },
  shutterRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterRingPressed: {
    borderColor: COLORS.primary,
  },
  shutterBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
  },
  shutterBtnPressed: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
  },
  cancelLink: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },

  permissionScreen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  permissionIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  permissionEmoji: { fontSize: 44 },
  permissionTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  permissionDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 300 },
  permissionBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  permissionBtnText: { color: COLORS.onPrimary, fontSize: 16, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  permissionBack: { marginTop: 4, padding: 8 },
  permissionBackText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
});