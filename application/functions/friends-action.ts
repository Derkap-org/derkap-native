import { supabase } from "@/lib/supabase";
import { TUserWithFriendshipStatus } from "@/types/types";

export const getFriends = async () => {
  const { user } = (await supabase.auth.getUser()).data;
  const { data, error, status } = await supabase
    .from("friends_request")
    .select(
      `*, sender:profile!friends_request_sender_id_fkey(*), receiver:profile!friends_request_receiver_id_fkey(*)`,
    )
    .eq("status", "accepted")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  if (error && status !== 406) {
    console.log(error);
    throw error;
  }

  // Get only data needed and reformat to get same structure as requests
  const transformedData = data?.map((request) => {
    const isUserSender = request.sender.id === user.id;
    const { sender, receiver, ...rest } = request;
    return {
      ...rest,
      profile: isUserSender ? request.receiver : request.sender,
    };
  });

  return { data: transformedData };
};

export const getRequests = async () => {
  const { user } = (await supabase.auth.getUser()).data;

  const { data, error, status } = await supabase
    .from("friends_request")
    .select(`*, profile!friends_request_sender_id_fkey(*)`)
    .eq("status", "pending")
    .eq("receiver_id", user.id);

  if (error && status !== 406) {
    throw error;
  }
  return { data };
};

export const insertFriendRequest = async (id: string) => {
  const { user } = (await supabase.auth.getUser()).data;

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("friends_request")
    .insert({ sender_id: user.id, receiver_id: id, status: "pending" })
    .select("id")
    .single();

  if (error) {
    console.log(error);
    throw error;
  }
  return { id: data?.id };
};

export const deleteFriendRequest = async (request_id: string) => {
  console.log("Deleting friend request", request_id);
  const { user } = (await supabase.auth.getUser()).data;

  if (!user) {
    throw new Error("User not found");
  }

  const { error } = await supabase
    .from("friends_request")
    .delete()
    .eq("id", request_id);

  console.log(error);
  console.log("Friend request deleted");

  return { error };
};

export const updateFriendRequest = async (
  id: string,
  status: "accepted" | "pending",
) => {
  const { user } = (await supabase.auth.getUser()).data;

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("friends_request")
    .update({ status })
    .eq("id", id)
    .select("*, profile!friends_request_sender_id_fkey(*)")
    .single();

  if (error) {
    throw error;
  }
  return { data };
};

export const getUserAndCheckFriendship = async (
  username: string,
): Promise<{ data: TUserWithFriendshipStatus | null }> => {
  const { user } = (await supabase.auth.getUser()).data;

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase.rpc("search_users_friendship_status", {
    p_search_username: username,
    p_current_user_id: user.id,
  });

  if (error) {
    console.log(error);
    throw error;
  }
  return { data };
};

export const getFriendsCount = async () => {
  const { user } = (await supabase.auth.getUser()).data;

  if (!user) {
    throw new Error("User not found");
  }

  const { count, error } = await supabase
    .from("friends_request")
    .select("id", { count: "exact" })
    .eq("status", "accepted")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  if (error) {
    throw error;
  }
  return { count: count };
};
