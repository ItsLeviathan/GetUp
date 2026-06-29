import { BathroomItemId } from '@/constants';

export interface Alarm {
  id: string;
  label: string;
  time: string;
  days: number[];
  enabled: boolean;
  challengeMode: 'bathroom_roulette';
  soundId: string;
  snoozeMinutes: number;
  createdAt: number;
}

export interface ChallengeSession {
  alarmId: string;
  startedAt: number;
  item: BathroomItemId;
  itemLabel: string;
  itemEmoji: string;
  completedAt?: number;
  photoUri?: string;
}

export interface WakeRecord {
  date: string;
  alarmId: string;
  item: BathroomItemId;
  completedAt: number;
  minutesToComplete: number;
}

export interface AppStats {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  averageMinutes: number;
}

export type RootStackParamList = {
  Main: undefined;
  AlarmEditor: { alarmId?: string };
  ActiveChallenge: { sessionId: string };
  ChallengeCamera: { sessionId: string };
  ChallengeResult: { sessionId: string; success: boolean };
};

export type TabParamList = {
  Alarms: undefined;
  History: undefined;
  Stats: undefined;
};