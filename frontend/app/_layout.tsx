
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';


import { useColorScheme } from '@/components/useColorScheme';
import { VerificationBanner } from '@/components/VerificationBanner';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { MoodProvider, useMood } from '@/context/MoodContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { useTheme } from '@/hooks/useTheme';
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
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const { user: authUser, authLoading } = useAuth();
  const { user: profileUser } = useMood();
  const segments = useSegments();
  const router = useRouter();

  const effectiveTheme = colorScheme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    if (authLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!authUser && !inAuthGroup) {
      router.replace('/login');
    } else if (authUser) {
      const isProfileLoaded = profileUser.id === authUser.uid;

      if (isProfileLoaded) {
        const isVerifyScreen = (segments as string[]).includes('verify-email');

        if (!profileUser.onboardingCompleted && !inOnboardingGroup && !isVerifyScreen) {
          router.replace('/(onboarding)/welcome');
        } else if (profileUser.onboardingCompleted && (inAuthGroup || inOnboardingGroup) && !isVerifyScreen) {
          router.replace('/home');
        }
      }
    }
  }, [authUser, authLoading, profileUser, segments]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <ThemeProvider value={effectiveTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar
        style={effectiveTheme === 'dark' ? 'light' : 'dark'}
        backgroundColor={effectiveTheme === 'dark' ? '#000000' : '#F6F6F6'}
        translucent={false}
      />
      <VerificationBanner />
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
