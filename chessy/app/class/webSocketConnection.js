import { WebSocketServer } from "ws";


/*
            isLoggedIN:false,
            bearerToken:"",
            bearerTokenDuration:"",
            userName:"user",
            userCountry:"International",
            userProfilePicture:"https://img.icons8.com/nolan/64/user-default.png",
            rapidRating:0,
            blitzRating:0,
            bulletRating:0,
            userCurrentState:"idle",
            webSocketConnection:"",
            rapidRatingHistory:[],
            bulletRatingHistory:[],
            blitzRatingHistory:[]

*/
const MESSAGE_TYPE = {
    AUTH: "AUTH",
    AUTH_RESULT: "AUTH_RESULT",

    GAME_REQUEST: "GAME_REQUEST",
    GAME_CANCEL: "GAME_CANCEL",
    GAME_SEARCHING: "GAME_SEARCHING",

    GAME_FOUND: "GAME_FOUND",
    GAME_ACCEPT: "GAME_ACCEPT",
    GAME_REJECT: "GAME_REJECT",

    GAME_STARTED: "GAME_STARTED",

    GAME_MOVE: "GAME_MOVE",
    GAME_MOVE_RESULT: "GAME_MOVE_RESULT",

    GAME_RESIGN: "GAME_RESIGN",

    GAME_DRAW_REQUEST: "GAME_DRAW_REQUEST",
    GAME_DRAW_RESPONSE: "GAME_DRAW_RESPONSE",

    GAME_CANCELLED: "GAME_CANCELLED",
    GAME_ENDED: "GAME_ENDED",

    RATING_UPDATE: "RATING_UPDATE",

    ERROR: "ERROR",

    PING: "PING",
    PONG: "PONG"
};


class webSocketConnection{

    constructor(url, changeUserState) {

        this.ws = new WebSocket(url);

        this.changeUserState = changeUserState;

        this.isOpen = false;

        this.outgoingMessageQuque = [];
        this.incomingMessageQuque = [];

        this.ws.onopen = () => {

            this.isOpen = true;

            console.log("channel has been opened");

            this.flushMessageOutgoing();
        };


        this.ws.onclose = () => {

            this.isOpen = false;

            console.log("channel has been closed");
        };


        this.ws.onerror = (error) => {

            console.log("websocket error", error);
        };


        this.ws.onmessage = (event) => {

            const message = JSON.parse(event.data);

            this.incomingMessageQuque.push(message);

            this.flushMessageIncoming();
        };
    }

    send(type, data = {}) {

        this.outgoingMessageQuque.push({
            type,
            data
        });

        this.flushMessageOutgoing();
    }


    flushMessageOutgoing() {

        if (!this.isOpen)
            return;

        while (this.outgoingMessageQuque.length > 0) {

            const message =
                this.outgoingMessageQuque.shift();

            this.ws.send(
                JSON.stringify(message)
            );
        }
    }


    flushMessageIncoming() {

        while (this.incomingMessageQuque.length > 0) {

            const message =
                this.incomingMessageQuque.shift();

            this.handleMessage(message);
        }
    }

    handleMessage(message) {

        switch (message.type) {

            case MESSAGE_TYPE.AUTH_RESULT:

                this.handleAuthResult(message.data);

                break;


            case MESSAGE_TYPE.GAME_SEARCHING:

                this.changeUserState(prev => ({
                    ...prev,
                    userCurrentState: "searching"
                }));

                break;


            case MESSAGE_TYPE.GAME_FOUND:

                this.changeUserState(prev => ({
                    ...prev,
                    userCurrentState: "gameFound"
                }));

                break;


            case MESSAGE_TYPE.GAME_STARTED:

                this.changeUserState(prev => ({
                    ...prev,
                    userCurrentState: "playing"
                }));

                break;


            case MESSAGE_TYPE.GAME_MOVE_RESULT:

                this.handleGameMove(message.data);

                break;


            case MESSAGE_TYPE.GAME_CANCELLED:

                this.changeUserState(prev => ({
                    ...prev,
                    userCurrentState: "idle"
                }));

                break;


            case MESSAGE_TYPE.GAME_ENDED:

                this.changeUserState(prev => ({
                    ...prev,
                    userCurrentState: "gameOver"
                }));

                break;


            case MESSAGE_TYPE.RATING_UPDATE:

                this.handleRatingUpdate(message.data);

                break;


            case MESSAGE_TYPE.ERROR:

                console.log(
                    "Server error:",
                    message.data
                );

                break;


            case MESSAGE_TYPE.PING:

                this.send(MESSAGE_TYPE.PONG);

                break;
        }
    }

    handleAuthResult(data) {

        this.changeUserState(prev => ({
            ...prev,
            isLoggedIN: data.isLoggedIN,
            userName: data.userName,
            userCountry: data.userCountry,
            userProfilePicture: data.userProfilePicture,
            rapidRating: data.rapidRating,
            blitzRating: data.blitzRating,
            bulletRating: data.bulletRating
        }));
    }
    handleGameMove(data) {

        this.changeUserState(prev => ({
            ...prev,
            game: data
        }));
    }

    handleRatingUpdate(data) {

        this.changeUserState(prev => ({
            ...prev,
            rapidRating: data.rapidRating ?? prev.rapidRating,
            blitzRating: data.blitzRating ?? prev.blitzRating,
            bulletRating: data.bulletRating ?? prev.bulletRating,

            rapidRatingHistory:
                data.rapidRatingHistory ??
                prev.rapidRatingHistory,

            blitzRatingHistory:
                data.blitzRatingHistory ??
                prev.blitzRatingHistory,

            bulletRatingHistory:
                data.bulletRatingHistory ??
                prev.bulletRatingHistory
        }));
    }


    authenticate(bearerToken) {

        this.send(
            MESSAGE_TYPE.AUTH,
            {
                bearerToken
            }
        );
    }
    requestGame(gameType, timeInterval) {

        this.send(
            MESSAGE_TYPE.GAME_REQUEST,
            {
                gameType,
                timeInterval
            }
        );
    }
    cancelGame() {

        this.send(
            MESSAGE_TYPE.GAME_CANCEL
        );
    }
    acceptGame(gameID) {

        this.send(
            MESSAGE_TYPE.GAME_ACCEPT,
            {
                gameID
            }
        );
    }


    rejectGame(gameID) {

        this.send(
            MESSAGE_TYPE.GAME_REJECT,
            {
                gameID
            }
        );
    }


    sendMove(gameID, move) {

        this.send(
            MESSAGE_TYPE.GAME_MOVE,
            {
                gameID,
                move
            }
        );
    }


    resign(gameID) {

        this.send(
            MESSAGE_TYPE.GAME_RESIGN,
            {
                gameID
            }
        );
    }


    requestDraw(gameID) {

        this.send(
            MESSAGE_TYPE.GAME_DRAW_REQUEST,
            {
                gameID
            }
        );
    }


    respondDraw(gameID, accept) {

        this.send(
            MESSAGE_TYPE.GAME_DRAW_RESPONSE,
            {
                gameID,
                accept
            }
        );
    }


    close() {

        this.ws.close();
    }

}