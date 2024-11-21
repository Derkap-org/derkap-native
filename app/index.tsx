import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const Home = () => {
  return (
    <View className="items-center justify-center flex-1">
      <Text className="text-3xl text-red-700">Home</Text>
      <Link href="/sign-in" asChild>
      <Pressable>
        <Text>Sign in</Text>
      </Pressable>
    </Link>
      <Link href="/camera" className="text-blue-700">Go to Camera</Link>
    </View>
  )
}

export default Home