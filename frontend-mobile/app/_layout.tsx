import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import 'react-native-reanimated';

function RootStack() {
  const { ready } = useAuth();

  if (!ready) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBar },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Masuk' }} />
      <Stack.Screen name="register" options={{ title: 'Daftar' }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="laporan/new" options={{ title: 'Laporan baru' }} />
      <Stack.Screen name="laporan/[id]" options={{ title: 'Detail laporan' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
