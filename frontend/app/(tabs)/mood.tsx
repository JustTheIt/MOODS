import BalanceMeter from '@/components/BalanceMeter';
import MoodChart from '@/components/MoodChart';
import { useColorScheme } from '@/components/useColorScheme';
import { MOOD_COLORS, MoodType, THEME } from '@/constants/theme';
import { useMood } from '@/context/MoodContext';
import { Edit3 } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Simplified moods for check-in
const CHECK_IN_MOODS: MoodType[] = ['happy', 'calm', 'anxious', 'sad'];

export default function MoodScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const { moodLogs, logMood, user } = useMood();

    const [note, setNote] = useState('');
    const [checkInMood, setCheckInMood] = useState<MoodType | null>(null);

    const handleCheckIn = () => {
        if (!checkInMood) return;
        logMood({
            id: Date.now().toString(),
            userId: user.id,
            mood: checkInMood,
            intensity: 0.5,
            note: note,
            timestamp: Date.now(),
        });
        setCheckInMood(null);
        setNote('');
    };

    // Calulate emotional balance based on recent logs
    const balanceScore = moodLogs.length > 0 ? (() => {
        const positiveMoods = ['happy', 'calm', 'love'];
        const positiveCount = moodLogs.filter(log => positiveMoods.includes(log.mood)).length;
        return Math.round((positiveCount / moodLogs.length) * 100);
    })() : 50; // Neutral starting point

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Reflection</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* 1. Primary Action: Daily Check-in */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.cardHeader}>
                        <Edit3 size={18} color={theme.textSecondary} />
                        <Text style={[styles.cardTitle, { color: theme.text }]}>How are you feeling?</Text>
                    </View>

                    <View style={styles.moodRow}>
                        {CHECK_IN_MOODS.map(m => (
                            <TouchableOpacity
                                key={m}
                                style={[
                                    styles.moodBtn,
                                    {
                                        backgroundColor: checkInMood === m ? MOOD_COLORS[m]?.primary : theme.background,
                                        borderColor: checkInMood === m ? MOOD_COLORS[m]?.primary : theme.border,
                                    }
                                ]}
                                onPress={() => setCheckInMood(m)}
                            >
                                <Text style={{ fontSize: 24 }}>{getMoodEmoji(m)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {checkInMood && (
                        <View style={styles.noteSection}>
                            <TextInput
                                placeholder="Add a mindful note..."
                                placeholderTextColor={theme.textSecondary}
                                style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                                value={note}
                                onChangeText={setNote}
                                multiline
                            />
                            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: MOOD_COLORS[checkInMood]?.primary }]} onPress={handleCheckIn}>
                                <Text style={styles.saveBtnText}>Log Entry</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* 2. Visual Insight: Balance Meter */}
                <View style={styles.sectionSpacer}>
                    <BalanceMeter score={balanceScore} />
                </View>

                {/* 3. Analytics: Chart */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <MoodChart logs={moodLogs} />
                </View>

                {/* 4. History: Journal */}
                <Text style={[styles.sectionHeader, { color: theme.text }]}>Recent Journal</Text>
                <View style={styles.journalList}>
                    {moodLogs.slice(0, 5).map((log) => {
                        const mColor = MOOD_COLORS[log.mood as MoodType] || MOOD_COLORS.happy;
                        return (
                            <View key={log.id} style={[styles.logItem, { backgroundColor: theme.card }]}>
                                <View style={styles.logLeft}>
                                    <View style={[styles.logIndicator, { backgroundColor: mColor.primary }]} />
                                    <View style={styles.logLine} />
                                </View>
                                <View style={styles.logContent}>
                                    <View style={styles.logHeader}>
                                        <Text style={[styles.logMood, { color: theme.text }]}>{log.mood}</Text>
                                        <Text style={[styles.logTime, { color: theme.textSecondary }]}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    </View>
                                    {log.note && (
                                        <Text style={[styles.logNote, { color: theme.textSecondary }]}>{log.note}</Text>
                                    )}
                                </View>
                            </View>
                        )
                    })}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

function getMoodEmoji(mood: string) {
    switch (mood) {
        case 'happy': return '😊';
        case 'sad': return '😢';
        case 'angry': return '😡';
        case 'love': return '😍';
        case 'calm': return '😌';
        case 'anxious': return '😨';
        case 'tired': return '😴';
        case 'neutral': return '😐';
        default: return '😐';
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        padding: 20,
        borderRadius: 20,
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    moodRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    moodBtn: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    noteSection: {
        marginTop: 15,
        gap: 15,
        paddingTop: 15,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#ccc',
    },
    input: {
        padding: 15,
        borderRadius: 15,
        minHeight: 80,
        borderWidth: StyleSheet.hairlineWidth,
        textAlignVertical: 'top',
        fontSize: 16,
    },
    saveBtn: {
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    saveBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionSpacer: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    journalList: {
        gap: 15,
    },
    logItem: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 16,
    },
    logLeft: {
        alignItems: 'center',
        marginRight: 15,
    },
    logIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    logLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#eee', // subtle guide line
        marginTop: 5,
        borderRadius: 1,
    },
    logContent: {
        flex: 1,
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    logMood: {
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    logTime: {
        fontSize: 12,
    },
    logNote: {
        fontSize: 14,
        lineHeight: 20,
    }
});
