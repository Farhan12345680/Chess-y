
import { View, ScrollView, Text, Pressable, StyleSheet } from "react-native";
import { useState, useContext } from "react";
import Input from "./component/input";
import { Link, useRouter } from "expo-router";
import {
    AuthContext,
    userDataContext,
    socketMgmtContext,
    applicationContext
} from "./context/contexts";
import Navbar from "./component/navbar";


export default function Signup() {

    const router = useRouter();

    const { login, logout } = useContext(AuthContext);
    const { changeUserState } = useContext(userDataContext);
    const { connectSocket } = useContext(socketMgmtContext);
    const { applicationState } = useContext(applicationContext);

    const isDarkMode = applicationState.applicationStyleMode === "black";

    const [signUPData, changeSignUPData] = useState({
        name: "",
        password: "",
        country: "",
        bearerToken: "",
        signUPState: "",
        newWebSocket: ""
    });

    async function signupUser() {

        if (
            signUPData.name.trim() === "" ||
            signUPData.password === "" ||
            signUPData.country.trim() === ""
        ) {
            changeSignUPData(prev => ({
                ...prev,
                signUPState: "Please fill in all fields"
            }));

            return;
        }

        changeSignUPData(prev => ({
            ...prev,
            signUPState: "loading"
        }));

        try {

            const response = await fetch("http://localhost:3000/signup", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: signUPData.name,
                    password: signUPData.password,
                    country: signUPData.country
                })
            });

            console.log(response);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Signup failed");
            }

            const token = data.sessionId;

            if (!token) {
                throw new Error("No bearer token received from server");
            }

            await login(token);

            changeUserState(prev => ({
                ...prev,
                isLoggedIN: true,
                bearerToken: token,
                userName: signUPData.name,
                userCountry: signUPData.country,
                rapidRating: data.rapidRating || 0,
                blitzRating: data.blitzRating || 0,
                bulletRating: data.bulletRating || 0
            }));

            connectSocket(token);

            changeSignUPData(prev => ({
                ...prev,
                bearerToken: token,
                signUPState: "success"
            }));

        } catch (err) {

            console.error(err);

            changeSignUPData(prev => ({
                ...prev,
                signUPState: err.message || "Signup failed"
            }));
        }
    }

    async function logoutUser() {

        await logout();

        changeUserState({
            isLoggedIN: false,
            bearerToken: "",
            bearerTokenDuration: "",
            userName: "user",
            userCountry: "International",
            userProfilePicture: "https://img.icons8.com/nolan/64/user-default.png",
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
            country: "",
            bearerToken: "",
            signUPState: "",
            newWebSocket: ""
        });
    }

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

                {signUPData.signUPState !== "success" ? (

                    <View style={[
                        styles.card,
                        isDarkMode && darkStyles.card
                    ]}>

                        <Text style={[
                            styles.title,
                            isDarkMode && darkStyles.title
                        ]}>
                            Create Account
                        </Text>

                        <Text style={[
                            styles.subtitle,
                            isDarkMode && darkStyles.subtitle
                        ]}>
                            Sign up to start playing on Chessy
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

                            <Input
                                labelText="Country"
                                value={signUPData.country}
                                changeInputState={(text) => {
                                    changeSignUPData(prev => ({
                                        ...prev,
                                        country: text
                                    }));
                                }}
                            />

                            {signUPData.signUPState !== "" &&
                                signUPData.signUPState !== "loading" && (
                                    <Text style={styles.errorText}>
                                        {signUPData.signUPState}
                                    </Text>
                                )}

                            <Pressable
                                disabled={signUPData.signUPState === "loading"}
                                style={({ pressed }) => [
                                    styles.signupButton,
                                    pressed && styles.signupButtonPressed,
                                    signUPData.signUPState === "loading" &&
                                    styles.loadingButton
                                ]}
                                onPress={signupUser}
                            >
                                <Text style={styles.signupButtonText}>
                                    {signUPData.signUPState === "loading"
                                        ? "Creating Account..."
                                        : "Create Account"}
                                </Text>
                            </Pressable>

                        </View>

                        <View style={styles.loginContainer}>

                            <Text style={[
                                styles.loginText,
                                isDarkMode && darkStyles.loginText
                            ]}>
                                Already have an account?
                            </Text>

                            <Link href="/login" asChild>
                                <Pressable>
                                    <Text style={[
                                        styles.loginLink,
                                        isDarkMode && darkStyles.loginLink
                                    ]}>
                                        Log in
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
                            Account Created
                        </Text>

                        <Text style={[
                            styles.subtitle,
                            isDarkMode && darkStyles.subtitle
                        ]}>
                            Your Chessy account has been created successfully.
                        </Text>

                        <Pressable
                            style={({ pressed }) => [
                                styles.signupButton,
                                pressed && styles.signupButtonPressed
                            ]}
                            onPress={() => router.replace("/profile")}
                        >
                            <Text style={styles.signupButtonText}>
                                Continue
                            </Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.logoutButton,
                                isDarkMode && darkStyles.logoutButton,
                                pressed && styles.signupButtonPressed
                            ]}
                            onPress={logoutUser}
                        >
                            <Text style={[
                                styles.logoutButtonText,
                                isDarkMode && darkStyles.logoutButtonText
                            ]}>
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
        backgroundColor: "#f5f5f5"
    },

    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24
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
        backgroundColor: "#006A4E",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8
    },

    signupButtonPressed: {
        opacity: 0.7
    },

    loadingButton: {
        opacity: 0.6
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

    loginText: {
        color: "#aaaaaa"
    },

    loginLink: {
        color: "#ffffff"
    },

    logoutButton: {
        backgroundColor: "#1a1a1a",
        borderColor: "#444444"
    },

    logoutButtonText: {
        color: "#ff5555"
    }
});
