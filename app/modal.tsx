import { THEME } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function ModalScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Modal</Text>
      <View style={[styles.separator, { backgroundColor: theme.border }]} />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
