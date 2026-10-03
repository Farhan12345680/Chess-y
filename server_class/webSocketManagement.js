import crypto from "crypto";

import { client, matchQueue } from "../server.js";

import GameClass from "../server_class/GameClass.js";

export async function websocketManagement(ws, req) {

    ws.userState = {

        bearerTokenID: "",

        bearerTokenReceivingTime: "",

        bearerTokenDuration: "",

        GameObject: null,

        userName: "",

        userID: "",

        state: "connected",

        gameID: null,

        gameType: null

    };

    const url = new URL(req.url, "http://localhost");

    const sessionId =
        url.searchParams.get("sessionId");

    if (!sessionId) {

        ws.close(1008, "Authentication required");

        return;

    }

    try {

        const sessionResult = await client.query(

            `SELECT
                S.session_id,
                S.user_id,
                S.created_at,
                S.session_duration,
                U.name
             FROM SESSIONS S
             INNER JOIN USERS U
                 ON U.user_id = S.user_id
             WHERE S.session_id = $1`,

            [sessionId]

        );

        if (sessionResult.rows.length === 0) {

            ws.close(1008, "Invalid session");

            return;

        }

        const session =
            sessionResult.rows[0];

        const sessionCreatedAt =
            new Date(session.created_at);

        const sessionExpiresAt =
            sessionCreatedAt.getTime() +
            Number(session.session_duration);

        if (Date.now() > sessionExpiresAt) {

            await client.query(
                "DELETE FROM SESSIONS WHERE session_id = $1",
                [sessionId]
            );

            ws.close(1008, "Session expired");

            return;

        }

        ws.userState.bearerTokenID =
            session.session_id;

        ws.userState.bearerTokenReceivingTime =
            session.created_at;

        ws.userState.bearerTokenDuration =
            Number(session.session_duration);

        ws.userState.userID =
            session.user_id;

        ws.userState.userName =
            session.name;

        ws.userState.state = "idle";

        await client.query(

            `UPDATE USERS
             SET last_active_at = CURRENT_TIMESTAMP
             WHERE user_id = $1`,

            [ws.userState.userID]

        );

        ws.send(

            JSON.stringify({

                type: "connected",

                message: "WebSocket connected",

                userID:
                    ws.userState.userID,

                userName:
                    ws.userState.userName

            })

        );

    } catch (error) {

        console.log(error);

        ws.close(1011, "Server error");

        return;

    }

    ws.on("message", async (message) => {

        await messageMgmt(ws, message);

    });

    ws.on("close", async () => {

        console.log(
            "WebSocket closed:",
            ws.userState.userName
        );

        if (
            ws.userState.state === "waiting"
        ) {

            matchQueue.remove(ws);

            ws.userState.state = "idle";

            ws.userState.gameType = null;

        }

        if (
            ws.userState.state === "playing" &&
            ws.userState.GameObject !== null
        ) {

            const game =
                ws.userState.GameObject;

            await game.handleDisconnect(ws);

            ws.userState.GameObject = null;

            ws.userState.gameID = null;

            ws.userState.gameType = null;

            ws.userState.state = "idle";

        }

        if (ws.userState.userID) {

            await client.query(

                `UPDATE USERS
                 SET last_active_at = CURRENT_TIMESTAMP
                 WHERE user_id = $1`,

                [ws.userState.userID]

            );

        }

    });

    ws.on("error", (error) => {

        console.log(
            "WebSocket error:",
            ws.userState.userName,
            error
        );

        if (
            ws.userState.state === "waiting"
        ) {

            matchQueue.remove(ws);

            ws.userState.state = "idle";

            ws.userState.gameType = null;

        }

    });

    ws.on("open", () => {

        console.log(
            "the websocket open request came"
        );

    });

}





