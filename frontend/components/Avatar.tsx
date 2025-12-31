import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface AvatarProps {
    uri?: string | null;
    name?: string;
    size?: number;
    style?: ViewStyle;
}

const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
];

const getBackgroundColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
};

const getInitial = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({ uri, name = 'User', size = 40, style }) => {
    const containerStyle: ViewStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: getBackgroundColor(name),
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
    };

    if (uri) {
        return (
            <View style={containerStyle}>
                <Image
                    source={{ uri }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                />
            </View>
        );
    }

    return (
        <View style={containerStyle}>
            <Text style={[styles.initial, { fontSize: size * 0.4 }]}>
                {getInitial(name)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: '100%',
    },
    initial: {
        color: '#FFF',
        fontWeight: '700',
    },
});
