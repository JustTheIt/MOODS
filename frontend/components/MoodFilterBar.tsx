import { useColorScheme } from '@/components/useColorScheme';
import { MOOD_COLORS, MoodType, THEME } from '@/constants/theme';
import { X } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MoodFilterBarProps {
    selectedMoods: MoodType[];
    onToggleMood: (mood: MoodType) => void;
    onClear: () => void;
}

const MOOD_OPTIONS: MoodType[] = ['happy', 'sad', 'angry', 'love', 'calm', 'anxious', 'tired'];

export default function MoodFilterBar({ selectedMoods, onToggleMood, onClear }: MoodFilterBarProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {selectedMoods.length > 0 && (
                    <TouchableOpacity onPress={onClear} style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                        <X size={14} color={theme.text} />
                        <Text style={[styles.chipText, { color: theme.text }]}>Clear</Text>
                    </TouchableOpacity>
                )}

                {MOOD_OPTIONS.map((mood) => {
                    const isSelected = selectedMoods.includes(mood);
                    const color = MOOD_COLORS[mood];
                    return (
                        <TouchableOpacity
                            key={mood}
                            onPress={() => onToggleMood(mood)}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: isSelected ? color.primary : theme.card,
                                    borderColor: isSelected ? color.primary : 'transparent',
                                    borderWidth: 1 // Always have border width for layout stability
                                }
                            ]}
                        >
                            <Text style={[
                                styles.chipText,
                                { color: isSelected ? '#FFF' : theme.textSecondary, fontWeight: isSelected ? '700' : '500' }
                            ]}>
                                {mood.charAt(0).toUpperCase() + mood.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4,
    },
    chipText: {
        fontSize: 13,
    }
});
