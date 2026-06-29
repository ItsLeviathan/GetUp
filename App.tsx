import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';

import { useStore } from '@/store';
import { requestNotificationPermissions } from '@/services/notifications';
import { COLORS } from '@/constants';
import { RootStackParamList, TabParamList } from '@/types';

import { AlarmsScreen } from '@/screens/AlarmsScreen';
import { AlarmEditorScreen } from '@/screens/AlarmEditorScreen';
import { ActiveChallengeScreen } from '@/screens/ActiveChallengeScreen';
import { ChallengeCameraScreen } from '@/screens/ChallengeCameraScreen';
import { ChallengeResultScreen } from '@/screens/ChallengeResultScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { StatsScreen } from '@/screens/StatsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const NAV_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.bg,
    card: COLORS.bgCard,
    text: COLORS.textPrimary,
    border: COLORS.border,
  },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Alarms: '⏰',
            History: '📅',
            Stats: '📊',
          };
          return <Text style={{ fontSize: size - 4 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Alarms" component={AlarmsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { hydrate, hydrated } = useStore();

  useEffect(() => {
    hydrate();
    requestNotificationPermissions();
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={NAV_THEME}>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="AlarmEditor" component={AlarmEditorScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="ActiveChallenge" component={ActiveChallengeScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="ChallengeCamera" component={ChallengeCameraScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="ChallengeResult" component={ChallengeResultScreen} options={{ gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}