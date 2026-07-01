import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '@/constants';

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'success';
  size?: 'md' | 'lg';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
  style,
}: ButtonProps) {
  const isCompact = size === 'md';

  if (variant === 'primary' || variant === 'success') {
    const gradientColors: [string, string] =
      variant === 'success' ? ['#2BA84A', '#22C55E'] : ['#FF7A40', '#FF5F1F'];
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.btnWrap, disabled && styles.btnDisabled, style]}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btnPrimary, isCompact ? styles.btnPadMd : styles.btnPadLg]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.btnContent}>
              {icon ? <Text style={styles.btnIcon}>{icon}</Text> : null}
              <Text style={styles.btnPrimaryText}>{label}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.btnGhost,
          isCompact ? styles.btnPadMd : styles.btnPadLg,
          { borderColor: COLORS.danger + '55', backgroundColor: COLORS.dangerDim },
          style,
        ]}
        activeOpacity={0.75}
      >
        <Text style={[styles.btnGhostText, { color: COLORS.danger }]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btnGhost, isCompact ? styles.btnPadMd : styles.btnPadLg, style]}
      activeOpacity={0.75}
    >
      <View style={styles.btnContent}>
        {icon ? <Text style={styles.btnIconGhost}>{icon}</Text> : null}
        <Text style={styles.btnGhostText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── IconBadge ─────────────────────────────────────────────────────────────────
// A consistent round/soft container for an emoji or icon, used for list leading
// icons, headers, and empty states so glyphs never float unanchored.
interface IconBadgeProps {
  icon: string;
  size?: number;
  tint?: string;
  tintDim?: string;
  style?: ViewStyle;
}

export function IconBadge({ icon, size = 44, tint = COLORS.primary, tintDim, style }: IconBadgeProps) {
  return (
    <View
      style={[
        styles.iconBadge,
        {
          width: size,
          height: size,
          borderRadius: size / 2.6,
          backgroundColor: tintDim ?? tint + '22',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.5 }}>{icon}</Text>
    </View>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── SectionLabel ──────────────────────────────────────────────────────────────
export function SectionLabel({ text, hint }: { text: string; hint?: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabel}>{text}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

// ── ScreenHeader ──────────────────────────────────────────────────────────────
// Shared header so every tab (Alarms / History / Stats) reads as one app
// instead of three differently-styled screens.
interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  return (
    <View style={styles.screenHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export function EmptyState({ emoji, title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyGlowWrap}>
        <View style={styles.emptyGlow} />
        <Text style={styles.emptyEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  btnWrap: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnPrimary: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  btnPadMd: { paddingVertical: 16, paddingHorizontal: 24 },
  btnPadLg: { paddingVertical: 19, paddingHorizontal: 28 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnIcon: { fontSize: 17 },
  btnIconGhost: { fontSize: 16 },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  btnGhost: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnGhostText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  iconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    marginLeft: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
  },
  sectionHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyGlowWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryDim,
  },
  emptyEmoji: {
    fontSize: 44,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  emptyAction: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
});