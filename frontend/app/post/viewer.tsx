import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Share2, X } from 'lucide-react-native';
import { Dimensions, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MediaViewerScreen() {
    const router = useRouter();
    const { uri, type, aspectRatio } = useLocalSearchParams<{ uri: string, type: 'image' | 'video', aspectRatio: string }>();

    const parsedAspectRatio = aspectRatio ? parseFloat(aspectRatio) : 1;
    const isVideo = type === 'video';

    const player = useVideoPlayer(isVideo ? uri : null, (player) => {
        player.loop = true;
        player.play();
    });

    const handleShare = async () => {
        try {
            await Share.share({ url: uri, message: 'Check out this mood!' });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <BlurView intensity={100} style={StyleSheet.absoluteFill} tint="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header Actions */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <X size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.rightActions}>
                        <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                            <Share2 size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Media Content */}
                <Animated.View
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(200)}
                    style={styles.mediaContainer}
                >
                    {isVideo ? (
                        <VideoView
                            style={[styles.media, { aspectRatio: parsedAspectRatio }]}
                            player={player}
                            allowsFullscreen
                            allowsPictureInPicture
                            contentFit="contain"
                        />
                    ) : (
                        <Image
                            source={{ uri }}
                            style={[styles.media, { aspectRatio: parsedAspectRatio }]}
                            contentFit="contain"
                            transition={300}
                        />
                    )}
                </Animated.View>

                {/* Footer Info (Optional) */}
                <View style={styles.footer}>
                    {/* Add any additional info or buttons here */}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        zIndex: 10,
    },
    rightActions: {
        flexDirection: 'row',
        gap: 15,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    media: {
        width: SCREEN_WIDTH,
        maxHeight: SCREEN_HEIGHT * 0.8,
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    }
});
