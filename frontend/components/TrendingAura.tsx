import { useColorScheme } from '@/components/useColorScheme';
import { MOOD_COLORS, MoodType, THEME } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const BUBBLES = [
    { mood: 'happy', size: 110, top: 30, left: 20, delay: 0 },
    { mood: 'calm', size: 120, top: 50, left: 205, delay: 500 },
    { mood: 'anxious', size: 95, top: 125, left: 125, delay: 1000 },
    { mood: 'sad', size: 85, top: 200, left: 45, delay: 1500 },
    { mood: 'love', size: 95, top: 215, left: 220, delay: 2000 },
];

interface TrendingAuraProps {
    onMoodPress?: (mood: MoodType) => void;
    activeMood?: MoodType | null;
}

function PulseBubble({ bubble, onMoodPress, activeMood, theme }: { bubble: any, onMoodPress: any, activeMood: any, theme: any }) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.8);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 2000 + bubble.delay / 5 }),
                withTiming(1, { duration: 2000 + bubble.delay / 5 })
            ),
            -1,
            true
        );
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1500 }),
                withTiming(0.7, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value
    }));

    const color = MOOD_COLORS[bubble.mood as MoodType] || MOOD_COLORS.happy;
    const isActive = activeMood === bubble.mood;

    return (
        <TouchableOpacity
            onPress={() => onMoodPress?.(bubble.mood)}
            style={{
                position: 'absolute',
                top: bubble.top,
                left: bubble.left,
                width: bubble.size,
                height: bubble.size,
                zIndex: isActive ? 10 : 1,
            }}
        >
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                <LinearGradient
                    colors={color.gradient}
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: bubble.size / 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: color.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                        elevation: 8,
                        borderWidth: isActive ? 3 : 0,
                        borderColor: '#fff',
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: bubble.size * 0.15 }}>
                        {bubble.mood.charAt(0).toUpperCase() + bubble.mood.slice(1)}
                    </Text>
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function TrendingAura({ onMoodPress, activeMood }: TrendingAuraProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.text }]}>Community Aura</Text>
            <View style={[styles.auraBox, { backgroundColor: '#0A0E1A', borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 }]}>
                {BUBBLES.map((b, i) => (
                    <PulseBubble
                        key={i}
                        bubble={b}
                        onMoodPress={onMoodPress}
                        activeMood={activeMood}
                        theme={theme}
                    />
                ))}
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
