import { cn } from '@/lib/utils'
import { useState } from 'react';
import Capture from '@/components/Capture';
import Button from '@/components/Button';
import { TChallengeDB, TGroupDB, TPostDB } from '@/types/types'

import { View, Text, Image, ViewProps } from 'react-native';
import CarouselMedia from '@/components/group/CarouselMedia';

interface PostNotTakenProps extends ViewProps {
  posts: TPostDB[] | undefined;
  // fetchAllGroupData: () => Promise<void>;
  challenge: TChallengeDB;
}

const PostNotTaken = ({
  className,
  posts,
  challenge,
  // fetchAllGroupData,
  ...props
}: PostNotTakenProps) => {
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  return (
    <View {...props} className={cn('', className)}>
      {isCapturing ? (
        <Capture
          setIsCapturing={setIsCapturing}
          // fetchAllGroupData={fetchAllGroupData}
          // challenge={challenge}
        />
      ) : (
        <View className="w-full flex flex-col items-center gap-2 relative rounded-xl">
          {posts && posts.length > 0 ? (
            <CarouselMedia posts={posts} />
          ) : (
            <View className="aspect-image w-full h-[510px] rounded-xl bg-gray-400"></View>
          )}
          <View className="flex flex-col gap-4">
            <Text className="text-xl font-champ text-center">À toi de jouer !</Text>
            <Button
              text="Capturer mon Derkap"
              className="font-champ"
              onPress={() => setIsCapturing(true)}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default PostNotTaken;
