import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

/**
 * Hanya akun `user` — admin/super_admin dipaksa keluar (fitur moderasi hanya di web).
 */
export function useProtectedUser() {
  const { ready, token, user, logout } = useAuth();
  const router = useRouter();
  const alerted = useRef(false);

  useEffect(() => {
    if (user?.role === 'user') alerted.current = false;
  }, [user?.role]);

  useEffect(() => {
    if (!ready) return;

    if (!token) {
      router.replace('/login');
      return;
    }

    if (user && user.role !== 'user') {
      if (!alerted.current) {
        alerted.current = true;
        Alert.alert(
          'Akses terbatas',
          'Aplikasi ini hanya untuk akun warga. Silakan gunakan website untuk admin atau super admin.',
          [
            {
              text: 'OK',
              onPress: () => {
                logout();
                router.replace('/login');
              },
            },
          ]
        );
      }
    }
  }, [ready, token, user, logout, router]);
}
