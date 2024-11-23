import { View, Text, Pressable, ViewProps } from 'react-native'
import React from 'react'
import { Link, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native';
import StatusLabel from './StatusLabel'
interface GroupHeaderProps extends ViewProps {
    group_id: string
}

export default function GroupHeader ({ group_id, ...props }: GroupHeaderProps) {
    const router = useRouter();

  return (
    <View {...props} className="flex-row justify-between items-center p-4 bg-[#f1d7f3] ">
        <Pressable onPress={() => router.back()}>
            <ChevronLeft size={40} color={'black'}  />
        </Pressable>
        {
          //todo: center the text
        }
        <Text className="text-2xl font-champ absolute left-1/2 transform -translate-x-1/2 "
        >Group {group_id}</Text>

        <StatusLabel challengeStatus='posting' />
    </View>
  )
}

