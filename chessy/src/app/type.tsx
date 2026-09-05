export type PieceColor =
  | "white"
  | "black";

export type PieceType =
  | "pawn"
  | "knight"
  | "bishop"
  | "rook"
  | "queen"
  | "king";

export type ChessPiece = {
  type: PieceType;
  color: PieceColor;
};

export type Square = {
  row: number;
  col: number;
};

export type ChessMove = {
  from: Square;
  to: Square;

  promotion?: PieceType;

  captured?: ChessPiece;
};

export type GameStatus =
  | "waiting"
  | "playing"
  | "check"
  | "checkmate"
  | "draw"
  | "resigned"
  | "finished";