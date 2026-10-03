import Board from "./component/board.jsx";
import PlayButton from "./component/playButton.jsx";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState, useRef } from "react";
import { Text, View, StyleSheet, Pressable, useWindowDimensions } from "react-native";
import { socketMgmtContext, AuthContext } from "./context/contexts";
import { Linking } from "expo-router";

export default function PlayerVsPlayer() {

    const router = useRouter();
    const { time } = useLocalSearchParams();
    const {} = useContext(AuthContext);
    const { width, height } = useWindowDimensions();

    const scale = Math.min(width / 400, height / 800);

    const fontSize = (size) =>
        Math.max(10, Math.min(size * scale, size));

    const spacing = (size) =>
        Math.max(4, Math.min(size * scale, size));

    const {
        socket,
        socketState,
        sendSocketMessage
    } = useContext(socketMgmtContext);

    const [matchState, setMatchState] = useState("idle");

    const [gameState, setGameState] = useState({
        gameID: null,
        side: null,
        turn: "w",
        whiteTime: 0,
        blackTime: 0,
        whiteName: "White",
        blackName: "Black"
    });

    const requestSent = useRef(false);

    useEffect(() => {
        if (
            !socket ||
            socketState !== "connected" ||
            !time ||
            requestSent.current
        ) {
            return;
        }

        requestSent.current = true;

        setMatchState("searching");

        sendSocketMessage({
            type: "requestGame",
            time: time
        });
    }, [socket, socketState, time]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        function handleMessage(event) {
            let data;

            try {
                data =
                    typeof event.data === "string"
                        ? JSON.parse(event.data)
                        : event.data;
            } catch (error) {
                console.log("Invalid WebSocket message:", event.data);
                return;
            }

            console.log("PvP message:", data);

            if (data.type === "waitingForOpponent") {
                setMatchState("waiting");
                return;
            }

            if (data.type === "gameStart") {
                setGameState({
                    gameID: data.gameID,
                    side: data.side,
                    turn: data.turn ?? "w",
                    whiteTime: data.whiteTime ?? 0,
                    blackTime: data.blackTime ?? 0,
                    whiteName: data.whiteName ?? "White",
                    blackName: data.blackName ?? "Black"
                });

                setMatchState("playing");

                return;
            }

            if (data.type === "clockUpdate") {
                setGameState((prev) => ({
                    ...prev,
                    turn: data.turn ?? prev.turn,
                    whiteTime: data.whiteTime ?? prev.whiteTime,
                    blackTime: data.blackTime ?? prev.blackTime
                }));

                return;
            }

            if (data.type === "move") {
                setGameState((prev) => ({
                    ...prev,
                    turn: data.turn ?? prev.turn,
                    whiteTime: data.whiteTime ?? prev.whiteTime,
                    blackTime: data.blackTime ?? prev.blackTime
                }));

                return;
            }

            if (data.type === "gameOver") {
                setGameState((prev) => ({
                    ...prev,
                    turn: data.turn ?? prev.turn,
                    whiteTime: data.whiteTime ?? prev.whiteTime,
                    blackTime: data.blackTime ?? prev.blackTime
                }));

                setMatchState("finished");

                return;
            }

            if (data.type === "opponentDisconnected") {
                setMatchState("finished");
                return;
            }

            if (data.type === "cancelled") {
                setMatchState("idle");
                return;
            }
        }

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socket]);

    useEffect(() => {
        if (matchState !== "playing") {
            return;
        }

        const timer = setInterval(() => {
            setGameState((prev) => {
                if (prev.turn === "w") {
                    return {
                        ...prev,
                        whiteTime: Math.max(0, prev.whiteTime - 0.1)
                    };
                }

                if (prev.turn === "b") {
                    return {
                        ...prev,
                        blackTime: Math.max(0, prev.blackTime - 0.1)
                    };
                }

                return prev;
            });
        }, 100);

        return () => {
            clearInterval(timer);
        };
    }, [matchState, gameState.turn]);

    function findOpponent() {
        if (!socket || socketState !== "connected") {
            console.log("WebSocket is not connected");
            return;
        }

        if (!time) {
            console.log("No time control selected");
            return;
        }

        if (requestSent.current) {
            return;
        }

        requestSent.current = true;

        setMatchState("searching");

        sendSocketMessage({
            type: "requestGame",
            time: time
        });
    }

    function cancelSearch() {
        if (!socket || socketState !== "connected") {
            return;
        }

        sendSocketMessage({
            type: "cancelGame",
            time: time
        });

        setMatchState("idle");
    }

    function leaveGame() {
        if (
            socket &&
            socketState === "connected" &&
            gameState.gameID
        ) {
            sendSocketMessage({
                type: "surrender",
                gameID: gameState.gameID
            });
        }

        resetGame();
    }

    function resetGame() {
        setGameState({
            gameID: null,
            side: null,
            turn: "w",
            whiteTime: 0,
            blackTime: 0,
            whiteName: "White",
            blackName: "Black"
        });

        setMatchState("idle");
    }

    function formatTime(seconds) {
        const totalSeconds = Math.max(0, Math.ceil(seconds));

        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;

        return `${minutes}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    }

    function getPlayerName(side) {
        if (side === "w") {
            return gameState.whiteName;
        }

        return gameState.blackName;
    }

    function getClock(side) {
        if (side === "w") {
            return gameState.whiteTime;
        }

        return gameState.blackTime;
    }

    function getGameType() {
        if (
            time === "1+0" ||
            time === "1+1" ||
            time === "1+3"
        ) {
            return "Bullet";
        }

        if (
            time === "3+0" ||
            time === "5+0" ||
            time === "5+3"
        ) {
            return "Blitz";
        }

        if (
            time === "10+0" ||
            time === "10+5" ||
            time === "15+0"
        ) {
            return "Rapid";
        }

        return "Chess";
    }

    function getGameStateText() {
        if (matchState === "waiting" || matchState === "searching") {
            return "Waiting for opponent";
        }

        if (matchState === "finished") {
            return "Game over";
        }

        if (gameState.turn === gameState.side) {
            return "Your turn";
        }

        return "Opponent's turn";
    }

    function PlayerCard({ side }) {
        const isActive = gameState.turn === side;
        const isYou = gameState.side === side;

        return (
            <View
                style={[
                    styles.commonWidth,
                    styles.playerCard,
                    {
                        paddingVertical: spacing(8),
                        paddingHorizontal: spacing(12),
                        borderRadius: spacing(10),
                        marginVertical: spacing(5),
                    },
                    isActive && styles.activePlayerCard
                ]}
            >
                <View style={styles.playerInfo}>

                    <View
                        style={[
                            styles.avatar,
                            {
                                width: spacing(42),
                                height: spacing(42),
                                borderRadius: spacing(21),
                                marginRight: spacing(10),
                            },
                            side === "b" && styles.blackAvatar
                        ]}
                    >
                        <Text
                            style={[
                                styles.avatarText,
                                { fontSize: fontSize(20) }
                            ]}
                        >
                            {getPlayerName(side).charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <View>
                        <Text
                            style={[
                                styles.playerName,
                                { fontSize: fontSize(17) }
                            ]}
                        >
                            {getPlayerName(side)}
                        </Text>

                        <Text
                            style={[
                                styles.playerSide,
                                {
                                    fontSize: fontSize(12),
                                    marginTop: spacing(2)
                                }
                            ]}
                        >
                            {isYou ? "You" : "Opponent"}
                        </Text>
                    </View>

                </View>

                <View
                    style={[
                        styles.clockBox,
                        {
                            minWidth: spacing(95),
                            borderRadius: spacing(7),
                            paddingVertical: spacing(7),
                            paddingHorizontal: spacing(12),
                        },
                        isActive && styles.activeClockBox
                    ]}
                >
                    <Text
                        style={[
                            styles.clockText,
                            { fontSize: fontSize(25) },
                            isActive && styles.activeClockText
                        ]}
                    >
                        {formatTime(getClock(side))}
                    </Text>
                </View>

            </View>
        );
    }

    // if (socket === null) {
    //     return (
    //         <View style={styles.gameContainer}>
    //             <Text style={styles.serverError}>
    //                 The server is not running!
    //             </Text>
    //         </View>
    //     );
    // }

    return (
        <View style={styles.gameContainer}>

            <View
                style={[
                    styles.commonWidth,
                    styles.gameTypeBox,
                    {
                        borderRadius: spacing(10),
                        paddingVertical: spacing(10),
                        paddingHorizontal: spacing(30),
                        marginBottom: spacing(8),
                    }
                ]}
            >
                <Text
                    style={[
                        styles.gameType,
                        { fontSize: fontSize(18) }
                    ]}
                >
                    {getGameType()}
                </Text>

                <Text
                    style={[
                        styles.timeControlText,
                        {
                            fontSize: fontSize(13),
                            marginTop: spacing(2)
                        }
                    ]}
                >
                    {time}
                </Text>
            </View>

            <View
                style={[
                    styles.commonWidth,
                    styles.gameStateBox,
                    {
                        borderRadius: spacing(8),
                        paddingVertical: spacing(7),
                        paddingHorizontal: spacing(25),
                        marginBottom: spacing(10),
                    }
                ]}
            >
                <Text
                    style={[
                        styles.gameStateText,
                        { fontSize: fontSize(14) }
                    ]}
                >
                    {getGameStateText()}
                </Text>
            </View>

            {matchState === "waiting" || matchState === "searching" ? (

                <View
                    style={[
                        styles.commonWidth,
                        styles.waitingContainer,
                        {
                            borderRadius: spacing(12),
                            padding: spacing(25),
                            marginTop: spacing(20),
                        }
                    ]}
                >
                    <Text
                        style={[
                            styles.waitingTitle,
                            {
                                fontSize: fontSize(20),
                                marginBottom: spacing(10)
                            }
                        ]}
                    >
                        Waiting for opponent
                    </Text>

                    <Text
                        style={[
                            styles.waitingText,
                            {
                                fontSize: fontSize(14),
                                lineHeight: fontSize(20)
                            }
                        ]}
                    >
                        Looking for a player with the same time control.
                    </Text>

                    <Pressable
                        style={[
                            styles.actionButton,
                            {
                                borderRadius: spacing(7),
                                paddingVertical: spacing(9),
                                marginTop: spacing(20)
                            }
                        ]}
                        onPress={cancelSearch}
                    >
                        <Text
                            style={[
                                styles.cancelText,
                                { fontSize: fontSize(14) }
                            ]}
                        >
                            Cancel
                        </Text>
                    </Pressable>

                </View>

            ) : matchState === "finished" ? (

                <View style={styles.finishedContainer}>

                    <Text
                        style={[
                            styles.gameOverTitle,
                            {
                                fontSize: fontSize(30),
                                marginBottom: spacing(20)
                            }
                        ]}
                    >
                        Game Over
                    </Text>

                    <Pressable
                        style={[
                            styles.commonWidth,
                            styles.actionButton,
                            {
                                marginTop: spacing(5),
                                paddingVertical: spacing(8)
                            }
                        ]}
                        onPress={() => router.push("/game")}
                    >
                        <Text
                            style={[
                                styles.backText,
                                { fontSize: fontSize(14) }
                            ]}
                        >
                            Go Back
                        </Text>
                    </Pressable>

                </View>

            ) : (

                <View style={styles.gameContent}>

                    <PlayerCard side="b" />

                    <View
                        style={[
                            styles.commonWidth,
                            styles.boardContainer,
                            {
                                marginVertical: spacing(2),
                                padding: spacing(2),
                            }
                        ]}
                    >
                        <Board
                            selfPlay={false}
                            playerSide={gameState.side}
                            gameID={gameState.gameID}
                        />
                    </View>

                    <PlayerCard side="w" />

                    <View
                        style={[
                            styles.resignContainer,
                            {
                                marginTop: spacing(8)
                            }
                        ]}
                    >
                        <Pressable
                            style={[
                                styles.commonWidth,
                                styles.actionButton,
                                {
                                    borderRadius: spacing(7),
                                    paddingVertical: spacing(8)
                                }
                            ]}
                            onPress={leaveGame}
                        >
                            <Text
                                style={[
                                    styles.resignText,
                                    { fontSize: fontSize(14) }
                                ]}
                            >
                                Resign
                            </Text>
                        </Pressable>
                    </View>

                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({

    commonWidth: {
        width: "92%",
        maxWidth: 520,
        alignSelf: "center",
    },

    gameContainer: {
        flex: 1,
        backgroundColor: "#111111",
        alignItems: "center",
        paddingTop: 20,
    },

    gameTypeBox: {
        backgroundColor: "#006A4E",
        borderWidth: 1,
        borderColor: "#006A4E",
        alignItems: "center",
        justifyContent: "center",
    },

    gameType: {
        color: "#ffffff",
        fontWeight: "bold",
    },

    timeControlText: {
        color: "#d8f0e8",
    },

    gameStateBox: {
        backgroundColor: "#1b1b19",
        borderWidth: 1,
        borderColor: "#006A4E",
        alignItems: "center",
        justifyContent: "center",
    },

    gameStateText: {
        color: "#cccccc",
        fontWeight: "500",
    },

    gameContent: {
        width: "100%",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    playerCard: {
        minHeight: 65,
        backgroundColor: "#262522",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#3a3937",
    },

    activePlayerCard: {
        borderColor: "#006A4E",
        backgroundColor: "#193c32",
    },

    playerInfo: {
        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        backgroundColor: "#dddddd",
        alignItems: "center",
        justifyContent: "center",
    },

    blackAvatar: {
        backgroundColor: "#555555",
    },

    avatarText: {
        color: "#111111",
        fontWeight: "bold",
    },

    playerName: {
        color: "#ffffff",
        fontWeight: "bold",
    },

    playerSide: {
        color: "#999999",
    },

    clockBox: {
        backgroundColor: "#151513",
        alignItems: "center",
        justifyContent: "center",
    },

    activeClockBox: {
        backgroundColor: "#006A4E",
    },

    clockText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontVariant: ["tabular-nums"],
    },

    activeClockText: {
        color: "#ffffff",
    },

    boardContainer: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#006A4E",
    },

    resignContainer: {
        width: "100%",
        alignItems: "center",
    },

    actionButton: {
        backgroundColor: "#006A4E",
        borderWidth: 1,
        borderColor: "#006A4E",
        alignItems: "center",
        justifyContent: "center",
    },

    resignText: {
        color: "#ffffff",
        fontWeight: "bold",
    },

    backText: {
        color: "#ffffff",
        fontWeight: "bold",
    },

    waitingContainer: {
        backgroundColor: "#262522",
        borderWidth: 1,
        borderColor: "#006A4E",
        alignItems: "center",
        justifyContent: "center",
    },

    waitingTitle: {
        color: "#ffffff",
        fontWeight: "bold",
    },

    waitingText: {
        color: "#aaaaaa",
        textAlign: "center",
    },

    cancelText: {
        color: "#ffffff",
        fontWeight: "bold",
    },

    finishedContainer: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },

    gameOverTitle: {
        color: "#ffffff",
        fontWeight: "bold",
    },

    serverError: {
        color: "#ffffff",
        fontSize: 18,
    },
});