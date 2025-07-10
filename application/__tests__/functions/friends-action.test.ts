import { getFriends, getRequests, insertFriendRequest, updateFriendRequest, deleteFriendRequest } from '../../functions/friends-action';
import { TFriendRequestDB } from '../../types/types';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(),
  rpc: jest.fn()
};

jest.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('Friends Actions', () => {
  const mockUser = { id: 'test-user-123', email: 'test@test.com' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
  });

  describe('getFriends', () => {
    it('should return list of friends for current user', async () => {
      const mockFriendsData = [
        {
          id: 'friend-1',
          sender_id: 'other-user-1',
          receiver_id: mockUser.id,
          status: 'accepted',
          created_at: '2024-01-01',
          sender: { id: 'other-user-1', username: 'friend1', avatar_url: null },
          receiver: { id: mockUser.id, username: 'testuser', avatar_url: null }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockResolvedValue({ data: mockFriendsData, error: null, status: 200 })
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getFriends();

      expect(mockSupabase.from).toHaveBeenCalledWith('friends_request');
      expect(mockQuery.select).toHaveBeenCalledWith(
        '*, sender:profile!friends_request_sender_id_fkey(*), receiver:profile!friends_request_receiver_id_fkey(*)'
      );
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'accepted');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].profile.username).toBe('friend1');
    });

    it('should handle errors gracefully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' }, 
          status: 500 
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await expect(getFriends()).rejects.toThrow('Database error');
    });
  });

  describe('getRequests', () => {
    it('should return pending friend requests for current user', async () => {
      const mockRequestsData = [
        {
          id: 'request-1',
          sender_id: 'other-user-2',
          receiver_id: mockUser.id,
          status: 'pending',
          created_at: '2024-01-02',
          profile: { id: 'other-user-2', username: 'requester', avatar_url: null }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockRequestsData, error: null, status: 200 })
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getRequests();

      expect(mockSupabase.from).toHaveBeenCalledWith('friends_request');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].profile.username).toBe('requester');
    });
  });

  describe('insertFriendRequest', () => {
    it('should create a new friend request', async () => {
      const targetUserId = 'target-user-123';
      const mockInsertData = { id: 'new-request-id' };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockInsertData, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await insertFriendRequest(targetUserId);

      expect(mockSupabase.from).toHaveBeenCalledWith('friends_request');
      expect(mockQuery.insert).toHaveBeenCalledWith({
        sender_id: mockUser.id,
        receiver_id: targetUserId,
        status: 'pending'
      });
      expect(result.id).toBe('new-request-id');
    });

    it('should handle duplicate friend request error', async () => {
      const targetUserId = 'target-user-123';

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'duplicate key value violates unique constraint' }
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await expect(insertFriendRequest(targetUserId)).rejects.toThrow();
    });
  });

  describe('updateFriendRequest', () => {
    it('should accept a friend request', async () => {
      const requestId = 'request-123';
      const mockUpdatedData = {
        id: requestId,
        status: 'accepted',
        profile: { id: 'sender-id', username: 'sender', avatar_url: null }
      };

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUpdatedData, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await updateFriendRequest(requestId, 'accepted');

      expect(mockQuery.update).toHaveBeenCalledWith({ status: 'accepted' });
      expect(mockQuery.eq).toHaveBeenCalledWith('id', requestId);
      expect(result.data.status).toBe('accepted');
    });

    it('should reject a friend request', async () => {
      const requestId = 'request-456';
      const mockUpdatedData = {
        id: requestId,
        status: 'rejected',
        profile: { id: 'sender-id', username: 'sender', avatar_url: null }
      };

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUpdatedData, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await updateFriendRequest(requestId, 'pending');

      expect(result.data.id).toBe(requestId);
    });
  });

  describe('deleteFriendRequest', () => {
    it('should delete a friend request', async () => {
      const requestId = 'request-to-delete';

      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await deleteFriendRequest(requestId);

      expect(mockSupabase.from).toHaveBeenCalledWith('friends_request');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', requestId);
      expect(result.error).toBeNull();
    });

    it('should handle delete errors', async () => {
      const requestId = 'non-existent-request';

      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: { message: 'Request not found' } })
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await deleteFriendRequest(requestId);

      expect(result.error.message).toBe('Request not found');
    });
  });

  describe('getUserAndCheckFriendship', () => {
    it('should return user with friendship status', async () => {
      const searchUsername = 'searchuser';
      const mockRpcResult = [
        {
          id: 'found-user-id',
          username: 'searchuser',
          avatar_url: null,
          email: 'search@test.com',
          friendship_status: 'not_friend',
          friend_request_id: null
        }
      ];

      mockSupabase.rpc.mockResolvedValue({ data: mockRpcResult, error: null });

      const { getUserAndCheckFriendship } = await import('../../functions/friends-action');
      const result = await getUserAndCheckFriendship(searchUsername);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('search_users_friendship_status', {
        p_search_username: searchUsername,
        p_current_user_id: mockUser.id
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].friendship_status).toBe('not_friend');
    });

    it('should handle search errors', async () => {
      const searchUsername = 'erroruser';

      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Search failed' }
      });

      const { getUserAndCheckFriendship } = await import('../../functions/friends-action');
      
      await expect(getUserAndCheckFriendship(searchUsername)).rejects.toThrow('Search failed');
    });
  });

  describe('Integration tests', () => {
    it('should handle complete friend request workflow', async () => {
      const targetUserId = 'workflow-user-id';
      
      // 1. Envoyer une demande d'ami
      const insertMockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { id: 'workflow-request-id' }, 
          error: null 
        })
      };

      // 2. Accepter la demande
      const updateMockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { 
            id: 'workflow-request-id', 
            status: 'accepted',
            profile: { id: targetUserId, username: 'workflow', avatar_url: null }
          }, 
          error: null 
        })
      };

      mockSupabase.from.mockReturnValueOnce(insertMockQuery)
                        .mockReturnValueOnce(updateMockQuery);

      // Test du workflow complet
      const insertResult = await insertFriendRequest(targetUserId);
      expect(insertResult.id).toBe('workflow-request-id');

      const updateResult = await updateFriendRequest('workflow-request-id', 'accepted');
      expect(updateResult.data.status).toBe('accepted');
    });
  });
});