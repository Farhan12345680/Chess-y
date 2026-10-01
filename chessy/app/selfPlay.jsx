
import Board from "./component/board.jsx";
import PlayButton from "./component/playButton.jsx";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View, StyleSheet } from "react-native";

export default function SelfPlay() {
    const router = useRouter();
    const [turn, setTurn] = useState("w");

    return (
        <View style={styles.container}>
            <PlayButton
                gameType={"<-- Back"}
                onPressFunction={() => {
                    router.push("/game");
                }}
            />

            <View
                style={[
                    styles.player,
                    turn !== "b" && styles.playerDisabled,
                ]}
            >
                <Text style={styles.playerText}>Player-2</Text>
            </View>

            <Board
                selfPlay={true}
                changeBoardTurn={(newTurn) => {
                    console.log("Parent turn:", newTurn);
                    setTurn(newTurn);
                }}
            />

            <View
                style={[
                    styles.player,
                    turn !== "w" && styles.playerDisabled,
                ]}
            >
                <Text style={styles.playerText}>Player-1</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingTop: 20,
    },

    player: {
        backgroundColor: "white",
        alignItems: "center",
        marginVertical: 15,
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 8,
        opacity: 1,
    },

    playerDisabled: {
        opacity: 0.35,
    },

    playerText: {
        color: "black",
        fontSize: 20,
        fontWeight: "bold",
    },
});