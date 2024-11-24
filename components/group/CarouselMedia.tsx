import { Dimensions, Image, Text, View, ViewProps } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { TPostDB, UserVote, TVoteDB } from '@/types/types';
import { cn } from '@/lib/utils'
interface CarouselMediaProps extends ViewProps {
    posts:TPostDB[];
    finalizationData? : {  
        setCurrentPostIndex: React.Dispatch<React.SetStateAction<number>>;
        challengeStatus: string;
        userVote: UserVote;
        votes: TVoteDB[];
    }
}

export default function CarouselMedia({posts, finalizationData, className, ...props}:CarouselMediaProps) {
    const width = Dimensions.get('window').width;
    const { setCurrentPostIndex, challengeStatus, userVote, votes} = finalizationData;
    const handleSnapToItem = (index: number) => {
        if (setCurrentPostIndex) {
            setCurrentPostIndex(index);
        }
    };

    const getVoteCount = ({postId}:{ postId: number}) => {
        return votes.filter(vote => vote.post_id === postId).length;
      };
    
      const getPostWithMostVotes = () => {
        const postsWithVotes = posts.map(post => ({
          ...post,
          voteCount: getVoteCount({ postId: post.id}),
        }));
        const highestVotes = Math.max(
          ...postsWithVotes.map(post => post.voteCount),
        );
        return postsWithVotes.find(post => post.voteCount === highestVotes);
      };
    
      const isPostHasMoreVotes = (postId: number) => {
        const postsWithVotesCount = posts.map(post => ({
          ...post,
          votes: getVoteCount({ postId: post.id}),
        }));
        const highestPostVotes = Math.max(
          ...postsWithVotesCount.map(post => post.votes),
        );
        return postsWithVotesCount.find(
          post => post.id === postId && post.votes === highestPostVotes,
        );
      };
    
    
    return (
        <View 
        className={cn(
            'flex flex-row',
            className,
          )}>
            <Carousel
                loop={false}
                style={{width:'100%' , 'borderRadius': '1rem'}}
                // width={width}
                width={width-28}
                height={width * (5/4)}
                autoPlay={false}
                data={posts}
                
                scrollAnimationDuration={400}
                onSnapToItem={(index) => handleSnapToItem(index)}
                renderItem={({item : post, index}) => (
                    <View className='flex-1 rounded-2xl gap-y-2 relative'>
                    <Image
                    src='https://picsum.photos/id/237/200/300'


                    className={cn(
                        'flex-1 rounded-2xl',
                        challengeStatus === 'voting' && 
                          post.id === userVote?.postId &&
                          'border-4 border-green-500',
                          challengeStatus === 'ended' &&
                          isPostHasMoreVotes(post.id) &&
                          'border-4 border-yellow-500',
                      )}
                    />

<View className="flex flex-row w-full justify-between absolute bottom-1 px-4">
                    <Text className="font-champ">@{post.creator?.username}</Text>
                    <Text className="font-champ">{getVoteCount({postId: post.id})} vote(s)</Text>
                  </View>
                    </View>

                       
                )}
            />
        </View>
    );
}
