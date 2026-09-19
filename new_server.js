import express from "express";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import http from "http";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { WebSocketServer } from "ws";
import cors from "cors"


const app = express();
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });

app.use(cors({
    origin: "http://localhost:8081",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(helmet());


//server running creation


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



//pg client
const client = new Pool({
    user: "postgres",
    password: "password",
    host: "localhost",
    port: 5432,
    database: "mydb"
});

/*
CREATE TABLE IF NOT EXISTS USERS(
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    country VARCHAR(10) DEFAULT NULL,
    account_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP DEFAULT NULL,
    password VARCHAR(200) NOT NULL,
    image_url varchar(1000) NOT NULL default "https://img.icons8.com/nolan/64/user-default.png"
);

CREATE TABLE IF NOT EXISTS CHESS_GAMES(
    game_id UUID default gen_random_uuid() PRIMARY KEY,
    player1 UUID,
    player2 UUID,
    pgn_game_string varchar(2000) default NULL,
    game_type varchar(100) not null,
    time_interval varchar(100) default '0+0',
    game_winner UUID,
    creation_time_stampz timestamp default current_timestamp,
    player1_color char(1) default 'W',
    
    foreign key (player1) references USERS(user_id),
    foreign key (player2) references USERS(user_id),
    foreign key (game_winner) references USERS(user_id)

);

CREATE TABLE IF NOT EXISTS SESSIONS(
    session_id varchar(100) NOT NULL,
    user_id UUID NOT NULL,
    created_at timestamp default current_timestamp,
    session_duration INT default 0,

    foreign key (user_id) references USERS(user_id)

);

CREATE TABLE IF NOT EXISTS USER_GAME_ELO(
    user_id UUID,
    gameType VARCHAR(100) NOT NULL,
    gameElo INT DEFAULT 0,

    PRIMARY KEY (user_id, gameType),
    FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);



CREATE OR REPLACE FUNCTION create_user_game_elo()
RETURNS TRIGGER
AS $$
BEGIN
    INSERT INTO USER_GAME_ELO (user_id, timeFrame, gameElo)
    VALUES
        (NEW.user_id, 'rapid', 0),
        (NEW.user_id, 'blitz', 0),
        (NEW.user_id, 'bullet', 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER after_user_created
AFTER INSERT ON USERS
FOR EACH ROW
EXECUTE FUNCTION create_user_game_elo();

*/



app.post("/login", async (req, res) => {
    if (req.cookies.sessionId !== undefined) {

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
        
        res.status(200).send({
            type: "redirect",
            message: "session found"
        });
        return;
    }

    const userName = req.body.name;
    const userPassword = req.body.password;
    const country = req.body.country;


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
        const sendingObject = {

            userName:userName,
            userCountry:country,
            type:"created",
            brearerToken: sessionIdCreation,
            maxAge:60*60*1000,
            rapidELO:0,
            blitzELO:0,
            bulletELO:0,
            rapidHistory:[],
            blitzHistory:[],
            bulletHistory:[],
            userProfilePicture:"https://img.icons8.com/nolan/64/user-default.png",
            message:"user created"
        } 
        res.status(200).send(sendingObject);
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

//log out

app.post("/logout", checkSession, async (req, res) => {
    const sessionId = req.cookies.sessionId;

    await client.query("DELETE FROM SESSIONS WHERE session_id = $1", [sessionId]);

    res.clearCookie("sessionId");

    return res.status(200).send({
        type: "loggedOut"
    });
});

wss.on("connection", (ws) => {
    ws.userState={
        bearerTokenID:"",
        bearerTokenReceivingTime:"",
        bearerTokenDuration:"",
        GameObject:"",
        userName:"",
        userID:"",
        state:"",
    }

    ws.on("open" , async (message)=>{
        console.log("web socket connection opened")
    }) 

    ws.on("message", async (message) => {
        const jsonObject = JSON.parse(message);

        switch (jsonObject.cmdType) {
            case requestGame:
                requestNewGame(jsonObject, ws);
                break;
            default:
                break;
        }
    });

    ws.on("close" , async (message)=>{

    })

});

(async function () {
    httpServer.listen(3000, () => {
        console.log("server started running");
    });
})();


