import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptPhoto, decryptPhoto, generateKeys, getEncryptionKey } from '../../functions/encryption-action';

// Mock fetch pour les appels API
global.fetch = jest.fn();

describe('Encryption Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('encryptPhoto', () => {
    it('should encrypt photo data correctly', async () => {
      const mockPhotoData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';
      const testKey = 'test-encryption-key-123';
      
      // Mock FileSystem.readAsStringAsync
      jest.doMock('expo-file-system', () => ({
        readAsStringAsync: jest.fn().mockResolvedValue('base64PhotoData'),
        EncodingType: { Base64: 'base64' }
      }));

      // Mock fetch pour simuler la création du blob
      global.fetch = jest.fn().mockResolvedValue({
        blob: () => Promise.resolve(new Blob())
      });

      const encryptedPhoto = await encryptPhoto({
        capturedPhoto: mockPhotoData,
        encryptionKey: testKey
      });

      expect(encryptedPhoto).toBeDefined();
      expect(Buffer.isBuffer(encryptedPhoto)).toBe(true);
    });
  });

  describe('decryptPhoto', () => {
    it('should decrypt photo correctly', async () => {
      const originalPhoto = 'base64PhotoData';
      const testKey = 'test-encryption-key-123';
      
      // Chiffrer d'abord la photo
      const encrypted = CryptoJS.AES.encrypt(originalPhoto, testKey).toString();
      const encryptedBlob = new Blob([Buffer.from(encrypted, 'base64')]);

      const decryptedPhoto = await decryptPhoto({
        encryptedBlob,
        encryptionKey: testKey
      });

      expect(decryptedPhoto).toBe(originalPhoto);
    });

    it('should handle invalid decryption gracefully', async () => {
      const invalidBlob = new Blob(['invalid-data']);
      const testKey = 'wrong-key';

      await expect(decryptPhoto({
        encryptedBlob: invalidBlob,
        encryptionKey: testKey
      })).rejects.toThrow();
    });
  });

  describe('generateKeys', () => {
    it('should generate unique keys for same challenge', async () => {
      const challenge = 'Test challenge';
      
      // Mock les appels API
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            success: true,
            key: 'encryption-key-1',
            base_key: 'base-key-1'
          })
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            success: true,
            key: 'encryption-key-2',
            base_key: 'base-key-2'
          })
        });

      // Mock supabase auth
      jest.doMock('../../lib/supabase', () => ({
        supabase: {
          auth: {
            getUser: () => Promise.resolve({
              data: { user: { id: 'test-user-id' } }
            }),
            getSession: () => Promise.resolve({
              data: { session: { access_token: 'test-token', refresh_token: 'refresh-token' } }
            })
          }
        }
      }));

      const keys1 = await generateKeys({ challenge });
      const keys2 = await generateKeys({ challenge });

      expect(keys1.encryption_key).not.toBe(keys2.encryption_key);
      expect(keys1.derkap_base_key).not.toBe(keys2.derkap_base_key);
    });

    it('should handle API errors gracefully', async () => {
      const challenge = 'Test challenge';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({
          success: false,
          message: 'API Error'
        })
      });

      await expect(generateKeys({ challenge })).rejects.toThrow('API Error');
    });
  });

  describe('getEncryptionKey', () => {
    it('should return cached key if available', async () => {
      const derkapId = 123;
      const cachedKey = 'cached-encryption-key';
      
      await AsyncStorage.setItem(`encryption_key_${derkapId}`, cachedKey);

      const result = await getEncryptionKey({ derkap_id: derkapId });

      expect(result).toBe(cachedKey);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch key from API if not cached', async () => {
      const derkapId = 456;
      const apiKey = 'api-encryption-key';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({
          success: true,
          key: apiKey
        })
      });

      const result = await getEncryptionKey({ derkap_id: derkapId });

      expect(result).toBe(apiKey);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `encryption_key_${derkapId}`,
        apiKey
      );
    });

    it('should handle unauthorized access', async () => {
      const derkapId = 789;
      
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({
          success: false,
          message: 'User not allowed to access derkap'
        })
      });

      await expect(getEncryptionKey({ derkap_id: derkapId }))
        .rejects.toThrow('User not allowed to access derkap');
    });
  });

  describe('Integration tests', () => {
    it('should encrypt and decrypt full workflow', async () => {
      const originalPhoto = 'data:image/jpeg;base64,testPhotoData';
      const challenge = 'Integration test challenge';
      
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({
          success: true,
          key: 'integration-test-key',
          base_key: 'integration-base-key'
        })
      });

      // Mock FileSystem
      jest.doMock('expo-file-system', () => ({
        readAsStringAsync: jest.fn().mockResolvedValue('testPhotoData'),
        EncodingType: { Base64: 'base64' }
      }));

      // Générer les clés
      const { encryption_key } = await generateKeys({ challenge });

      // Chiffrer la photo
      const encryptedPhoto = await encryptPhoto({
        capturedPhoto: originalPhoto,
        encryptionKey: encryption_key
      });

      // Simuler le téléchargement depuis Supabase
      const encryptedBlob = new Blob([encryptedPhoto]);

      // Déchiffrer la photo
      const decryptedPhoto = await decryptPhoto({
        encryptedBlob,
        encryptionKey: encryption_key
      });

      expect(decryptedPhoto).toBe('testPhotoData');
    });
  });
});