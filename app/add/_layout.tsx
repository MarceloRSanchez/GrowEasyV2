import { Stack } from 'expo-router';
import { AddWizardProvider } from '@/contexts/AddWizardContext';

export default function AddPlantLayout() {
  return (
    <AddWizardProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="search" />
        <Stack.Screen name="reminders" />
        <Stack.Screen name="review" />
      </Stack>
    </AddWizardProvider>
  );
}