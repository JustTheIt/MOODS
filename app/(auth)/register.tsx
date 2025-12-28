import { THEME } from '@/constants/theme';
import { registerUser } from '@/services/authService';
import { Link, useRouter } from 'expo-router';
import { Lock, LogIn, Mail, User as UserIcon } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password should be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await registerUser(email, password, username);
            router.replace('/home');
        } catch (error: any) {
            console.error(error);
            Alert.alert("Registration Failed", error.message || "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View style={[styles.logoContainer, { backgroundColor: THEME.primary }]}>
                            <Text style={styles.logoText}>M</Text>
                        </View>
                        <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Join MOOD to share your emotions.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Username</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <UserIcon size={20} color={theme.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Choose a username"
                                    placeholderTextColor={theme.textSecondary}
                                    value={username}
                                    onChangeText={setUsername}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Mail size={20} color={theme.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="your@email.com"
                                    placeholderTextColor={theme.textSecondary}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Lock size={20} color={theme.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Minimum 6 characters"
                                    placeholderTextColor={theme.textSecondary}
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Confirm Password</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Lock size={20} color={theme.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Re-enter password"
                                    placeholderTextColor={theme.textSecondary}
                                    secureTextEntry
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: THEME.primary }]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>Register</Text>
                                    <LogIn size={20} color="#FFF" />
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                                Already have an account?{' '}
                            </Text>
                            <Link href="/login" asChild>
                                <TouchableOpacity>
                                    <Text style={[styles.link, { color: THEME.primary }]}>Login</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoText: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '900',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    button: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 15,
    },
    link: {
        fontSize: 15,
        fontWeight: 'bold',
    },
});
