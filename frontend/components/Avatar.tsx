import { generateAvatarUrl } from '@/utils/avatar.utils';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface AvatarProps {
    uri?: string | null;
    name?: string;
    size?: number;
    style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ uri, name = 'User', size = 40, style }) => {
    const containerStyle: ViewStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        ...style,
    };

    // Use provided image or generate a default avatar PNG
    const avatarSource = uri || generateAvatarUrl(name, size * 2);

    return (
        <View style={containerStyle}>
            <Image
                source={{ uri: avatarSource }}
                style={styles.image}
                contentFit="cover"
                transition={0}
                cachePolicy="memory-disk"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: '100%',
    },
});
