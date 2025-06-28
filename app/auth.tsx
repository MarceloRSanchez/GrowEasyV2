import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { Leaf, Mail, Lock } from 'lucide-react-native';

export default function AuthScreen() {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      setErrorMessage(t('auth.fillAllFields'));
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Leaf size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{t('auth.title')}</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? t('auth.createYourAccount') : t('auth.welcomeBack')}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.password')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <Button
              title={isSignUp ? t('auth.createAccount') : t('auth.signIn')}
              onPress={handleAuth}
              loading={loading}
              size="large"
              style={styles.authButton}
            />

          </View>

          {/* Toggle */}
          <View style={styles.toggle}>
            <Text style={styles.toggleText}>
              {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
            </Text>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.toggleLink}>
                {isSignUp ? t('auth.signIn') : t('auth.signUp')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {errorMessage && (
        <ErrorToast
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.white,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  authButton: {
    marginBottom: Spacing.md,
  },
  demoButton: {
    marginBottom: Spacing.lg,
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
    color: Colors.primary,
    fontWeight: '600',
  },
});