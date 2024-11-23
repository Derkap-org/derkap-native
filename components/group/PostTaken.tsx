import { cn } from '../../lib/utils'
import { TPostDB, TGroupDB, TChallengeDB } from '../../types/types';
// import { useUser } from '@/contexts/user-context';
// import Button from '../Button';
// import DrawerComponent from '@/components/DrawerComponent';
import { useState } from 'react';
// import { setChallengeToVoting } from '@/functions/challenge-action';
// import { toast } from 'sonner';
// import CarouselComponent from '../CarousselComponent';
// import { CarouselItem } from '../ui/carousel';
import Image,  { View, Text, StyleSheet } from 'react-native';
import Button from '../Button';
// import { Separator } from '@radix-ui/react-separator';
import CarouselMedia from './CarouselMedia'
import { BlurView } from 'expo-blur';

interface PostTakenProps {
  posts: TPostDB[] | undefined;
  group: TGroupDB | undefined;
  challenge: TChallengeDB;
  // fetchAllGroupData: () => Promise<void>;
  className?:string
}

const PostTaken = ({
  className,
  posts,
  challenge,
  group,
  // fetchAllGroupData,
  ...props
}: PostTakenProps) => {
  // const { userData: currentUserData } = useUser();
  const [isGoVoteOpen, setIsGoVoteOpen] = useState<boolean>(false);

  const handleGoVote = async () => {
    // try {
    //   if (!challenge) return toast.error('Challenge inconnu');
    //   await setChallengeToVoting({ challenge_id: challenge.id });
    // } catch (error) {
    //   toast.error('Erreur lors du passage aux votes');
    // } finally {
    //   await fetchAllGroupData();
    // }
  };

  const getWhoNotPost = () => {
    if (!group || !posts) return [];
    const groupMembers = group.members;
    const postsProfiles = posts.map(post => post.profile_id);
    return groupMembers.filter(
      member => !postsProfiles.includes(member.profile?.id ?? ''),
    );
  };

  return (
    <View className="w-full flex flex-col gap-4 rounded-2xl">
      <View
        {...props}
        className={cn(
          ' w-full rounded-2xl flex items-center justify-center flex-col text-white gap-y-4',
          className,
        )}
      >
        {/* <DrawerComponent
          trigger={null}
          title="Passer aux votes"
          isOpen={isGoVoteOpen}
          onClose={() => setIsGoVoteOpen(false)}
        >
          <View className="w-full flex flex-col p-6 gap-12 mb-12">
            <View className="flex flex-col gap-4">
              <p className="text-xs">
                En tant que créateur du défi, tu peux décider de passer aux
                votes, sans attendre que tous les participants aient posté leur
                Derkap.
              </p>
              <p className="text-xs font-bold">
                Attention, une fois les votes lancés, les participants ne
                pourront plus poster leur Derkap.
              </p>
            </View>
            <Button text="Confirmer" onPress={handleGoVote} />
          </View>
        </DrawerComponent> */}

        <View className="w-full relative rounded-2xl">
          {/* <CarouselComponent>
            {posts?.map((post, index) => (
              <CarouselItem key={index}>
                <Image
                  src={post.img_url}
                  alt="post"
                  width={300}
                  height={300}
                  className="blur-2xl w-full object-cover aspect-image rounded-xl"
                />
              </CarouselItem>
            ))}
          </CarouselComponent> */}
          <CarouselMedia posts={posts} />
          <View className="absolute flex flex-col w-full h-full gap-4 font-champ rounded-2xl overflow-hidden">
          <BlurView intensity={80} tint="light" className='flex flex-col w-full h-full items-center justify-center text-center' >
            <Text className="text-xl w-fit">
              En attente de tous les participants !
            </Text>
            <Text className="text-4xl w-fit">
              {posts?.length} / {group?.members?.length}
            </Text>
          </BlurView>
          </View>
        </View>
      </View>

      <View className="w-full flex flex-col gap-4">
        <Text className="text-xl font-champ">Toujours en retard...</Text>
        <View className="w-full flex flex-col gap-2">
          {getWhoNotPost().map((member, index) => (
            <Text
              key={index}
              className=""
              // href={`/profile/${member?.profile?.username}`}
            >
              @{member.profile?.username}
            </Text>
          ))}
        </View>
      </View>

      {/* {challenge?.creator_id === currentUserData.id && ( 
      <Button
              text="Passer aux votes"
              className="w-full font-champ"
              onPress={() => {
                setIsGoVoteOpen(true);
              }}
              
            />
       )} */}

    </View>
  );
};

export default PostTaken;


// const styles = StyleSheet.create({
//   blurView: {
//     borderRadius: 20,
//   },
// });