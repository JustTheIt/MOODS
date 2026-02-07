
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { StyleSheet, Text, View } from 'react-native';

interface MoodLabelProps {
    mood: string;
    flat?: boolean;
}

export function MoodLabel({ mood, flat = false }: MoodLabelProps) {
    return (
        <View style={[styles.container, flat && styles.flat]}>
            <Text style={styles.text}>{mood.toUpperCase()}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.s,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        borderLeftWidth: 2,
        borderLeftColor: colors.calm,
    },
    flat: {
        backgroundColor: 'transparent',
    },
    text: {
        fontSize: 10,
        fontWeight: typography.semibold as any,
        color: colors.textSecondary,
        letterSpacing: 1,
    },
});
