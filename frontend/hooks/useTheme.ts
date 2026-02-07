
import { useColorScheme } from '@/components/useColorScheme';
import { THEME } from '@/constants/theme';

export function useTheme() {
    const colorScheme = useColorScheme();
    return colorScheme === 'dark' ? THEME.dark : THEME.light;
}
