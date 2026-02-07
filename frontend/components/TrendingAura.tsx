
import { MOOD_COLORS, MoodType } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BUBBLES = [
    { mood: 'happy', size: 110, top: 30, left: 20 },
    { mood: 'calm', size: 120, top: 50, left: 205 },
    { mood: 'anxious', size: 95, top: 125, left: 125 },
    { mood: 'sad', size: 85, top: 200, left: 45 },
    { mood: 'love', size: 95, top: 215, left: 220 },
];

interface TrendingAuraProps {
    onMoodPress?: (mood: MoodType) => void;
    activeMood?: MoodType | null;
}

function StaticBubble({ bubble, onMoodPress, activeMood }: { bubble: any, onMoodPress: any, activeMood: any }) {
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
            <View style={StyleSheet.absoluteFill}>
                <LinearGradient
                    colors={color.gradient}
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: bubble.size / 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: isActive ? 3 : 0,
                        borderColor: '#fff',
                        opacity: 0.9,
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: bubble.size * 0.15 }}>
                        {bubble.mood.charAt(0).toUpperCase() + bubble.mood.slice(1)}
                    </Text>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );
}

import { useTheme } from '@/hooks/useTheme';

export default function TrendingAura({ onMoodPress, activeMood }: TrendingAuraProps) {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.text }]}>Community Aura</Text>
            <View style={[styles.auraBox, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                {BUBBLES.map((b, i) => (
                    <StaticBubble
                        key={i}
                        bubble={b}
                        onMoodPress={onMoodPress}
                        activeMood={activeMood}
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
