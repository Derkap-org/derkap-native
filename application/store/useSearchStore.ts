import { TUserWithFriendshipStatus } from "@/types/types";
import { create } from "zustand";

interface SearchState {
  searchedUsers: TUserWithFriendshipStatus;
  setSearchedUsers: (searchedUsers: TUserWithFriendshipStatus) => void;
}

const useSearchStore = create<SearchState>((set, get) => ({
  searchedUsers: [],
  setSearchedUsers: (searchedUsers) => set({ searchedUsers }),
}));

export default useSearchStore;
