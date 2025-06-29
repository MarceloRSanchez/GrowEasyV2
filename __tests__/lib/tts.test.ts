import { speak, unloadSound } from '@/lib/tts';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

// Mock FileSystem
jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///cache/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

// Mock Audio
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn(),
          unloadAsync: jest.fn(),
          setOnPlaybackStatusUpdate: jest.fn(),
        },
      }),
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();
global.FileReader = jest.fn(() => ({
  readAsDataURL: jest.fn(),
  onloadend: null,
  result: 'data:audio/mpeg;base64,mockBase64Data',
}));

describe('TTS Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock FileSystem.getInfoAsync for cache directory
    (FileSystem.getInfoAsync as jest.Mock).mockImplementation((path) => {
      if (path.endsWith('tts/')) {
        return Promise.resolve({ exists: false });
      }
      return Promise.resolve({ exists: false });
    });
    
    // Mock fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(new Blob(['mock audio data'], { type: 'audio/mpeg' })),
    });
  });

  it('should create cache directory if it does not exist', async () => {
    await speak('Test text');
    
    expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
      'file:///cache/tts/',
      { intermediates: true }
    );
  });

  it('should download audio if not cached', async () => {
    await speak('Test text');
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.elevenlabs.io'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'xi-api-key': expect.any(String),
        }),
        body: expect.stringContaining('Test text'),
      })
    );
    
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
      expect.stringContaining('md5hash'),
      'mockBase64Data',
      { encoding: 'base64' }
    );
  });

  it('should use cached audio if available', async () => {
    // First, mock that the file doesn't exist
    (FileSystem.getInfoAsync as jest.Mock).mockImplementation((path) => {
      if (path.endsWith('tts/')) {
        return Promise.resolve({ exists: true });
      }
      return Promise.resolve({ exists: false });
    });
    
    // First call should download
    await speak('Test text');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Now mock that the file exists
    (FileSystem.getInfoAsync as jest.Mock).mockImplementation((path) => {
      return Promise.resolve({ exists: true });
    });
    
    // Second call should use cache
    await speak('Test text');
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still only one call
  });

  it('should create and play sound', async () => {
    await speak('Test text');
    
    expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
      { uri: expect.stringContaining('.mp3') },
      { shouldPlay: true }
    );
  });

  it('should handle API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue('Bad request'),
    });
    
    await expect(speak('Test text')).rejects.toThrow('ElevenLabs API error');
  });

  it('should unload sound when requested', async () => {
    const mockUnloadAsync = jest.fn();
    
    // Mock the sound object
    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: {
        playAsync: jest.fn(),
        unloadAsync: mockUnloadAsync,
        setOnPlaybackStatusUpdate: jest.fn(),
      },
    });
    
    await speak('Test text');
    await unloadSound();
    
    expect(mockUnloadAsync).toHaveBeenCalled();
  });
});