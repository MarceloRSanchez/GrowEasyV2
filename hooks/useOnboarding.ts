import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = '@GrowEasy:onboardingCompleted';
const LANGUAGE_SELECTED_KEY = '@GrowEasy:languageSelected';

interface OnboardingState {
  isOnboardingCompleted: boolean;
  isLanguageSelected: boolean;
  isLoading: boolean;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isOnboardingCompleted: false,
    isLanguageSelected: false,
    isLoading: true,
  });

  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      const [onboardingCompleted, languageSelected] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY),
        AsyncStorage.getItem(LANGUAGE_SELECTED_KEY),
      ]);

      setState({
        isOnboardingCompleted: onboardingCompleted === 'true',
        isLanguageSelected: languageSelected === 'true',
        isLoading: false,
      });
    } catch (error) {
      console.log('Failed to load onboarding state:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const markLanguageSelected = async () => {
    try {
      await AsyncStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
      setState(prev => ({ ...prev, isLanguageSelected: true }));
    } catch (error) {
      console.log('Failed to save language selection:', error);
    }
  };

  const markOnboardingCompleted = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true'),
        AsyncStorage.setItem(LANGUAGE_SELECTED_KEY, 'true'),
      ]);
      setState(prev => ({ 
        ...prev, 
        isOnboardingCompleted: true,
        isLanguageSelected: true,
      }));
    } catch (error) {
      console.log('Failed to save onboarding completion:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY),
        AsyncStorage.removeItem(LANGUAGE_SELECTED_KEY),
      ]);
      setState({
        isOnboardingCompleted: false,
        isLanguageSelected: false,
        isLoading: false,
      });
    } catch (error) {
      console.log('Failed to reset onboarding:', error);
    }
  };

  return {
    ...state,
    markLanguageSelected,
    markOnboardingCompleted,
    resetOnboarding,
  };
} 