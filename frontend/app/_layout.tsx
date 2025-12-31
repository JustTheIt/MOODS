import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { MoodProvider, useMood } from '@/context/MoodContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ActivityIndicator, View } from 'react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  return (
    <MoodProvider>
      <NotificationProvider>
        <RootLayoutContent />
      </NotificationProvider>
    </MoodProvider>
  );
}

function RootLayoutContent() {
  const systemScheme = useColorScheme();
  const { user: authUser, loading: authLoading } = useAuth();
  const { user: profileUser, settings } = useMood(); // Custom User type with onboardingCompleted
  const segments = useSegments();
  const router = useRouter();

  // effectiveTheme
  const effectiveTheme = 'dark';

  useEffect(() => {
    if (authLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!authUser && !inAuthGroup) {
      // 1. Not logged in -> Go to Login
      router.replace('/login');
    } else if (authUser) {
      // 2. Logged in

      // Check if profile is loaded (if profile ID matches auth ID)
      // Note: profileUser is initialized as 'guest' in MoodContext
      const isProfileLoaded = profileUser.id === authUser.uid;

      if (isProfileLoaded) {
        if (!profileUser.onboardingCompleted && !inOnboardingGroup) {
          // 3. Profile loaded, but onboarding incomplete -> Go to Onboarding
          router.replace('/(onboarding)/welcome');
        } else if (profileUser.onboardingCompleted && (inAuthGroup || inOnboardingGroup)) {
          // 4. Onboarding complete, but on auth/onboarding pages -> Go Home
          router.replace('/home');
        }
      }
      // If profile not loaded yet, wait (do nothing)
    }
  }, [authUser, authLoading, profileUser, segments]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <ThemeProvider value={effectiveTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="search" options={{ presentation: 'modal' }} />
        <Stack.Screen name="post/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notifications" options={{ presentation: 'modal', headerTitle: 'Notifications', headerShown: true }} />
        <Stack.Screen name="stories/create" options={{ presentation: 'modal', headerTitle: 'New Story', headerShown: false }} />
        <Stack.Screen name="stories/viewer" options={{ presentation: 'fullScreenModal', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
