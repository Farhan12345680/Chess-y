import express from "express";
import { Pool } from "pg";
import http from "http";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { WebSocketServer } from "ws";
import cors from "cors";
import MatchQueue from './server_class/MatchQueue.js'
import { websocketManagement } from "./server_class/webSocketManagement.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";



export const matchQueue = new MatchQueue()
const app = express();
const httpServer = http.createServer(app);
export const wss = new WebSocketServer({ server: httpServer });


app.use(cors({
    origin: "http://localhost:8081",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(helmet());


export const client = new Pool({
    user: "postgres",
    password: "password",
    host: "localhost",
    port: 5432,
    database: "mydb"
});

function createSessionId() {
    return crypto.randomBytes(32).toString("hex");
}


async function checkSession(req, res, next) {

    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
        return res.status(401).send({
            type: "notAuthenticated"
        });
    }

    const result = await client.query(
        "SELECT * FROM SESSIONS WHERE session_id = $1",
        [sessionId]
    );

    if (result.rows.length === 0) {
        res.clearCookie("sessionId");

        return res.status(401).send({
            type: "sessionExpired"
        });
    }

    const session = result.rows[0];

    const sessionCreatedAt = new Date(session.created_at);
    const sessionExpiresAt = new Date(
        sessionCreatedAt.getTime() + Number(session.session_duration)
    );

    if (Date.now() > sessionExpiresAt.getTime()) {

        await client.query(
            "DELETE FROM SESSIONS WHERE session_id = $1",
            [sessionId]
        );

        res.clearCookie("sessionId");

        return res.status(401).send({
            type: "sessionExpired"
        });
    }

    req.user_id = session.user_id;

    await client.query(
        "UPDATE USERS SET last_active_at = CURRENT_TIMESTAMP WHERE user_id = $1",
        [req.user_id]
    );

    next();
}


app.get("/", (req, res) => {
    res.send("Chess-y server is running");
});


app.post("/signup", async (req, res) => {

    const { name, password, country } = req.body;

    if (!name || !password) {
        return res.status(400).send({
            type: "invalidRequest",
            message: "Name and password are required"
        });
    }

    const existingUser = await client.query(
        "SELECT user_id FROM USERS WHERE name = $1",
        [name]
    );

    if (existingUser.rows.length !== 0) {
        return res.status(409).send({
            type: "nameTaken",
            message: "Name is already taken"
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const sessionId = createSessionId();

    const dbClient = await client.connect();

    try {

        await dbClient.query("BEGIN");

        const userResult = await dbClient.query(
            `INSERT INTO USERS
                (name, country, password, last_active_at)
             VALUES
                ($1, $2, $3, CURRENT_TIMESTAMP)
             RETURNING user_id, name, country, image_url`,
            [name, country ?? null, hash]
        );

        const user = userResult.rows[0];

        await dbClient.query(
            `INSERT INTO SESSIONS
                (session_id, user_id, session_duration)
             VALUES
                ($1, $2, $3)`,
            [sessionId, user.user_id, 7 * 24 * 60 * 60 * 1000]
        );

        await dbClient.query("COMMIT");

        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).send({
            type: "signedUp",
            user
        });

    } catch (error) {

        await dbClient.query("ROLLBACK");

        console.log(error);

        return res.status(500).send({
            type: "serverError"
        });

    } finally {
        dbClient.release();
    }
});


app.post("/login", async (req, res) => {

    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).send({
            type: "invalidRequest",
            message: "Name and password are required"
        });
    }

    const result = await client.query(
        "SELECT * FROM USERS WHERE name = $1",
        [name]
    );

    if (result.rows.length === 0) {
        return res.status(401).send({
            type: "invalidCredentials"
        });
    }

    const user = result.rows[0];

    const passwordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordCorrect) {
        return res.status(401).send({
            type: "invalidCredentials"
        });
    }

    await client.query(
        "DELETE FROM SESSIONS WHERE user_id = $1",
        [user.user_id]
    );

    const sessionId = createSessionId();

    await client.query(
        `INSERT INTO SESSIONS
            (session_id, user_id, session_duration)
         VALUES
            ($1, $2, $3)`,
        [sessionId, user.user_id, 7 * 24 * 60 * 60 * 1000]
    );

    await client.query(
        "UPDATE USERS SET last_active_at = CURRENT_TIMESTAMP WHERE user_id = $1",
        [user.user_id]
    );

    res.cookie("sessionId", sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).send({
        type: "loggedIn",
        user: {
            user_id: user.user_id,
            name: user.name,
            country: user.country,
            image_url: user.image_url
        }
    });
});


app.get("/me", checkSession, async (req, res) => {

    const result = await client.query(
        "SELECT * FROM USERS WHERE user_id = $1",
        [req.user_id]
    );

    if (result.rows.length === 0) {
        return res.status(404).send({
            type: "userNotFound"
        });
    }

    return res.status(200).send(result.rows[0]);
});


app.post("/logout", checkSession, async (req, res) => {

    const sessionId = req.cookies.sessionId;

    await client.query(
        "DELETE FROM SESSIONS WHERE session_id = $1",
        [sessionId]
    );

    res.clearCookie("sessionId");

    return res.status(200).send({
        type: "loggedOut"
    });
});



// web scoket connection

wss.on("connection", websocketManagement);


httpServer.listen(3000, () => {
    console.log("Chess-y server running on port 3000");
});