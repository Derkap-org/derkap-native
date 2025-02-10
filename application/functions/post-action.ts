import { supabase } from "@/lib/supabase";
import { decryptPhoto } from "./encryption-action";
import { getEncryptionKey } from "./encryption-action";

const getPostPath = ({
  challenge_id,
  group_id,
  user_id,
}: {
  challenge_id: number;
  group_id: number;
  user_id: string;
}) => {
  return `group_${group_id}/challenge_${challenge_id}/user_${user_id}`;
};

export const uploadPostToDB = async ({
  group_id,
  challenge_id,
  encrypted_post,
  caption,
}: {
  group_id: number;
  challenge_id: number;
  encrypted_post: Buffer;
  caption: string;
}) => {
  const user = await supabase.auth.getUser();
  const user_id = user.data.user?.id;
  if (!user || !user_id) {
    throw new Error("Not authorized");
  }

  const filePath = getPostPath({
    challenge_id,
    group_id,
    user_id,
  });

  const bucketName = process.env.EXPO_PUBLIC_ENCRYPTED_POSTS_BUCKET_NAME;

  const { error: errorUpload } = await supabase.storage
    .from(bucketName)
    .upload(filePath, encrypted_post, {
      upsert: true,
    });

  if (errorUpload) {
    throw new Error(errorUpload.message);
  }

  // add post to db
  const { error: errorCreate } = await supabase.from("post").upsert(
    {
      challenge_id,
      profile_id: user_id,
      file_path: filePath,
      caption,
    },
    {
      onConflict: "challenge_id, profile_id",
    },
  );

  if (errorCreate) {
    throw new Error(errorCreate.message);
  }
};

export const getPostsFromDB = async ({
  challenge_id,
  group_id,
}: {
  challenge_id: number;
  group_id: number;
}) => {
  const { data, error } = await supabase
    .from("post")
    .select(`*, creator:profile(*)`)
    .eq("challenge_id", challenge_id);

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  // fetch posts from storage
  const posts = await Promise.all(
    data.map(async (post) => {
      const filePath = post.file_path;
      const bucketName = process.env.EXPO_PUBLIC_ENCRYPTED_POSTS_BUCKET_NAME;
      const { data: file, error: errorDownload } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (errorDownload) {
        throw new Error(errorDownload.message);
      }

      return {
        ...post,
        file,
      };
    }),
  );

  // decrypt posts

  const encryptionKey = await getEncryptionKey({
    challenge_id,
    group_id,
  });

  const decryptedPosts = await Promise.all(
    posts.map(async (post) => {
      const decryptedPost = await decryptPhoto({
        encryptedBlob: post.file,
        encryptionKey,
      });
      return {
        ...post,
        base64img: `data:image/jpeg;base64,${decryptedPost}`,
      };
    }),
  );

  return decryptedPosts;
};
