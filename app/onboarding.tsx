import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Leaf, Camera, Users, Award } from 'lucide-react-native';
import { useOnboarding } from '@/hooks/useOnboarding';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Grow Anywhere',
    subtitle: 'Turn any space into your urban garden',
    description: 'Whether you have a balcony, windowsill, or small yard, we\'ll help you grow fresh food anywhere.',
    icon: <Leaf size={80} color={Colors.primary} />,
    image: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 2,
    title: 'AI-Powered Care',
    subtitle: 'Get smart guidance for healthy plants',
    description: 'Our AI analyzes your plants and provides personalized care recommendations, reminders, and health diagnostics.',
    icon: <Camera size={80} color={Colors.accent} />,
    image: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 3,
    title: 'Join the Community',
    subtitle: 'Connect with fellow gardeners',
    description: 'Share your progress, get tips from experts, and celebrate your harvests with a vibrant community.',
    icon: <Users size={80} color={Colors.primary} />,
    image: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 4,
    title: 'Track Your Success',
    subtitle: 'Monitor growth and earn eco-points',
    description: 'Watch your plants grow, track your environmental impact, and earn rewards for sustainable practices.',
    icon: <Award size={80} color={Colors.accent} />,
    image: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const {
    isLoading,
    markOnboardingCompleted,
  } = useOnboarding();

  const handleNext = async () => {
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      await markOnboardingCompleted();
      router.replace('/auth');
    }
  };

  const handleSkip = async () => {
    await markOnboardingCompleted();
    router.replace('/auth');
  };

  const currentData = onboardingData[currentPage];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Skip"
          onPress={handleSkip}
          variant="ghost"
          size="small"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: currentData.image }} style={styles.image} />
          <View style={styles.iconOverlay}>
            {currentData.icon}
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentData.title}</Text>
          <Text style={styles.subtitle}>{currentData.subtitle}</Text>
          <Text style={styles.description}>{currentData.description}</Text>
        </View>

        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={currentPage === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="large"
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginTop: Spacing.xl,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  iconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 253, 251, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.h3,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  nextButton: {
    width: '100%',
  },
});