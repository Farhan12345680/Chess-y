import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    ScrollView,
    Pressable,
    Text,
    View,
    Image,
    StyleSheet,
    useWindowDimensions,
    Linking
} from "react-native";

import { router } from "expo-router";

import Navbar from "./component/navbar";

import {
    socketMgmtContext,
    userDataContext,
    applicationContext,
} from "./context/contexts";

import { useContext, useEffect, useState } from "react";

export default function Index() {

    const { socket } = useContext(socketMgmtContext);
    const { userState } = useContext(userDataContext);
    const { applicationState } = useContext(applicationContext);

    const { width, height } = useWindowDimensions();

    const scale = Math.min(width / 400, height / 800);

    const [userStats, changeUserStats] = useState({
        bullet: {
            games: 0,
            winRatio: 0,
        },
        blitz: {
            games: 0,
            winRatio: 0,
        },
        rapid: {
            games: 0,
            winRatio: 0,
        },
    });

    useEffect(() => {

        

        async function fetchUserStats() {


            if (!userState.userID) {

                console.log("Early return happened");

                return;
            }

            try {

                const response = await fetch(
                    "https://chess-y.onrender.com:3000/userStat",
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

                const data = await response.json();
                if (!response.ok) {
                    console.log("Failed to get user stats:", data);
                    return;
                }

                changeUserStats(data);

            } catch (error) {
                console.log(error);
            }
        }

        fetchUserStats();

    }, [userState]);


    function ifSocketOpenThenReturnPlayOnlineButton() {

        if (!socket) {

            return (
                <Pressable
                    style={[
                        styles.button,
                        {
                            paddingVertical: 15 * scale,
                        }
                    ]}
                    onPress={() => {
                        router.push("/game");
                    }}
                >
                    <Text
                        style={[
                            styles.buttonText,
                            {
                                fontSize: 18 * scale,
                            }
                        ]}
                    >
                        Play online games against others
                    </Text>
                </Pressable>
            );
        }

        return <></>;
    }


    function userCardButton() {

        return (
            <View style={styles.userCard}>

                <Image
                    source={{
                        uri: userState?.userProfilePicture
                    }}
                    style={{
                        width: 70 * scale,
                        height: 70 * scale,
                        borderRadius: 35 * scale,
                    }}
                />

                <View style={styles.userInfo}>

                    <Text
                        style={[
                            styles.userName,
                            {
                                width: 0.7 * width,
                                fontSize: 24 * scale,
                            }
                        ]}
                    >
                        {userState?.userName}
                    </Text>

                    <Text
                        style={[
                            styles.userCountry,
                            {
                                fontSize: 16 * scale,
                            }
                        ]}
                    >
                        {userState?.userCountry}
                    </Text>

                </View>

            </View>
        );
    }


    function userStat() {

        return (
            <View style={styles.statsRow}>

                <View style={[styles.statCard, { width: 0.7 * width }]}>
                    <Text
                        style={[
                            styles.gameType,
                            {
                                fontSize: 17 * scale,
                            }
                        ]}
                    >
                        Bullet
                    </Text>

                    <Text
                        style={[
                            styles.statText,
                            {
                                fontSize: 15 * scale,
                            }
                        ]}
                    >
                        Games: {userStats?.bullet?.games}
                    </Text>

                    <Text
                        style={[
                            styles.statText,
                            {
                                fontSize: 15 * scale,
                            }
                        ]}
                    >
                        Win Ratio: {userStats?.bullet?.winRatio}%
                    </Text>
                </View>

                <View style={styles.statCard}>
                    <Text
                        style={[
                            styles.gameType,
                            {
                                fontSize: 17 * scale,
                            }
                        ]}
                    >
                        Blitz
                    </Text>

                    <Text
                        style={[
                            styles.statText,
                            {
                                fontSize: 15 * scale,
                            }
                        ]}
                    >
                        Games: {userStats?.blitz?.games}
                    </Text>

                    <Text
                        style={[
                            styles.statText,
                            {
                                fontSize: 15 * scale,
                            }
                        ]}
                    >
                        Win Ratio: {userStats?.blitz?.winRatio}%
                    </Text>
                </View>

                <View style={styles.statCard}>
                    <Text
                        style={[
                            styles.gameType,
                            {
                                fontSize: 17 * scale,
                            }
                        ]}
                    >
                        Rapid
                    </Text>

                    <Text
                        style={[
                            styles.statText,
                            {
                                fontSize: 15 * scale,
                            }
                        ]}
                    >
                        Games: {userStats?.rapid?.games}
                    </Text>

                    <Text
                        style={[
                            styles.statText,
                            {
                                fontSize: 15 * scale,
                            }
                        ]}
                    >
                        Win Ratio: {userStats?.rapid?.winRatio}%
                    </Text>
                </View>

            </View>
        );
    }


    return (

        <View style={styles.container}>

            <Navbar />

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        gap: 30 * scale,
                        paddingVertical: 30 * scale
                    }
                ]}
            >

                {userCardButton()}

                {userStat()}

                {ifSocketOpenThenReturnPlayOnlineButton()}

                <Pressable
                    style={[
                        styles.button,
                        {
                            paddingVertical: 15 * scale,
                        }
                    ]}
                    onPress={() =>
                        Linking.openURL(
                            "https://farhan12345680.github.io/Swamp-Chess-Engine/"
                        )
                    }
                >
                    <Text
                        style={[
                            styles.buttonText,
                            {
                                fontSize: 18 * scale,
                            }
                        ]}
                    >
                        Play Swamp Engine
                    </Text>
                </Pressable>

            </ScrollView>

        </View>
    );
}


const styles = StyleSheet.create({

    container: {
        flex: 1,
        alignItems: "center",
    },

    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    userCard: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 15,
        width: "70%",
        padding: 15,
        backgroundColor: "#006A4E"
    },

    userInfo: {
        marginLeft: 15,
    },

    userName: {
        fontWeight: "bold",
        color: "white"
    },

    userCountry: {
        marginTop: 5,
        color: "white"
    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "70%",
        gap: 10,
    },

    statCard: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        padding: 15,
        backgroundColor: "#006A4E",
    },

    gameType: {
        fontWeight: "bold",
        marginBottom: 8,
        color: "white",
    },

    statText: {
        color: "white",
        textAlign: "center",
    },

    button: {
        width: "70%",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#006A4E",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1,
        elevation: 1,
    },

    buttonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        textAlign: "center",
    },

});
