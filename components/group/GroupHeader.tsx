import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Link, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native';

interface GroupHeaderProps {
    id: string
}

export default function GroupHeader ({ id }: GroupHeaderProps) {
    const router = useRouter();

  return (
    // make a horizontal view with justify-between, ChrevronLeft, Text, and another View
    <View className="flex-row justify-between items-center p-4 bg-[#f1d7f3]">
        <Pressable onPress={() => router.back()}>
            <ChevronLeft  />
        </Pressable>
        <Text style={{ fontFamily: 'Champ' }} className="text-2xl">Group {id}</Text>
        <Text className="">Status</Text>
    </View>
  )
}

