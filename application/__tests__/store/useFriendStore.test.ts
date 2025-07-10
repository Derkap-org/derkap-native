/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react-native';
import useFriendStore from '../../store/useFriendStore';
import { TFriendRequestDB } from '../../types/types';

// Mock des fonctions d'amis
jest.mock('../../functions/friends-action', () => ({
  getFriends: jest.fn(),
  getRequests: jest.fn(),
  insertFriendRequest: jest.fn(),
  updateFriendRequest: jest.fn(),
  deleteFriendRequest: jest.fn(),
}));

describe('useFriendStore', () => {
  beforeEach(() => {
    // Reset du store avant chaque test
    const { result } = renderHook(() => useFriendStore());
    act(() => {
      result.current.setFriends([]);
      result.current.setRequests([]);
      result.current.hideModalConfirmDeletion();
    });
  });

  test('should initialize with empty state', () => {
    const { result } = renderHook(() => useFriendStore());
    
    expect(result.current.friends).toEqual([]);
    expect(result.current.requests).toEqual([]);
    expect(result.current.isLoadingFriends).toBe(false);
    expect(result.current.isLoadingRequests).toBe(false);
    expect(result.current.modalRequestSelected).toBe(null);
    expect(result.current.isModalOpen).toBe(false);
  });

  test('should set friends correctly', () => {
    const { result } = renderHook(() => useFriendStore());
    
    const mockFriends: TFriendRequestDB[] = [
      {
        id: 'friend-1',
        sender_id: 'user-1',
        receiver_id: 'user-2',
        status: 'accepted',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        profile: {
          id: 'user-1',
          username: 'friend1',
          email: 'friend1@test.com',
          avatar_url: null,
          created_at: '2024-01-01',
          birthdate: null
        }
      }
    ];

    act(() => {
      result.current.setFriends(mockFriends);
    });

    expect(result.current.friends).toEqual(mockFriends);
    expect(result.current.friends).toHaveLength(1);
    expect(result.current.friends[0].profile.username).toBe('friend1');
  });

  test('should set requests correctly', () => {
    const { result } = renderHook(() => useFriendStore());
    
    const mockRequests: TFriendRequestDB[] = [
      {
        id: 'request-1',
        sender_id: 'user-3',
        receiver_id: 'user-2',
        status: 'pending',
        created_at: '2024-01-02',
        updated_at: '2024-01-02',
        profile: {
          id: 'user-3',
          username: 'requester',
          email: 'requester@test.com',
          avatar_url: null,
          created_at: '2024-01-01',
          birthdate: null
        }
      }
    ];

    act(() => {
      result.current.setRequests(mockRequests);
    });

    expect(result.current.requests).toEqual(mockRequests);
    expect(result.current.requests).toHaveLength(1);
    expect(result.current.requests[0].profile.username).toBe('requester');
  });

  test('should show and hide modal correctly', () => {
    const { result } = renderHook(() => useFriendStore());
    
    const mockRequest: TFriendRequestDB = {
      id: 'modal-request',
      sender_id: 'user-4',
      receiver_id: 'user-2',
      status: 'pending',
      created_at: '2024-01-03',
      updated_at: '2024-01-03',
      profile: {
        id: 'user-4',
        username: 'modaluser',
        email: 'modal@test.com',
        avatar_url: null,
        created_at: '2024-01-01',
        birthdate: null
      }
    };

    // Afficher le modal
    act(() => {
      result.current.showModalConfirmDeletion(mockRequest);
    });

    expect(result.current.modalRequestSelected).toEqual(mockRequest);
    expect(result.current.isModalOpen).toBe(true);

    // Cacher le modal
    act(() => {
      result.current.hideModalConfirmDeletion();
    });

    expect(result.current.modalRequestSelected).toBe(null);
    expect(result.current.isModalOpen).toBe(false);
  });

  test('should handle loading states', () => {
    const { result } = renderHook(() => useFriendStore());
    
    // Test initial state
    expect(result.current.isLoadingFriends).toBe(false);
    expect(result.current.isLoadingRequests).toBe(false);
  });

  test('should manage friend list operations', () => {
    const { result } = renderHook(() => useFriendStore());
    
    const initialFriends: TFriendRequestDB[] = [
      {
        id: 'friend-1',
        sender_id: 'user-1',
        receiver_id: 'user-2',
        status: 'accepted',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        profile: {
          id: 'user-1',
          username: 'friend1',
          email: 'friend1@test.com',
          avatar_url: null,
          created_at: '2024-01-01',
          birthdate: null
        }
      },
      {
        id: 'friend-2',
        sender_id: 'user-3',
        receiver_id: 'user-2',
        status: 'accepted',
        created_at: '2024-01-02',
        updated_at: '2024-01-02',
        profile: {
          id: 'user-3',
          username: 'friend2',
          email: 'friend2@test.com',
          avatar_url: null,
          created_at: '2024-01-01',
          birthdate: null
        }
      }
    ];

    // Ajouter des amis
    act(() => {
      result.current.setFriends(initialFriends);
    });

    expect(result.current.friends).toHaveLength(2);

    // Vider la liste
    act(() => {
      result.current.setFriends([]);
    });

    expect(result.current.friends).toHaveLength(0);
  });

  test('should manage request list operations', () => {
    const { result } = renderHook(() => useFriendStore());
    
    const initialRequests: TFriendRequestDB[] = [
      {
        id: 'request-1',
        sender_id: 'user-4',
        receiver_id: 'user-2',
        status: 'pending',
        created_at: '2024-01-03',
        updated_at: '2024-01-03',
        profile: {
          id: 'user-4',
          username: 'requester1',
          email: 'req1@test.com',
          avatar_url: null,
          created_at: '2024-01-01',
          birthdate: null
        }
      },
      {
        id: 'request-2',
        sender_id: 'user-5',
        receiver_id: 'user-2',
        status: 'pending',
        created_at: '2024-01-04',
        updated_at: '2024-01-04',
        profile: {
          id: 'user-5',
          username: 'requester2',
          email: 'req2@test.com',
          avatar_url: null,
          created_at: '2024-01-01',
          birthdate: null
        }
      }
    ];

    // Ajouter des demandes
    act(() => {
      result.current.setRequests(initialRequests);
    });

    expect(result.current.requests).toHaveLength(2);

    // Vider la liste
    act(() => {
      result.current.setRequests([]);
    });

    expect(result.current.requests).toHaveLength(0);
  });
});