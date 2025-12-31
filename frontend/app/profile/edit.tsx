import { useColorScheme } from '@/components/useColorScheme';
import { THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useMood } from '@/context/MoodContext';
import { updateUserProfile } from '@/services/userService';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import React, { useState } from 'react';
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

export default function EditProfileScreen() {
    const { user, refreshUserProfile } = useMood();
    const { user: authUser } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;

    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!user || !authUser) return;
        setLoading(true);
        try {
            await updateUserProfile(user.id, {
                name,
                displayName: name, // syncing both for now
                bio,
            });
            await refreshUserProfile();
            Alert.alert("Success", "Profile updated!");
            router.back();
        } catch (error) {
            console.error("Update error:", error);
            Alert.alert("Error", "Could not update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={theme.text} size={24} />
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={THEME.primary} />
                    ) : (
                        <Save color={THEME.primary} size={24} />
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Display Name</Text>
                        <TextInput
                            style={[
                                styles.input,
                                { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
                            ]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Your Name"
                            placeholderTextColor={theme.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Bio</Text>
                        <TextInput
                            style={[
                                styles.textArea,
                                { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
                            ]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell us about yourself..."
                            placeholderTextColor={theme.textSecondary}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    textArea: {
        height: 120,
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
    },
});
