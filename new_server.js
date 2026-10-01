import express from "express";
import { Pool } from "pg";
import http from "http";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { WebSocketServer } from "ws";
import cors from "cors";


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


const client = new Pool({
    user: "postgres",
    password: "password",
    host: "localhost",
    port: 5432,
    database: "mydb"
});


app.get("/", (req, res) => {
    res.send("Chess-y server is running");
});


wss.on("connection", (ws) => {

    console.log("WebSocket connection established");

    ws.send(JSON.stringify({
        type: "connected",
        message: "WebSocket connected"
    }));


    ws.on("message", (message) => {
        console.log(
            "Received:",
            message.toString()
        );
    });


    ws.on("close", () => {
        console.log(
            "WebSocket connection closed"
        );
    });


    ws.on("error", (error) => {
        console.log(
            "WebSocket error:",
            error
        );

    });

});


httpServer.listen(3000, () => {
    console.log(
        "Chess-y server running on port 3000"
    );
});
