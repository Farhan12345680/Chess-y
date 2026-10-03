import { Link } from "expo-router";
import { Pressable, Text, View, StyleSheet } from "react-native";
import ProfileComponent from "./profile.jsx";
import { useContext } from "react";
import { applicationContext, userDataContext, leaderBoardContext } from "../context/contexts.jsx";

export default function Navbar() {
    const { applicationState, changeApplicationState } = useContext(applicationContext);
    const {userState} =useContext(userDataContext);


    return (
        <View style={[styles.container, applicationState.applicationStyleMode === "black" && darkStyles.container]}>
            <Text style={[styles.logo, applicationState.applicationStyleMode === "black" && darkStyles.logo]}>
                Chess-y
            </Text>

            <View
                style={[
                    styles.buttonContainer,
                    applicationState.applicationStyleMode === "black" && darkStyles.buttonContainer
                ]}
            >
                <Link href="/" asChild>
                    <Pressable
                        style={StyleSheet.flatten([
                            styles.button,
                            applicationState.applicationStyleMode === "black" && darkStyles.button
                        ])}
                    >
                        <Text
                            style={[
                                styles.buttonText,
                                applicationState.applicationStyleMode === "black" && darkStyles.buttonText
                            ]}
                        >
                            Home
                        </Text>
                    </Pressable>
                </Link>
                {userState.isLoggedIN === true ? (                <Link href="/game" asChild>
                    <Pressable
                        style={StyleSheet.flatten([
                            styles.button,
                            applicationState.applicationStyleMode === "black" && darkStyles.button
                        ])}
                    >
                        <Text
                            style={[
                                styles.buttonText,
                                applicationState.applicationStyleMode === "black" && darkStyles.buttonText
                            ]}
                        >
                            Game
                        </Text>
                    </Pressable>
                </Link>):(<></>) }


                <Link href="/about" asChild>
                    <Pressable
                        style={StyleSheet.flatten([
                            styles.button,
                            applicationState.applicationStyleMode === "black" && darkStyles.button
                        ])}
                    >   
                        <Text
                            style={[
                                styles.buttonText,
                                applicationState.applicationStyleMode === "black" && darkStyles.buttonText
                            ]}
                        >
                            About
                        </Text>
                    </Pressable>
                </Link>
            </View>
                            
            <View style={styles.buttonContainer}>
                <Pressable
                    style={StyleSheet.flatten([
                        styles.button,
                        applicationState.applicationStyleMode === "black"
                            ? styles.button
                            : darkStyles.button
                    ])}
                    onPress={() => {
                        changeApplicationState({
                            ...applicationState,
                            applicationStyleMode:
                                applicationState.applicationStyleMode === "black"
                                    ? "light"
                                    : "black"
                        })
                    }}
                >
                    <Text
                        style={[
                            styles.buttonText,
                            applicationState.applicationStyleMode === "black"
                                ? styles.buttonText
                                : darkStyles.buttonText
                        ]}
                    >
                        {applicationState.applicationStyleMode === "black" ? "🌙" : "🌞"}
                    </Text>
                </Pressable>
            <ProfileComponent />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding:10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 5,
        backgroundColor: "#006A4E",
        width: "100%",
        borderColor: "#dddddd"
    },

    logo: {
        color: "#fbfbfb",
        fontSize: 24,
        fontWeight: "bold",
        flexGrow: 2
    },

    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 15,
        flexGrow: 3
    },

    button: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        minWidth: 80,
        alignItems: "center",
        borderRadius: 6
    },

    buttonText: {
        color: "#fffefe",
        fontSize: 16,
        fontWeight: "500"
    }
});

const darkStyles = StyleSheet.create({
    container: {
        padding:10,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 5,
        backgroundColor: "#006A4E",
        width: "100%",
        borderColor: "#333333"
    },

    logo: {
        color: "#ffffff",
        fontSize: 24,
        fontWeight: "bold",
        flexGrow: 2
    },

    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 15,
        flexGrow: 3
    },

    button: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        minWidth: 80,
        alignItems: "center",
        borderRadius: 6
    },

    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "500"
    }
});
