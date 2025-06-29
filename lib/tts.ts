import { Audio as ExpoAudio } from 'expo-av';
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

// Configure audio mode for mobile
const configureAudio = async () => {
  if (Platform.OS !== 'web') {
    try {
      await ExpoAudio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('Audio mode configured successfully');
    } catch (error) {
      console.error('Error configuring audio mode:', error);
    }
  }
};

// Platform-specific imports
let FileSystem: any = null;

if (Platform.OS !== 'web') {
  FileSystem = require('expo-file-system');
}

// ElevenLabs API configuration
const ELEVEN_API_KEY = process.env.EXPO_PUBLIC_ELEVEN_API_KEY;
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam voice (male, American accent)
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

// Create a hash of the text to use as the filename (mobile only)
const getTextHash = async (text: string): Promise<string> => {
  if (Platform.OS === 'web') {
    // Simple hash for web
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.MD5, text);
};

// Get the cache directory path (mobile only)
const getCacheDirectory = (): string => {
  if (Platform.OS === 'web') return '';
  return `${FileSystem.cacheDirectory}tts/`;
};

// Ensure the cache directory exists (mobile only)
const ensureCacheDirectory = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  const dir = getCacheDirectory();
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
};

// Get the cached file path for a given text (mobile only)
const getCachedFilePath = async (text: string): Promise<string> => {
  if (Platform.OS === 'web') return '';
  
  const hash = await getTextHash(text);
  return `${getCacheDirectory()}${hash}.mp3`;
};

// Check if a file exists in the cache (mobile only)
const checkCache = async (text: string): Promise<string | null> => {
  if (Platform.OS === 'web') return null;
  
  const filePath = await getCachedFilePath(text);
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  return fileInfo.exists ? filePath : null;
};

// Download audio from ElevenLabs API
const downloadAudio = async (text: string): Promise<string> => {
  console.log('[TTS] Preparing to download audio from ElevenLabs API');
  
  // Prepare the request body
  const body = JSON.stringify({
    text,
    model_id: 'eleven_monolingual_v1',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  });

  try {
    // Check if API key is available
    if (!ELEVEN_API_KEY) {
      throw new Error('ElevenLabs API key is not configured');
    }

    console.log('[TTS] Making API request to ElevenLabs');
    
    // Make the API request
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TTS] ElevenLabs API error: ${response.status} ${errorText}`);
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    console.log('[TTS] API request successful, processing audio blob');
    
    // Get the audio data as a blob
    const audioBlob = await response.blob();
    console.log(`[TTS] Audio blob size: ${audioBlob.size} bytes`);
    
    if (Platform.OS === 'web') {
      // For web, create object URL directly from blob
      const objectUrl = URL.createObjectURL(audioBlob);
      console.log(`[TTS] Created object URL for web: ${objectUrl}`);
      return objectUrl;
    } else {
      // For mobile, save to file system
      const filePath = await getCachedFilePath(text);
      console.log(`[TTS] Saving audio to file: ${filePath}`);
      
      // Convert blob to base64 for FileSystem
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove the data URL prefix
          const base64Data = base64.split(',')[1];
          console.log(`[TTS] Converted to base64, length: ${base64Data.length}`);
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Write the file to the cache
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log(`[TTS] Audio file saved successfully: ${filePath}`);
      return filePath;
    }
  } catch (error) {
    console.error('[TTS] Error downloading audio:', error);
    throw error;
  }
};

// Play audio from a file path
let soundObject: ExpoAudio.Sound | null = null;
let webAudioUrl: string | null = null;
let globalWebAudioEndTimer: ReturnType<typeof setTimeout> | null = null;


export const unloadSound = async (): Promise<void> => {
  try {
    if (globalWebAudioEndTimer) {
      clearTimeout(globalWebAudioEndTimer);
      globalWebAudioEndTimer = null;
    }
    
    if (soundObject) {
      console.log('[TTS] Unloading sound object');

      soundObject.setOnPlaybackStatusUpdate(null);

      const status = await soundObject.getStatusAsync();
      if (status.isLoaded) {
        await soundObject.unloadAsync();
      }
      
      soundObject = null;
      console.log('[TTS] Sound object unloaded successfully');
    }

    if (Platform.OS === 'web' && webAudioUrl) {
      URL.revokeObjectURL(webAudioUrl);
      webAudioUrl = null;
      console.log('[TTS] Web audio URL cleaned up');
    }
  } catch (error) {
    console.error('[TTS] Error during sound cleanup:', error);
    soundObject = null;
    if (Platform.OS === 'web' && webAudioUrl) {
      try {
        URL.revokeObjectURL(webAudioUrl);
      } catch (e) {
      }
      webAudioUrl = null;
    }
  }
};

let webAudio: HTMLAudioElement | null = null;

async function playWebAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Cleanup any existing element first
      if (webAudio) {
        webAudio.pause();
        webAudio.src = '';
        webAudio.load();
      }

      const audioElement = new Audio(url);
      audioElement.volume = 1;
      audioElement.play().catch(reject);

      audioElement.onended = () => {
        resolve();
        unloadSound();
      };
      audioElement.onerror = (e) => {
        reject(e);
        unloadSound();
      };

      webAudio = audioElement;
    } catch (err) {
      reject(err);
    }
  });
}

export const speak = async (
  text: string
): Promise<ExpoAudio.Sound | HTMLAudioElement> => {
  console.log(`[TTS] Starting to speak text: "${text.substring(0, 50)}..."`);

  await configureAudio();
  await unloadSound();

  try {
    if (Platform.OS === 'web') {
      console.log('[TTS] Web platform - processing');
      const audioPath = await downloadAudio(text);
      webAudioUrl = audioPath; // Save for cleanup
      await playWebAudio(audioPath);
      console.log('[TTS] Web audio finished');
      return webAudio as HTMLAudioElement;
    }

    console.log('[TTS] Mobile platform - preparing expo-av Sound');
    await ensureCacheDirectory();
    const cached = await checkCache(text);
    const audioPath = cached || await downloadAudio(text);

    const { sound } = await ExpoAudio.Sound.createAsync(
      { uri: audioPath },
      { shouldPlay: true }
    );

    soundObject = sound;

    await new Promise<void>((resolve, reject) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded && status.error) {
          reject(status.error);
        }
        if (status.isLoaded && status.didJustFinish) {
          resolve();
        }
      });
    });

    console.log('[TTS] Mobile audio finished');
    return soundObject as ExpoAudio.Sound;
  } catch (err) {
    console.error('[TTS] Error during speak:', err);
    throw err;
  } finally {
  }
};

export const testTTS = async () => {
  const testText = "Hello! This is a test of the text to speech functionality.";
  console.log('[TTS] Starting test...');
  
  try {
    await speak(testText);
    console.log('[TTS] Test successful - audio should be playing');
  } catch (error) {
    console.error('[TTS] Test failed:', error);
    throw error;
  }
};