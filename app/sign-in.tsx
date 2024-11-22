import React from 'react'
import { View } from 'react-native'
import Auth from '../component/Auth'
import { SafeAreaView } from "react-native-safe-area-context";
export default function SignIn() {
  return (
    <SafeAreaView className="flex-1">
    <Auth />
    </SafeAreaView>
    
  )
}
