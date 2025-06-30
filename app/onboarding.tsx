import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WelcomeCarousel } from '@/components/onboarding/WelcomeCarousel';

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <WelcomeCarousel />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});