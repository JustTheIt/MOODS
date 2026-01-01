import { useColorScheme } from '@/components/useColorScheme';
import { THEME } from '@/constants/theme';
import { SuggestedUser } from '@/services/suggestedUsersService';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import UserSuggestionCard from './UserSuggestionCard';

interface SuggestedUsersRowProps {
    users: SuggestedUser[];
    loading?: boolean;
    onRefresh?: () => void;
}

// Skeleton loader component
function UserCardSkeleton() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;

    return (
        <View style={[styles.skeletonCard, { backgroundColor: theme.card }]}>
            <View style={[styles.skeletonAvatar, { backgroundColor: theme.border }]} />
            <View style={[styles.skeletonText, { backgroundColor: theme.border, width: 80 }]} />
            <View style={[styles.skeletonText, { backgroundColor: theme.border, width: 60 }]} />
            <View style={[styles.skeletonButton, { backgroundColor: theme.border }]} />
        </View>
    );
}

export default function SuggestedUsersRow({ users, loading, onRefresh }: SuggestedUsersRowProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.text }]}>✨ Suggested for You</Text>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[1, 2, 3, 4, 5]}
                    keyExtractor={(item) => `skeleton_${item}`}
                    renderItem={() => <UserCardSkeleton />}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        );
    }

    if (!users || users.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.text }]}>✨ Suggested for You</Text>
                <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        No new people to suggest right now.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.text }]}>✨ Suggested for You</Text>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={users}
                keyExtractor={(item) => `suggested_${item.id}`}
                renderItem={({ item, index }) => (
                    <UserSuggestionCard
                        user={item}
                        isTopPriority={index < 3} // Top 3 get animated glow
                        onFollowSuccess={onRefresh}
                    />
                )}
                contentContainerStyle={styles.listContent}
                initialNumToRender={5}
                maxToRenderPerBatch={3}
                windowSize={5}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 16,
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    listContent: {
        paddingHorizontal: 16,
        gap: 0, // Gap handled by card marginRight
    },
    skeletonCard: {
        width: 140,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignItems: 'center',
        marginRight: 12,
    },
    skeletonAvatar: {
        width: 68,
        height: 68,
        borderRadius: 34,
        marginBottom: 10,
    },
    skeletonText: {
        height: 12,
        borderRadius: 6,
        marginBottom: 6,
    },
    skeletonButton: {
        width: 80,
        height: 28,
        borderRadius: 12,
        marginTop: 8,
    },
    emptyContainer: {
        marginHorizontal: 16,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
