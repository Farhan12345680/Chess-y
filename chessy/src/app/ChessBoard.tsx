import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { styles } from "./style";

type ChessBoardProps = {
  board: string[][];
  onSquarePress?: (row: number, col: number) => void;
};

export default function ChessBoard({
  board,
  onSquarePress,
}: ChessBoardProps) {

  return (
    <View style={styles.chessBoard}>

      {board.map((row, rowIndex) => (

        <View
          key={rowIndex}
          style={styles.chessRow}
        >

          {row.map((piece, colIndex) => {

            const isLight =
              (rowIndex + colIndex) % 2 === 0;

            return (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.chessSquare,

                  isLight
                    ? styles.lightSquare
                    : styles.darkSquare,
                ]}
                onPress={() =>
                  onSquarePress?.(
                    rowIndex,
                    colIndex
                  )
                }
              >

                <Text style={styles.chessPiece}>
                  {piece}
                </Text>

              </TouchableOpacity>
            );

          })}

        </View>

      ))}

    </View>
  );
}