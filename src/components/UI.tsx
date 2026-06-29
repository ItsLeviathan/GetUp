import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants';

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[styles.btnWrap, style]} activeOpacity={0.85}>
        <LinearGradient
          colors={['#FF7A40', '#FF5F1F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btnPrimary}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>{label}</Text>
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
        style={[styles.btnGhost, { borderColor: COLORS.danger }, style]}
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
      style={[styles.btnGhost, style]}
      activeOpacity={0.75}
    >
      <Text style={styles.btnGhostText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── SectionLabel ──────────────────────────────────────────────────────────────
export function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
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
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  btnWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  btnPrimary: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnGhost: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnGhostText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
    marginBottom: 8,
    marginLeft: 4,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 8,
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
  },
  emptyAction: {
    marginTop: 20,
  },
});