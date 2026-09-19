import { ScrollView, View, Text, StyleSheet } from "react-native";
import PlayButton from "./component/playButton";
import Navbar from "./component/navbar";
import { useContext } from "react";
import { applicationContext } from "./context/contexts.jsx";

export default function GameMenu() {

    const { applicationState } = useContext(applicationContext);

    return (
        <View style={[
            styles.container,
            applicationState.applicationStyleMode === "black" && darkStyles.container
        ]}>
            <Navbar />

            <ScrollView contentContainerStyle={[
                styles.content,
                applicationState.applicationStyleMode === "black" && darkStyles.content
            ]}>

                <Text style={[
                    styles.title,
                    applicationState.applicationStyleMode === "black" && darkStyles.title
                ]}>
                    Play Rapid
                </Text>

                <View style={styles.grid}>
                    <PlayButton gameType={"10+0"} onPressFunction={() => {}} />
                    <PlayButton gameType={"10+5"} onPressFunction={() => {}} />
                    <PlayButton gameType={"15+0"} onPressFunction={() => {}} />
                    <PlayButton gameType={"Custom Rapid"} onPressFunction={() => {}} />
                </View>

                <Text style={[
                    styles.title,
                    applicationState.applicationStyleMode === "black" && darkStyles.title
                ]}>
                    Play Blitz
                </Text>

                <View style={styles.grid}>
                    <PlayButton gameType={"5+0"} onPressFunction={() => {}} />
                    <PlayButton gameType={"5+3"} onPressFunction={() => {}} />
                    <PlayButton gameType={"3+0"} onPressFunction={() => {}} />
                    <PlayButton gameType={"Custom Blitz"} onPressFunction={() => {}} />
                </View>

                <Text style={[
                    styles.title,
                    applicationState.applicationStyleMode === "black" && darkStyles.title
                ]}>
                    Play Bullet
                </Text>

                <View style={styles.grid}>
                    <PlayButton gameType={"1+0"} onPressFunction={() => {}} />
                    <PlayButton gameType={"1+1"} onPressFunction={() => {}} />
                    <PlayButton gameType={"1+3"} onPressFunction={() => {}} />
                    <PlayButton gameType={"Custom Bullet"} onPressFunction={() => {}} />
                </View>

                <Text style={[
                    styles.title,
                    applicationState.applicationStyleMode === "black" && darkStyles.title
                ]}>
                    Play "SWAMP" / Pass & Play
                </Text>

                <View style={styles.grid}>
                    <PlayButton gameType={"Swamp 400"} onPressFunction={() => {}} />
                    <PlayButton gameType={"Swamp 1000"} onPressFunction={() => {}} />
                    <PlayButton gameType={"Swamp 1400"} onPressFunction={() => {}} />
                    <PlayButton gameType={"Pass N Play"} onPressFunction={() => {}} />
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