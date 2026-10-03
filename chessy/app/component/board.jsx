import { useEffect, useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    useWindowDimensions
} from "react-native";
import { Chess } from "chess.js";

const initialBoard = [
    "r", "n", "b", "q", "k", "b", "n", "r",
    "p", "p", "p", "p", "p", "p", "p", "p",
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    "P", "P", "P", "P", "P", "P", "P", "P",
    "R", "N", "B", "Q", "K", "B", "N", "R",
];

const pieceSymbols = {
    K: "♔",
    Q: "♕",
    R: "♖",
    B: "♗",
    N: "♘",
    P: "♙",
    k: "♚",
    q: "♛",
    r: "♜",
    b: "♝",
    n: "♞",
    p: "♟",
};

const files = "abcdefgh";

function indexToSquare(index) {
    return `${files[index % 8]}${8 - Math.floor(index / 8)}`;
}

function boardFromFen(fen) {
    const game = new Chess(fen);
    const nextBoard = Array(64).fill(null);

    game.board().forEach((row, rowIndex) => {
        row.forEach((square, colIndex) => {
            if (square) {
                nextBoard[rowIndex * 8 + colIndex] =
                    square.color === "w"
                        ? square.type.toUpperCase()
                        : square.type;
            }
        });
    });

    return nextBoard;
}

export default function ChessBoard({
    playerColor = "w",
    onMove,
    disabled = false,
    selfPlay = false,
    changeBoardTurn,
    incomingFen = "start",
}) {
    const { width } = useWindowDimensions();

    const boardSize = Math.min(width - 24, 480);
    const squareSize = boardSize / 8;

    const [board, setBoard] = useState(initialBoard);
    const [selected, setSelected] = useState(null);
    const [turn, setTurn] = useState("w");
    const [fen, setFen] = useState("start");

    useEffect(() => {
        if (!incomingFen) {
            return;
        }

        if (incomingFen === "start") {
            setBoard(initialBoard);
            setFen("start");
            setTurn("w");
            setSelected(null);

            if (changeBoardTurn) {
                changeBoardTurn("w");
            }

            return;
        }

        try {
            const game = new Chess(incomingFen);

            setBoard(boardFromFen(incomingFen));
            setFen(incomingFen);
            setTurn(game.turn());
            setSelected(null);

            if (changeBoardTurn) {
                changeBoardTurn(game.turn());
            }
        } catch {
            setSelected(null);
        }
    }, [incomingFen]);

    function handlePress(index) {
        if (disabled) {
            return;
        }

        if (!selfPlay && turn !== playerColor) {
            return;
        }

        const piece = board[index];

        if (selected === null) {
            if (!piece) {
                return;
            }

            const pieceColor =
                piece === piece.toUpperCase()
                    ? "w"
                    : "b";

            if (selfPlay || pieceColor === turn) {
                setSelected(index);
            }

            return;
        }

        if (selected === index) {
            setSelected(null);
            return;
        }

        const game = new Chess(
            fen === "start" ? undefined : fen
        );

        try {
            const move = game.move({
                from: indexToSquare(selected),
                to: indexToSquare(index),
                promotion: "q",
            });

            if (!move) {
                const pieceColor =
                    piece === piece?.toUpperCase()
                        ? "w"
                        : "b";

                if (
                    piece &&
                    (selfPlay || pieceColor === turn)
                ) {
                    setSelected(index);
                } else {
                    setSelected(null);
                }

                return;
            }

            setSelected(null);

            onMove?.({
                from: move.from,
                to: move.to,
                promotion: move.promotion,
            });
        } catch {
            setSelected(null);
        }
    }

    return (
        <View
            style={[
                styles.board,
                {
                    width: boardSize,
                    height: boardSize,
                },
            ]}
        >
            {board.map((piece, index) => {
                const row = Math.floor(index / 8);
                const col = index % 8;
                const light = (row + col) % 2 === 0;

                return (
                    <Pressable
                        key={index}
                        onPress={() => handlePress(index)}
                        style={[
                            styles.square,
                            {
                                width: squareSize,
                                height: squareSize,
                                backgroundColor:
                                    selected === index
                                        ? "#829769"
                                        : light
                                            ? "#eeeed2"
                                            : "#769656",
                            },
                        ]}
                    >
                        {piece && (
                            <Text
                                style={[
                                    styles.piece,
                                    {
                                        fontSize:
                                            squareSize * 0.76,
                                    },
                                ]}
                            >
                                {pieceSymbols[piece]}
                            </Text>
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    board: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignSelf: "center",
    },

    square: {
        justifyContent: "center",
        alignItems: "center",
    },

    piece: {
        includeFontPadding: false,
        textAlign: "center",
    },
});
