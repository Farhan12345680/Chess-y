"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_http_1 = __importDefault(require("node:http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const ws_1 = require("ws");
const moveGeneratorPool_js_1 = require("./moveGeneratorPool.js");
const node_os_1 = __importDefault(require("node:os"));
const app = (0, express_1.default)();
const httpServer = node_http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({
    server: httpServer
});
const pool = new pg_1.Pool({
    user: "postgres",
    password: "password",
    host: "localhost",
    port: 5432,
    database: "mydb"
});
const moveGenerator = new moveGeneratorPool_js_1.MoveGeneratorPool(Math.max(1, node_os_1.default.cpus().length - 1));
const PORT = 3000;
const MOVE_RECONNECT_TIME = 30_000;
const ELO_K = 32;
const DEFAULT_ELO = 1200;
const TIME_CONTROLS = [
    "10+0",
    "5+0",
    "3+0"
];
const gamesMap = new Map();
const userGameMap = new Map();
const pendingByUser = new Map();
const socketUserMap = new Map();
const socketNameMap = new Map();
const userSocketMap = new Map();
const competitionRange = {};
for (const timeControl of TIME_CONTROLS) {
    competitionRange[timeControl] = [];
    for (let i = 1; i <= 100; i++) {
        competitionRange[timeControl].push({
            elo: i * 50,
            arrays: []
        });
    }
}
class PendingRequestGameClass {
    socket;
    gameTime;
    name;
    userId;
    bucket;
    constructor(socket, gameTime, name, userId, bucket) {
        this.socket = socket;
        this.gameTime = gameTime;
        this.name = name;
        this.userId = userId;
        this.bucket = bucket;
    }
}
class GameClass {
    gameId;
    player1Id;
    player2Id;
    player1Name;
    player2Name;
    player1Color;
    sideArray = [
        undefined,
        undefined
    ];
    sideUsers = ["", ""];
    sideNames = ["", ""];
    sideToMove = 0;
    plyMoveCount = 0;
    lastTime;
    sideTimeRemaining;
    timeAndIncrement;
    moves = "";
    moveHistory = [];
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    positionCounts = new Map();
    processingMove = false;
    status = "playing";
    drawOfferBy = null;
    reconnectTimers = [undefined, undefined];
    clockInterval;
    ended = false;
    constructor(socketServer1, gameTime, socketServer2, player1Id, player2Id, player1Name, player2Name, gameId) {
        this.gameId = gameId;
        this.player1Id = player1Id;
        this.player2Id = player2Id;
        this.player1Name = player1Name;
        this.player2Name = player2Name;
        this.lastTime = Date.now();
        this.timeAndIncrement = gameTime
            .split("+")
            .map(Number);
        this.timeAndIncrement[0] =
            this.timeAndIncrement[0] * 60 * 1000;
        this.timeAndIncrement[1] =
            this.timeAndIncrement[1] * 1000;
        this.sideTimeRemaining = [
            this.timeAndIncrement[0],
            this.timeAndIncrement[0]
        ];
        const player1IsWhite = Math.random() < 0.5;
        this.player1Color =
            player1IsWhite ? "W" : "B";
        if (player1IsWhite) {
            this.sideArray[0] = socketServer1;
            this.sideArray[1] = socketServer2;
            this.sideUsers[0] = player1Id;
            this.sideUsers[1] = player2Id;
            this.sideNames[0] = player1Name;
            this.sideNames[1] = player2Name;
        }
        else {
            this.sideArray[0] = socketServer2;
            this.sideArray[1] = socketServer1;
            this.sideUsers[0] = player2Id;
            this.sideUsers[1] = player1Id;
            this.sideNames[0] = player2Name;
            this.sideNames[1] = player1Name;
        }
        this.positionCounts.set(this.positionKey(this.fen), 1);
        this.attachSocket(0, this.sideArray[0]);
        this.attachSocket(1, this.sideArray[1]);
        this.clockInterval = setInterval(() => this.checkClock(), 100);
    }
    positionKey(fen) {
        return fen
            .split(" ")
            .slice(0, 4)
            .join(" ");
    }
    sideForSocket(socket) {
        if (this.sideArray[0] === socket) {
            return 0;
        }
        if (this.sideArray[1] === socket) {
            return 1;
        }
        return -1;
    }
    send(side, object) {
        const socket = this.sideArray[side];
        if (socket &&
            socket.readyState === ws_1.WebSocket.OPEN) {
            socket.send(JSON.stringify(object));
        }
    }
    broadcast(object) {
        this.send(0, object);
        this.send(1, object);
    }
    attachSocket(side, socket) {
        this.sideArray[side] = socket;
        socket.on("message", async (message) => {
            let jsonObject;
            try {
                jsonObject = JSON.parse(message.toString());
            }
            catch {
                socket.send(JSON.stringify({
                    type: "error",
                    message: "Invalid JSON"
                }));
                return;
            }
            if (jsonObject.cmdType === "move") {
                await this.playMove(socket, jsonObject.move);
                return;
            }
            if (jsonObject.cmdType === "surrender") {
                const socketSide = this.sideForSocket(socket);
                if (socketSide !== -1) {
                    await this.finishGame("surrender", 1 - socketSide);
                }
                return;
            }
            if (jsonObject.cmdType === "offerDraw") {
                this.offerDraw(socket);
                return;
            }
            if (jsonObject.cmdType === "acceptDraw") {
                this.acceptDraw(socket);
                return;
            }
            if (jsonObject.cmdType === "declineDraw") {
                this.declineDraw(socket);
                return;
            }
            if (jsonObject.cmdType === "getState") {
                this.sendState(socket);
            }
        });
        socket.on("close", () => {
            if (this.sideArray[side] !== socket) {
                return;
            }
            this.sideArray[side] = undefined;
            if (this.ended) {
                return;
            }
            this.broadcast({
                type: "opponentDisconnected",
                side,
                reconnectTime: MOVE_RECONNECT_TIME
            });
            this.reconnectTimers[side] =
                setTimeout(() => {
                    if (this.ended ||
                        this.sideArray[side] !==
                            undefined) {
                        return;
                    }
                    if (this.plyMoveCount === 0) {
                        this.finishGame("abort", null);
                    }
                    else {
                        this.finishGame("surrender", 1 - side);
                    }
                }, MOVE_RECONNECT_TIME);
        });
    }
    reconnectSocket(userId, socket) {
        const side = this.sideUsers.indexOf(userId);
        if (side === -1) {
            return false;
        }
        if (this.reconnectTimers[side]) {
            clearTimeout(this.reconnectTimers[side]);
            this.reconnectTimers[side] =
                undefined;
        }
        this.sideArray[side] = socket;
        this.attachSocket(side, socket);
        this.sendState(socket);
        this.broadcast({
            type: "opponentReconnected",
            side
        });
        return true;
    }
    sendState(socket) {
        const side = this.sideForSocket(socket);
        this.send(side, {
            type: "gameState",
            gameID: this.gameId,
            side,
            sideToMove: this.sideToMove,
            fen: this.fen,
            moves: this.moves,
            moveHistory: this.moveHistory,
            sideTimeRemaining: this.getCurrentClockTimes(),
            players: {
                white: {
                    userId: this.sideUsers[0],
                    name: this.sideNames[0]
                },
                black: {
                    userId: this.sideUsers[1],
                    name: this.sideNames[1]
                }
            },
            status: this.status
        });
    }
    getCurrentClockTimes() {
        const result = [
            this.sideTimeRemaining[0],
            this.sideTimeRemaining[1]
        ];
        if (this.status === "playing") {
            const elapsed = Date.now() - this.lastTime;
            result[this.sideToMove] -=
                elapsed;
        }
        return [
            Math.max(0, result[0]),
            Math.max(0, result[1])
        ];
    }
    checkClock() {
        if (this.ended ||
            this.status !== "playing" ||
            this.processingMove) {
            return;
        }
        const elapsed = Date.now() - this.lastTime;
        if (this.sideTimeRemaining[this.sideToMove] - elapsed <= 0) {
            this.sideTimeRemaining[this.sideToMove] = 0;
            this.finishGame("timeout", 1 - this.sideToMove);
            return;
        }
        this.broadcast({
            type: "clock",
            sideTimeRemaining: this.getCurrentClockTimes(),
            sideToMove: this.sideToMove
        });
    }
    async playMove(socket, move) {
        if (this.ended ||
            this.status !== "playing") {
            return;
        }
        const side = this.sideForSocket(socket);
        if (side === -1) {
            return;
        }
        if (side !== this.sideToMove) {
            socket.send(JSON.stringify({
                type: "error",
                message: "Not your turn"
            }));
            return;
        }
        if (this.processingMove) {
            return;
        }
        this.processingMove = true;
        try {
            const validation = await moveGenerator.validate({
                fen: this.fen,
                move
            });
            if (this.ended ||
                this.status !== "playing") {
                return;
            }
            const now = Date.now();
            const elapsed = now - this.lastTime;
            this.sideTimeRemaining[side] -= elapsed;
            if (this.sideTimeRemaining[side] <= 0) {
                this.sideTimeRemaining[side] = 0;
                await this.finishGame("timeout", 1 - side);
                return;
            }
            if (!validation.valid ||
                !validation.fen ||
                !validation.san ||
                !validation.uci) {
                socket.send(JSON.stringify({
                    type: "illegalMove",
                    move,
                    legalMoves: validation.legalMoves ?? []
                }));
                return;
            }
            this.fen = validation.fen;
            this.moveHistory.push(validation.uci);
            const moveNumber = Math.floor(this.plyMoveCount / 2) + 1;
            if (side === 0) {
                this.moves +=
                    `${moveNumber}. ${validation.san} `;
            }
            else {
                this.moves +=
                    `${validation.san} `;
            }
            this.plyMoveCount++;
            this.sideTimeRemaining[side] +=
                this.timeAndIncrement[1];
            this.sideToMove = 1 - side;
            this.lastTime = now;
            const key = this.positionKey(this.fen);
            const count = (this.positionCounts.get(key) ??
                0) + 1;
            this.positionCounts.set(key, count);
            this.broadcast({
                type: "move",
                message: "play move",
                gameID: this.gameId,
                side,
                move: validation.uci,
                san: validation.san,
                fen: this.fen,
                sideToMove: this.sideToMove,
                sideTimeRemaining: this.getCurrentClockTimes()
            });
            if (count >= 3) {
                await this.finishGame("threefold", null);
                return;
            }
            if (validation.status ===
                "checkmate") {
                await this.finishGame("checkmate", side);
                return;
            }
            if (validation.status ===
                "stalemate" ||
                validation.status ===
                    "insufficientMaterial" ||
                validation.status ===
                    "fiftyMove") {
                const status = validation.status ===
                    "fiftyMove"
                    ? "fiftyMove"
                    : validation.status;
                await this.finishGame(status, null);
                return;
            }
        }
        finally {
            this.processingMove = false;
        }
    }
    offerDraw(socket) {
        if (this.ended ||
            this.status !== "playing") {
            return;
        }
        const side = this.sideForSocket(socket);
        if (side === -1) {
            return;
        }
        this.drawOfferBy = side;
        this.send(1 - side, {
            type: "drawOffer"
        });
    }
    acceptDraw(socket) {
        if (this.ended ||
            this.drawOfferBy === null) {
            return;
        }
        const side = this.sideForSocket(socket);
        if (side === -1) {
            return;
        }
        if (side === this.drawOfferBy) {
            return;
        }
        this.finishGame("drawAgreement", null);
    }
    declineDraw(socket) {
        if (this.drawOfferBy === null) {
            return;
        }
        const side = this.sideForSocket(socket);
        if (side === -1) {
            return;
        }
        if (side !== this.drawOfferBy) {
            return;
        }
        this.drawOfferBy = null;
        this.broadcast({
            type: "drawDeclined"
        });
    }
    resultString() {
        if (this.status === "checkmate" ||
            this.status === "surrender" ||
            this.status === "timeout") {
            const winner = this.getWinnerUserId();
            if (winner ===
                this.sideUsers[0]) {
                return "1-0";
            }
            return "0-1";
        }
        if (this.status === "stalemate" ||
            this.status ===
                "insufficientMaterial" ||
            this.status === "fiftyMove" ||
            this.status === "threefold" ||
            this.status === "drawAgreement") {
            return "1/2-1/2";
        }
        return "*";
    }
    getWinnerUserId() {
        if (this.status === "abort") {
            return null;
        }
        if (this.status === "checkmate") {
            return this.sideUsers[1 - this.sideToMove];
        }
        if (this.status === "timeout" ||
            this.status === "surrender") {
            return this.winnerSideOverride;
        }
        return null;
    }
    winnerSideOverride = null;
    async finishGame(status, winnerSide) {
        if (this.ended) {
            return;
        }
        this.ended = true;
        this.status = status;
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
        if (winnerSide === null) {
            this.winnerSideOverride = null;
        }
        else {
            this.winnerSideOverride =
                this.sideUsers[winnerSide];
        }
        this.moves =
            `${this.moves.trim()} ${this.resultString()}`.trim();
        const winnerUserId = this.getWinnerUserId();
        this.broadcast({
            type: "gameOver",
            gameID: this.gameId,
            result: this.resultString(),
            winner: winnerUserId,
            reason: status,
            fen: this.fen,
            moves: this.moves,
            moveHistory: this.moveHistory,
            sideTimeRemaining: this.getCurrentClockTimes()
        });
        await this.addGameToDatabase();
    }
    async addGameToDatabase() {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const winner = this.getWinnerUserId();
            await client.query(`
        INSERT INTO CHESS_GAMES
        (
          game_id,
          player1,
          player2,
          pgn_game_string,
          time_interval,
          game_winner,
          player1_color
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )
        `, [
                this.gameId,
                this.player1Id,
                this.player2Id,
                this.moves.slice(0, 2000),
                this.getTimeControlString(),
                winner,
                this.player1Color
            ]);
            const shouldUpdateElo = this.status !== "abort" &&
                this.plyMoveCount > 0;
            if (shouldUpdateElo) {
                await this.updateElo(client, winner);
            }
            await client.query("COMMIT");
        }
        catch (error) {
            await client.query("ROLLBACK");
            console.error("Game database error:", error);
        }
        finally {
            client.release();
            gamesMap.delete(this.gameId);
            userGameMap.delete(this.player1Id);
            userGameMap.delete(this.player2Id);
        }
    }
    getTimeControlString() {
        return (`${this.timeAndIncrement[0] / 60000}` +
            `+` +
            `${this.timeAndIncrement[1] / 1000}`);
    }
    async updateElo(client, winner) {
        const result = winner === null
            ? 0.5
            : winner === this.player1Id
                ? 1
                : 0;
        const query = await client.query(`
        SELECT user_id, gameElo
        FROM USER_GAME_ELO
        WHERE user_id IN ($1, $2)
          AND timeFrame = $3
        FOR UPDATE
        `, [
            this.player1Id,
            this.player2Id,
            this.getTimeControlString()
        ]);
        const eloMap = new Map();
        for (const row of query.rows) {
            eloMap.set(row.user_id, Number(row.gameelo));
        }
        const rating1 = eloMap.get(this.player1Id) || DEFAULT_ELO;
        const rating2 = eloMap.get(this.player2Id) || DEFAULT_ELO;
        const expected1 = 1 /
            (1 +
                Math.pow(10, (rating2 - rating1) / 400));
        const expected2 = 1 -
            expected1;
        const score1 = result;
        const score2 = winner === null
            ? 0.5
            : 1 - result;
        const newRating1 = Math.round(rating1 +
            ELO_K *
                (score1 - expected1));
        const newRating2 = Math.round(rating2 +
            ELO_K *
                (score2 - expected2));
        await client.query(`
      UPDATE USER_GAME_ELO
      SET gameElo = $1
      WHERE user_id = $2
        AND timeFrame = $3
      `, [
            newRating1,
            this.player1Id,
            this.getTimeControlString()
        ]);
        await client.query(`
      UPDATE USER_GAME_ELO
      SET gameElo = $1
      WHERE user_id = $2
        AND timeFrame = $3
      `, [
            newRating2,
            this.player2Id,
            this.getTimeControlString()
        ]);
    }
}
function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) {
        return cookies;
    }
    for (const part of cookieHeader.split(";")) {
        const index = part.indexOf("=");
        if (index === -1) {
            continue;
        }
        const key = part.slice(0, index).trim();
        const value = part.slice(index + 1).trim();
        cookies[key] =
            decodeURIComponent(value);
    }
    return cookies;
}
async function authenticateWebSocket(socket, request) {
    const cookies = parseCookies(request.headers.cookie);
    const sessionId = cookies.sessionId;
    if (!sessionId) {
        socket.close(1008, "Unauthorized");
        return null;
    }
    const result = await pool.query(`
      SELECT
        SESSIONS.user_id,
        USERS.name,
        SESSIONS.created_at,
        SESSIONS.session_duration
      FROM SESSIONS
      INNER JOIN USERS
        ON USERS.user_id = SESSIONS.user_id
      WHERE SESSIONS.session_id = $1
      `, [sessionId]);
    if (result.rows.length === 0) {
        socket.close(1008, "Invalid session");
        return null;
    }
    const session = result.rows[0];
    const expires = session.created_at.getTime() +
        Number(session.session_duration);
    if (Date.now() >= expires) {
        await pool.query(`
      DELETE FROM SESSIONS
      WHERE session_id = $1
      `, [sessionId]);
        socket.close(1008, "Session expired");
        return null;
    }
    return {
        userId: session.user_id,
        name: session.name
    };
}
function removePendingUser(userId) {
    const pending = pendingByUser.get(userId);
    if (!pending) {
        return;
    }
    const buckets = competitionRange[pending.gameTime];
    if (buckets) {
        const array = buckets[pending.bucket]
            .arrays;
        const index = array.indexOf(pending);
        if (index !== -1) {
            array.splice(index, 1);
        }
    }
    pendingByUser.delete(userId);
}
async function getUserElo(userId, timeControl) {
    const result = await pool.query(`
      SELECT gameElo
      FROM USER_GAME_ELO
      WHERE user_id = $1
        AND timeFrame = $2
      `, [
        userId,
        timeControl
    ]);
    if (result.rows.length === 0) {
        return DEFAULT_ELO;
    }
    const elo = Number(result.rows[0].gameelo);
    return elo > 0
        ? elo
        : DEFAULT_ELO;
}
function findBucket(timeControl, elo) {
    const buckets = competitionRange[timeControl];
    const target = Math.min(99, Math.max(0, Math.floor(elo / 50)));
    for (let distance = 0; distance < 100; distance++) {
        const lower = target - distance;
        const upper = target + distance;
        if (lower >= 0 &&
            buckets[lower].arrays.length > 0) {
            return lower;
        }
        if (upper < 100 &&
            buckets[upper].arrays.length > 0) {
            return upper;
        }
    }
    return -1;
}
async function requestNewGame(jsonObject, socket) {
    const userId = socketUserMapGet(socket);
    if (!userId) {
        return;
    }
    const userName = socketNameMap.get(socket);
    if (!userName) {
        return;
    }
    if (userGameMap.has(userId)) {
        socket.send(JSON.stringify({
            type: "error",
            message: "You are already in a game"
        }));
        return;
    }
    if (pendingByUser.has(userId)) {
        socket.send(JSON.stringify({
            type: "error",
            message: "You are already matchmaking"
        }));
        return;
    }
    const timeControl = jsonObject?.body?.timeControl;
    if (!TIME_CONTROLS.includes(timeControl)) {
        socket.send(JSON.stringify({
            type: "error",
            message: "Invalid time control"
        }));
        return;
    }
    const elo = await getUserElo(userId, timeControl);
    const bucket = findBucket(timeControl, elo);
    if (bucket !== -1) {
        const pending = competitionRange[timeControl][bucket]
            .arrays.shift();
        if (!pending) {
            return;
        }
        pendingByUser.delete(pending.userId);
        if (pending.socket.readyState !==
            ws_1.WebSocket.OPEN) {
            return requestNewGame(jsonObject, socket);
        }
        const gameId = node_crypto_1.default.randomUUID();
        const newGame = new GameClass(pending.socket, timeControl, socket, pending.userId, userId, pending.name, userName, gameId);
        gamesMap.set(gameId, newGame);
        userGameMap.set(pending.userId, newGame);
        userGameMap.set(userId, newGame);
        newGame.sendGameStart();
        return;
    }
    const bucketForPlayer = Math.min(99, Math.max(0, Math.floor(elo / 50)));
    const pending = new PendingRequestGameClass(socket, timeControl, userName, userId, bucketForPlayer);
    competitionRange[timeControl][bucketForPlayer]
        .arrays.push(pending);
    pendingByUser.set(userId, pending);
    socket.send(JSON.stringify({
        type: "waiting",
        timeControl,
        elo
    }));
}
function socketUserMapGet(socket) {
    return socketUserMap.get(socket);
}
async function checkSession(req, res, next) {
    if (req.cookies.sessionId === undefined) {
        res.status(200).send({
            type: "redirect",
            message: "no session found do redirect"
        });
        return;
    }
    const sessionID = req.cookies.sessionId;
    try {
        const rows = await pool.query(`
        SELECT *
        FROM SESSIONS
        WHERE session_id = $1
        `, [sessionID]);
        if (rows.rows.length === 0) {
            res.clearCookie("sessionId");
            res.status(200).send({
                type: "redirect",
                message: "Session expired | corrupt"
            });
            return;
        }
        const session = rows.rows[0];
        const expiration = session.created_at.getTime() +
            Number(session.session_duration);
        if (Date.now() >= expiration) {
            await pool.query(`
        DELETE FROM SESSIONS
        WHERE session_id = $1
        `, [sessionID]);
            res.clearCookie("sessionId");
            res.status(200).send({
                type: "redirect",
                message: "Session expired"
            });
            return;
        }
        req.user_id =
            session.user_id;
        await pool.query(`
      UPDATE USERS
      SET last_active_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      `, [req.user_id]);
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            type: "error",
            message: "Server Error"
        });
    }
}
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
app.post("/login", async (req, res) => {
    if (req.cookies.sessionId !==
        undefined) {
        res.clearCookie("sessionId");
        res.status(200).send({
            type: "redirect",
            message: "session found"
        });
        return;
    }
    const userName = req.body.name;
    const userPassword = req.body.password;
    try {
        const rows = await pool.query(`
          SELECT *
          FROM USERS
          WHERE name = $1
          `, [userName]);
        if (rows.rows.length === 0) {
            res.status(200).send({
                type: "notFound",
                message: "user not found"
            });
            return;
        }
        const comparison = await bcryptjs_1.default.compare(userPassword, rows.rows[0].password);
        if (!comparison) {
            res.status(200).send({
                type: "passwordWrong",
                message: "wrong password given"
            });
            return;
        }
        await pool.query(`
        DELETE FROM SESSIONS
        WHERE user_id = $1
        `, [rows.rows[0].user_id]);
        const sessionId = node_crypto_1.default
            .randomBytes(32)
            .toString("hex");
        await pool.query(`
        INSERT INTO SESSIONS
        (
          session_id,
          user_id,
          session_duration
        )
        VALUES
        (
          $1,
          $2,
          $3
        )
        `, [
            sessionId,
            rows.rows[0].user_id,
            60 * 60 * 1000
        ]);
        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 1000
        });
        res.status(200).send({
            type: "found",
            message: "user found"
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            type: "error",
            message: "Server Error"
        });
    }
});
app.post("/signup", async (req, res) => {
    if (req.cookies.sessionId !==
        undefined) {
        res.clearCookie("sessionId");
        res.status(200).send({
            type: "redirect",
            message: "session found"
        });
        return;
    }
    const userName = req.body.name;
    const userPassword = req.body.password;
    const country = req.body.country;
    if (typeof userName !== "string" ||
        typeof userPassword !==
            "string") {
        res.status(400).send({
            type: "error",
            message: "Invalid input"
        });
        return;
    }
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const rows = await client.query(`
          SELECT user_id
          FROM USERS
          WHERE name = $1
          `, [userName]);
        if (rows.rows.length !== 0) {
            await client.query("ROLLBACK");
            res.status(200).send({
                type: "exists",
                message: "name already exists"
            });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hash = await bcryptjs_1.default.hash(userPassword, salt);
        const userResult = await client.query(`
          INSERT INTO USERS
          (
            name,
            password,
            country,
            last_active_at
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4
          )
          RETURNING user_id
          `, [
            userName,
            hash,
            country,
            new Date()
        ]);
        const sessionId = node_crypto_1.default
            .randomBytes(32)
            .toString("hex");
        await client.query(`
        INSERT INTO SESSIONS
        (
          session_id,
          user_id,
          session_duration
        )
        VALUES
        (
          $1,
          $2,
          $3
        )
        `, [
            sessionId,
            userResult.rows[0]
                .user_id,
            60 * 60 * 1000
        ]);
        await client.query("COMMIT");
        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 1000
        });
        res.status(200).send({
            type: "created",
            message: "user created"
        });
    }
    catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).send({
            type: "error",
            message: "Server Error"
        });
    }
    finally {
        client.release();
    }
});
app.get("/getGames/:offset", checkSession, async (req, res) => {
    const userId = req.user_id;
    const offset = Math.max(0, Number(req.params.offset) || 0);
    try {
        const result = await pool.query(`
          SELECT *
          FROM CHESS_GAMES
          WHERE player1 = $1
             OR player2 = $1
          ORDER BY
            creation_time_stampz DESC
          LIMIT 30
          OFFSET $2
          `, [
            userId,
            offset * 30
        ]);
        return res.status(200)
            .send(result.rows);
    }
    catch (error) {
        console.error(error);
        return res.status(500)
            .send({
            type: "error",
            message: "Server Error"
        });
    }
});
app.get("/me", checkSession, async (req, res) => {
    try {
        const userResult = await pool.query(`
          SELECT
            user_id,
            name,
            country,
            account_created_at,
            last_active_at
          FROM USERS
          WHERE user_id = $1
          `, [req.user_id]);
        const eloResult = await pool.query(`
          SELECT
            timeFrame,
            gameElo
          FROM USER_GAME_ELO
          WHERE user_id = $1
          ORDER BY timeFrame
          `, [req.user_id]);
        return res.status(200)
            .send({
            user: userResult.rows[0],
            elo: eloResult.rows
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500)
            .send({
            type: "error",
            message: "Server Error"
        });
    }
});
app.post("/logout", checkSession, async (req, res) => {
    const sessionId = req.cookies.sessionId;
    await pool.query(`
      DELETE FROM SESSIONS
      WHERE session_id = $1
      `, [sessionId]);
    res.clearCookie("sessionId");
    return res.status(200)
        .send({
        type: "loggedOut"
    });
});
app.get("/", async (_req, res) => {
    try {
        const result = await pool.query(`
          SELECT COUNT(*)
          FROM information_schema.tables
          WHERE table_schema = 'public'
          `);
        res.status(200)
            .send(result.rows);
    }
    catch {
        res.status(500)
            .send({
            message: "Server error"
        });
    }
});
wss.on("connection", async (socket, request) => {
    try {
        const user = await authenticateWebSocket(socket, request);
        if (!user) {
            return;
        }
        socketUserMap.set(socket, user.userId);
        socketNameMap.set(socket, user.name);
        const oldSocket = userSocketMap.get(user.userId);
        if (oldSocket &&
            oldSocket !== socket) {
            oldSocket.close(4000, "Reconnected");
        }
        userSocketMap.set(user.userId, socket);
        const activeGame = userGameMap.get(user.userId);
        if (activeGame) {
            activeGame.reconnectSocket(user.userId, socket);
        }
        const pending = pendingByUser.get(user.userId);
        if (pending) {
            pending.socket =
                socket;
        }
        socket.on("message", async (message) => {
            let jsonObject;
            try {
                jsonObject =
                    JSON.parse(message.toString());
            }
            catch {
                socket.send(JSON.stringify({
                    type: "error",
                    message: "Invalid JSON"
                }));
                return;
            }
            switch (jsonObject.cmdType) {
                case "requestGame":
                    await requestNewGame(jsonObject, socket);
                    break;
                case "cancelGame": {
                    const userId = socketUserMap.get(socket);
                    if (userId) {
                        removePendingUser(userId);
                        socket.send(JSON.stringify({
                            type: "matchmakingCancelled"
                        }));
                    }
                    break;
                }
                default:
                    break;
            }
        });
        socket.on("close", () => {
            const userId = socketUserMap.get(socket);
            if (!userId) {
                return;
            }
            if (userSocketMap.get(userId) === socket) {
                userSocketMap.delete(userId);
            }
            socketUserMap.delete(socket);
            socketNameMap.delete(socket);
            removePendingUser(userId);
        });
    }
    catch (error) {
        console.error("WebSocket connection error:", error);
        socket.close(1011, "Server error");
    }
});
httpServer.listen(PORT, () => {
    console.log(`HTTP + WebSocket server running on ${PORT}`);
    console.log(`Move generator workers: ${Math.max(1, node_os_1.default.cpus().length - 1)}`);
});
async function shutdown() {
    console.log("Shutting down...");
    wss.close();
    httpServer.close();
    await moveGenerator.close();
    await pool.end();
    process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
