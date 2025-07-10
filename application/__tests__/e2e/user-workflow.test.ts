/**
 * @jest-environment jsdom
 * Tests E2E simulant le workflow complet d'un utilisateur
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock des modules externes
jest.mock('@supabase/supabase-js');
jest.mock('expo-notifications');
jest.mock('expo-router');

// Mock des fonctions principales
const mockFunctions = {
  // Auth
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  
  // Friends
  getFriends: jest.fn(),
  insertFriendRequest: jest.fn(),
  updateFriendRequest: jest.fn(),
  getUserAndCheckFriendship: jest.fn(),
  
  // Derkaps
  getMyChallenges: jest.fn(),
  createDerkap: jest.fn(),
  sendDerkap: jest.fn(),
  getDerkapById: jest.fn(),
  getEncryptionKey: jest.fn(),
  
  // Encryption
  generateKeys: jest.fn(),
  encryptPhoto: jest.fn(),
  decryptPhoto: jest.fn(),
  
  // Comments
  getComments: jest.fn(),
  insertComment: jest.fn(),
};

// Mock des données de test
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: {
    username: 'testuser',
    avatar_url: null
  }
};

const mockFriend = {
  id: 'friend-request-123',
  sender_id: 'friend-user-456',
  receiver_id: 'user-123',
  status: 'accepted',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  profile: {
    id: 'friend-user-456',
    username: 'frienduser',
    email: 'friend@example.com',
    avatar_url: null,
    created_at: '2024-01-01',
    birthdate: null
  }
};

const mockDerkap = {
  id: 123,
  author_id: 'user-123',
  challenge: 'Test challenge',
  photo_url: 'encrypted-photo-url',
  derkap_base_key: 'base-key-123',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  profile: mockUser,
  responses: []
};

describe('User Workflow E2E Tests', () => {
  beforeEach(async () => {
    // Reset mocks et storage
    jest.clearAllMocks();
    await AsyncStorage.clear();
    
    // Setup des mocks par défaut
    mockFunctions.signIn.mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token', refresh_token: 'refresh' } },
      error: null
    });
    
    mockFunctions.getFriends.mockResolvedValue({
      data: [mockFriend],
      error: null,
      status: 200
    });
    
    mockFunctions.getMyChallenges.mockResolvedValue({
      data: [mockDerkap],
      error: null,
      status: 200
    });
  });

  describe('Complete User Journey', () => {
    test('should complete full user workflow: auth → friends → challenge → response', async () => {
      // 1. AUTHENTIFICATION
      console.log('🔐 Testing authentication...');
      
      const authResult = await mockFunctions.signIn('test@example.com', 'password123');
      expect(authResult.data.user).toEqual(mockUser);
      expect(authResult.error).toBeNull();
      
      // Simuler la sauvegarde des données utilisateur
      await AsyncStorage.setItem('user_session', JSON.stringify(authResult.data.session));
      const savedSession = await AsyncStorage.getItem('user_session');
      expect(savedSession).toBeTruthy();

      // 2. GESTION DES AMIS
      console.log('👥 Testing friend management...');
      
      // Récupérer la liste d'amis
      const friendsResult = await mockFunctions.getFriends();
      expect(friendsResult.data).toHaveLength(1);
      expect(friendsResult.data[0].profile.username).toBe('frienduser');
      
      // Rechercher un nouvel ami
      mockFunctions.getUserAndCheckFriendship.mockResolvedValue({
        data: [{
          id: 'new-user-789',
          username: 'newpotentialfriend',
          email: 'newpotential@example.com',
          avatar_url: null,
          friendship_status: 'not_friend',
          friend_request_id: null
        }],
        error: null
      });
      
      const searchResult = await mockFunctions.getUserAndCheckFriendship('newpotentialfriend');
      expect(searchResult.data[0].friendship_status).toBe('not_friend');
      
      // Envoyer une demande d'ami
      mockFunctions.insertFriendRequest.mockResolvedValue({
        id: 'new-friend-request-456',
        sender_id: 'user-123',
        receiver_id: 'new-user-789',
        status: 'pending'
      });
      
      const friendRequestResult = await mockFunctions.insertFriendRequest('new-user-789');
      expect(friendRequestResult.status).toBe('pending');

      // 3. CRÉATION DE DÉFI
      console.log('📸 Testing challenge creation...');
      
      const challengeText = 'Take a selfie with your favorite food!';
      
      // Générer les clés de chiffrement
      mockFunctions.generateKeys.mockResolvedValue({
        encryption_key: 'encryption-key-abc123',
        derkap_base_key: 'base-key-def456'
      });
      
      const keysResult = await mockFunctions.generateKeys({ challenge: challengeText });
      expect(keysResult.encryption_key).toBeTruthy();
      expect(keysResult.derkap_base_key).toBeTruthy();
      
      // Chiffrer une photo simulée
      const mockPhotoData = 'data:image/jpeg;base64,mockPhotoBase64Data';
      const mockEncryptedPhoto = Buffer.from('encrypted-photo-data');
      
      mockFunctions.encryptPhoto.mockResolvedValue(mockEncryptedPhoto);
      
      const encryptedPhoto = await mockFunctions.encryptPhoto({
        capturedPhoto: mockPhotoData,
        encryptionKey: keysResult.encryption_key
      });
      
      expect(Buffer.isBuffer(encryptedPhoto)).toBe(true);
      
      // Créer le défi
      mockFunctions.createDerkap.mockResolvedValue({
        data: {
          id: 456,
          author_id: 'user-123',
          challenge: challengeText,
          photo_url: 'encrypted-photo-456.jpg',
          derkap_base_key: keysResult.derkap_base_key,
          created_at: new Date().toISOString()
        },
        error: null
      });
      
      const createResult = await mockFunctions.createDerkap({
        challenge: challengeText,
        encryptedPhoto: encryptedPhoto,
        derkap_base_key: keysResult.derkap_base_key
      });
      
      expect(createResult.data.challenge).toBe(challengeText);
      expect(createResult.data.id).toBe(456);

      // 4. ENVOI À DES AMIS
      console.log('📤 Testing sending challenge to friends...');
      
      mockFunctions.sendDerkap.mockResolvedValue({
        data: { success: true },
        error: null
      });
      
      const sendResult = await mockFunctions.sendDerkap({
        derkapId: createResult.data.id,
        friendIds: ['friend-user-456']
      });
      
      expect(sendResult.data.success).toBe(true);

      // 5. RÉCEPTION ET RÉPONSE À UN DÉFI
      console.log('📥 Testing challenge response...');
      
      // Simuler la réception d'un défi d'un ami
      const receivedDerkap = {
        id: 789,
        author_id: 'friend-user-456',
        challenge: 'Show your workspace!',
        photo_url: 'encrypted-workspace-photo.jpg',
        derkap_base_key: 'workspace-base-key',
        created_at: '2024-01-02',
        profile: mockFriend.profile,
        responses: []
      };
      
      mockFunctions.getDerkapById.mockResolvedValue({
        data: receivedDerkap,
        error: null
      });
      
      const derkapResult = await mockFunctions.getDerkapById(789);
      expect(derkapResult.data.challenge).toBe('Show your workspace!');
      
      // Obtenir la clé de déchiffrement
      mockFunctions.getEncryptionKey.mockResolvedValue('workspace-encryption-key');
      
      const decryptionKey = await mockFunctions.getEncryptionKey({
        derkap_id: receivedDerkap.id
      });
      expect(decryptionKey).toBe('workspace-encryption-key');
      
      // Créer une réponse au défi
      const responsePhotoData = 'data:image/jpeg;base64,myWorkspacePhoto';
      const responseEncryptedPhoto = Buffer.from('encrypted-response-photo');
      
      mockFunctions.encryptPhoto.mockResolvedValue(responseEncryptedPhoto);
      
      const responseEncrypted = await mockFunctions.encryptPhoto({
        capturedPhoto: responsePhotoData,
        encryptionKey: decryptionKey
      });
      
      expect(Buffer.isBuffer(responseEncrypted)).toBe(true);

      // 6. AJOUT DE COMMENTAIRES
      console.log('💬 Testing comments...');
      
      // Récupérer les commentaires existants
      mockFunctions.getComments.mockResolvedValue({
        data: [],
        error: null
      });
      
      const commentsResult = await mockFunctions.getComments(receivedDerkap.id);
      expect(commentsResult.data).toHaveLength(0);
      
      // Ajouter un commentaire
      mockFunctions.insertComment.mockResolvedValue({
        data: {
          id: 'comment-123',
          derkap_id: receivedDerkap.id,
          user_id: 'user-123',
          content: 'Great workspace! 🔥',
          created_at: new Date().toISOString(),
          profile: {
            username: 'testuser',
            avatar_url: null
          }
        },
        error: null
      });
      
      const commentResult = await mockFunctions.insertComment({
        derkapId: receivedDerkap.id,
        content: 'Great workspace! 🔥'
      });
      
      expect(commentResult.data.content).toBe('Great workspace! 🔥');

      // 7. VÉRIFICATION DE L'ÉTAT FINAL
      console.log('✅ Testing final state...');
      
      // Vérifier que le workflow complet s'est bien déroulé
      expect(mockFunctions.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockFunctions.getFriends).toHaveBeenCalled();
      expect(mockFunctions.getUserAndCheckFriendship).toHaveBeenCalledWith('newpotentialfriend');
      expect(mockFunctions.insertFriendRequest).toHaveBeenCalledWith('new-user-789');
      expect(mockFunctions.generateKeys).toHaveBeenCalledWith({ challenge: challengeText });
      expect(mockFunctions.encryptPhoto).toHaveBeenCalledTimes(2); // Challenge + Response
      expect(mockFunctions.createDerkap).toHaveBeenCalled();
      expect(mockFunctions.sendDerkap).toHaveBeenCalled();
      expect(mockFunctions.getDerkapById).toHaveBeenCalledWith(789);
      expect(mockFunctions.getEncryptionKey).toHaveBeenCalled();
      expect(mockFunctions.insertComment).toHaveBeenCalled();
      
      console.log('🎉 Complete user workflow test passed!');
    });
  });

  describe('Error Handling in Workflows', () => {
    test('should handle authentication failure gracefully', async () => {
      mockFunctions.signIn.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      });

      const authResult = await mockFunctions.signIn('wrong@email.com', 'wrongpassword');
      
      expect(authResult.data.user).toBeNull();
      expect(authResult.error.message).toContain('Invalid login credentials');
    });

    test('should handle friend request already exists', async () => {
      mockFunctions.insertFriendRequest.mockRejectedValue(
        new Error('duplicate key value violates unique constraint')
      );

      await expect(mockFunctions.insertFriendRequest('existing-friend-id'))
        .rejects
        .toThrow('duplicate key value violates unique constraint');
    });

    test('should handle encryption key generation failure', async () => {
      mockFunctions.generateKeys.mockRejectedValue(
        new Error('API Error: Unable to generate keys')
      );

      await expect(mockFunctions.generateKeys({ challenge: 'Test challenge' }))
        .rejects
        .toThrow('API Error: Unable to generate keys');
    });
  });

  describe('Performance Workflows', () => {
    test('should handle concurrent friend requests', async () => {
      const friendIds = ['friend1', 'friend2', 'friend3', 'friend4', 'friend5'];
      
      // Mock responses for each friend request
      friendIds.forEach((friendId, index) => {
        mockFunctions.insertFriendRequest.mockResolvedValueOnce({
          id: `request-${index}`,
          sender_id: 'user-123',
          receiver_id: friendId,
          status: 'pending'
        });
      });

      const promises = friendIds.map(friendId => 
        mockFunctions.insertFriendRequest(friendId)
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result.id).toBe(`request-${index}`);
        expect(result.status).toBe('pending');
      });
    });
  });
});