import { useState } from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
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
    K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
    k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

const files = "abcdefgh";

function indexToSquare(index) {
    return `${files[index % 8]}${8 - Math.floor(index / 8)}`;
}

function squareToIndex(square) {
    return (8 - Number(square[1])) * 8 + files.indexOf(square[0]);
}

export default function ChessBoard({
    playerColor = "w",
    onMove,
    disabled = false,
    selfPlay=false,
    changeBoardTurn
}) {
    const { width } = useWindowDimensions();
    const boardSize = Math.min(width - 24, 480);
    const squareSize = boardSize / 8;

    const [board, setBoard] = useState(initialBoard);
    const [selected, setSelected] = useState(null);
    const [turn, setTurn] = useState("w");
    const [fen, setFen] = useState("start");

    function handlePress(index) {
        if(selfPlay){
            if ( disabled) return;
        }else {
            if ( disabled || turn !== playerColor) return;
        }


        const piece = board[index];

        if (selected === null) {
            if (selfPlay || (piece && (piece === piece.toUpperCase() ? "w" : "b") === turn)) {
                setSelected(index);
            }
            return;
        }

        if (selected === index) {
            setSelected(null);
            return;
        }

        const game = new Chess(fen === "start" ? undefined : fen);

        try {
            const move = game.move({
                from: indexToSquare(selected),
                to: indexToSquare(index),
                promotion: "q",
            });

            if (!move) {
                setSelected(
                    piece &&
                    (piece === piece.toUpperCase() ? "w" : "b") === turn
                        ? index
                        : null
                );
                return;
            }

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

            setBoard(nextBoard);
            setFen(game.fen());
            setTurn(game.turn());
            setSelected(null);

            if(changeBoardTurn){
                changeBoardTurn(game.turn());

            }
            onMove?.({
                from: move.from,
                to: move.to,
                promotion: move.promotion,
                san: move.san,
                fen: game.fen(),
            });
        } catch {
            setSelected(null);
        }
    }

    return (
        <View style={[styles.board, { width: boardSize, height: boardSize }]}>
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
                                    { fontSize: squareSize * 0.76 },
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