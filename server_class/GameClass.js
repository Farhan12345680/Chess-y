import { Chess } from "chess.js";
import { client } from "../server.js";

export default class GameClass {
    constructor(socketServer1, gameTime, socketServer2) {
        this.socket1 = socketServer1;
        this.socket2 = socketServer2;

        this.sideArray = [socketServer1, socketServer2];

        if (Math.random() < 0.5) {
            this.sideArray = [socketServer2, socketServer1];
        }

        this.sideToMove = 0;
        this.plyMoveCount = 0;
        this.moves = "";
        this.gameID = null;
        this.gameTime = gameTime;

        this.timeAndIncrement = gameTime.split("+");

        this.timeAndIncrement[0] =
            Number(this.timeAndIncrement[0]) * 60 * 1000;

        this.timeAndIncrement[1] =
            Number(this.timeAndIncrement[1]) * 1000;

        this.sideTimeRemaining = [
            this.timeAndIncrement[0],
            this.timeAndIncrement[0]
        ];

        this.lastTime = Date.now();

        this.gameEnded = false;
        this.started = false;

        this.chess = new Chess();

        this.winner = null;
        this.endReason = null;
    }

    startGame() {
        if (this.started || this.gameEnded) {
            return;
        }

        this.started = true;
        this.lastTime = Date.now();

        this.sendToBoth({
            type: "gameStart",
            gameID: this.gameID,
            gameType: this.gameTime,
            white: this.sideArray[0].userState.userID,
            black: this.sideArray[1].userState.userID,
            sideToMove: this.sideToMove,
            sideTimeRemaining: this.sideTimeRemaining
        });
    }

    sendToBoth(object) {
        const message = JSON.stringify(object);

        if (this.sideArray[0].readyState === 1) {
            this.sideArray[0].send(message);
        }

        if (this.sideArray[1].readyState === 1) {
            this.sideArray[1].send(message);
        }
    }

    sendToSide(side, object) {
        if (
            side >= 0 &&
            side <= 1 &&
            this.sideArray[side].readyState === 1
        ) {
            this.sideArray[side].send(JSON.stringify(object));
        }
    }

    resetSocketGameState() {
        for (const ws of this.sideArray) {
            ws.userState.GameObject = null;
            ws.userState.gameID = null;
            ws.userState.gameType = null;
            ws.userState.state = "idle";
        }
    }

    updateClock() {
        if (!this.started || this.gameEnded) {
            return true;
        }

        const currentTime = Date.now();

        const elapsedTime = currentTime - this.lastTime;

        this.sideTimeRemaining[this.sideToMove] -= elapsedTime;

        this.lastTime = currentTime;

        if (this.sideTimeRemaining[this.sideToMove] <= 0) {
            this.sideTimeRemaining[this.sideToMove] = 0;

            this.timeout(this.sideToMove);

            return false;
        }

        return true;
    }

    playMove(gameObject) {
        if (this.gameEnded || !this.started) {
            return false;
        }

        const side = Number(gameObject.side);
        const move = gameObject.move;

        if (side !== 0 && side !== 1) {
            return false;
        }

        if (typeof move !== "string" || move.length < 4) {
            this.sendToSide(side, {
                type: "moveRejected",
                message: "Invalid move format"
            });

            return false;
        }

        if (side !== this.sideToMove) {
            this.sendToSide(side, {
                type: "moveRejected",
                message: "It is not your turn"
            });

            return false;
        }

        if (!this.updateClock()) {
            return false;
        }

        const from = move.substring(0, 2);
        const to = move.substring(2, 4);

        let promotion = undefined;

        if (move.length >= 5) {
            promotion = move.substring(4, 5).toLowerCase();
        }

        let playedMove;

        try {
            playedMove = this.chess.move({
                from: from,
                to: to,
                promotion: promotion
            });
        } catch (error) {
            this.sendToSide(side, {
                type: "moveRejected",
                message: "Illegal move"
            });

            return false;
        }

        this.plyMoveCount++;

        this.moves +=
            this.plyMoveCount +
            ". " +
            side +
            " " +
            move +
            "|";

        this.sideTimeRemaining[side] +=
            this.timeAndIncrement[1];

        this.sideToMove = 1 - this.sideToMove;

        this.lastTime = Date.now();

        this.updateGame({
            side: side,
            move: move,
            san: playedMove.san,
            fen: this.chess.fen()
        });

        if (this.chess.isCheckmate()) {
            this.finishGame(side, "checkmate");
            return true;
        }

        if (this.chess.isStalemate()) {
            this.finishDraw("stalemate");
            return true;
        }

        if (this.chess.isInsufficientMaterial()) {
            this.finishDraw("insufficientMaterial");
            return true;
        }

        if (this.chess.isThreefoldRepetition()) {
            this.finishDraw("threefoldRepetition");
            return true;
        }

        if (this.chess.isDrawByFiftyMoves()) {
            this.finishDraw("fiftyMoveRule");
            return true;
        }

        return true;
    }

