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


class PendingRequestGameClass {
    constructor(socketServer1, gameTime, name) {
        this.socket = socketServer1;
        this.gameTime = gameTime;
        this.name = name;
    }
}

//app middleware


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

//app middle ware




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
