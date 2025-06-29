import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Platform-specific imports
let FileSystem: any = null;
let createHash: any = null;

if (Platform.OS !== 'web') {
  FileSystem = require('expo-file-system');
  createHash = require('crypto').createHash;
}

// ElevenLabs API configuration
const ELEVEN_API_KEY = process.env.EXPO_PUBLIC_ELEVEN_API_KEY;
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam voice (male, American accent)
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

// Create a hash of the text to use as the filename (mobile only)
const getTextHash = (text: string): string => {
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
  return createHash('md5').update(text).digest('hex');
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
const getCachedFilePath = (text: string): string => {
  if (Platform.OS === 'web') return '';
  
  const hash = getTextHash(text);
  return `${getCacheDirectory()}${hash}.mp3`;
};

// Check if a file exists in the cache (mobile only)
const checkCache = async (text: string): Promise<string | null> => {
  if (Platform.OS === 'web') return null;
  
  const filePath = getCachedFilePath(text);
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  return fileInfo.exists ? filePath : null;
};

// Download audio from ElevenLabs API
const downloadAudio = async (text: string): Promise<string> => {
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
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    // Get the audio data as a blob
    const audioBlob = await response.blob();
    
    if (Platform.OS === 'web') {
      // For web, create object URL directly from blob
      return URL.createObjectURL(audioBlob);
    } else {
      // For mobile, save to file system
      const filePath = getCachedFilePath(text);
      
      // Convert blob to base64 for FileSystem
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove the data URL prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(audioBlob);
      });

      // Write the file to the cache
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return filePath;
    }
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw error;
  }
};

// Play audio from a file path
let soundObject: Audio.Sound | null = null;
let webAudioUrl: string | null = null;

// Clean up function to unload the sound
export const unloadSound = async (): Promise<void> => {
  if (soundObject) {
    // Clear the playback status update listener before unloading
    soundObject.setOnPlaybackStatusUpdate(null);
    await soundObject.unloadAsync();
    soundObject = null;
  }
  
  // Clean up web object URL to prevent memory leaks
  if (Platform.OS === 'web' && webAudioUrl) {
    URL.revokeObjectURL(webAudioUrl);
    webAudioUrl = null;
  }
};

// Main function to speak text
export const speak = async (text: string): Promise<Audio.Sound> => {
  // Unload any existing sound
  await unloadSound();
  
  try {
    let audioPath: string;
    
    if (Platform.OS === 'web') {
      // For web, always download fresh (no caching)
      audioPath = await downloadAudio(text);
      webAudioUrl = audioPath; // Store for cleanup
    } else {
      // For mobile, use caching
      await ensureCacheDirectory();
      
      // Check if the audio is already cached
      audioPath = await checkCache(text) || await downloadAudio(text);
    }
    
    // Create a new sound object
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioPath },
      { shouldPlay: true }
    );
    
    soundObject = sound;
    
    // Set up completion handler
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        // Auto-unload when finished
        unloadSound();
      }
    });
    
    return sound;
  } catch (error) {
    console.error('Error speaking text:', error);
    throw error;
  }
};