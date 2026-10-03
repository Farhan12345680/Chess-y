import Board from "./component/board.jsx";

import {
    useRouter,
    useLocalSearchParams,
    useFocusEffect
} from "expo-router";

import {
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef
} from "react";

import {
    Text,
    View,
    StyleSheet,
    Pressable,
    useWindowDimensions
} from "react-native";

import {
    socketMgmtContext,
    userDataContext
} from "./context/contexts";

export default function PlayerVsPlayer() {
    const router = useRouter();

    const { time } = useLocalSearchParams();

    const { width, height } = useWindowDimensions();

    const scale = Math.min(width / 400, height / 800);

    const fontSize = (size) =>
        Math.max(10, Math.min(size * scale, size));

    const spacing = (size) =>
        Math.max(4, Math.min(size * scale, size));

    const { userState } = useContext(userDataContext);

    const {
        socket,
        socketState,
        sendSocketMessage,
        connectSocket,
        closeSocket
    } = useContext(socketMgmtContext);

    const closeSocketRef = useRef(closeSocket);

    useEffect(() => {
        closeSocketRef.current = closeSocket;
    }, [closeSocket]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                console.log("PlayerVsPlayer lost focus");
                closeSocketRef.current();
            };
        }, [])
    );

    const [matchState, setMatchState] = useState("idle");

    const [gameState, setGameState] = useState({
        gameID: null,
        side: null,
        turn: "w",
        whiteTime: 0,
        blackTime: 0,
        whiteName: "White",
        blackName: "Black",
        fen: "start"
    });

    const [localTimes, setLocalTimes] = useState({
        white: 0,
        black: 0
    });

    const timerRef = useRef(null);

    const lastServerSyncRef = useRef({
        white: 0,
        black: 0,
        timestamp: 0
    });

    const normalizedTime =
        String(time ?? "").replace(" ", "+");

    useEffect(() => {
        if (!userState?.bearerToken) {
            return;
        }

        if (
            socket &&
            (
                socket.readyState === WebSocket.OPEN ||
                socket.readyState === WebSocket.CONNECTING
            )
        ) {
            return;
        }

        connectSocket(userState.bearerToken);
    }, [userState?.bearerToken]);

    useEffect(() => {
        if (
            !socket ||
            socketState !== "connected" ||
            !normalizedTime
        ) {
            return;
        }

        setMatchState("searching");

        sendSocketMessage({
            cmdType: "requestGame",
            timeControl: normalizedTime
        });
    }, [
        socket,
        socketState,
        normalizedTime
    ]);

    useEffect(() => {
        if (
            matchState !== "playing" ||
            (
                gameState.turn !== "w" &&
                gameState.turn !== "b"
            )
        ) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            return;
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            const now = Date.now();

            const elapsed =
                now -
                lastServerSyncRef.current.timestamp;

            setLocalTimes((prev) => {
                if (gameState.turn === "w") {
                    return {
                        white: Math.max(
                            0,
                            lastServerSyncRef.current.white -
                                elapsed
                        ),
                        black:
                            lastServerSyncRef.current.black
                    };
                }

                return {
                    white:
                        lastServerSyncRef.current.white,

                    black: Math.max(
                        0,
                        lastServerSyncRef.current.black -
                            elapsed
                    )
                };
            });
        }, 100);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [
        matchState,
        gameState.turn
    ]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        function synchronizeClock(
            whiteTime,
            blackTime
        ) {
            const white =
                Math.max(
                    0,
                    Number(whiteTime) || 0
                );

            const black =
                Math.max(
                    0,
                    Number(blackTime) || 0
                );

            const timestamp = Date.now();

            lastServerSyncRef.current = {
                white,
                black,
                timestamp
            };

            setLocalTimes({
                white,
                black
            });
        }

        function handleMessage(event) {
            let data;

            try {
                data =
                    typeof event.data === "string"
                        ? JSON.parse(event.data)
                        : event.data;
            } catch (error) {
                console.log(
                    "Invalid WebSocket message:",
                    event.data
                );

                return;
            }

            console.log("PvP message:", data);

            if (data.type === "connected") {
                return;
            }

            if (data.type === "waitingForOpponent") {
                setMatchState("waiting");
                return;
            }

            if (data.type === "gameStart") {
                const userID =
                    userState?.userID;

                let side = null;

                if (data.white === userID) {
                    side = "w";
                } else if (data.black === userID) {
                    side = "b";
                }

                const turn =
                    data.sideToMove === 0
                        ? "w"
                        : "b";

                const whiteTime =
                    Number(
                        data.sideTimeRemaining?.[0]
                    ) || 0;

                const blackTime =
                    Number(
                        data.sideTimeRemaining?.[1]
                    ) || 0;

                setGameState({
                    gameID: data.gameID,
                    side,
                    turn,
                    whiteTime,
                    blackTime,
                    whiteName:
                        data.whiteName ??
                        data.white ??
                        "White",
                    blackName:
                        data.blackName ??
                        data.black ??
                        "Black",
                    fen:
                        data.fen ??
                        "start"
                });

                synchronizeClock(
                    whiteTime,
                    blackTime
                );

                setMatchState("playing");

                return;
            }

            if (data.type === "move") {
                const whiteTime =
                    data.sideTimeRemaining?.[0] !== undefined
                        ? Number(
                            data.sideTimeRemaining[0]
                        )
                        : gameState.whiteTime;

                const blackTime =
                    data.sideTimeRemaining?.[1] !== undefined
                        ? Number(
                            data.sideTimeRemaining[1]
                        )
                        : gameState.blackTime;

                const turn =
                    data.sideToMove !== undefined
                        ? data.sideToMove === 0
                            ? "w"
                            : "b"
                        : data.turn ??
                            gameState.turn;

                setGameState((prev) => ({
                    ...prev,

                    turn,

                    whiteTime,

                    blackTime,

                    fen:
                        data.fen ??
                        prev.fen
                }));

                synchronizeClock(
                    whiteTime,
                    blackTime
                );

                return;
            }

            if (data.type === "gameOver") {
                const whiteTime =
                    data.sideTimeRemaining?.[0] !== undefined
                        ? Number(
                            data.sideTimeRemaining[0]
                        )
                        : gameState.whiteTime;

                const blackTime =
                    data.sideTimeRemaining?.[1] !== undefined
                        ? Number(
                            data.sideTimeRemaining[1]
                        )
                        : gameState.blackTime;

                const turn =
                    data.sideToMove !== undefined
                        ? data.sideToMove === 0
                            ? "w"
                            : "b"
                        : data.turn ??
                            gameState.turn;

                setGameState((prev) => ({
                    ...prev,

                    turn,

                    whiteTime,

                    blackTime,

                    fen:
                        data.fen ??
                        prev.fen
                }));

                synchronizeClock(
                    whiteTime,
                    blackTime
                );

                setMatchState("finished");

                return;
            }

            if (data.type === "surrender") {
                setGameState((prev) => ({
                    ...prev,

                    fen:
                        data.fen ??
                        prev.fen
                }));

                setMatchState("finished");

                return;
            }

            if (data.type === "timeout") {
                const whiteTime =
                    data.sideTimeRemaining?.[0] !== undefined
                        ? Number(
                            data.sideTimeRemaining[0]
                        )
                        : gameState.whiteTime;

                const blackTime =
                    data.sideTimeRemaining?.[1] !== undefined
                        ? Number(
                            data.sideTimeRemaining[1]
                        )
                        : gameState.blackTime;

                synchronizeClock(
                    whiteTime,
                    blackTime
                );

                setGameState((prev) => ({
                    ...prev,

                    whiteTime,

                    blackTime,

                    fen:
                        data.fen ??
                        prev.fen
                }));

                setMatchState("finished");

                return;
            }

            if (data.type === "abort") {
                setMatchState("finished");
                return;
            }

            if (data.type === "opponentDisconnected") {
                setMatchState("finished");
                return;
            }

            if (data.type === "gameSearchCancelled") {
                setMatchState("idle");
                return;
            }

            if (data.type === "gameRequestRejected") {
                console.log(
                    "Game request rejected:",
                    data.message
                );

                setMatchState("idle");

                return;
            }

            if (data.type === "moveRejected") {
                console.log(
                    "Move rejected:",
                    data.message
                );

                return;
            }

            if (data.type === "gameCommandRejected") {
                console.log(
                    "Game command rejected:",
                    data.message
                );

                return;
            }

            if (data.type === "serverError") {
                console.log(
                    "Server error:",
                    data.message
                );

                return;
            }
        }

        socket.addEventListener(
            "message",
            handleMessage
        );

        return () => {
            socket.removeEventListener(
                "message",
                handleMessage
            );
        };
    }, [
        socket,
        userState?.userID
    ]);

    function findOpponent() {
        if (
            !socket ||
            socketState !== "connected"
        ) {
            console.log(
                "WebSocket is not connected"
            );

            return;
        }

        setMatchState("searching");

        sendSocketMessage({
            cmdType: "requestGame",
            timeControl: normalizedTime
        });
    }

    function cancelSearch() {
        if (
            !socket ||
            socketState !== "connected"
        ) {
            return;
        }

        sendSocketMessage({
            cmdType: "cancelGame"
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
                cmdType: "surrender"
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
            blackName: "Black",
            fen: "start"
        });

        setLocalTimes({
            white: 0,
            black: 0
        });

        lastServerSyncRef.current = {
            white: 0,
            black: 0,
            timestamp: 0
        };

        setMatchState("idle");
    }

    function formatTime(milliseconds) {
        const totalSeconds =
            Math.max(
                0,
                Math.ceil(
                    (Number(milliseconds) || 0) /
                        1000
                )
            );

        const minutes =
            Math.floor(
                totalSeconds / 60
            );

        const remainingSeconds =
            totalSeconds % 60;

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
            return localTimes.white;
        }

        return localTimes.black;
    }

    function getGameTypeName() {
        const minutes = Number(
            normalizedTime.split("+")[0]
        );

        if (minutes <= 2) {
            return "Bullet";
        }

        if (minutes <= 5) {
            return "Blitz";
        }

        return "Rapid";
    }

    function getGameStateText() {
        if (
            matchState === "waiting" ||
            matchState === "searching"
        ) {
            return "Waiting for opponent";
        }

        if (matchState === "finished") {
            return "Game over";
        }

        if (
            gameState.turn ===
            gameState.side
        ) {
            return "Your turn";
        }

        return "Opponent's turn";
    }

    function PlayerCard({ side }) {
        const isActive =
            gameState.turn === side;

        const isYou =
            gameState.side === side;

        return (
            <View
                style={[
                    styles.commonWidth,
                    styles.playerCard,
                    {
                        paddingVertical:
                            spacing(8),

                        paddingHorizontal:
                            spacing(12),

                        borderRadius:
                            spacing(10),

                        marginVertical:
                            spacing(5),
                    },

                    isActive &&
                    styles.activePlayerCard
                ]}
            >
                <View
                    style={styles.playerInfo}
                >
                    <View
                        style={[
                            styles.avatar,
                            {
                                width:
                                    spacing(42),

                                height:
                                    spacing(42),

                                borderRadius:
                                    spacing(21),

                                marginRight:
                                    spacing(10),
                            },

                            side === "b" &&
                            styles.blackAvatar
                        ]}
                    >
                        <Text
                            style={[
                                styles.avatarText,
                                {
                                    fontSize:
                                        fontSize(20)
                                }
                            ]}
                        >
                            {getPlayerName(side)
                                .charAt(0)
                                .toUpperCase()}
                        </Text>
                    </View>

                    <View>
                        <Text
                            style={[
                                styles.playerName,
                                {
                                    fontSize:
                                        fontSize(17)
                                }
                            ]}
                        >
                            {getPlayerName(side)}
                        </Text>

                        <Text
                            style={[
                                styles.playerSide,
                                {
                                    fontSize:
                                        fontSize(12),

                                    marginTop:
                                        spacing(2)
                                }
                            ]}
                        >
                            {isYou
                                ? "You"
                                : "Opponent"}
                        </Text>
                    </View>
                </View>

                <View
                    style={[
                        styles.clockBox,
                        {
                            minWidth:
                                spacing(95),

                            borderRadius:
                                spacing(7),

                            paddingVertical:
                                spacing(7),

                            paddingHorizontal:
                                spacing(12),
                        },

                        isActive &&
                        styles.activeClockBox
                    ]}
                >
                    <Text
                        style={[
                            styles.clockText,
                            {
                                fontSize:
                                    fontSize(25)
                            },

                            isActive &&
                            styles.activeClockText
                        ]}
                    >
                        {formatTime(
                            getClock(side)
                        )}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View
            style={styles.gameContainer}
        >
            <View
                style={[
                    styles.commonWidth,
                    styles.gameTypeBox,
                    {
                        borderRadius:
                            spacing(10),

                        paddingVertical:
                            spacing(10),

                        paddingHorizontal:
                            spacing(30),

                        marginBottom:
                            spacing(8),
                    }
                ]}
            >
                <Text
                    style={[
                        styles.gameType,
                        {
                            fontSize:
                                fontSize(18)
                        }
                    ]}
                >
                    {getGameTypeName()}
                </Text>

                <Text
                    style={[
                        styles.timeControlText,
                        {
                            fontSize:
                                fontSize(13),

                            marginTop:
                                spacing(2)
                        }
                    ]}
                >
                    {normalizedTime}
                </Text>
            </View>

            <View
                style={[
                    styles.commonWidth,
                    styles.gameStateBox,
                    {
                        borderRadius:
                            spacing(8),

                        paddingVertical:
                            spacing(7),

                        paddingHorizontal:
                            spacing(25),

                        marginBottom:
                            spacing(10),
                    }
                ]}
            >
                <Text
                    style={[
                        styles.gameStateText,
                        {
                            fontSize:
                                fontSize(14)
                        }
                    ]}
                >
                    {getGameStateText()}
                </Text>
            </View>

            {matchState === "waiting" ||
            matchState === "searching" ? (
                <View
                    style={[
                        styles.commonWidth,
                        styles.waitingContainer,
                        {
                            borderRadius:
                                spacing(12),

                            padding:
                                spacing(25),

                            marginTop:
                                spacing(20),
                        }
                    ]}
                >
                    <Text
                        style={[
                            styles.waitingTitle,
                            {
                                fontSize:
                                    fontSize(20),

                                marginBottom:
                                    spacing(10)
                            }
                        ]}
                    >
                        Waiting for opponent
                    </Text>

                    <Text
                        style={[
                            styles.waitingText,
                            {
                                fontSize:
                                    fontSize(14),

                                lineHeight:
                                    fontSize(20)
                            }
                        ]}
                    >
                        Looking for a player with the same time control.
                    </Text>

                    <Pressable
                        style={[
                            styles.actionButton,
                            {
                                borderRadius:
                                    spacing(7),

                                paddingVertical:
                                    spacing(9),

                                marginTop:
                                    spacing(20)
                            }
                        ]}
                        onPress={cancelSearch}
                    >
                        <Text
                            style={[
                                styles.cancelText,
                                {
                                    fontSize:
                                        fontSize(14)
                                }
                            ]}
                        >
                            Cancel
                        </Text>
                    </Pressable>
                </View>
            ) : matchState === "finished" ? (
                <View
                    style={styles.finishedContainer}
                >
                    <Text
                        style={[
                            styles.gameOverTitle,
                            {
                                fontSize:
                                    fontSize(30),

                                marginBottom:
                                    spacing(20)
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
                                marginTop:
                                    spacing(5),

                                paddingVertical:
                                    spacing(8)
                            }
                        ]}
                        onPress={() =>
                            router.push("/game")
                        }
                    >
                        <Text
                            style={[
                                styles.backText,
                                {
                                    fontSize:
                                        fontSize(14)
                                }
                            ]}
                        >
                            Go Back
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <View
                    style={styles.gameContent}
                >
                    <PlayerCard side="b" />

                    <View
                        style={[
                            styles.commonWidth,
                            styles.boardContainer,
                            {
                                marginVertical:
                                    spacing(2),

                                padding:
                                    spacing(2),
                            }
                        ]}
                    >
                        <Board
                            selfPlay={false}
                            playerColor={gameState.side}
                            incomingFen={gameState.fen}
                            onMove={(move) => {
                                sendSocketMessage({
                                    cmdType: "move",
                                    move:
                                        `${move.from}${move.to}${move.promotion ?? ""}`
                                });
                            }}
                        />
                    </View>

                    <PlayerCard side="w" />

                    <View
                        style={[
                            styles.resignContainer,
                            {
                                marginTop:
                                    spacing(8)
                            }
                        ]}
                    >
                        <Pressable
                            style={[
                                styles.commonWidth,
                                styles.actionButton,
                                {
                                    borderRadius:
                                        spacing(7),

                                    paddingVertical:
                                        spacing(8)
                                }
                            ]}
                            onPress={leaveGame}
                        >
                            <Text
                                style={[
                                    styles.resignText,
                                    {
                                        fontSize:
                                            fontSize(14)
                                    }
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