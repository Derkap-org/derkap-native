import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router';
const Home = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-3xl text-red-700">Home</Text>
      <Link href="/camera" className="text-blue-700">Go to Camera</Link>
    </View>
  )
}

export default Home