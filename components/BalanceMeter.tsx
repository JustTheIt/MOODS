import { THEME } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Circle, G, Svg } from 'react-native-svg';

interface BalanceMeterProps {
    score: number; // 0 to 100, 50 is balanced
}

export default function BalanceMeter({ score }: BalanceMeterProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const radius = 60;
    const strokeWidth = 12; // Slightly thicker for modern look
    const circumference = 2 * Math.PI * radius;
    // Limit arc to 180 degrees (half circle)
    const arcLength = circumference / 2;
    const progress = (score / 100) * arcLength;

    const [showInfo, setShowInfo] = useState(false);

    // Color logic: 40-60 is green (balanced), else warning
    const isBalanced = score >= 40 && score <= 60;
    const color = isBalanced ? '#20B2AA' : score > 60 ? '#FFD700' : '#4682B4'; // Green, Gold (High), Blue (Low)

    // Breathing Animation
    const scale = useSharedValue(1);
    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.03, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: showInfo ? 1 : scale.value }] // Stop breathing when interacting
    }));

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowInfo(!showInfo);
    };

    return (
        <Pressable onPress={handlePress} style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: theme.text }]}>Emotional Balance</Text>
                <View style={[styles.infoBadge, { backgroundColor: theme.border }]}>
                    <Text style={[styles.infoIcon, { color: theme.textSecondary }]}>i</Text>
                </View>
            </View>

            <View style={styles.contentContainer}>
                {showInfo ? (
                    <View style={styles.infoContainer}>
                        <Text style={[styles.infoTitle, { color: theme.text }]}>
                            {isBalanced ? 'Balanced State' : score > 60 ? 'High Energy' : 'Restorative State'}
                        </Text>
                        <Text style={[styles.infoDesc, { color: theme.textSecondary }]}>
                            {isBalanced
                                ? "You are in a state of equilibrium. Great for focus and decision making."
                                : score > 60
                                    ? "Your emotional energy is high. Channel this into creative or physical activities."
                                    : "You are preserving energy. It's a good time for rest and self-care."
                            }
                        </Text>
                        <Text style={[styles.tapHint, { color: theme.textSecondary }]}>Tap to view meter</Text>
                    </View>
                ) : (
                    <View style={styles.meterWrapper}>
                        <Animated.View style={animatedStyle}>
                            <Svg height={140} width={140} viewBox="0 0 140 140">
                                <G rotation="-180" origin="70, 70">
                                    {/* Background Arc */}
                                    <Circle
                                        cx="70"
                                        cy="70"
                                        r={radius}
                                        stroke={theme.border}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={`${arcLength} ${circumference}`}
                                        fill="transparent"
                                        strokeLinecap="round"
                                        opacity={0.3}
                                    />
                                    {/* Progress Arc */}
                                    <Circle
                                        cx="70"
                                        cy="70"
                                        r={radius}
                                        stroke={color}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={`${progress} ${circumference}`}
                                        fill="transparent"
                                        strokeLinecap="round"
                                    />
                                </G>
                            </Svg>
                        </Animated.View>
                        <View style={styles.scoreOverlay}>
                            <Text style={[styles.score, { color: theme.text }]}>{score}</Text>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>
                                {isBalanced ? 'Stable' : score > 60 ? 'High' : 'Low'}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 20,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoIcon: {
        fontSize: 14,
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    contentContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    meterWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 80, // Half circle height
        marginTop: 20,
    },
    scoreOverlay: {
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
    },
    score: {
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 36,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        gap: 10,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoDesc: {
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    tapHint: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 10,
    }
});
