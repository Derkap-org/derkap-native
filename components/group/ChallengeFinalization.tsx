import { cn } from '../../lib/utils';
import Button from '../Button';
// import CarouselComponent from '@/components/CarousselComponent';
// import { CarouselApi, CarouselItem } from '@/components/ui/carousel';
import CarouselMedia from './CarouselMedia'
import { TPostDB, TVoteDB, TChallengeDB, UserVote } from '../../types/types';
import { useState, useEffect } from 'react';
import {Image, View, Text, ViewProps, Pressable} from 'react-native';
// import { addVote, getVotes } from '@/functions/vote-action';
// import { useUser } from '@/contexts/user-context';
// import DrawerComponent from '@/components/DrawerComponent';
// import { setChallengeToEnd } from '@/functions/challenge-action';

interface ChallengeFinalizationProps extends ViewProps{
  posts: TPostDB[];
  // fetchAllGroupData: () => Promise<void>;
  challenge: TChallengeDB;
  setIsCreateChallengeOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChallengeFinalization = ({
  posts,
  challenge,
  setIsCreateChallengeOpen,
  // fetchAllGroupData,
  className,
  ...props
}: ChallengeFinalizationProps) => {

  const userVotedMocked : UserVote = {
    voted: true,
    postId: 1
  }

  // const { userData } = useUser();
  const [selectedPost, setSelectedPost] = useState<TPostDB | null>(null);
  const [votes, setVotes] = useState<TVoteDB[]>([]);
  const [userVote, setUserVote] = useState<UserVote>(userVotedMocked); // null
  const [isEndVoteOpen, setIsEndVoteOpen] = useState<boolean>(false);

  // const [api, setApi] = useState<CarouselApi>();
  const [currentPost, setCurrentPost] = useState(0);

  const handleVote = async () => {
    // try {
    //   if (!selectedPost) return toast.error('Aucun post sélectionné');
    //   // await addVote({
    //   //   post_id: selectedPost.id,
    //   //   challenge_id: selectedPost.challenge_id,
    //   // });
    //   await addVote({
    //     post_id: selectedPost.id,
    //     challenge_id: selectedPost.challenge_id,
    //   });
    // } catch (error) {
    //   toast.error('Erreur lors du vote');
    // } finally {
    //   await fetchAllGroupData();
    // }
  };


  const handleEndVote = async () => {
    // try {
    //   if (!challenge) return toast.error('Challenge inconnu');
    //   await setChallengeToEnd({ challenge_id: challenge.id });
    // } catch (error) {
    //   toast.error('Erreur lors du passage aux votes');
    // } finally {
    //   await fetchAllGroupData();
    // }
  };

  // const fetchVotes = async () => {
  //   try {
  //     if (!challenge) return;
  //     const { data, error } = await getVotes({
  //       challenge_id: challenge.id,
  //     });
  //     if (error) {
  //       throw new Error('');
  //     } else {
  //       setVotes(data || []);
  //       const userVote = data?.find(vote => vote.user_id === userData.id);
  //       setUserVote({
  //         voted: !!userVote,
  //         postId: userVote?.post_id,
  //       });
  //     }
  //   } catch (error) {
  //     toast.error('Erreur lors de la récupération des votes');
  //   }
  // };

  // useEffect(() => {
  //   try {
  //     fetchVotes();
  //   } catch (error) {
  //     toast.error('Erreur lors de la récupération des votes');
  //   }
  // }, []);

  // useEffect(() => {
  //   if (challenge?.status === 'ended') {
  //     const highestVotedPost = getPostWithMostVotes();
  //     if (highestVotedPost && api) {
  //       const postIndex = posts.findIndex(
  //         post => post.id === highestVotedPost.id,
  //       );
  //       if (postIndex !== -1) {
  //         setCurrentPost(postIndex + 1);
  //         api.scrollTo(postIndex);
  //       }
  //     }
  //   }
  // }, [challenge, posts, api, votes]);

  // useEffect(() => {
  //   if (!api) {
  //     return;
  //   }
  //   setCurrentPost(api.selectedScrollSnap() + 1);
  //   api.on('select', () => {
  //     setCurrentPost(api.selectedScrollSnap() + 1);
  //   });
  // }, [api]);

  useEffect(() => {
    setSelectedPost(posts[currentPost]);
  }, [currentPost]);

  return (
    <View
      {...props}
      className={cn('w-full flex flex-col items-center gap-2 mb-28', className)}
    >
      {/* <DrawerComponent
        trigger={null}
        title="Fermer les votes"
        isOpen={isEndVoteOpen}
        onClose={() => setIsEndVoteOpen(false)}
      >
        <View className="w-full flex flex-col Text-6 gap-12 mb-12">
          <Text className="text-xs">
            En tant que créateur du défi, tu peux décider de clore les votes,
            sans attendre que tous les participants aient voté.
            <br />
            <span className="font-bold">
              Attention, une fois les votes clos, les participants ne pourront
              plus voter et le défi sera terminé.
            </span>
          </Text>
          <Button text="Confirmer" onPress={handleEndVote} />
        </View>
      </DrawerComponent> */}

      {challenge?.status === 'ended' && (
        <Text className="font-champ text-xl">
          Défi terminé ! Check les résultats:
        </Text>
      )}

      {/* <CarouselComponent setApi={setApi}>
        {posts.map((post, index) => (
          <CarouselItem onClick={() => setSelectedPost(post)} key={index}>
            <Image
              className={cn(
                'rounded-xl w-full object-cover max-h-[510px] aspect-image',
                challenge?.status === 'voting' &&
                  post.id === userVote?.postId &&
                  'border-4 border-green-500',
                challenge?.status === 'ended' &&
                  isPostHasMoreVotes(post.id) &&
                  'border-4 border-yellow-500',
              )}
              src={post.img_url}
              alt="post"
              width={300}
              height={300}
            />
            <View className="flex w-full justify-between">
              <Text className="font-champ">@{post.creator?.username}</Text>
              <Text className="font-champ">{getVoteCount(post.id)} vote(s)</Text>
            </View>
          </CarouselItem>
        ))}
      </CarouselComponent> */}

      <CarouselMedia posts={posts} finalizationData={
       { setCurrentPostIndex : setCurrentPost,
        challengeStatus: challenge.status,
        userVote: userVote,
        votes: votes,
        }

      } />

      


      <View className="flex flex-row items-center gap-1">
        {posts.map((post, index) => (
          <View
            key={index}
            className={cn(
              'rounded-full cursor-pointer transition-all duration-300',
              post.id === selectedPost?.id
                ? 'bg-gray-800 w-2 h-2'
                : 'bg-gray-400 w-1 h-1',
            )}
            // onPress={() => {
            //   setCurrentPost(index + 1);
            //   // api?.scrollTo(index);
            // }}
          ></View>
        ))}
      </View>


       {/* {challenge?.creator_id === userData.id && (
              <Button
                className="bg-purple-300 w-full font-champ"
                text="Fermer les votes"
                onPress={() => {
                  setIsEndVoteOpen(true);
                }}
              />
            )} 
             todo : in challenge?.status === 'voting' 
             */} 

      {challenge?.status === 'voting' && (

            <Button
              className="w-full font-champ"
              text={userVote?.voted ? `Changer mon vote pour @${selectedPost?.creator?.username}` : `Voter pour @${selectedPost?.creator?.username}`}
              isCancel={!selectedPost}
              onPress={() => {
                handleVote();
              }}
            />


      )}
      {challenge?.status === 'ended' && (
        <View className="fixed w-full bg-[#f8e9db] bottom-0 right-0">
            <Button
              className="w-full font-champ"
              text="Relancer dès mainteant un défi !"
              onPress={() => setIsCreateChallengeOpen(true)}
            />
        </View>
      )}
    </View>
  );
};

export default ChallengeFinalization;
