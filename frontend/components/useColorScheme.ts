import { MoodContext } from '@/context/MoodContext';
import { useContext } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

export function useColorScheme() {
    const system = useNativeColorScheme();
    const context = useContext(MoodContext);

    if (context && context.settings.themeMode !== 'system') {
        return context.settings.themeMode;
    }

    return system;
}
