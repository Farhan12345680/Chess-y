
import { View, ScrollView, Text, Pressable, StyleSheet } from "react-native";
import { useState, useContext } from "react";
import Input from "./component/input";
import { Link, router } from "expo-router";
import Navbar from "./component/navbar";
import {
    AuthContext,
    userDataContext,
    socketMgmtContext,
    applicationContext
} from "./context/contexts.jsx";

export default function Login() {

    const { login, logout } = useContext(AuthContext);
    const { userState, changeUserState } = useContext(userDataContext);
    const { connectSocket } = useContext(socketMgmtContext);
    const { applicationState } = useContext(applicationContext);

    const isDarkMode = applicationState.applicationStyleMode === "black";

    const [signUPData, changeSignUPData] = useState({
        name: "",
        password: "",
        bearerToken: "",
        signUPState: "",
        newWebSocket: "",
        error: ""
    });

    async function loginUser() {

        if (
            signUPData.name.trim() === "" ||
            signUPData.password === ""
        ) {
            changeSignUPData(prev => ({
                ...prev,
                error: "Enter your name and password."
            }));

            return;
        }

        changeSignUPData(prev => ({
            ...prev,
            signUPState: "load",
            error: ""
        }));

        try {

            const response = await fetch("http://localhost:3000/login", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    name: signUPData.name.trim(),
                    password: signUPData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Invalid name or password."
                );
            }

            if (data.type !== "loggedIn" || !data.user) {
                throw new Error("Invalid response from server.");
            }

            const user = data.user;

            if (!user.user_id) {
                throw new Error("User ID was not received from server.");
            }

            if (!user.sessionId) {
                throw new Error("Session ID was not received from server.");
            }


            const sessionId = user.sessionId;

            await login(JSON.stringify({
                token: sessionId,
                userName: user.name,
                userCountry: user.country || "International",
                userID: user.user_id,
                userProfilePicture:user.image_url
            }));

            changeUserState(prev => ({
                ...prev,

                userID: user.user_id,

                isLoggedIN: true,

                bearerToken: sessionId,

                userName: user.name,

                userCountry: user.country || "International",

                userProfilePicture:
                    user.image_url ||
                    "https://img.icons8.com/nolan/64/user-default.png",

                rapidRating: prev.rapidRating,

                blitzRating: prev.blitzRating,

                bulletRating: prev.bulletRating
            }));

            connectSocket(sessionId);

            changeSignUPData(prev => ({
                ...prev,

                bearerToken: sessionId,

                signUPState: "finish",

                error: ""
            }));

        } catch (error) {

            console.log("Login error ->", error);

            changeSignUPData(prev => ({
                ...prev,

                signUPState: "",

                error:
                    error.message ||
                    "Unable to connect to the server."
            }));
        }
    }

    async function logoutUser() {

        await logout();

        changeUserState({
            userID: null,
            isLoggedIN: false,
            bearerToken: "",
            bearerTokenDuration: "",
            userName: "user",
            userCountry: "International",
            userProfilePicture:
                "https://img.icons8.com/nolan/64/user-default.png",
            rapidRating: 0,
            blitzRating: 0,
            bulletRating: 0,
            userCurrentState: "idle",
            webSocketConnection: "",
            rapidRatingHistory: [],
            bulletRatingHistory: [],
            blitzRatingHistory: []
        });

        changeSignUPData({
            name: "",
            password: "",
            bearerToken: "",
            signUPState: "",
            newWebSocket: "",
            error: ""
        });
    }

    const showSuccess =
        userState?.isLoggedIN === true ||
        signUPData.signUPState === "finish";

    return (
        <View style={[
            styles.screen,
            isDarkMode && darkStyles.screen
        ]}>

            <Navbar />

            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    isDarkMode && darkStyles.container
                ]}
                keyboardShouldPersistTaps="handled"
            >

                {!showSuccess ? (

                    <View style={[
                        styles.card,
                        isDarkMode && darkStyles.card
                    ]}>

                        <Text style={[
                            styles.title,
                            isDarkMode && darkStyles.title
                        ]}>
                            Welcome Back
                        </Text>

                        <Text style={[
                            styles.subtitle,
                            isDarkMode && darkStyles.subtitle
                        ]}>
                            Log in to continue playing on Chess-y
                        </Text>

                        <View style={styles.form}>

                            <Input
                                labelText="Name"
                                value={signUPData.name}
                                autoCapitalize="none"
                                changeInputState={(text) => {
                                    changeSignUPData(prev => ({
                                        ...prev,
                                        name: text
                                    }));
                                }}
                            />

                            <Input
                                labelText="Password"
                                value={signUPData.password}
                                secureTextEntry
                                changeInputState={(text) => {
                                    changeSignUPData(prev => ({
                                        ...prev,
                                        password: text
                                    }));
                                }}
                            />

                            {signUPData.error !== "" && (
                                <Text style={styles.errorText}>
                                    {signUPData.error}
                                </Text>
                            )}

                            <Pressable
                                disabled={signUPData.signUPState === "load"}
                                style={({ pressed }) => [
                                    styles.loginButton,
                                    isDarkMode && darkStyles.loginButton,
                                    pressed && styles.loginButtonPressed,
                                    signUPData.signUPState === "load" &&
                                    styles.loadingButton
                                ]}
                                onPress={loginUser}
                            >
                                <Text style={styles.loginButtonText}>
                                    {signUPData.signUPState === "load"
                                        ? "Logging in..."
                                        : "Log In"}
                                </Text>
                            </Pressable>

                        </View>

                        <View style={styles.signupContainer}>

                            <Text style={[
                                styles.signupText,
                                isDarkMode && darkStyles.signupText
                            ]}>
                                Don't have an account?
                            </Text>

                            <Link href="/signup" asChild>
                                <Pressable>
                                    <Text style={[
                                        styles.signupLink,
                                        isDarkMode && darkStyles.signupLink
                                    ]}>
                                        Sign up
                                    </Text>
                                </Pressable>
                            </Link>

                        </View>

                    </View>

                ) : (

                    <View style={[
                        styles.card,
                        isDarkMode && darkStyles.card
                    ]}>

                        <View style={styles.successIcon}>
                            <Text style={styles.successIconText}>
                                ✓
                            </Text>
                        </View>

                        <Text style={[
                            styles.title,
                            isDarkMode && darkStyles.title
                        ]}>
                            Login Successful
                        </Text>

                        <Text style={[
                            styles.subtitle,
                            isDarkMode && darkStyles.subtitle
                        ]}>
                            Welcome back!
                        </Text>

                        <Pressable
                            style={[
                                styles.loginButton,
                                isDarkMode && darkStyles.loginButton
                            ]}
                            onPress={() => router.replace("/profile")}
                        >
                            <Text style={styles.loginButtonText}>
                                Continue
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.logoutButton,
                                isDarkMode && darkStyles.logoutButton
                            ]}
                            onPress={logoutUser}
                        >
                            <Text style={styles.logoutButtonText}>
                                Log Out
                            </Text>
                        </Pressable>

                    </View>

                )}

            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: "#ffffff"
    },

    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#ffffff"
    },

    card: {
        width: "100%",
        maxWidth: 450,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 28,
        elevation: 4,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowOpacity: 0.1,
        shadowRadius: 8
    },

    title: {
        fontSize: 30,
        fontWeight: "700",
        textAlign: "center",
        color: "#111111",
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

    loginButton: {
        height: 50,
        backgroundColor: "#006A4E",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8
    },

    loginButtonPressed: {
        opacity: 0.7
    },

    loadingButton: {
        opacity: 0.6
    },

    loginButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600"
    },

    signupContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 25,
        gap: 5
    },

    signupText: {
        color: "#777777",
        fontSize: 14
    },

    signupLink: {
        color: "#006A4E",
        fontSize: 14,
        fontWeight: "700"
    },

    errorText: {
        color: "#d82020",
        fontSize: 14,
        textAlign: "center"
    },

    successIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#e8f5df",
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20
    },

    successIconText: {
        color: "#4a9604",
        fontSize: 36,
        fontWeight: "700"
    },

    logoutButton: {
        height: 48,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dddddd",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12
    },

    logoutButtonText: {
        color: "#dd2020",
        fontSize: 15,
        fontWeight: "600"
    }
});

const darkStyles = StyleSheet.create({

    screen: {
        backgroundColor: "#111111"
    },

    container: {
        backgroundColor: "#111111"
    },

    card: {
        backgroundColor: "#1a1a1a"
    },

    title: {
        color: "#ffffff"
    },

    subtitle: {
        color: "#aaaaaa"
    },

    loginButton: {
        backgroundColor: "#006A4E"
    },

    signupText: {
        color: "#aaaaaa"
    },

    signupLink: {
        color: "#ffffff"
    },

    logoutButton: {
        backgroundColor: "#1a1a1a",
        borderColor: "#444444"
    }
});
