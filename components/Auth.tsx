import React, { useState } from "react"
import { Alert, StyleSheet, View, AppState } from "react-native"
import { supabase } from "../lib/supabase"
import { Button, Input } from "@rneui/themed"
import { Link, router } from "expo-router"
import { Pressable } from "react-native"
import { ChevronLeft } from "lucide-react-native"

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
	if (state === "active") {
		supabase.auth.startAutoRefresh()
	} else {
		supabase.auth.stopAutoRefresh()
	}
})

export default function Auth() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [username, setUsername] = useState("")
	const [loading, setLoading] = useState(false)

	async function signInWithEmail() {
		setLoading(true)
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		})

		setLoading(false)
		if (error) Alert.alert(error.message)
		else {
			router.push("/")
		}
	}

	async function signUpWithEmail() {
		setLoading(true)
		const {
			data: { session },
			error,
		} = await supabase.auth.signUp({
			email: email,
			password: password,
			options: { data: { username: username } },
		})

		if (error) Alert.alert(error.message)
		if (!session) Alert.alert("Please check your inbox for email verification!")
		setLoading(false)
	}

	return (
		<View className="px-4 ">
			<View className="mt-20">
				<Input label="Email" leftIcon={{ type: "font-awesome", name: "envelope" }} onChangeText={(text) => setEmail(text)} value={email} placeholder="email@address.com" autoCapitalize={"none"} />
			</View>
			<View className="py-4">
				<Input label="Username" leftIcon={{ type: "font-awesome", name: "user" }} onChangeText={(text) => setUsername(text)} value={username} placeholder="Username" autoCapitalize={"none"} />
			</View>
			<View className="">
				<Input label="Password" leftIcon={{ type: "font-awesome", name: "lock" }} onChangeText={(text) => setPassword(text)} value={password} secureTextEntry={true} placeholder="Password" autoCapitalize={"none"} />
			</View>

			<View className="py-4 mt-20">
				<Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
			</View>
			<View className="py-4">
				<Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
			</View>
		</View>
	)
}
