import EmotionStories from '@/components/EmotionStories';
import SuggestedUsersRow from '@/components/SuggestedUsersRow';
import TrendingAura from '@/components/TrendingAura';
import TrendingSection from '@/components/TrendingSection';
import { useColorScheme } from '@/components/useColorScheme';
import { MoodType, THEME } from '@/constants/theme';
import { clearSuggestedUsersCache, getSuggestedUsers, SuggestedUser } from '@/services/suggestedUsersService';
import { clearTrendingCache, getTrendingPosts, TrendingPost } from '@/services/trendingService';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;

    // States for sections
    const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
    const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
    const [loadingTrending, setLoadingTrending] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter state
    const [activeFilterMood, setActiveFilterMood] = useState<MoodType | null>(null);

    const fetchSuggestedUsers = async () => {
        try {
            setLoadingSuggestions(true);
            const suggestions = await getSuggestedUsers(10); // Limited to 10
            setSuggestedUsers(suggestions);
        } catch (error) {
            console.error("Error fetching suggested users:", error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const fetchTrendingPosts = async () => {
        try {
            setLoadingTrending(true);
            const trending = await getTrendingPosts(15, activeFilterMood || undefined);
            setTrendingPosts(trending);
        } catch (error) {
            console.error("Error fetching trending posts:", error);
        } finally {
            setLoadingTrending(false);
        }
    };

    useEffect(() => {
        fetchTrendingPosts();
    }, [activeFilterMood]);

    useEffect(() => {
        fetchSuggestedUsers();
        fetchTrendingPosts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        clearSuggestedUsersCache();
        clearTrendingCache();

        Promise.all([
            fetchSuggestedUsers(),
            fetchTrendingPosts()
        ]).finally(() => setRefreshing(false));
    };

    const toggleAuraFilter = (mood: MoodType) => {
        setActiveFilterMood(prev => prev === mood ? null : mood);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={[]} // Primary sections are in Header
                renderItem={null}
                ListHeaderComponent={
                    <View style={{ paddingTop: 10 }}>
                        {/* 1) Emotion Stories - Horizontal */}
                        <EmotionStories />

                        <View style={styles.divider} />

                        {/* 2) Community Aura - Interactive Activity */}
                        <TrendingAura
                            onMoodPress={toggleAuraFilter}
                            activeMood={activeFilterMood}
                        />

                        <View style={styles.divider} />

                        {/* 3) Trending Now - Vertical */}
                        <TrendingSection
                            posts={trendingPosts}
                            loading={loadingTrending}
                            selectedMood={activeFilterMood || undefined}
                        />

                        <View style={styles.divider} />

                        {/* 4) Suggested Users - Horizontal (Bottom) */}
                        <View style={{ marginBottom: 40 }}>
                            <SuggestedUsersRow
                                users={suggestedUsers}
                                loading={loadingSuggestions}
                                onRefresh={fetchSuggestedUsers}
                            />
                        </View>
                    </View>
                }
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 40,
    },
    divider: {
        height: 10,
    }
});
