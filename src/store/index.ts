import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, ChallengeSession, WakeRecord, AppStats } from '@/types';
import { BATHROOM_ITEMS } from '@/constants';
import { format } from 'date-fns';

const STORAGE_KEYS = {
  alarms: '@getup:alarms',
  records: '@getup:records',
};

interface StoreState {
  alarms: Alarm[];
  records: WakeRecord[];
  activeSession: ChallengeSession | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addAlarm: (alarm: Alarm) => Promise<void>;
  updateAlarm: (id: string, patch: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  startChallenge: (alarmId: string) => ChallengeSession;
  completeChallenge: (alarmId: string, photoUri: string) => Promise<WakeRecord>;
  clearActiveSession: () => void;
  getStats: () => AppStats;
}

const pickRandomItem = () => BATHROOM_ITEMS[Math.floor(Math.random() * BATHROOM_ITEMS.length)];

export const useStore = create<StoreState>((set, get) => ({
  alarms: [],
  records: [],
  activeSession: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const [alarmsRaw, recordsRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.alarms),
        AsyncStorage.getItem(STORAGE_KEYS.records),
      ]);
      set({
        alarms: alarmsRaw ? JSON.parse(alarmsRaw) : [],
        records: recordsRaw ? JSON.parse(recordsRaw) : [],
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  addAlarm: async (alarm) => {
    const alarms = [...get().alarms, alarm];
    set({ alarms });
    await AsyncStorage.setItem(STORAGE_KEYS.alarms, JSON.stringify(alarms));
  },

  updateAlarm: async (id, patch) => {
    const alarms = get().alarms.map((a) => (a.id === id ? { ...a, ...patch } : a));
    set({ alarms });
    await AsyncStorage.setItem(STORAGE_KEYS.alarms, JSON.stringify(alarms));
  },

  deleteAlarm: async (id) => {
    const alarms = get().alarms.filter((a) => a.id !== id);
    set({ alarms });
    await AsyncStorage.setItem(STORAGE_KEYS.alarms, JSON.stringify(alarms));
  },

  toggleAlarm: async (id) => {
    const alarms = get().alarms.map((a) =>
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    set({ alarms });
    await AsyncStorage.setItem(STORAGE_KEYS.alarms, JSON.stringify(alarms));
  },

  startChallenge: (alarmId) => {
    const item = pickRandomItem();
    const session: ChallengeSession = {
      alarmId,
      startedAt: Date.now(),
      item: item.id,
      itemLabel: item.label,
      itemEmoji: item.emoji,
    };
    set({ activeSession: session });
    return session;
  },

  completeChallenge: async (alarmId, photoUri) => {
    const session = get().activeSession!;
    const completedAt = Date.now();
    const minutesToComplete = Math.max(1, Math.round((completedAt - session.startedAt) / 60000));
    const record: WakeRecord = {
      date: format(new Date(), 'yyyy-MM-dd'),
      alarmId,
      item: session.item,
      completedAt,
      minutesToComplete,
    };
    const records = [record, ...get().records];
    set({ records, activeSession: { ...session, completedAt, photoUri } });
    await AsyncStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
    return record;
  },

  clearActiveSession: () => set({ activeSession: null }),

  getStats: () => {
    const { records } = get();
    if (!records.length) return { currentStreak: 0, longestStreak: 0, totalCompleted: 0, averageMinutes: 0 };

    const totalCompleted = records.length;
    const averageMinutes = Math.round(
      records.reduce((s, r) => s + r.minutesToComplete, 0) / totalCompleted
    );

    const dates = [...new Set(records.map((r) => r.date))].sort().reverse();
    let longestStreak = 1;
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / 86400000;
      streak = diff === 1 ? streak + 1 : 1;
      if (streak > longestStreak) longestStreak = streak;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    let currentStreak = 0;
    if (dates[0] === today || dates[0] === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const diff = (new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / 86400000;
        if (diff === 1) currentStreak++;
        else break;
      }
    }

    return { currentStreak, longestStreak, totalCompleted, averageMinutes };
  },
}));