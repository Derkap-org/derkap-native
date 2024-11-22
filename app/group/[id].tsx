import { Text, Pressable, View } from 'react-native'
import React, {useState} from 'react'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from "react-native-safe-area-context";
import GroupHeader from '../../components/group/GroupHeader';
import ChallengeBox from '../../components/ChallengeBox';
import { TChallengeDB, TGroupDB } from '../../types/types';
export default function Group() {
  const [currentGroup, setCurrentGroup] = useState<TGroupDB>();
  const [currentChallenge, setCurrentChallenge] = useState<TChallengeDB>(null);
    const { id } = useLocalSearchParams() as { id: string };
    const router = useRouter();
  
    return (
      <SafeAreaView className='flex-1'>
        <GroupHeader group_id={id} />
        <View className="flex-1 p-4">
        <ChallengeBox challenge={currentChallenge} />
        </View>
      </SafeAreaView>
    );
  }