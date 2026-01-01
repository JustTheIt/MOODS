import { useColorScheme } from '@/components/useColorScheme';
import { THEME } from '@/constants/theme';
import { registerUser } from '@/services/authService';
import { checkUsernameAvailability } from '@/services/userService';
import {
    generateUsernameSuggestions,
    normalizeUsername,
    validateEmail as validateEmailUtil,
    validateUsername as validateUsernameUtil
} from '@/utils/validation.utils';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Link, useRouter } from 'expo-router';
import { Calendar, Check, Info, Lock, LogIn, Mail, User as UserIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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
    const [displayName, setDisplayName] = useState('');
    const [dob, setDob] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date(2000, 0, 1));
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [loading, setLoading] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);

    // Field error states
    const [emailError, setEmailError] = useState('');
    const [emailSuggestion, setEmailSuggestion] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
    const [displayNameError, setDisplayNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Email validation with typo detection
    const handleEmailValidation = (emailValue: string) => {
        const result = validateEmailUtil(emailValue);

        if (!result.isValid && result.error) {
            setEmailError(result.error);
            setEmailSuggestion('');
        } else if (result.suggestion) {
            setEmailError('');
            setEmailSuggestion(result.suggestion);
        } else {
            setEmailError('');
            setEmailSuggestion('');
        }
    };

    // Accept email suggestion
    const acceptEmailSuggestion = () => {
        if (emailSuggestion) {
            setEmail(emailSuggestion);
            setEmailSuggestion('');
        }
    };

    // Username validation
    const handleUsernameValidation = (usernameValue: string) => {
        const result = validateUsernameUtil(usernameValue);

        if (!result.isValid && result.error) {
            setUsernameError(result.error);
        } else {
            setUsernameError('');
        }
    };

    // Display name validation
    const validateDisplayName = (name: string) => {
        if (!name) {
            setDisplayNameError('');
            return;
        }
        if (name.length < 2) {
            setDisplayNameError('Display name must be at least 2 characters');
        } else if (name.length > 50) {
            setDisplayNameError('Display name must be less than 50 characters');
        } else {
            setDisplayNameError('');
        }
    };

    // Password validation
    const validatePassword = (pwd: string) => {
        if (!pwd) {
            setPasswordError('');
            return;
        }
        if (pwd.length < 6) {
            setPasswordError('Password must be at least 6 characters');
        } else {
            setPasswordError('');
        }
    };

    // Debounce username check with format validation
    useEffect(() => {
        const check = async () => {
            const normalized = normalizeUsername(username);

            if (normalized.length < 3) {
                setUsernameAvailable(null);
                setUsernameSuggestions([]);
                return;
            }

            // First validate format
            const formatResult = validateUsernameUtil(normalized);
            if (!formatResult.isValid) {
                setUsernameAvailable(null);
                setUsernameSuggestions([]);
                return;
            }

            setCheckingUsername(true);
            const isAvailable = await checkUsernameAvailability(normalized);
            setUsernameAvailable(isAvailable);

            // Generate suggestions if username is taken
            if (!isAvailable) {
                const suggestions = generateUsernameSuggestions(normalized);
                setUsernameSuggestions(suggestions);
            } else {
                setUsernameSuggestions([]);
            }

            setCheckingUsername(false);
        };
        const timeout = setTimeout(check, 500);
        return () => clearTimeout(timeout);
    }, [username]);

    const calculateAge = (birthDate: Date): number => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    const getPasswordStrength = () => {
        if (password.length === 0) return 0;
        if (password.length < 6) return 1;
        if (password.length < 10) return 2;
        return 3;
    };

    const handleRegister = async () => {
        if (!username || !email || !password || !displayName || !dob) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (!termsAccepted) {
            Alert.alert("Terms", "Please accept the Terms & Core Values");
            return;
        }

        // Check age requirement
        const age = calculateAge(selectedDate);
        if (age < 18) {
            Alert.alert(
                "Age Requirement",
                "You must be at least 18 years old to use this app. We apologize for any inconvenience."
            );
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password should be at least 6 characters");
            return;
        }

        if (usernameAvailable === false) {
            Alert.alert("Error", "Username is already taken");
            return;
        }

        setLoading(true);
        try {
            await registerUser(email, password, username, displayName, dob);

            // Navigate to verification screen with email param
            router.replace({
                pathname: '/(auth)/verify-email',
                params: { email }
            });
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
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={[styles.logoContainer, { backgroundColor: THEME.primary }]}>
                            <Text style={styles.logoText}>M</Text>
                        </View>
                        <Text style={[styles.title, { color: theme.text }]}>Join Moods</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Create your safe space.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: emailError ? '#FF6B6B' : theme.border }]}>
                                <Mail size={20} color={theme.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="your.email@example.com"
                                    placeholderTextColor={theme.textSecondary}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                    onBlur={() => handleEmailValidation(email)}
                                />
                            </View>
                            {emailError ? (
                                <Text style={{ color: '#FF6B6B', fontSize: 12, marginLeft: 4 }}>{emailError}</Text>
                            ) : null}
                            {emailSuggestion ? (
                                <TouchableOpacity
                                    style={[styles.suggestionBox, { backgroundColor: theme.card, borderColor: '#4ECDC4' }]}
                                    onPress={acceptEmailSuggestion}
                                >
                                    <Info size={16} color="#4ECDC4" />
                                    <Text style={[styles.suggestionText, { color: theme.text }]}>
                                        Did you mean <Text style={{ fontWeight: 'bold', color: '#4ECDC4' }}>{emailSuggestion}</Text>?
                                    </Text>
                                    <Text style={[styles.acceptButton, { color: '#4ECDC4' }]}>Accept</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Username (Public Identity)</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: usernameError ? '#FF6B6B' : theme.border }]}>
                                <UserIcon size={20} color={theme.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="@username"
                                    placeholderTextColor={theme.textSecondary}
                                    autoCapitalize="none"
                                    value={username}
                                    onChangeText={(text) => {
                                        setUsername(text);
                                        handleUsernameValidation(text);
                                    }}
                                    onBlur={() => handleUsernameValidation(username)}
                                />
                                {checkingUsername ? (
                                    <ActivityIndicator size="small" color={THEME.primary} />
                                ) : username.length >= 3 && !usernameError ? (
                                    usernameAvailable ? (
                                        <Check size={20} color="#4ECDC4" />
                                    ) : (
                                        <Info size={20} color="#FF6B6B" />
                                    )
                                ) : null}
                            </View>
                            {usernameError ? (
                                <Text style={{ color: '#FF6B6B', fontSize: 12, marginLeft: 4 }}>{usernameError}</Text>
                            ) : username.length >= 3 && !usernameAvailable && !checkingUsername ? (
                                <View>
                                    <Text style={{ color: '#4ECDC4', fontSize: 12, marginLeft: 4, marginTop: 4 }}>
                                        That username is already loved by someone else. How about these?
                                    </Text>
                                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                                        {usernameSuggestions.map((suggestion, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.suggestionChip, { backgroundColor: theme.card, borderColor: '#4ECDC4' }]}
                                                onPress={() => setUsername(suggestion)}
                                            >
                                                <Text style={{ color: '#4ECDC4', fontSize: 13, fontWeight: '600' }}>
                                                    {suggestion}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ) : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Display Name</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: displayNameError ? '#FF6B6B' : theme.border }]}>
                                <UserIcon size={20} color={theme.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Name you go by"
                                    placeholderTextColor={theme.textSecondary}
                                    value={displayName}
                                    onChangeText={setDisplayName}
                                    onBlur={() => validateDisplayName(displayName)}
                                />
                            </View>
                            {displayNameError ? (
                                <Text style={{ color: '#FF6B6B', fontSize: 12, marginLeft: 4 }}>{displayNameError}</Text>
                            ) : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Date of Birth</Text>
                            <TouchableOpacity
                                style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Calendar size={20} color={theme.textSecondary} />
                                <Text style={[styles.input, { color: dob ? theme.text : theme.textSecondary }]}>
                                    {dob || 'DD/MM/YYYY'}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={selectedDate}
                                    mode="date"
                                    display="spinner"
                                    maximumDate={new Date()}
                                    onChange={(event, date) => {
                                        setShowDatePicker(Platform.OS === 'ios');
                                        if (date) {
                                            setSelectedDate(date);
                                            const day = String(date.getDate()).padStart(2, '0');
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const year = date.getFullYear();
                                            setDob(`${day}/${month}/${year}`);
                                        }
                                    }}
                                />
                            )}
                            <Text style={{ color: theme.textSecondary, fontSize: 11, marginLeft: 4 }}>
                                To ensure age-appropriate safety. Not shown publicly.
                            </Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: passwordError ? '#FF6B6B' : theme.border }]}>
                                <Lock size={20} color={theme.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Minimum 6 characters"
                                    placeholderTextColor={theme.textSecondary}
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                    onBlur={() => validatePassword(password)}
                                />
                            </View>
                            {passwordError ? (
                                <Text style={{ color: '#FF6B6B', fontSize: 12, marginLeft: 4 }}>{passwordError}</Text>
                            ) : null}
                            <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                                {[1, 2, 3].map((i) => (
                                    <View
                                        key={i}
                                        style={{
                                            height: 4,
                                            flex: 1,
                                            borderRadius: 2,
                                            backgroundColor:
                                                password.length === 0
                                                    ? theme.border
                                                    : getPasswordStrength() >= i
                                                        ? (i === 1 ? '#FF6B6B' : i === 2 ? '#FFD93D' : '#4ECDC4')
                                                        : theme.border
                                        }}
                                    />
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.termsContainer}
                            onPress={() => setTermsAccepted(!termsAccepted)}
                        >
                            {termsAccepted ? (
                                <View style={[styles.checkbox, { backgroundColor: THEME.primary, borderColor: THEME.primary }]}>
                                    <Check size={14} color="#FFF" />
                                </View>
                            ) : (
                                <View style={[styles.checkbox, { borderColor: theme.textSecondary }]} />
                            )}
                            <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                                I agree to the <Text style={{ color: THEME.primary, fontWeight: 'bold' }}>Terms</Text> & <Text style={{ color: THEME.primary, fontWeight: 'bold' }}>Privacy Policy</Text>.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: THEME.primary, opacity: (loading || !termsAccepted) ? 0.7 : 1 }]}
                            onPress={handleRegister}
                            disabled={loading || !termsAccepted}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>Start My Journey</Text>
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
        marginBottom: 30,
    },
    logoContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '900',
    },
    title: {
        fontSize: 24,
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
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    termsText: {
        fontSize: 13,
    },
    suggestionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 8,
        gap: 8,
    },
    suggestionText: {
        flex: 1,
        fontSize: 13,
    },
    acceptButton: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    suggestionChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
    }
});
