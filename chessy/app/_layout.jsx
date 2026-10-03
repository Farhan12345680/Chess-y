import { Stack } from "expo-router";
import {
    applicationContext,
    userDataContext,
    leaderBoardContext,
    AuthContext,
    socketMgmtContext
} from "./context/contexts";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Layout() {
    const [userState, changeUserState] = useState({
        userID:null,
        isLoggedIN: false,
        bearerToken: "",
        bearerTokenDuration: "",
        userName: "user",
        userCountry: "International",
        userProfilePicture: "https://img.icons8.com/nolan/64/user-default.png",
        rapidRating: 0,
        blitzRating: 0,
        bulletRating: 0,
        userCurrentState: "idle",
        webSocketConnection: "",
        rapidRatingHistory: [],
        bulletRatingHistory: [],
        blitzRatingHistory: []
    });

    const [socket, changeSocket] = useState(null);
    const [socketState, changeSocketState] = useState("disconnected");

    const [applicationState, changeApplicationState] = useState({
        applicationStyleMode: "black",
        applicationStaus: "idle"
    });

    const [leaderBoardState, changeLeaderBoardState] = useState({});

    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        async function loadToken() {
            let token=null;
            try{
                token =JSON.parse( await AsyncStorage.getItem("token"));

            }catch(e){
                await AsyncStorage.removeItem("token")
            }

            

            if (token) {
                changeUserState((prev) => ({
                    ...prev,
                    userID:token.userID,
                    userProfilePicture:token.userProfilePicture,
                    userName:token.userName,
                    userCountry:token.userCountry,
                    isLoggedIN: true,
                    bearerToken: token.token
                }));
            }
            setAuthLoading(false);
        }

        loadToken();
    }, []);



    //    
    // useEffect(() => {
    //     console.log("this is the updated user state -> "+JSON.stringify(userState))
    // }, [userState]);





    async function login(token) {
        await AsyncStorage.setItem("token", token);

        changeUserState((prev) => ({
            ...prev,
            isLoggedIN: true,
            bearerToken: token
        }));
    }

    async function logout() {
        await AsyncStorage.removeItem("token");

        closeSocket();

        changeUserState((prev) => ({
            ...prev,
            isLoggedIN: false,
            bearerToken: ""
        }));
    }

    function connectSocket(sessionId) {
        if (!sessionId) {
            return;
        }

        if (
            socket &&
            (
                socket.readyState === WebSocket.OPEN ||
                socket.readyState === WebSocket.CONNECTING
            )
        ) {
            return socket;
        }

        const newSocket =
            new WebSocket(
                `ws://localhost:3000?sessionId=${encodeURIComponent(sessionId)}`
            );

        changeSocketState("connecting");

        newSocket.onopen = () => {
            console.log("Socket connection opened");

            changeSocketState("connected");

            changeUserState((prev) => ({
                ...prev,
                webSocketConnection: newSocket
            }));
        };

        newSocket.onmessage = (event) => {
            console.log("WebSocket message:", event.data);
        };

        newSocket.onerror = (error) => {
            console.error("WebSocket error:", error);
            changeSocketState("error");
        };

        newSocket.onclose = (event) => {
            console.log(
                "WebSocket disconnected:",
                event.code,
                event.reason
            );

            changeSocketState("disconnected");

            changeSocket(null);

            changeUserState((prev) => ({
                ...prev,
                webSocketConnection: ""
            }));
        };

        changeSocket(newSocket);

        return newSocket;
    }

    function sendSocketMessage(message) {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.log("WebSocket is not connected");
            return;
        }

        socket.send(typeof message === "string" ? message : JSON.stringify(message));
    }

    function closeSocket() {
        if (socket) {

            console.log("calling socket close");
            socket.close();
        }

        changeSocket(null);
        changeSocketState("disconnected");

        changeUserState((prev) => ({
            ...prev,
            webSocketConnection: ""
        }));
    }

    return (
        <AuthContext.Provider
            value={{
                login,
                logout,
                authLoading
            }}
        >
            <socketMgmtContext.Provider
                value={{
                    socket,
                    socketState,
                    connectSocket,
                    sendSocketMessage,
                    closeSocket
                }}
            >
                <applicationContext.Provider
                    value={{
                        applicationState,
                        changeApplicationState
                    }}
                >
                    <userDataContext.Provider
                        value={{
                            userState,
                            changeUserState
                        }}
                    >
                        <leaderBoardContext.Provider
                            value={{
                                leaderBoardState,
                                changeLeaderBoardState
                            }}
                        >
                            <Stack
                                screenOptions={{
                                    headerShown: false,
                                    contentStyle: {
                                        backgroundColor:
                                            applicationState.applicationStyleMode === "black" ? "#111111" : "#ffffff"
                                    }
                                }}
                            />
                        </leaderBoardContext.Provider>
                    </userDataContext.Provider>
                </applicationContext.Provider>
            </socketMgmtContext.Provider>
        </AuthContext.Provider>
    );
}
