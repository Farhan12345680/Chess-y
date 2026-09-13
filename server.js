import express from "express";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import http from "http";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { WebSocketServer } from "ws";

//global Objects
const gamesMap = new Map();
const competitionRange = {};

competitionRange["10+0"] = [];
competitionRange["5+0"] = [];
competitionRange["3+2"] = [];

for (let i = 1; i <= 100; i++) {
    competitionRange["10+0"].push({
        elo: i * 50,
        arrays: []
    });
    competitionRange["5+0"].push({
        elo: i * 50,
        arrays: []
    });
    competitionRange["3+2"].push({
        elo: i * 50,
        arrays: []
    });
}

class GameClass {
    constructor(socketServer1, gameTime, socketServer2) {
        this.lastTime = new Date().getTime();
        this.sideToMove = 0;
        this.sideArray = [1, 2];
        const rand = (Math.random() * 100) % 2;
        this.sideArray[rand] = socketServer1;
        this.sideArray[1 - rand] = socketServer2;
        this.plyMoveCount = 0;

        this.sideArray.forEach((elem) => {
            elem.on("close", async () => {
                if (this.plyMoveCount == 0) {
                    const gameObject = {
                        type: "abort",
                        message: "game has been aborted"
                    };
                    this.sideArray[0].send(JSON.stringify(gameObject));
                    this.sideArray[1].send(JSON.stringify(gameObject));
                } else {
                    const gameObject = {
                        type: "surrender",
                        message: "game has been surrendered"
                    };
                    this.sideArray[0].send(JSON.stringify(gameObject));
                    this.sideArray[1].send(JSON.stringify(gameObject));
                }
            });

            elem.on("message", async (message) => {
                const jsonObject = JSON.parse(message);

                switch (jsonObject.cmdType) {
                    case "surrender":
                        const newObject = { type: "surrender", message: "surrendered" };
                        this.sideArray[0].send(JSON.stringify(newObject));
                        this.sideArray[1].send(JSON.stringify(newObject));
                        break;
                    case "move":
                        this.playMove({ side: jsonObject.side, move: jsonObject.move });
                        break;
                    default:
                        break;
                }
            });
        });

        this.timeAndIncrement = gameTime.split("+");
        this.timeAndIncrement[0] = Number(this.timeAndIncrement[0]) * 60 * 1000;
        this.timeAndIncrement[1] = Number(this.timeAndIncrement[1]) * 1000;

        this.moves = "";
        this.sideTimeRemaining = [this.timeAndIncrement[0], this.timeAndIncrement[0]];
    }

    playMove(gameObject) {
        const side = gameObject.side;
        const move = gameObject.move;

        if (side == this.sideToMove) {
            this.updateGame(gameObject);
            this.moves += this.plyMoveCount + ". " + side + " " + move + "|";
        }
    }

    updateGame(gameObject) {
        const newObject = { type: "move", message: "play move", ...gameObject };
        this.sideArray[0].send(JSON.stringify(newObject));
        this.sideArray[1].send(JSON.stringify(newObject));
    }

    async addGameToDatabase() {}
}

class PendingRequestGameClass {
    constructor(socketServer1, gameTime, name) {
        this.socket = socketServer1;
        this.gameTime = gameTime;
        this.name = name;
    }
}

//app middleware
const app = express();
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });

function requestNewGame(jsonObject, webSocketObject) {
    const eloRange = Math.floor(jsonObject.body.elo / 50);
    let range = false;
    for (let i = eloRange, j = eloRange; i > 0 || j <= 100; i--, j++) {
        if (i >= 1 && competitionRange[jsonObject.body.timeControl][i - 0].arrays.length != 0) {
            range = i;
            break;
        }
        if (j <= 100 && competitionRange[jsonObject.body.timeControl][j - 1].arrays.length != 0) {
            range = j;
            break;
        }
    }

    if (range !== false) {
        const pendingGame = competitionRange[jsonObject.body.timeControl][j - 1].arrays[0];
        competitionRange[jsonObject.body.timeControl][range - 1].arrays.shift();

        const newGameObject = new GameClass(pendingGame.socket, jsonObject.body.timeControl, webSocketObject);

        gamesMap.set(pendingGame.name + " " + jsonObject.body.name, newGameObject);

        newGameObject.sideArray[0].send(
            JSON.stringify({
                type: "gameStart",
                gameID: pendingGame.name + " " + jsonObject.body.name
            })
        );
        newGameObject.sideArray[1].send(
            JSON.stringify({
                type: "gameStart",
                gameID: pendingGame.name + " " + jsonObject.body.name
            })
        );

        return newGameObject;
    } else {
        const pendingGame = new PendingRequestGameClass(
            webSocketObject,
            jsonObject.body.timeControl,
            jsonObject.body.name
        );
        competitionRange[jsonObject.body.timeControl].arrays.push(pendingGame);

        return undefined;
    }
}

//web socket listening
wss.on("connection", (wss) => {
    wss.on("message", async (message) => {
        const jsonObject = JSON.parse(message);

        switch (jsonObject.cmdType) {
            case requestGame:
                requestNewGame(jsonObject, wss);
                break;
            default:
                break;
        }
    });
});

//app middle ware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

