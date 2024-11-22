import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { SafeAreaView } from "react-native-safe-area-context";
const Home = () => {
  return (
    <SafeAreaView className="items-center justify-center flex-1">
      <Text className="text-3xl text-red-700">Home</Text>
      <Link href="/sign-in" asChild>
      <Pressable>
        <Text>Sign in</Text>
      </Pressable>
    </Link>
    <Link href='/sign-in' className="text-blue-700">GSign in</Link>
      <Link href="/camera" className="text-blue-700">Go to Camera</Link>
      <Link href={{
          pathname: '/group/[id]',
          params: { id: '1' },
        }} className="text-blue-700">Go to Group 1</Link>
      <Link href={{
          pathname: '/group/[id]',
          params: { id: '2' },
        }} className="text-blue-700">Go to Group 2</Link>
    </SafeAreaView>
  )
}

export default Home