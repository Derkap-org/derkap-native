import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import CryptoJS from "crypto-js";
export const getEncryptionKey = async ({
  derkap_id,
}: {
  derkap_id: number;
}) => {
  const key = `encryption_key_${derkap_id}`;
  const encryption_key = await AsyncStorage.getItem(key);
  if (encryption_key) {
    return encryption_key;
  }

  // fetch encryption key from server

  const user = await supabase.auth.getUser();
  const user_id = user.data.user?.id;
  if (!user || !user_id) {
    throw new Error("Not authorized");
  }

  const session = await supabase.auth.getSession();
  const access_token = session?.data?.session?.access_token;
  const refresh_token = session?.data?.session?.refresh_token;

  if (!access_token || !refresh_token) {
    throw new Error("Not authorized");
  }

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/api/get-key`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
        refresh_token: refresh_token,
      },
      body: JSON.stringify({
        derkap_id: derkap_id,
      }),
    },
  );
  const data = await response.json();
  if (!data.success) {
    throw new Error(data?.message || "Error fetching key");
  }

  await AsyncStorage.setItem(key, data.key);
  return data.key;
};

export const encryptPhoto = async ({
  capturedPhoto,
  encryptionKey,
}: {
  capturedPhoto: string;
  encryptionKey: string;
}) => {
  // Read the photo file as a base64 string

  const base64Img = await fetch(capturedPhoto).then((res) => res.blob());
  const formData = new FormData();
  formData.append("file", base64Img);

  const base64Photo = await FileSystem.readAsStringAsync(capturedPhoto, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Encrypt the base64 string using the encryption key
  const encryptedPhoto = CryptoJS.AES.encrypt(
    base64Photo,
    encryptionKey,
  ).toString();

  // Convert the encrypted string to a string byte array
  const encryptedPhotoBuffer = Buffer.from(encryptedPhoto, "base64");
  return encryptedPhotoBuffer;
};

export const decryptPhoto = async ({
  encryptedBlob,
  encryptionKey,
}: {
  encryptedBlob: Blob;
  encryptionKey: string;
}) => {
  const encryptedPhoto = await blobToBuffer(encryptedBlob);
  // Decrypt the encrypted photo using the encryption key
  const decryptedPhoto = CryptoJS.AES.decrypt(
    encryptedPhoto.toString("base64"),
    encryptionKey,
  ).toString(CryptoJS.enc.Utf8);
  return decryptedPhoto;
};

const blobToBuffer = (blob: Blob): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.readyState === FileReader.DONE) {
        const arrayBuffer = reader.result as ArrayBuffer;
        const buffer = Buffer.from(arrayBuffer);
        resolve(buffer);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

export const generateKeys = async ({
  challenge,
}: {
  challenge: string;
}): Promise<{ encryption_key: string; derkap_base_key: string }> => {
  // ask server to generate encryption key

  const user = await supabase.auth.getUser();
  const user_id = user.data.user?.id;
  if (!user || !user_id) {
    throw new Error("Not authorized");
  }

  const session = await supabase.auth.getSession();
  const access_token = session?.data?.session?.access_token;
  const refresh_token = session?.data?.session?.refresh_token;

  if (!access_token || !refresh_token) {
    throw new Error("Not authorized");
  }
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/api/generate-key`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
        refresh_token: refresh_token,
      },
      body: JSON.stringify({ challenge }),
    },
  );
  const data = await response.json();
  if (!data.success) {
    throw new Error(data?.message || "Error generating key");
  }
  return {
    encryption_key: data.key,
    derkap_base_key: data.base_key,
  };
};
