import React, {
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef
} from "react";

import Board from "./component/board.jsx";

import {
    useRouter,
    useLocalSearchParams,
    useFocusEffect
} from "expo-router";

import {
    Text,
    View,
    Image,
    StyleSheet,
    Pressable,
    useWindowDimensions
} from "react-native";

import {
    socketMgmtContext,
    userDataContext
} from "./context/contexts";

const StaticAvatar = React.memo(function StaticAvatar({
    playerImage,
    playerName,
    spacing,
    fontSize
}) {
    const imageSource = React.useMemo(
        () =>
            playerImage
                ? { uri: playerImage }
                : null,
        [playerImage]
    );

    return (
        <View
            style={[
                styles.avatar,
                {
                    width: spacing(42),
                    height: spacing(42),
                    borderRadius: spacing(21),
                    marginRight: spacing(10),
                }
            ]}
        >
            {imageSource ? (
                <Image
                    source={imageSource}
                    fadeDuration={0}
                    style={[
                        styles.avatarImage,
                        {
                            width: spacing(42),
                            height: spacing(42),
                            borderRadius: spacing(21)
                        }
                    ]}
                />
            ) : (
                <Text
                    style={[
                        styles.avatarText,
                        {
                            fontSize:
                                fontSize(20)
                        }
                    ]}
                >
                    {playerName
                        .charAt(0)
                        .toUpperCase()}
                </Text>
            )}
        </View>
    );
});

const PlayerCard = React.memo(function PlayerCard({
    side,
    gameState,
    matchState,
    playerImage,
    playerName,
    playerCountry,
    clock,
    isYou,
    isWinner,
    spacing,
    fontSize
}) {
    const isActive =
        gameState.turn === side &&
        matchState === "playing";

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
                isActive &&
                    styles.activePlayerCard
            ]}
        >
            <View style={styles.playerInfo}>
                <StaticAvatar
                    playerImage={playerImage}
                    playerName={playerName}
                    spacing={spacing}
                    fontSize={fontSize}
                />

                <View>
                    <View style={styles.nameRow}>
                        <Text
                            style={[
                                styles.playerName,
                                {
                                    fontSize:
                                        fontSize(17)
                                }
                            ]}
                        >
                            {playerName}
                        </Text>

                        {isWinner && (
                            <Text
                                style={[
                                    styles.trophy,
                                    {
                                        fontSize:
                                            fontSize(19),
                                        marginLeft:
                                            spacing(6)
                                    }
                                ]}
                            >
                                🏆
                            </Text>
                        )}
                    </View>

                    <View style={styles.countryRow}>
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

                        {playerCountry && (
                            <Text
                                style={[
                                    styles.countryText,
                                    {
                                        fontSize:
                                            fontSize(12),
                                        marginTop:
                                            spacing(2),
                                        marginLeft:
                                            spacing(7)
                                    }
                                ]}
                            >
                                {playerCountry}
                            </Text>
                        )}
                    </View>
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
                    {clock}
                </Text>
            </View>
        </View>
    );
});

