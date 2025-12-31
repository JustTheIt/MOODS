import { useColorScheme } from '@/components/useColorScheme';
import { MOOD_COLORS, THEME } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const BUBBLES = [
    { mood: 'happy', size: 110, top: 30, left: 20 },      // Top Left
    { mood: 'calm', size: 120, top: 50, left: 205 },      // Top Rightish
    { mood: 'anxious', size: 95, top: 125, left: 125 },   // Middle
    { mood: 'sad', size: 85, top: 200, left: 45 },        // Bottom Left
    { mood: 'love', size: 95, top: 215, left: 220 },      // Bottom Right
];

export default function TrendingAura() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;

    const handlePress = (mood: string) => {
        Alert.alert('Community Pulse', `Exploring ${mood} vibes in your area.`);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.text }]}>Community Aura</Text>
            <View style={[styles.auraBox, { backgroundColor: '#0A0E1A', borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 }]}>
                {BUBBLES.map((b, i) => {
                    const color = MOOD_COLORS[b.mood as keyof typeof MOOD_COLORS] || MOOD_COLORS.happy;
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => handlePress(b.mood)}
                            style={{
                                position: 'absolute',
                                top: b.top,
                                left: b.left,
                                width: b.size,
                                height: b.size,
                            }}
                        >
                            <LinearGradient
                                colors={color.gradient}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: b.size / 2,
                                    opacity: 0.95,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    shadowColor: color.primary,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 10,
                                    elevation: 8,
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: b.size * 0.15 }}>
                                    {b.mood.charAt(0).toUpperCase() + b.mood.slice(1)}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginLeft: 20,
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    auraBox: {
        height: 340,
        marginHorizontal: 15,
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
    }
});
