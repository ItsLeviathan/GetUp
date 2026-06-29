import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImageManipulator from 'expo-image-manipulator';
import { useStore } from '@/store';
import { verifyBathroomItem } from '@/services/verification';
import { COLORS } from '@/constants';
import { RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ChallengeCameraScreen() {
  const navigation = useNavigation<Nav>();
  const { activeSession, completeChallenge } = useStore();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [verifying, setVerifying] = useState(false);
  const [attemptFeedback, setAttemptFeedback] = useState<string | null>(null);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !activeSession || verifying) return;

    setVerifying(true);
    setAttemptFeedback(null);

    try {
      // Take photo — camera-only, no gallery access (anti-cheat)
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        base64: false,
        skipProcessing: true,
      });

      if (!photo?.uri) throw new Error('No photo captured');

      // Resize to 640px wide before sending to Roboflow (saves bandwidth, YOLO prefers 640)
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 640 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (!resized.base64) throw new Error('Base64 encoding failed');

      // Send to Roboflow YOLO model
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
      setAttemptFeedback('Something went wrong. Try again.');
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
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionDesc}>
          GetUp needs camera access to verify your bathroom challenge. No photos are stored.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!activeSession) return null;

  return (
    <View style={styles.root}>
      {/* Live camera view — rear camera for anti-cheat */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        {/* Target overlay */}
        <SafeAreaView style={styles.overlay}>
          {/* Top HUD */}
          <View style={styles.hud}>
            <View style={styles.targetBadge}>
              <Text style={styles.targetEmoji}>{activeSession.itemEmoji}</Text>
              <Text style={styles.targetLabel}>Find: {activeSession.itemLabel}</Text>
            </View>
          </View>

          {/* Scan frame */}
          <View style={styles.frameWrap}>
            <View style={styles.frame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.frameHint}>Point at the {activeSession.itemLabel.toLowerCase()}</Text>
          </View>

          {/* Bottom controls */}
          <View style={styles.controls}>
            {attemptFeedback && (
              <View style={styles.feedbackBanner}>
                <Text style={styles.feedbackText}>❌  {attemptFeedback}</Text>
              </View>
            )}

            {verifying ? (
              <View style={styles.verifyingWrap}>
                <ActivityIndicator color={COLORS.primary} size="large" />
                <Text style={styles.verifyingText}>Scanning with YOLO...</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.shutterWrap} onPress={handleCapture} activeOpacity={0.85}>
                <View style={styles.shutterRing}>
                  <View style={styles.shutterBtn} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

// Corner frame helper
function Corner({ style }: { style: object }) {
  return <View style={style} />;
}

const CORNER_SIZE = 28;
const CORNER_WIDTH = 3;
const FRAME_SIZE = 220;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },

  // HUD
  hud: { alignItems: 'center', paddingTop: 16 },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  targetEmoji: { fontSize: 20 },
  targetLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Scan frame
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

  // Controls
  controls: { paddingBottom: 48, alignItems: 'center', gap: 20 },
  feedbackBanner: {
    backgroundColor: 'rgba(239,68,68,0.85)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 32,
  },
  feedbackText: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  verifyingWrap: { alignItems: 'center', gap: 12 },
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
  shutterBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
  },

  // Permissions
  permissionScreen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  permissionEmoji: { fontSize: 56 },
  permissionTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  permissionDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  permissionBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  permissionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});