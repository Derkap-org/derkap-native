import { TChallengeDB } from '../types/types';
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '../lib/utils';

interface ChallengeBoxProps {
    challenge?: TChallengeDB;
    className?: string;
  }

export default function ChallengeBox ({
    challenge,
    className,
    ...props
  }: ChallengeBoxProps) {
    return (
    <View className={cn('w-full', className)} > 
        <View className="min-h-16 bg-red max-h-fit flex flex-row w-full px-4 bg-custom-white border border-custom-black rounded-xl py-2 text-custom-black shadow-element gap-x-2">
            <Text className="text-5xl text-center pt-1 flex flex-row items-center justify-center">{challenge ? '😹' : '🥱'}</Text>
          <View className="flex-1 flex flex-col items-center justify-center gap-y-1 ">
            <Text className="text-sm font-champ text-custom-black line-clamp-2">
              {challenge ? challenge.description : 'Pas de défi...'}
            </Text>
            <View className="flex items-center gap-1">
              <Text className="text-sm line-clamp-1">
                {challenge
                  ? 'Par ' + challenge.creator?.username
                  : 'Créez en un dès maintenant !'}
              </Text>
            </View>
          </View>
        </View>
    </View>
    )
}