export default function PlayerVsPlayer() {
    const router = useRouter();

    const { time } =
        useLocalSearchParams();

    const { width, height } =
        useWindowDimensions();

    const scale =
        Math.min(
            width / 400,
            height / 800
        );

    const fontSize = useCallback(
        (size) =>
            Math.max(
                10,
                Math.min(
                    size * scale,
                    size
                )
            ),
        [scale]
    );

    const spacing = useCallback(
        (size) =>
            Math.max(
                4,
                Math.min(
                    size * scale,
                    size
                )
            ),
        [scale]
    );

    const { userState } =
        useContext(userDataContext);

    const {
        socket,
        socketState,
        sendSocketMessage,
        connectSocket,
        closeSocket
    } = useContext(socketMgmtContext);

    const closeSocketRef =
        useRef(closeSocket);

    useEffect(() => {
        closeSocketRef.current =
            closeSocket;
    }, [closeSocket]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                closeSocketRef.current();
            };
        }, [])
    );

    const [matchState, setMatchState] =
        useState("searching");

    const [gameState, setGameState] =
        useState({
            gameID: null,
            side: null,
            turn: "w",

            whiteTime: 0,
            blackTime: 0,

            whiteName: "White",
            blackName: "Black",

            whiteID: null,
            blackID: null,

            whiteCountry: null,
            blackCountry: null,

            fen: "start",
            winner: null,
            result: null,
            reason: null
        });

    const [playerImages, setPlayerImages] =
        useState({
            white: null,
            black: null
        });

    const [localTimes, setLocalTimes] =
        useState({
            white: 0,
            black: 0
        });

    const timerRef =
        useRef(null);

    const lastServerSyncRef =
        useRef({
            white: 0,
            black: 0,
            timestamp: 0
        });

    const normalizedTime =
        String(time ?? "")
            .replace(" ", "+");

    useEffect(() => {
        if (!userState?.bearerToken) {
            return;
        }

        if (
            socket &&
            (
                socket.readyState ===
                    WebSocket.OPEN ||
                socket.readyState ===
                    WebSocket.CONNECTING
            )
        ) {
            return;
        }

        connectSocket(
            userState.bearerToken
        );
    }, [
        userState?.bearerToken
    ]);

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
            timeControl:
                normalizedTime
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
                clearInterval(
                    timerRef.current
                );

                timerRef.current = null;
            }

            return;
        }

        if (timerRef.current) {
            clearInterval(
                timerRef.current
            );
        }

        timerRef.current =
            setInterval(() => {
                const now =
                    Date.now();

                const elapsed =
                    now -
                    lastServerSyncRef
                        .current
                        .timestamp;

                if (
                    gameState.turn === "w"
                ) {
                    setLocalTimes({
                        white:
                            Math.max(
                                0,
                                lastServerSyncRef
                                    .current
                                    .white -
                                    elapsed
                            ),

                        black:
                            lastServerSyncRef
                                .current
                                .black
                    });

                    return;
                }

                setLocalTimes({
                    white:
                        lastServerSyncRef
                            .current
                            .white,

                    black:
                        Math.max(
                            0,
                            lastServerSyncRef
                                .current
                                .black -
                                elapsed
                        )
                });
            }, 100);

        return () => {
            if (timerRef.current) {
                clearInterval(
                    timerRef.current
                );

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
                    Number(
                        whiteTime
                    ) || 0
                );

            const black =
                Math.max(
                    0,
                    Number(
                        blackTime
                    ) || 0
                );

            lastServerSyncRef.current = {
                white,
                black,
                timestamp:
                    Date.now()
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
                    typeof event.data ===
                    "string"
                        ? JSON.parse(
                            event.data
                        )
                        : event.data;
            } catch {
                return;
            }

            if (
                data.type ===
                "connected"
            ) {
                return;
            }

            if (
                data.type ===
                "waitingForOpponent"
            ) {
                setMatchState(
                    "waiting"
                );

                return;
            }

            if (
                data.type ===
                "gameStart"
            ) {
                const userID =
                    userState?.userID;

                const whiteIsObject =
                    typeof data.white ===
                        "object" &&
                    data.white !== null;

                const blackIsObject =
                    typeof data.black ===
                        "object" &&
                    data.black !== null;

                const whiteID =
                    whiteIsObject
                        ? data.white.id
                        : data.white;

                const blackID =
                    blackIsObject
                        ? data.black.id
                        : data.black;

                const whiteName =
                    whiteIsObject
                        ? data.white.name
                        : data.whiteName ??
                            "White";

                const blackName =
                    blackIsObject
                        ? data.black.name
                        : data.blackName ??
                            "Black";

                const whiteCountry =
                    whiteIsObject
                        ? data.white.country
                        : null;

                const blackCountry =
                    blackIsObject
                        ? data.black.country
                        : null;

                const whiteImage =
                    whiteIsObject
                        ? data.white.image_url
                        : null;

                const blackImage =
                    blackIsObject
                        ? data.black.image_url
                        : null;

                let side = null;

                if (
                    whiteID === userID
                ) {
                    side = "w";
                } else if (
                    blackID === userID
                ) {
                    side = "b";
                }

                const turn =
                    data.sideToMove ===
                    0
                        ? "w"
                        : "b";

                const whiteTime =
                    Number(
                        data.sideTimeRemaining
                            ?. [0]
                    ) || 0;

                const blackTime =
                    Number(
                        data.sideTimeRemaining
                            ?. [1]
                    ) || 0;

                setPlayerImages({
                    white:
                        whiteImage,
                    black:
                        blackImage
                });

                setGameState({
                    gameID:
                        data.gameID,

                    side,

                    turn,

                    whiteTime,

                    blackTime,

                    whiteName:
                        whiteName ||
                        "White",

                    blackName:
                        blackName ||
                        "Black",

                    whiteID,
                    blackID,

                    whiteCountry,
                    blackCountry,

                    fen:
                        data.fen ??
                        "start",

                    winner: null,
                    result: null,
                    reason: null
                });

                synchronizeClock(
                    whiteTime,
                    blackTime
                );

                setMatchState(
                    "playing"
                );

                return;
            }

            if (
                data.type ===
                "move"
            ) {
                const whiteTime =
                    data.sideTimeRemaining
                        ?. [0] !==
                    undefined
                        ? Number(
                            data.sideTimeRemaining[0]
                        )
                        : gameState.whiteTime;

                const blackTime =
                    data.sideTimeRemaining
                        ?. [1] !==
                    undefined
                        ? Number(
                            data.sideTimeRemaining[1]
                        )
                        : gameState.blackTime;

                const turn =
                    data.sideToMove !==
                    undefined
                        ? data.sideToMove ===
                          0
                            ? "w"
                            : "b"
                        : data.turn ??
                          gameState.turn;

                setGameState(
                    prev => ({
                        ...prev,
                        turn,
                        whiteTime,
                        blackTime,
                        fen:
                            data.fen ??
                            prev.fen
                    })
                );

                synchronizeClock(
                    whiteTime,
                    blackTime
                );

                return;
            }

            if (
                data.type ===
                "gameOver"
            ) {
                const whiteTime =
                    data.sideTimeRemaining
                        ?. [0] !==
                    undefined
                        ? Number(
                            data.sideTimeRemaining[0]
                        )
                        : gameState.whiteTime;

                const blackTime =
                    data.sideTimeRemaining
                        ?. [1] !==
                    undefined
                        ? Number(
                            data.sideTimeRemaining[1]
                        )
                        : gameState.blackTime;

                const winner =
                    data.winner === 0
                        ? "w"
                        : data.winner === 1
                            ? "b"
                            : null;

                setGameState(
                    prev => {
                        let result =
                            "draw";

                        if (
                            winner !==
                            null
                        ) {
                            result =
                                winner ===
                                prev.side
                                    ? "won"
                                    : "lost";
                        }

                        return {
                            ...prev,

                            whiteTime,

                            blackTime,

                            fen:
                                data.fen ??
                                prev.fen,

                            winner,

                            result,

                            reason:
                                data.reason ??
                                null
                        };
                    }
                );

                synchronizeClock(
                    whiteTime,
                    blackTime
                );

                setMatchState(
                    "finished"
                );

                return;
            }

            if (
                data.type ===
                "surrender"
            ) {
                const winner =
                    data.winner === 0
                        ? "w"
                        : data.winner === 1
                            ? "b"
                            : null;

                setGameState(
                    prev => {
                        let result =
                            "draw";

                        if (
                            winner !==
                            null
                        ) {
                            result =
                                winner ===
                                prev.side
                                    ? "won"
                                    : "lost";
                        }

                        return {
                            ...prev,

                            fen:
                                data.fen ??
                                prev.fen,

                            winner,

                            result,

                            reason:
                                data.reason ??
                                "surrender"
                        };
                    }
                );

                setMatchState(
                    "finished"
                );

                return;
            }

            if (
                data.type ===
                "timeout"
            ) {
                const whiteTime =
                    data.sideTimeRemaining
                        ?. [0] !==
                    undefined
                        ? Number(
                            data.sideTimeRemaining[0]
                        )
                        : gameState.whiteTime;

                const blackTime =
                    data.sideTimeRemaining
                        ?. [1] !==
                    undefined
                        ? Number(
                            data.sideTimeRemaining[1]
                        )
                        : gameState.blackTime;

                const winner =
                    data.winner === 0
                        ? "w"
                        : data.winner === 1
                            ? "b"
                            : null;

                setGameState(
                    prev => {
                        let result =
                            "draw";

                        if (
                            winner !==
                            null
                        ) {
                            result =
                                winner ===
                                prev.side
                                    ? "won"
                                    : "lost";
                        }

                        return {
                            ...prev,

                            whiteTime,

                            blackTime,

                            fen:
                                data.fen ??
                                prev.fen,

                            winner,

                            result,

                            reason:
                                "timeout"
                        };
                    }
                );

                synchronizeClock(
                    whiteTime,
                    blackTime
                );

                setMatchState(
                    "finished"
                );

                return;
            }

            if (
                data.type ===
                "abort"
            ) {
                setGameState(
                    prev => ({
                        ...prev,
                        result:
                            "aborted",
                        reason:
                            "abort"
                    })
                );

                setMatchState(
                    "finished"
                );

                return;
            }

            if (
                data.type ===
                "opponentDisconnected"
            ) {
                setGameState(
                    prev => ({
                        ...prev,
                        result: "won",
                        reason:
                            "disconnect"
                    })
                );

                setMatchState(
                    "finished"
                );

                return;
            }

            if (
                data.type ===
                "gameSearchCancelled"
            ) {
                setMatchState(
                    "idle"
                );

                return;
            }

            if (
                data.type ===
                "gameRequestRejected"
            ) {
                setMatchState(
                    "idle"
                );

                return;
            }

            if (
                data.type ===
                "moveRejected"
            ) {
                return;
            }

            if (
                data.type ===
                "gameCommandRejected"
            ) {
                return;
            }

            if (
                data.type ===
                "serverError"
            ) {
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

    function handleMove(move) {
        if (
            !socket ||
            socketState !==
                "connected" ||
            matchState !==
                "playing"
        ) {
            return;
        }

        sendSocketMessage({
            cmdType: "move",
            move:
                `${move.from}${move.to}${move.promotion ?? ""}`
        });
    }

    function cancelSearch() {
        if (
            !socket ||
            socketState !==
                "connected"
        ) {
            return;
        }

        sendSocketMessage({
            cmdType:
                "cancelGame"
        });

        setMatchState("idle");

        router.replace(
            "/game"
        );
    }

    function leaveGame() {
        if (
            socket &&
            socketState ===
                "connected" &&
            gameState.gameID
        ) {
            sendSocketMessage({
                cmdType:
                    "surrender"
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

            whiteID: null,
            blackID: null,

            whiteCountry: null,
            blackCountry: null,

            fen: "start",
            winner: null,
            result: null,
            reason: null
        });

        setPlayerImages({
            white: null,
            black: null
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

    function formatTime(
        milliseconds
    ) {
        const totalSeconds =
            Math.max(
                0,
                Math.ceil(
                    (Number(
                        milliseconds
                    ) || 0) / 1000
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

    function getGameTypeName() {
        const minutes =
            Number(
                normalizedTime
                    .split("+")[0]
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
            matchState ===
                "waiting" ||
            matchState ===
                "searching"
        ) {
            return "Waiting for opponent";
        }

        if (
            matchState ===
            "finished"
        ) {
            if (
                gameState.result ===
                "won"
            ) {
                return "You Won!";
            }

            if (
                gameState.result ===
                "lost"
            ) {
                return "You Lost";
            }

            if (
                gameState.result ===
                "draw"
            ) {
                return "Draw";
            }

            if (
                gameState.result ===
                "aborted"
            ) {
                return "Game Aborted";
            }

            return "Game Over";
        }

        if (
            gameState.turn ===
            gameState.side
        ) {
            return "Your Turn";
        }

        return "Opponent's Turn";
    }

    const whiteClock =
        formatTime(
            localTimes.white
        );

    const blackClock =
        formatTime(
            localTimes.black
        );

    const whiteIsYou =
        gameState.side === "w";

    const blackIsYou =
        gameState.side === "b";

    const whiteIsWinner =
        matchState ===
            "finished" &&
        gameState.winner === "w";

    const blackIsWinner =
        matchState ===
            "finished" &&
        gameState.winner === "b";

    return (
        <View
            style={
                styles.gameContainer
            }
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

            {matchState ===
                "waiting" ||
            matchState ===
                "searching" ? (
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
                                spacing(20)
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
                        onPress={
                            cancelSearch
                        }
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
            ) : matchState ===
                "finished" ? (
                <View
                    style={
                        styles.finishedContainer
                    }
                >
                    <View
                        style={
                            styles.resultCard
                        }
                    >
                        <Text
                            style={[
                                styles.gameOverTitle,
                                {
                                    fontSize:
                                        fontSize(30)
                                }
                            ]}
                        >
                            {getGameStateText()}
                        </Text>

                        {gameState.reason && (
                            <Text
                                style={[
                                    styles.reasonText,
                                    {
                                        fontSize:
                                            fontSize(14),

                                        marginTop:
                                            spacing(10)
                                    }
                                ]}
                            >
                                {gameState.reason ===
                                "checkmate"
                                    ? "Checkmate"
                                    : gameState.reason ===
                                      "surrender"
                                        ? "Resignation"
                                        : gameState.reason ===
                                          "timeout"
                                            ? "Time expired"
                                            : gameState.reason ===
                                              "disconnect"
                                                ? "Opponent disconnected"
                                                : gameState.reason ===
                                                  "stalemate"
                                                    ? "Stalemate"
                                                    : gameState.reason ===
                                                      "abort"
                                                        ? "Game aborted"
                                                        : ""}
                            </Text>
                        )}

                        <Pressable
                            style={[
                                styles.actionButton,
                                {
                                    width:
                                        "100%",

                                    marginTop:
                                        spacing(25),

                                    paddingVertical:
                                        spacing(9),

                                    borderRadius:
                                        spacing(7)
                                }
                            ]}
                            onPress={() =>
                                router.replace(
                                    "/games"
                                )
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
                </View>
            ) : (
                <View
                    style={
                        styles.gameContent
                    }
                >
                    {gameState.side === "w" ? (
                        <>
                            <PlayerCard
                                side="b"
                                gameState={gameState}
                                matchState={matchState}
                                playerImage={playerImages.black}
                                playerName={gameState.blackName}
                                playerCountry={gameState.blackCountry}
                                clock={blackClock}
                                isYou={blackIsYou}
                                isWinner={blackIsWinner}
                                spacing={spacing}
                                fontSize={fontSize}
                            />

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
                                    playerColor={gameState.side}
                                    onMove={handleMove}
                                    incomingFen={gameState.fen}
                                    disabled={matchState !== "playing"}
                                />
                            </View>

                            <PlayerCard
                                side="w"
                                gameState={gameState}
                                matchState={matchState}
                                playerImage={playerImages.white}
                                playerName={gameState.whiteName}
                                playerCountry={gameState.whiteCountry}
                                clock={whiteClock}
                                isYou={whiteIsYou}
                                isWinner={whiteIsWinner}
                                spacing={spacing}
                                fontSize={fontSize}
                            />
                        </>
                    ) : (
                        <>
                            <PlayerCard
                                side="w"
                                gameState={gameState}
                                matchState={matchState}
                                playerImage={playerImages.white}
                                playerName={gameState.whiteName}
                                playerCountry={gameState.whiteCountry}
                                clock={whiteClock}
                                isYou={whiteIsYou}
                                isWinner={whiteIsWinner}
                                spacing={spacing}
                                fontSize={fontSize}
                            />

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
                                    playerColor={gameState.side}
                                    onMove={handleMove}
                                    incomingFen={gameState.fen}
                                    disabled={matchState !== "playing"}
                                />
                            </View>

                            <PlayerCard
                                side="b"
                                gameState={gameState}
                                matchState={matchState}
                                playerImage={playerImages.black}
                                playerName={gameState.blackName}
                                playerCountry={gameState.blackCountry}
                                clock={blackClock}
                                isYou={blackIsYou}
                                isWinner={blackIsWinner}
                                spacing={spacing}
                                fontSize={fontSize}
                            />
                        </>
                    )}

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
                            onPress={
                                leaveGame
                            }
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

    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    countryRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        backgroundColor: "#dddddd",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },

    avatarImage: {
        resizeMode: "cover",
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

    countryText: {
        color: "#777777",
    },

    trophy: {
        color: "#ffffff",
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

    resultCard: {
        width: "92%",
        maxWidth: 420,
        backgroundColor: "#262522",
        borderWidth: 1,
        borderColor: "#006A4E",
        borderRadius: 14,
        padding: 25,
        alignItems: "center",
    },

    gameOverTitle: {
        color: "#ffffff",
        fontWeight: "bold",
        textAlign: "center",
    },

    reasonText: {
        color: "#999999",
        textAlign: "center",
    },

    serverError: {
        color: "#ffffff",
        fontSize: 18,
    },
});