import {
  getFriends,
  getRequests,
  insertFriendRequest,
  updateFriendRequest,
} from "@/functions/friends-action";
import { TFriendRequestDB } from "@/types/types";
import { create } from "zustand";

interface FriendState {
  friends: TFriendRequestDB[];
  requests: TFriendRequestDB[];
  loadingFriendId: string | null;
  isLoadingFriends: boolean;
  loadingRequestId: string | null;
  isLoadingRequests: boolean;
  setFriends: (friends: TFriendRequestDB[]) => void;
  setRequests: (requests: TFriendRequestDB[]) => void;
  fetchFriends: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  handleRequest: (id: string, status: "accepted" | "rejected") => Promise<void>;
  addFriend: (id: string) => Promise<void>;
}

const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  requests: [],
  loadingFriendId: null,
  isLoadingFriends: false,
  loadingRequestId: null,
  isLoadingRequests: false,
  setFriends: (friends) => set({ friends }),
  setRequests: (requests) => set({ requests }),
  fetchFriends: async () => {
    if (get().friends.length > 0) return;
    set({ isLoadingFriends: true });
    const { data } = await getFriends();
    set({ friends: data, isLoadingFriends: false });
  },
  fetchRequests: async () => {
    if (get().requests.length > 0) return;
    set({ isLoadingRequests: true });
    const { data } = await getRequests();
    set({ requests: data, isLoadingRequests: false });
  },
  handleRequest: async (id: string, status: "accepted" | "rejected") => {
    set({ loadingRequestId: id });
    const { data } = await updateFriendRequest(id, status);
    set({ requests: data, loadingRequestId: null });
  },
  addFriend: async (id: string) => {
    set({ loadingFriendId: id });
    await insertFriendRequest(id);
    set({ loadingFriendId: null });
  },
}));

export default useFriendStore;
