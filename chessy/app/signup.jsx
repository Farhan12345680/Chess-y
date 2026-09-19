import { View, ScrollView, Text, Pressable, StyleSheet } from "react-native"

import { useState } from "react"

import Input from "./component/input"

import { Link } from "expo-router"

export default function Signup() {


const [signUPData, changeSignUPData] = useState({
    name: "",
    password: "",
    country: "",
    bearerToken: "",
    signUPState: "",
    newWebSocket: ""
})

return (
    <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
    >
        <View style={styles.card}>

            <Text style={styles.title}>
                Create Account
            </Text>

            <Text style={styles.subtitle}>
                Sign up to start playing on Chessy
            </Text>

            <View style={styles.form}>

                <Input
                    labelText={"Name"}
                    changeInputState={(Text) => {
                        changeSignUPData({
                            ...signUPData,
                            name: Text
                        })
                    }}
                />

                <Input
                    labelText={"Password"}
                    changeInputState={(Text) => {
                        changeSignUPData({
                            ...signUPData,
                            password: Text
                        })
                    }}
                />

                <Input
                    labelText={"Country"}
                    changeInputState={(Text) => {
                        changeSignUPData({
                            ...signUPData,
                            country: Text
                        })
                    }}
                />

                <Pressable
                    style={({ pressed }) => [
                        styles.signupButton,
                        pressed && styles.signupButtonPressed
                    ]}
                    onPress={async () => {
                        try {
                            const response = await fetch("http://localhost:3000/signup", {
                                method: "POST",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    name: signUPData.name,
                                    password: signUPData.password,
                                    country: signUPData.country
                                })
                            })

                            const data = await response.json()

                            console.log(data)

                        } catch (err) {
                            console.error(err)
                        }
                    }}
                >
                    <Text style={styles.signupButtonText}>
                        Create Account
                    </Text>
                </Pressable>

            </View>

            <View style={styles.loginContainer}>

                <Text style={styles.loginText}>
                    Already have an account?
                </Text>

                <Link href="/login" asChild>
                    <Pressable>
                        <Text style={styles.loginLink}>
                            Log in
                        </Text>
                    </Pressable>
                </Link>

            </View>

        </View>
    </ScrollView>
)


}

const styles = StyleSheet.create({

container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f5f5"
},

card: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 28,
    elevation: 4
},

title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    color: "#222222",
    marginBottom: 8
},

subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#777777",
    marginBottom: 30
},

form: {
    width: "100%",
    gap: 16
},

signupButton: {
    height: 50,
    backgroundColor: "#222222",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8
},

signupButtonPressed: {
    opacity: 0.7
},

signupButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600"
},

loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    gap: 5
},

loginText: {
    color: "#777777",
    fontSize: 14
},

loginLink: {
    color: "#222222",
    fontSize: 14,
    fontWeight: "700"
}


})
