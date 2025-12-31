import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { Bell, Heart, Info, MessageCircle, UserPlus } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
    const { notifications, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
    const router = useRouter();

    useEffect(() => {
        refreshNotifications();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart size={20} color="#FF6B6B" fill="#FF6B6B" />;
            case 'comment': return <MessageCircle size={20} color="#4ECDC4" fill="#4ECDC4" />;
            case 'follow': return <UserPlus size={20} color="#45B7D1" fill="#45B7D1" />;
            case 'mood_reminder': return <Bell size={20} color="#FFD93D" fill="#FFD93D" />;
            default: return <Info size={20} color="#666" />;
        }
    };

    const handlePress = async (item: any) => {
        if (!item.isRead) {
            await markAsRead(item.id);
        }

        if (item.data?.postId) {
            router.push(`/post/${item.data.postId}`);
        } else if (item.data?.url) {
            // router.push(item.data.url);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.itemContainer, !item.isRead && styles.unreadItem]}
            onPress={() => handlePress(item)}
        >
            <View style={styles.iconContainer}>
                {getIcon(item.type)}
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</Text>
            </View>
            {!item.isRead && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => markAllAsRead()}>
                    <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Bell size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Use theme background in real app
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    markAllText: {
        color: '#4ECDC4',
        fontWeight: '600',
    },
    listContent: {
        padding: 0,
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
    },
    unreadItem: {
        backgroundColor: '#f9f9ff',
    },
    iconContainer: {
        marginRight: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    body: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF6B6B',
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        marginTop: 16,
        color: '#999',
        fontSize: 16,
    },
});
