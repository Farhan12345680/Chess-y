import {Stack} from "expo-router"
import { applicationContext , userDataContext , leaderBoardContext } from "./context/contexts"
import {useState , createContext , useContext} from "react"

export default function Layout(){
    
    
        const [userState , changeUserState]=useState({
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
        })
    
    
        const [applicationState , changeApplicationState]= useState({
            applicationStyleMode :"black",
            applicationStaus:"idle"
        })
    
    
        const [leaderBoardState , changeLeaderBoardState]=useState({
            
        })
    
        return (
            <applicationContext.Provider value={{applicationState , changeApplicationState}}>
            <userDataContext.Provider value={{userState , changeUserState}}>
            <leaderBoardContext.Provider value={{leaderBoardState , changeLeaderBoardState}}>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: {
                                backgroundColor:
                                    applicationState.applicationStyleMode === "black"
                                        ? "#111111"
                                        : "#ffffff"
                            }
                        }}
                    />            </leaderBoardContext.Provider>
            </userDataContext.Provider>
            </applicationContext.Provider>
        )
    
}
