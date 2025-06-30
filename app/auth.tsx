import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Typography, Spacing, BorderRadius, OnboardingColors, OnboardingTypography } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { Leaf, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Floating leaf component for background animation
function FloatingLeaf({ 
  size, 
  left, 
  top, 
  delay, 
  duration, 
  rotation 
}: { 
  size: number, 
  left: string, 
  top: string, 
  delay: number, 
  duration: number,
  rotation: number
}) {
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Random movement animation
    const createAnimation = () => {
      // Reset position
      position.setValue({ x: 0, y: 0 });
      opacity.setValue(0.1);
      rotate.setValue(0);
      
      // Animate
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: duration * 0.3,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.7,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(position, {
          toValue: { 
            x: Math.random() * 30 - 15, 
            y: Math.random() * 50 + 50 
          },
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: rotation,
          duration,
          delay,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Repeat with new random values
        createAnimation();
      });
    };
    
    createAnimation();
    
    return () => {
      position.stopAnimation();
      opacity.stopAnimation();
      rotate.stopAnimation();
    };
  }, []);
  
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top,
        opacity,
        transform: [
          { translateX: position.x },
          { translateY: position.y },
          { rotate: rotate.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', `${rotation}deg`],
          })},
        ],
      }}
    >
      <Leaf size={size} color={OnboardingColors.login.secondary} />
    </Animated.View>
  );
}

export default function AuthScreen() {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Card shake animation for errors
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  const startShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleAuth = async () => {
    if (!email || !password) {
      setErrorMessage(t('auth.fillAllFields'));
      startShake();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert(t('auth.success'), t('auth.accountCreated'));
      } else {
        await signIn(email, password);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      // Handle specific error cases
      if (isSignUp && error.message?.includes('User already registered')) {
        setErrorMessage(t('auth.existingAccount'));
        setIsSignUp(false);
      } else {
        setErrorMessage(error.message || t('auth.unexpectedError'));
      }
      
      startShake();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      // Use demo credentials
      await signIn('demo@groweasy.com', 'demo123456');
      router.replace('/(tabs)');
    } catch (error: any) {
      setErrorMessage(error.message);
      startShake();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#E8F5E8', '#E0F2F1', '#E1F5FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      {/* Floating Leaves Background */}
      <FloatingLeaf size={24} left="10%" top="15%" delay={0} duration={8000} rotation={360} />
      <FloatingLeaf size={32} left="85%" top="25%" delay={2000} duration={10000} rotation={-360} />
      <FloatingLeaf size={20} left="20%" top="60%" delay={1000} duration={9000} rotation={180} />
      <FloatingLeaf size={28} left="70%" top="75%" delay={3000} duration={12000} rotation={-180} />
      <FloatingLeaf size={16} left="40%" top="40%" delay={500} duration={7000} rotation={270} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateX: shakeAnim }
              ]
            }
          ]}
        >
          {/* Logo and Header */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Leaf size={48} color={OnboardingColors.login.primary} />
            </View>
            <Text style={styles.title}>{t('auth.title')}</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? t('auth.createYourAccount') : t('auth.welcomeBack')}
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Mail size={20} color={OnboardingColors.login.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Email input"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Lock size={20} color={OnboardingColors.login.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.password')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                accessibilityLabel="Password input"
              />
              <TouchableOpacity 
                onPress={togglePasswordVisibility}
                style={styles.eyeIcon}
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                accessibilityRole="button"
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.textMuted} />
                ) : (
                  <Eye size={20} color={Colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            {/* Auth Button */}
            <Button
              title={isSignUp ? t('auth.createAccount') : t('auth.signIn')}
              onPress={handleAuth}
              loading={loading}
              size="large"
              style={[styles.authButton, { backgroundColor: OnboardingColors.login.primary }]}
            />
            
  
          </View>

          {/* Toggle Sign Up / Sign In */}
          <View style={styles.toggle}>
            <Text style={styles.toggleText}>
              {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage(null);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={isSignUp ? "Sign in" : "Sign up"}
            >
              <Text style={styles.toggleLink}>
                {isSignUp ? t('auth.signIn') : t('auth.signUp')}
              </Text>
            </TouchableOpacity>
          </View>

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
        </Animated.View>
      </KeyboardAvoidingView>
      
      {errorMessage && (
        <ErrorToast
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 96,
    height: 96,
    backgroundColor: Colors.white,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: OnboardingColors.login.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    ...OnboardingTypography.loginTitle,
    color: OnboardingColors.login.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: OnboardingColors.login.primary,
    opacity: 0.8,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: OnboardingColors.login.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    height: 56,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    height: '100%',
  },
  eyeIcon: {
    padding: Spacing.xs,
  },
  authButton: {
    marginBottom: Spacing.md,
  },
  demoButton: {
    marginBottom: Spacing.sm,
    borderColor: OnboardingColors.login.primary,
  },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  toggleLink: {
    ...Typography.body,
    color: OnboardingColors.login.primary,
    fontWeight: '600',
  },
  boltContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  boltLogo: {
    width: 60,
    height: 60,
    opacity: 0.6,
  },
});