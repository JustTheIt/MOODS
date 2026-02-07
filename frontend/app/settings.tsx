import { useColorScheme } from '@/components/useColorScheme';
import { THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useMood } from '@/context/MoodContext';
import { useRouter } from 'expo-router';
import { LogOut, Moon, X } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsModal() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const router = useRouter();
    const { settings, toggleSetting, updateSettings } = useMood();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Customization</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <X size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Visuals</Text>

                <View style={[styles.row, { borderBottomColor: theme.border, flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
                    <View style={styles.optionInfo}>
                        <Moon size={20} color={theme.text} />
                        <Text style={[styles.optionText, { color: theme.text }]}>Appearance</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                        {(['system', 'light', 'dark'] as const).map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                onPress={() => updateSettings('themeMode', mode)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    backgroundColor: settings.themeMode === mode ? THEME.primary : theme.border,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Text style={{
                                    color: settings.themeMode === mode ? '#FFF' : theme.textSecondary,
                                    fontWeight: '600',
                                    textTransform: 'capitalize'
                                }}>{mode}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Account</Text>
                <TouchableOpacity style={[styles.row, { borderBottomColor: theme.border }]} onPress={handleLogout}>
                    <View style={styles.optionInfo}>
                        <LogOut size={20} color="#FF6B6B" />
                        <Text style={[styles.optionText, { color: "#FF6B6B" }]}>Logout</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>Version 2.0 (UI Preview)</Text>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 15,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    optionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        marginTop: 'auto',
    }
});
