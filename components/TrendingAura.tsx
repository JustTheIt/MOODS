import { MOOD_COLORS, THEME } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

const { width } = Dimensions.get('window');

const BUBBLES = [
    { mood: 'happy', size: 100, top: 20, left: 20 },
    { mood: 'anxious', size: 80, top: 100, left: 140 },
    { mood: 'calm', size: 120, top: 40, left: 220 },
    { mood: 'sad', size: 70, top: 160, left: 40 },
    { mood: 'love', size: 90, top: 180, left: 240 },
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
            <View style={[styles.auraBox, { backgroundColor: theme.card }]}>
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
                                    opacity: 0.8,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
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
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
        marginBottom: 15,
    },
    auraBox: {
        height: 300,
        marginHorizontal: 20,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    }
});