    updateGame(gameObject) {
        this.sendToBoth({
            type: "move",
            message: "play move",
            ...gameObject,
            sideToMove: this.sideToMove,
            sideTimeRemaining: this.sideTimeRemaining
        });
    }

    surrender(side) {
        if (this.gameEnded) {
            return;
        }

        side = Number(side);

        if (side !== 0 && side !== 1) {
            return;
        }

        this.gameEnded = true;

        this.winner = 1 - side;
        this.endReason = "surrender";

        this.sendToBoth({
            type: "surrender",
            message: "surrendered",
            winner: this.winner,
            loser: side,
            fen: this.chess.fen()
        });

        this.addGameToDatabase();

        this.resetSocketGameState();
    }

    timeout(side) {
        if (this.gameEnded) {
            return;
        }

        side = Number(side);

        if (side !== 0 && side !== 1) {
            return;
        }

        this.gameEnded = true;

        this.winner = 1 - side;
        this.endReason = "timeout";

        this.sendToBoth({
            type: "timeout",
            message: "time expired",
            winner: this.winner,
            loser: side,
            fen: this.chess.fen()
        });

        this.addGameToDatabase();

        this.resetSocketGameState();
    }

    finishGame(winner, reason) {
        if (this.gameEnded) {
            return;
        }

        this.gameEnded = true;

        this.winner = Number(winner);
        this.endReason = reason;

        this.sendToBoth({
            type: "gameOver",
            result: "win",
            reason: reason,
            winner: this.winner,
            loser: 1 - this.winner,
            fen: this.chess.fen(),
            pgn: this.chess.pgn()
        });

        this.addGameToDatabase();

        this.resetSocketGameState();
    }

    finishDraw(reason) {
        if (this.gameEnded) {
            return;
        }

        this.gameEnded = true;

        this.winner = null;
        this.endReason = reason;

        this.sendToBoth({
            type: "gameOver",
            result: "draw",
            reason: reason,
            winner: null,
            fen: this.chess.fen(),
            pgn: this.chess.pgn()
        });

        this.addGameToDatabase();

        this.resetSocketGameState();
    }

    handleDisconnect(ws) {
        if (this.gameEnded) {
            return;
        }

        const side = this.sideArray.indexOf(ws);

        if (side === -1) {
            return;
        }

        this.gameEnded = true;

        if (this.plyMoveCount === 0) {
            this.endReason = "abort";
            this.winner = null;

            this.sendToBoth({
                type: "abort",
                message: "game has been aborted"
            });
        } else {
            const winner = 1 - side;

            this.winner = winner;
            this.endReason = "disconnect";

            this.sendToBoth({
                type: "surrender",
                message: "game has been surrendered",
                winner: winner,
                loser: side,
                reason: "disconnect"
            });
        }

        this.addGameToDatabase();

        this.resetSocketGameState();
    }

    async addGameToDatabase() {
        try {
            const player1 =
                this.sideArray[0].userState.userID;

            const player2 =
                this.sideArray[1].userState.userID;

            let gameWinner = null;

            if (
                this.winner === 0 ||
                this.winner === 1
            ) {
                gameWinner =
                    this.sideArray[this.winner]
                        .userState.userID;
            }

            const pgn = this.chess.pgn();

            await client.query(
                `INSERT INTO CHESS_GAMES (
                    game_id,
                    player1,
                    player2,
                    pgn_game_string,
                    game_type,
                    time_interval,
                    game_winner,
                    player1_color
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8
                )`,
                [
                    this.gameID,
                    player1,
                    player2,
                    pgn,
                    this.gameTime,
                    this.gameTime,
                    gameWinner,
                    "W"
                ]
            );
        } catch (error) {
            console.log(
                "Error adding game to database:",
                error
            );
        }
    }
}