import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";

export const getGroups = async ({ user_id }: { user_id?: string }) => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    return {
      data: null,
      error: "User not found",
    };
  }
  const { data, error } = await supabase
    .from("group_profile")
    .select("group(*, members:group_profile(profile(*)))")
    .eq("profile_id", user_id ?? user.id);
  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }
  const groups = data
    .map((item) => item.group)
    .filter((group) => group !== null);
  return {
    data: groups,
    error: null,
  };
};

export const addMemberToGroup = async ({
  group_id,
  user_id,
}: {
  group_id: number;
  user_id: string;
}) => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    return {
      error: "User not found",
    };
  }
  if (!group_id || !user_id) {
    return {
      error: "Id is required",
    };
  }
  // INSERT IN MANY TO MANY TABLE

  const { data: existingGroupProfile, error: checkError } = await supabase
    .from("group_profile")
    .select("*")
    .eq("profile_id", user_id)
    .eq("group_id", group_id);

  if (checkError) {
    console.error("Erreur de vérification :", checkError);
    return;
  }
  if (existingGroupProfile.length > 0) {
    return {
      error: "Le membre est déjà dans le groupe",
    };
  }

  const { error: errorGroupProfil } = await supabase
    .from("group_profile")
    .insert({ profile_id: user_id, group_id: group_id });

  if (errorGroupProfil) {
    return {
      error: errorGroupProfil.message,
    };
  }
};

export const joinGroup = async ({ invite_code }: { invite_code: string }) => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    return {
      error: "User not found",
    };
  }
  if (!invite_code) {
    return {
      data: null,
      error: "Invite code is required",
    };
  }
  // GET GROUP FROM INVITE CODE
  // USE RPS TO BYPASS RLS
  const { data: group, error: errorGroup } = await supabase.rpc(
    "get_group_by_invite_code",
    {
      p_invite_code: invite_code,
    },
  );

  if (errorGroup) {
    return {
      error: errorGroup.message,
    };
  }
  if (!group) {
    return {
      error: "Aucun groupe trouvé",
    };
  }

  // INSERT IN MANY TO MANY TABLE

  const { data: existingGroupProfile, error: checkError } = await supabase
    .from("group_profile")
    .select("*")
    .eq("profile_id", user.id)
    .eq("group_id", group[0].id);
  // .single();

  if (checkError) {
    console.error("Erreur de vérification :", checkError);
    return;
  }

  if (existingGroupProfile.length > 0) {
    Alert.alert("Déjà membre", "Vous êtes déjà membre de ce groupe");
    return {
      error: checkError.message,
    };
  } else {
    const { error: errorGroupProfil } = await supabase
      .from("group_profile")
      .insert({ profile_id: user.id, group_id: group[0].id });

    if (errorGroupProfil) {
      return {
        error: errorGroupProfil.message,
      };
    }

    const newGroup = await getGroup({
      group_id: group[0].id.toString(),
    });

    return {
      data: newGroup,
      error: null,
    };
  }
};

export const createGroup = async ({ name }: { name: string }) => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    return {
      data: null,
      error: "User not found",
    };
  }
  if (!name) {
    return {
      data: null,
      error: "Name is required",
    };
  }
  // INSERT TO GROUP TABLE
  const { data: group, error: errorGroup } = await supabase
    .from("group")
    .insert({ name: name, invite_code: null })
    .select("id")
    .single();

  if (errorGroup) {
    return {
      data: null,
      error: errorGroup.message,
    };
  }
  // INSERT IN MANY TO MANY TABLE
  const { data: group_profile, error: errorGroupProfil } = await supabase
    .from("group_profile")
    .insert({ profile_id: user.id, group_id: group.id })
    .select("group(*, members:group_profile(profile(*)))")
    .single();
  if (errorGroupProfil) {
    return {
      data: null,
      error: errorGroupProfil.message,
    };
  }

  return {
    data: group_profile.group,
    error: null,
  };
};

export const getGroup = async ({ group_id }: { group_id: string }) => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  //select the single group and its members

  const parsedGroupId = parseInt(group_id);
  const { data: group, error } = await supabase
    .from("group")
    .select("*, members:group_profile(profile(*))")
    .eq("id", parsedGroupId)
    .single();
  if (error) {
    throw new Error(
      error?.message || "Erreur lors de la récupération du groupe",
    );
  }
  return group;
};

export const updateGroupName = async ({
  group_id,
  name,
}: {
  group_id: number;
  name: string;
}) => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  if (!group_id || !name) {
    throw new Error("Id et nom requis");
  }
  // UPDATE GROUP TABLE
  const { error: errorGroup } = await supabase
    .from("group")
    .update({ name: name })
    .eq("id", group_id)
    .select("name")
    .single();
  if (errorGroup) {
    throw new Error(errorGroup.message);
  }
};

// export const deleteGroup = async ({ group_id }: { group_id: number }) => {
//   const { user } = (await supabase.auth.getUser()).data;
//   if (!user) {
//     return {
//       error: "User not found",
//     };
//   }
//   if (!group_id) {
//     return {
//       error: "Id is required",
//     };
//   }
//   // DELETE FROM GROUP TABLE
//   const { error: errorGroup } = await supabase
//     .from("group")
//     .delete()
//     .eq("id", group_id);
//   if (errorGroup) {
//     return {
//       error: errorGroup.message,
//     };
//   }
//   return {
//     error: null,
//   };
// };

export const leaveGroup = async ({ group_id }: { group_id: string }) => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  if (!group_id) {
    throw new Error("Id requis");
  }
  // DELETE FROM MANY TO MANY TABLE
  const parsedGroupId = parseInt(group_id);

  const { error: errorGroupProfil } = await supabase
    .from("group_profile")
    .delete()
    .eq("profile_id", user.id)
    .eq("group_id", parsedGroupId)
    .select("group(*, members:group_profile(profile(*)))");

  if (errorGroupProfil) {
    throw new Error(
      errorGroupProfil?.message || "Erreur lors de la suppression",
    );
  }
};

export async function getGroupRanking({ group_id }: { group_id: number }) {
  const { data, error } = await supabase.rpc("get_group_ranking", {
    group_id_param: group_id,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateDbGroupImg(group_id: number, file_url: string) {
  const { user } = (await supabase.auth.getUser()).data;

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  const response = await fetch(file_url);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  // UPLOAD NEW GROUP IMG
  const { data, error } = await supabase.storage
    .from("groups")
    .upload(`${group_id}`, arrayBuffer, {
      upsert: true,
      contentType: "image/png",
    });

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("No data");
  }

  const { data: group_img_url } = await supabase.storage
    .from("groups")
    .getPublicUrl(`${group_id}?${new Date().getTime()}`);

  const { error: updateError } = await supabase
    .from("group")
    .update({
      img_url: group_img_url.publicUrl,
    })
    .eq("id", group_id);

  if (updateError) {
    throw updateError;
  }

  return group_img_url;
}
