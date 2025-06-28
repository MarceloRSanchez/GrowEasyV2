import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function IndexScreen() {
  const { user, loading: authLoading } = useAuth();
  const { isOnboardingCompleted, isLoading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    // Wait for both auth and onboarding state to load
    if (!authLoading && !onboardingLoading) {
      if (!isOnboardingCompleted) {
        // First time user - show onboarding
        router.replace('/onboarding');
      } else if (user) {
        // Onboarding done + authenticated - go to app
        router.replace('/(tabs)');
      } else {
        // Onboarding done + not authenticated - show auth
        router.replace('/auth');
      }
    }
  }, [user, authLoading, isOnboardingCompleted, onboardingLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
  },
});