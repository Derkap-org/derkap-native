import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
export const compressImage = async ({
  uri,
  width = 500,
  compression = 0.8,
}: {
  uri: string;
  width?: number;
  compression?: number;
}) => {
  const compressedPhoto = await manipulateAsync(
    uri,
    [
      {
        resize: {
          width: width,
        },
      },
    ], // Adjust the width as needed
    { compress: compression, format: SaveFormat.JPEG }, // Adjust the compression quality as needed
  );
  return compressedPhoto;
};
