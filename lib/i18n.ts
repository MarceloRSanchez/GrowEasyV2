import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

// Import translations
import enCommon from '@/locales/en/common.json';

// Get device language
const getDeviceLanguage = (): string => {
  const deviceLanguage = Platform.OS === 'ios'
    ? NativeModules.SettingsManager?.settings?.AppleLocale ||
      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
      'en'
    : NativeModules.I18nManager?.localeIdentifier || 'en';

  // Extract language code (e.g., 'es_ES' -> 'es')
  const langCode = deviceLanguage.split('_')[0].split('-')[0];
  
  // Only support 'en' and 'es', default to 'en'
  return ['en', 'es'].includes(langCode) ? langCode : 'en';
};

const STORAGE_KEY = '@GrowEasy:language';

const resources = {
  en: {
    common: enCommon,
  },
  es: {
    common: enCommon,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(), // Will be overridden by AsyncStorage if available
    fallbackLng: 'en',
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false,
    },
  });

// Load saved language from AsyncStorage
const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedLanguage && ['en', 'es'].includes(savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.log('Failed to load saved language:', error);
  }
};

// Save language to AsyncStorage
export const saveLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, language);
    i18n.changeLanguage(language);
  } catch (error) {
    console.log('Failed to save language:', error);
  }
};

// Initialize language loading
loadSavedLanguage();

export default i18n; 