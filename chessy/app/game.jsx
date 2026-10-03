import { ScrollView, View, Text, StyleSheet, Linking } from "react-native";
import PlayButton from "./component/playButton";
import Navbar from "./component/navbar";
import { useContext } from "react";
import { applicationContext } from "./context/contexts.jsx";
import { useRouter, Link } from "expo-router";

export default function GameMenu() {

    const { applicationState } = useContext(applicationContext);
    const router = useRouter();

    const isDarkMode = applicationState.applicationStyleMode === "black";

    return (
        <View style={[
            styles.container,
            isDarkMode && darkStyles.container
        ]}>
            <Navbar />

            <ScrollView contentContainerStyle={[
                styles.content,
                isDarkMode && darkStyles.content
            ]}>

                <Text style={[
                    styles.title,
                    isDarkMode && darkStyles.title
                ]}>
                    Play Rapid
                </Text>

                <View style={styles.grid}>
                    <PlayButton
                        gameType={"10+0"}
                        onPressFunction={() => {router.push("/playerVsplayer?time=10+0")}}
                        style={styles.gameButton}
                    />
                    <PlayButton
                        gameType={"10+5"}
                        onPressFunction={() => {router.push("/playerVsplayer?time=10+5")}}
                        style={styles.gameButton}
                    />
                    <PlayButton
                        gameType={"15+0"}
                        onPressFunction={() => {router.push("/playerVsplayer?time=15+0")}}
                        style={styles.gameButton}
                    />
                </View>

                <Text style={[
                    styles.title,
                    isDarkMode && darkStyles.title
                ]}>
                    Play Blitz
                </Text>

                <View style={styles.grid}>
                    <PlayButton
                        gameType={"5+0"}
                        onPressFunction={() => {router.push("/playerVsplayer?time=5+0")}}
                        style={styles.gameButton}
                    />
                    <PlayButton
                        gameType={"5+3"}
                        onPressFunction={() => {router.push("/playerVsplayer?time=5+3")}}
                        style={styles.gameButton}
                    />
                    <PlayButton
                        gameType={"3+0"}
                        onPressFunction={() => {router.push("/playerVsplayer?time=3+0")}}
                        style={styles.gameButton}
                    />
                </View>

                <Text style={[
                    styles.title,
                    isDarkMode && darkStyles.title
                ]}>
                    Play Bullet
                </Text>

                <View style={styles.grid}>
                    <PlayButton
                        gameType={"1+0"}
                        onPressFunction={() => {router.push("/playerVsplayer?time=1+0")}}
                        style={styles.gameButton}
                    />
                    <PlayButton
                        gameType={"1+1"}
                        onPressFunction={() => {router.push("/playerVsplayer?time=1+1")}}
                        style={styles.gameButton}
                    />
                    <PlayButton
                        gameType={"1+3"}
                        onPressFunction={() => {router.push("/playerVsplayer?time=1+3")}}
                        style={styles.gameButton}
                    />
                </View>

                <Text style={[
                    styles.title,
                    isDarkMode && darkStyles.title
                ]}>
                    Play "SWAMP"
                </Text>

                <View style={styles.grid}>
                    <PlayButton
                        gameType={"Swamp 400"}
                        onPressFunction={() => {Linking.openURL("https://farhan12345680.github.io/Swamp-Chess-Engine/play_swamp0.html")}}
                        style={styles.gameButton}
                    />
                    <PlayButton
                        gameType={"Swamp 1100"}
                        onPressFunction={() => {Linking.openURL("https://farhan12345680.github.io/Swamp-Chess-Engine/play_swamp1.html")}}
                        style={styles.gameButton}
                    />
                </View>

                <View style={styles.grid}>
                    <PlayButton
                        gameType={"Swamp 1400"}
                        onPressFunction={() => {Linking.openURL("https://farhan12345680.github.io/Swamp-Chess-Engine/play_swamp2.html")}}
                        style={styles.gameButton}
                    />

                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#ffffff"
    },

    content: {
        alignItems: "center",
        padding: 30,
        gap: 25,
        backgroundColor: "#ffffff"
    },

    title: {
        width: "100%",
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 5,
        letterSpacing: 0.5,
        color: "#111111"
    },

    grid: {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: 15
    },

    gameButton: {
        height: 50,
        backgroundColor: "#006A4E",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    }
});

const darkStyles = StyleSheet.create({

    container: {
        backgroundColor: "#111111"
    },

    content: {
        backgroundColor: "#111111"
    },

    title: {
        color: "#ffffff"
    }
});