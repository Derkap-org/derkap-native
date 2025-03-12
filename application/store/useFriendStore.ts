import {
  deleteFriendRequest,
  getFriends,
  getRequests,
  insertFriendRequest,
  updateFriendRequest,
} from "@/functions/friends-action";
import { TFriendRequestDB, TFriendshipStatus } from "@/types/types";
import { create } from "zustand";
import useSearchStore from "./useSearchStore";

interface FriendState {
  friends: TFriendRequestDB[];
  requests: TFriendRequestDB[];
  isLoadingFriends: boolean;
  // loadingRequestIdByUserId: string[];
  isLoadingRequests: boolean;
  modalRequestSelected: TFriendRequestDB | null;
  isModalOpen: boolean;
  setFriends: (friends: TFriendRequestDB[]) => void;
  setRequests: (requests: TFriendRequestDB[]) => void;
  showModalConfirmDeletion: (request: TFriendRequestDB) => void;
  hideModalConfirmDeletion: () => void;
  fetchFriends: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  acceptRequest: ({
    request_id,
    user_id,
  }: {
    request_id: string;
    user_id: string;
  }) => Promise<void>;
  rejectRequest: ({
    request_id,
    user_id,
  }: {
    request_id: string;
    user_id: string;
  }) => Promise<void>;
  addRequest: ({ user_id }: { user_id: string }) => Promise<void>;
}

const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  requests: [],
  isLoadingFriends: false,
  loadingRequestIdByUserId: [],
  isLoadingRequests: false,
  modalRequestSelected: null,
  isModalOpen: false,
  setFriends: (friends) => set({ friends }),
  setRequests: (requests) => set({ requests }),
  showModalConfirmDeletion: (request) =>
    set({ modalRequestSelected: request, isModalOpen: true }),
  hideModalConfirmDeletion: () =>
    set({ modalRequestSelected: null, isModalOpen: false }),
  fetchFriends: async () => {
    set({ isLoadingFriends: true });
    const { data } = await getFriends();
    set({ friends: data, isLoadingFriends: false });
  },
  fetchRequests: async () => {
    set({ isLoadingRequests: true });
    const { data } = await getRequests();
    set({ requests: data, isLoadingRequests: false });
  },

  acceptRequest: async ({
    request_id,
    user_id,
  }: {
    request_id: string;
    user_id: string;
  }) => {
    const { data } = await updateFriendRequest(request_id, "accepted");
    const prevRequests = get().requests;
    const newRequests = prevRequests.filter(
      (request) => request.id !== request_id,
    );
    const newFriends = [...get().friends, data];

    // if the user is in the searchedUsers array
    const searchedUsers = useSearchStore.getState().searchedUsers;
    const currentSearchedUsers = searchedUsers.find(
      (user) => user.id === user_id,
    );
    if (currentSearchedUsers) {
      const newCurrentSearchedUsers = {
        ...currentSearchedUsers,
        friendship_status: "friend" as TFriendshipStatus,
      };
      const newSearchedUsers = searchedUsers.map((user) =>
        user.id === user_id ? newCurrentSearchedUsers : user,
      );
      useSearchStore.getState().setSearchedUsers(newSearchedUsers);
    }

    set({
      requests: newRequests,
      friends: newFriends,
    });
  },

  rejectRequest: async ({
    request_id,
    user_id,
  }: {
    request_id: string;
    user_id: string;
  }) => {
    const prevRequests = get().requests;
    const prevFriends = get().friends;

    await deleteFriendRequest(request_id);
    const newRequests = prevRequests.filter(
      (request) => request.id !== request_id,
    );

    // if the user is in the prevFriends array
    const newFriends = prevFriends.filter(
      (friend) => friend.profile.id !== user_id,
    );
    set({ friends: newFriends });

    // if the user is in the searchedUsers array
    const searchedUsers = useSearchStore.getState().searchedUsers;
    const currentSearchedUsers = searchedUsers.find(
      (user) => user.id === user_id,
    );
    if (currentSearchedUsers) {
      const newCurrentSearchedUsers = {
        ...currentSearchedUsers,
        friendship_status: "not_friend" as TFriendshipStatus,
      };
      const newSearchedUsers = searchedUsers.map((user) =>
        user.id === user_id ? newCurrentSearchedUsers : user,
      );
      useSearchStore.getState().setSearchedUsers(newSearchedUsers);
    }
    set({
      requests: newRequests,
    });
  },
  addRequest: async ({ user_id }: { user_id: string }) => {
    const { id } = await insertFriendRequest(user_id);
    // if the user is in the searchedUsers array
    const searchedUsers = useSearchStore.getState().searchedUsers;
    const currentSearchedUsers = searchedUsers.find(
      (user) => user.id === user_id,
    );
    if (currentSearchedUsers) {
      const newCurrentSearchedUsers = {
        ...currentSearchedUsers,
        friend_request_id: id,
        friendship_status: "pending_their_acceptance" as TFriendshipStatus,
      };
      const newSearchedUsers = searchedUsers.map((user) =>
        user.id === user_id ? newCurrentSearchedUsers : user,
      );
      useSearchStore.getState().setSearchedUsers(newSearchedUsers);
    }
  },
}));

export default useFriendStore;
