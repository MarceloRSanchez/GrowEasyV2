import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, OnboardingColors, OnboardingTypography, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/hooks/useOnboarding';
import * as Haptics from 'expo-haptics';
import {
  Building2,
  Leaf,
  Brain,
  Sparkles,
  Users,
  Heart,
  TrendingUp,
  Award,
  ChevronRight,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  colors: typeof OnboardingColors.slide1;
  primaryIcon: React.ReactNode;
  secondaryIcon: React.ReactNode;
}

const slides: SlideData[] = [
   {
    id: 1,
    title: "Grow Anywhere",
    subtitle: "Transform your balcony, window, or terrace into a green oasis. Urban gardens for small spaces.",
    image: "https://images.pexels.com/photos/6231753/pexels-photo-6231753.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    colors: OnboardingColors.slide1,
    primaryIcon: <Building2 size={48} color={OnboardingColors.slide1.primary} />,
    secondaryIcon: <Leaf size={32} color={OnboardingColors.slide1.secondary} />,
  },
  {
    id: 2,
    title: "Smart Care",
    subtitle: "AI analyzes your plants, detects issues, and guides you step by step for perfect care.",
    image: "https://images.pexels.com/photos/7728082/pexels-photo-7728082.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    colors: OnboardingColors.slide2,
    primaryIcon: <Brain size={48} color={OnboardingColors.slide2.primary} />,
    secondaryIcon: <Sparkles size={32} color={OnboardingColors.slide2.secondary} />,
  },
  {
    id: 3,
    title: "Join the Community",
    subtitle: "Share experiences, learn from other gardeners, and celebrate your harvests together.",
    image: "https://images.pexels.com/photos/7728384/pexels-photo-7728384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    colors: OnboardingColors.slide3,
    primaryIcon: <Users size={48} color={OnboardingColors.slide3.primary} />,
    secondaryIcon: <Heart size={32} color={OnboardingColors.slide3.secondary} />,
  },
  {
    id: 4,
    title: "Track Your Progress",
    subtitle: "Monitor growth, log plant care, and celebrate every milestone in your garden.",
    image: "https://images.pexels.com/photos/4505161/pexels-photo-4505161.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    colors: OnboardingColors.slide4,
    primaryIcon: <TrendingUp size={48} color={OnboardingColors.slide4.primary} />,
    secondaryIcon: <Award size={32} color={OnboardingColors.slide4.secondary} />,
  }
];

export function WelcomeCarousel() {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { markOnboardingCompleted } = useOnboarding();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  
  // Animate entrance of current slide
  useEffect(() => {
    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    translateYAnim.setValue(50);
    
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [currentPage]);
  
  // Floating animation for icons
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
  }, []);
  
  const floatTransform = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const handleNext = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (currentPage < slides.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      await markOnboardingCompleted();
      router.replace('/auth');
    }
  };

  const handleSkip = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    await markOnboardingCompleted();
    router.replace('/auth');
  };
  
  const handleDotPress = (index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setCurrentPage(index);
  };

  const currentSlide = slides[currentPage];
  const isLastSlide = currentPage === slides.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentSlide.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkip}
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        
        {/* Bolt Logo */}
          <TouchableOpacity 
            style={styles.boltContainer}
            onPress={() => Linking.openURL('https://bolt.new/')}
            accessibilityRole="button"
            accessibilityLabel="Visit Bolt.new"
          >
            <Image 
              source={require('@/assets/images/bolt_logo.png')}
              style={styles.boltLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        <Text style={styles.pageIndicator}>{currentPage + 1}/{slides.length}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Image Container with Floating Icons */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: currentSlide.image }} 
            style={styles.image}
            accessibilityLabel={`Illustration for ${currentSlide.title}`}
          />
          
          <View style={styles.imageOverlay}>
            <Animated.View 
              style={[
                styles.primaryIconContainer,
                { transform: [{ translateY: floatTransform }] }
              ]}
            >
              {currentSlide.primaryIcon}
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.secondaryIconContainer,
                { transform: [{ translateY: Animated.multiply(floatAnim, -1).interpolate({
                  inputRange: [-1, 0],
                  outputRange: [10, 0],
                }) }] }
              ]}
            >
              {currentSlide.secondaryIcon}
            </Animated.View>
          </View>
        </View>

        {/* Text Content */}
        <Animated.View 
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: translateYAnim }
              ]
            }
          ]}
        >
          <Text style={[styles.title, { color: currentSlide.colors.primary }]}>
            {currentSlide.title}
          </Text>
          <Text style={[styles.subtitle, { color: currentSlide.colors.primary }]}>
            {currentSlide.subtitle}
          </Text>
        </Animated.View>

        {/* Pagination */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                currentPage === index && [
                  styles.activeDot,
                  { backgroundColor: currentSlide.colors.primary }
                ]
              ]}
              onPress={() => handleDotPress(index)}
              accessibilityLabel={`Go to slide ${index + 1}`}
              accessibilityRole="button"
              accessibilityState={{ selected: currentPage === index }}
            />
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={isLastSlide ? "Get Started" : "Next"}
          onPress={handleNext}
          size="large"
          style={[
            styles.nextButton,
            { backgroundColor: currentSlide.colors.primary }
          ]}
          textStyle={styles.nextButtonText}
          icon={isLastSlide ? undefined : <ChevronRight size={20} color="#FFF" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  skipButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  skipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  pageIndicator: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryIconContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -24,
    marginTop: -24,
  },
  secondaryIconContainer: {
    position: 'absolute',
    bottom: '30%',
    right: '30%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  title: {
    ...OnboardingTypography.slideTitle,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...OnboardingTypography.slideSubtitle,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  nextButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    marginRight: Spacing.xs,
  },
  boltContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  boltLogo: {
    width: 70,
    height: 70,
    opacity: 0.6,
    zIndex: 1000,
  },
});