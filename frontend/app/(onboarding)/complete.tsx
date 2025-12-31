import { useColorScheme } from '@/components/useColorScheme';
import { THEME } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CompleteScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/home');
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                <CheckCircle2 size={80} color="#4ECDC4" />
                <Text style={[styles.title, { color: theme.text }]}>All Set!</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Redirecting you to your home...
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        gap: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
    }
});
