import { useColorScheme } from '@/components/useColorScheme';
import { MOOD_COLORS, THEME } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import { Tabs, router } from 'expo-router';
import { Compass, Home, Search, Smile, User } from 'lucide-react-native';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarActiveTintColor: MOOD_COLORS.happy.primary, // distinctive active color
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="mood"
        options={{
          title: 'Mood',
          tabBarIcon: ({ color, size }) => <Smile color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="search_trigger"
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault(); // Prevent navigation to the dummy tab
            router.push('/search'); // Navigate to the search modal in its root location
          },
        })}
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: theme.text, // Contrast background
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: Platform.OS === 'ios' ? 15 : 20,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}>
              <Search color={theme.background} size={24} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
