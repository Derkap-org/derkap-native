import { Text, Pressable } from 'react-native'
import React from 'react'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from "react-native-safe-area-context";
import GroupHeader from '../../components/group/GroupHeader';
export default function Groupe() {
    const { id } = useLocalSearchParams() as { id: string };
    const router = useRouter();
  
    return (
      <SafeAreaView className='flex-1'>
        <GroupHeader id={id} />
      </SafeAreaView>
    );
  }