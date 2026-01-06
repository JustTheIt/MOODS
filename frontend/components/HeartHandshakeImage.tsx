import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HeartHandshakeImageProps {
    size?: number;
    color?: string;
}

export const HeartHandshakeImage = ({ size = 100, color = "#4ECDC4" }: HeartHandshakeImageProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <Path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.99 0 2.82 2.82 0 0 1 0 3.99l-2.01 2.01" />
    </Svg>
);