async function messageMgmt(ws, message) {

    let jsonObject;

    try {

        jsonObject =
            JSON.parse(message.toString());

    } catch (error) {

        ws.send(

            JSON.stringify({

                type: "invalidMessage",

                message: "Invalid JSON"

            })

        );

        return;

    }

    if (!jsonObject.cmdType) {

        ws.send(

            JSON.stringify({

                type: "invalidMessage",

                message: "cmdType missing"

            })

        );

        return;

    }

    try {

        switch (jsonObject.cmdType) {

            case "requestGame": {

                if (
                    ws.userState.state !== "idle"
                ) {

                    ws.send(

                        JSON.stringify({

                            type:
                                "gameRequestRejected",

                            message:
                                "You are already in a game or queue"

                        })

                    );

                    break;

                }

                const timeControl =
                    jsonObject.timeControl;

                if (
                    typeof timeControl !== "string" ||
                    !/^\d+\+\d+$/.test(timeControl)
                ) {

                    ws.send(

                        JSON.stringify({

                            type:
                                "gameRequestRejected",

                            message:
                                "Invalid time control"

                        })

                    );

                    break;

                }

                const baseMinutes =
                    Number(
                        timeControl.split("+")[0]
                    );

                let gameType;

                if (baseMinutes <= 1) {

                    gameType = "bullet";

                } else if (baseMinutes <= 3) {

                    gameType = "blitz";

                } else {

                    gameType = "rapid";

                }

                const opponent =
                    matchQueue.pop(
                        timeControl
                    );

                if (opponent === null) {

                    matchQueue.add(
                        timeControl,
                        ws
                    );

                    ws.userState.state =
                        "waiting";

                    ws.userState.gameType =
                        gameType;

                    ws.send(

                        JSON.stringify({

                            type:
                                "waitingForOpponent",

                            timeControl:
                                timeControl,

                            gameType:
                                gameType

                        })

                    );

                } else {

                    if (
                        opponent.readyState !== 1 ||
                        opponent.userState.state !==
                            "waiting"
                    ) {

                        matchQueue.remove(
                            opponent
                        );

                        matchQueue.add(
                            timeControl,
                            ws
                        );

                        ws.userState.state =
                            "waiting";

                        ws.userState.gameType =
                            gameType;

                        ws.send(

                            JSON.stringify({

                                type:
                                    "waitingForOpponent",

                                timeControl:
                                    timeControl,

                                gameType:
                                    gameType

                            })

                        );

                        break;

                    }

                    const gameID =
                        crypto.randomUUID();

                    const game =
                        new GameClass(
                            opponent,
                            timeControl,
                            ws
                        );

                    game.gameID = gameID;

                    opponent.userState.GameObject =
                        game;

                    opponent.userState.state =
                        "playing";

                    opponent.userState.gameID =
                        gameID;

                    opponent.userState.gameType =
                        gameType;

                    ws.userState.GameObject =
                        game;

                    ws.userState.state =
                        "playing";

                    ws.userState.gameID =
                        gameID;

                    ws.userState.gameType =
                        gameType;

                    game.startGame();

                }

                break;

            }



            case "cancelGame": {

                if (
                    ws.userState.state === "waiting"
                ) {

                    matchQueue.remove(ws);

                    ws.userState.state =
                        "idle";

                    ws.userState.gameType =
                        null;

                    ws.send(

                        JSON.stringify({

                            type:
                                "gameSearchCancelled"

                        })

                    );

                }

                break;

            }



            case "move": {

                if (
                    ws.userState.state !== "playing" ||
                    ws.userState.GameObject === null
                ) {

                    ws.send(

                        JSON.stringify({

                            type:
                                "moveRejected",

                            message:
                                "You are not currently playing a game"

                        })

                    );

                    break;

                }

                const game =
                    ws.userState.GameObject;

                const side =
                    game.sideArray.indexOf(ws);

                if (side === -1) {

                    ws.send(

                        JSON.stringify({

                            type:
                                "moveRejected",

                            message:
                                "You are not a player in this game"

                        })

                    );

                    break;

                }

                await game.playMove({

                    side: side,

                    move:
                        jsonObject.move

                });

                break;

            }



            case "surrender": {

                if (
                    ws.userState.state !== "playing" ||
                    ws.userState.GameObject === null
                ) {

                    ws.send(

                        JSON.stringify({

                            type:
                                "gameCommandRejected",

                            message:
                                "You are not currently playing a game"

                        })

                    );

                    break;

                }

                const game =
                    ws.userState.GameObject;

                const side =
                    game.sideArray.indexOf(ws);

                if (side === -1) {

                    break;

                }

                await game.surrender(side);

                ws.userState.state = "idle";

                break;

            }



            default: {

                ws.send(

                    JSON.stringify({

                        type:
                            "unknownCommand",

                        message:
                            "Unknown command"

                    })

                );

                break;

            }

        }

    } catch (error) {

        console.log(error);

        ws.send(

            JSON.stringify({

                type:
                    "serverError",

                message:
                    "Error processing command"

            })

        );

    }

}