async function checkSession(req, res, next) {
    if (req.cookies.sessionId == undefined) {
        res.status(200).send({
            type: "redirect",
            message: "no session found do redirect"
        });

        return;
    }

    const sessionID = req.cookies.sessionId;

    try {
        const rows = await client.query("SELECT * from SESSIONS where session_id = $1", [sessionID]);

        if (rows.rows.length == 0) {
            res.clearCookie("sessionId");

            res.status(200).send({
                type: "redirect",
                message: "Session expired | corrupt"
            });
            return;
        } else {
            const currDate = new Date();

            if (currDate.getTime() - rows.rows[0].created_at.getTime() >= rows.rows[0].session_duration) {
                res.clearCookie("sessionId");

                res.status(200).send({
                    type: "redirect",
                    message: "Session expired"
                });
                await client.query("Delete from SESSIONS where session_id = $1", [sessionID]);
                return;
            }

            req.user_id = rows.rows[0].user_id;
            next();
        }
    } catch (error) {
        res.status(500).send({
            type: "error",
            message: "Server Error"
        });

        console.log(error);
    }
}

// app controllers

app.post("/login", async (req, res) => {
    if (req.cookies.sessionId !== undefined) {
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
        const rows = await client.query("Select * from USERS where name= $1", [userName]);

        if (rows.rows.length == 0) {
            res.status(200).send({
                type: "notFound",
                message: "user not found"
            });
            return;
        }

        const comparision = await bcrypt.compare(req.body.password, rows.rows[0].password);

        if (comparision == true) {
            const removeAllPrevSession = await client.query("DELETE FROM SESSIONS WHERE user_id = $1", [
                rows.rows[0].user_id
            ]);

            const sessionIdCreation = crypto.randomBytes(32).toString("hex");

            const newSession = await client.query(
                "INSERT INTO SESSIONS(session_id , user_id  , session_duration) values($1 , $2 , $3)",
                [sessionIdCreation, rows.rows[0].user_id, 60 * 60 * 1000]
            );

            res.cookie("sessionId", sessionIdCreation, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 60 * 60 * 1000
            });

            res.status(200).send({
                type: "found",
                message: "user found"
            });
        } else {
            res.status(200).send({
                type: "passwordWrong",
                message: "wrong password given"
            });

            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            type: "error",
            message: "Server Error"
        });
    }
});

app.post("/signup", async (req, res) => {
    if (req.cookies.sessionId !== undefined) {
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
    const chessElo = 0;

    const clientOnce = await client.connect();

    try {
        await client.query("BEGIN");
        const rows = await client.query("SELECT * FROM USERS WHERE name = $1", [userName]);
        if (rows.rows.length != 0) {
            await client.query("ROLLBACK");
            res.status(200).send({ type: "exists", message: "name already exists" });
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(userPassword, salt);
        const userResult = await client.query(
            `INSERT INTO USERS (name, password, country, last_active_at) VALUES ($1, $2, $3, $4) RETURNING user_id`,
            [userName, hash, country, new Date()]
        );

        const sessionIdCreation = crypto.randomBytes(32).toString("hex");
        await client.query(`INSERT INTO SESSIONS (session_id, user_id, session_duration) VALUES ($1, $2, $3)`, [
            sessionIdCreation,
            userResult.rows[0].user_id,
            60 * 60 * 1000
        ]);
        await client.query("COMMIT");
        res.cookie("sessionId", sessionIdCreation, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 1000
        });
        res.status(200).send({ type: "created", message: "user created" });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            type: "error",
            message: "Server Error"
        });
    } finally {
        clientOnce.release();
    }
});

app.get("/getGames/:offset", checkSession, async (req, res) => {
    const user_id = req.user_id;
    const upperLimit = Number(req.params.offset) || 0;

    try {
        const result = await client.query(
            `SELECT *
             FROM CHESS_GAMES
             WHERE player1 = $1 OR player2 = $1
             ORDER BY creation_time_stampz DESC
             LIMIT 30
             OFFSET $2`,
            [user_id, upperLimit * 30]
        );

        return res.status(200).send(result.rows);
    } catch (error) {
        console.log(error);

        return res.status(500).send({
            type: "error",
            message: "Server Error"
        });
    }
});

app.get("/me", checkSession, async (req, res) => {
    const result = await client.query(
        "SELECT * FROM USERS  inner join USER_GAME_ELO on USER_GAME_ELO.user_id = USERS.user_id WHERE user_id = $1",
        [req.user_id]
    );

    return res.status(200).send(result.rows[0]);
});

app.post("/logout", checkSession, async (req, res) => {
    const sessionId = req.cookies.sessionId;

    await client.query("DELETE FROM SESSIONS WHERE session_id = $1", [sessionId]);

    res.clearCookie("sessionId");

    return res.status(200).send({
        type: "loggedOut"
    });
});

app.get("/", async (req, res) => {
    try {
        const result12 = await client.query(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
        );
        res.status(200).send(result12.rows);
    } catch (error) {
        res.status(500).send({
            message: "Server error"
        });
    }
});

// express client
const client = new Pool({
    user: "postgres",
    password: "password",
    host: "localhost",
    port: 5432,
    database: "mydb"
});

(async function () {
    httpServer.listen(3000, () => {
        console.log("server started running");
    });
})();
