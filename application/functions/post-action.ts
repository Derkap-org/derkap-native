import { supabase } from "@/lib/supabase";
import { decryptPhoto } from "./encryption-action";
import { getEncryptionKey } from "./encryption-action";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TPostDB } from "@/types/types";
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

export const getPosts = async ({
  challenge_id,
  group_id,
  isChallengeEnded,
}: {
  challenge_id: number;
  group_id: number;
  isChallengeEnded: boolean;
}) => {
  if (isChallengeEnded) {
    const key = `posts_${group_id}_${challenge_id}`;
    const cachedPosts = await AsyncStorage.getItem(key);
    if (cachedPosts) {
      return JSON.parse(cachedPosts);
    }
  }

  const postsFromDB = await getPostsFromDB({
    challenge_id,
    group_id,
  });

  if (isChallengeEnded) {
    const key = `posts_${group_id}_${challenge_id}`;
    await AsyncStorage.setItem(key, JSON.stringify(postsFromDB));
  }

  return postsFromDB;
};

const getPostsFromDB = async ({
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

  const posts = await addPhotosToPosts({
    data,
    challenge_id,
    group_id,
  });

  return posts;
};

const addPhotosToPosts = async ({
  data,
  challenge_id,
  group_id,
}: {
  challenge_id: number;
  group_id: number;
  data: Omit<TPostDB, "base64img">[];
}) => {
  const postsWithPhotos: TPostDB[] = [];

  for (const post of data) {
    const filePath = post.file_path;

    const key = `photo_${group_id}_${challenge_id}_${post.profile_id}`;
    const cached_photo = await AsyncStorage.getItem(key);
    if (cached_photo) {
      postsWithPhotos.push({
        ...post,
        base64img: cached_photo,
      });
      continue;
    }

    const bucketName = process.env.EXPO_PUBLIC_ENCRYPTED_POSTS_BUCKET_NAME;
    const { data: file, error: errorDownload } = await supabase.storage
      .from(bucketName)
      .download(filePath);
    if (errorDownload) {
      throw new Error(errorDownload.message);
    }

    const encryptionKey = await getEncryptionKey({
      challenge_id,
      group_id,
    });

    const decryptedPost = await decryptPhoto({
      encryptedBlob: file,
      encryptionKey,
    });

    const photo = `data:image/jpeg;base64,${decryptedPost}`;

    postsWithPhotos.push({
      ...post,
      base64img: photo,
    });

    await AsyncStorage.setItem(key, photo);
  }

  // const posts = await Promise.all(
  //   data.map(async (post) => {
  //     const filePath = post.file_path;
  //     const bucketName = process.env.EXPO_PUBLIC_ENCRYPTED_POSTS_BUCKET_NAME;
  //     const { data: file, error: errorDownload } = await supabase.storage
  //       .from(bucketName)
  //       .download(filePath);

  //     if (errorDownload) {
  //       throw new Error(errorDownload.message);
  //     }

  //     return {
  //       ...post,
  //       file,
  //     };
  //   }),
  // );

  // // decrypt posts

  // const encryptionKey = await getEncryptionKey({
  //   challenge_id,
  //   group_id,
  // });

  // const decryptedPosts = await Promise.all(
  //   posts.map(async (post) => {
  //     const decryptedPost = await decryptPhoto({
  //       encryptedBlob: post.file,
  //       encryptionKey,
  //     });
  //     return {
  //       ...post,
  //       base64img: `data:image/jpeg;base64,${decryptedPost}`,
  //     };
  //   }),
  // );

  // return decryptedPosts;
  return postsWithPhotos;
};
