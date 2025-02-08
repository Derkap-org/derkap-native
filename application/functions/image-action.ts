import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
export const compressImage = async (uri: string) => {
  const compressedPhoto = await manipulateAsync(
    uri,
    [
      {
        resize: {
          width: 500,
        },
      },
    ], // Adjust the width as needed
    { compress: 0.8, format: SaveFormat.JPEG }, // Adjust the compression quality as needed
  );
  const compressedFileInfo = await FileSystem.getInfoAsync(compressedPhoto.uri);
  const compressedMoSize = (compressedFileInfo as any).size / (1024 * 1024);
  console.log("compressed file size", compressedMoSize);
  return compressedPhoto;
};
