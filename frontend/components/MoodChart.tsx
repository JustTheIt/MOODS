import { useColorScheme } from '@/components/useColorScheme';
import { MOOD_COLORS, MoodType, THEME } from '@/constants/theme';
import { MoodLog } from '@/types';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Line, Rect, Svg } from 'react-native-svg';

interface MoodChartProps {
    logs: MoodLog[];
}

export default function MoodChart({ logs }: MoodChartProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;

    const height = 180;
    const barWidth = 16;
    const spacing = 28;
    const maxBars = 7;
    const displayLogs = logs.slice(0, maxBars).reverse();
    // If fewer than 7, we just show what we have. 
    // In a real app we'd pad with empty days.

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Weekly Flow</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>Last 7 Entries</Text>
            </View>

            <View style={styles.chartArea}>
                {displayLogs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={{ color: theme.textSecondary }}>No data yet</Text>
                    </View>
                ) : (
                    <Svg height={height} width="100%">
                        {/* Grid Lines */}
                        <Line x1="0" y1={height * 0.25} x2="100%" y2={height * 0.25} stroke={theme.border} strokeWidth="1" strokeDasharray="4 4" opacity={0.5} />
                        <Line x1="0" y1={height * 0.5} x2="100%" y2={height * 0.5} stroke={theme.border} strokeWidth="1" strokeDasharray="4 4" opacity={0.5} />
                        <Line x1="0" y1={height * 0.75} x2="100%" y2={height * 0.75} stroke={theme.border} strokeWidth="1" strokeDasharray="4 4" opacity={0.5} />

                        {displayLogs.map((log, index) => {
                            const moodColor = MOOD_COLORS[log.mood as MoodType] || MOOD_COLORS.happy;
                            // Mood 'Height' Mapping
                            let barHeight = 40;
                            if (['happy', 'love'].includes(log.mood)) barHeight = 140;
                            else if (['calm'].includes(log.mood)) barHeight = 100;
                            else if (['tired', 'anxious'].includes(log.mood)) barHeight = 70;
                            else if (['sad', 'angry'].includes(log.mood)) barHeight = 50;

                            const x = index * (barWidth + spacing) + 10;
                            const y = height - barHeight - 20; // 20px padding bottom for labels

                            return (
                                <React.Fragment key={log.id}>
                                    <Rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        fill={moodColor.primary}
                                        rx={barWidth / 2}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </Svg>
                )}

                {/* Labels Row (Separate from SVG for easier text handling) */}
                <View style={[styles.labelsRow, { paddingLeft: 10 }]}>
                    {displayLogs.map((log, index) => (
                        <View key={log.id} style={{ width: barWidth, marginRight: spacing, alignItems: 'center' }}>
                            <Text style={[styles.dayLabel, { color: theme.textSecondary }]}>
                                {format(log.timestamp, 'EEEEE')}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    chartArea: {
        height: 200,
        justifyContent: 'flex-end',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelsRow: {
        flexDirection: 'row',
        marginTop: 5,
        height: 20,
    },
    dayLabel: {
        fontSize: 10,
        fontWeight: '600',
    }
});
