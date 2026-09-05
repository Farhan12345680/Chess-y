import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import ChessBoard from "./ChessBoard";

import { styles } from "./style";

const startingBoard = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],

  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],

  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
];

export default function GameScreen() {

  const handleSquarePress = (
    row: number,
    col: number
  ) => {

    console.log(
      "Square pressed:",
      row,
      col
    );

  };

  return (
    <View style={styles.gameScreen}>

      {/* Black player */}

      <View style={styles.gameHeader}>

        <View>
          <Text style={styles.playerName}>
            Stockfish
          </Text>

          <Text style={styles.playerRating}>
            Engine • 1800
          </Text>
        </View>

        <Text style={styles.timer}>
          09:42
        </Text>

      </View>

      {/* Board */}

      <ChessBoard
        board={startingBoard}
        onSquarePress={handleSquarePress}
      />

      {/* White player */}

      <View style={styles.gameHeader}>

        <View>
          <Text style={styles.playerName}>
            You
          </Text>

          <Text style={styles.playerRating}>
            1200
          </Text>
        </View>

        <Text style={styles.timer}>
          10:00
        </Text>

      </View>

      {/* Controls */}

      <View
        style={{
          paddingHorizontal: 20,
          gap: 10,
        }}
      >

        <TouchableOpacity
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            Resign
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            Offer Draw
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}