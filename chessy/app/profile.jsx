import { useContext } from "react";
import { Link } from "expo-router";
import { View, Text, Pressable, ScrollView, Image, StyleSheet } from "react-native";
import Navbar from "./component/navbar";
import { applicationContext ,userDataContext } from "./context/contexts.jsx";

export default function Profile() {

    const { applicationState } = useContext(applicationContext);
    const {userState , changeUserState} = useContext(userDataContext);

    return (
        <View style={[
            styles.container,
            applicationState.applicationStyleMode === "black" && darkStyles.container
        ]}>

            <Navbar />

            <ScrollView contentContainerStyle={[
                styles.content,
                applicationState.applicationStyleMode === "black" && darkStyles.content
            ]}>

                <View style={[
                    styles.profile,
                    applicationState.applicationStyleMode === "black" && darkStyles.profile
                ]}>

                    <View>
                        <Image
                            source={{
                                uri:userState.userProfilePicture
                            }}
                            style={styles.profileImage}
                        />

                        <Text style={[
                            styles.name,
                            applicationState.applicationStyleMode === "black" && darkStyles.name
                        ]}>
                            {userState.userName} || {userState.userCountry}
                        </Text>
                    </View>
                    {userState.isLoggedIN &&
                        <View style={styles.utilityButtonContainer}>

                            <Pressable style={StyleSheet.flatten([
                                styles.uploadButton,
                                applicationState.applicationStyleMode === "black" && darkStyles.uploadButton
                            ])}>

                                <Text style={styles.buttonText}>
                                    Upload Image
                                </Text>
                            </Pressable>

                            <Pressable 
                                onPress={()=>{
                                    changeUserState({        
                                        isLoggedIN:false,
                                        bearerToken:"",
                                        userName:"user",
                                        userCountry:"International",
                                        userProfilePicture:"https://img.icons8.com/nolan/64/user-default.png",
                                        rapidRating:0,
                                        blitzRating:0,
                                        bulletRating:0,
                                        rapidRatingHistory:[],
                                        bulletRatingHistory:[],
                                        blitzRatingHistory:[]
                                    })
                                }}
                            style={styles.logOutButton}>

                                <Text style={styles.buttonText}>
                                    Log Out
                                </Text>
                            </Pressable>

                        </View>
                    }

                    {userState.isLoggedIN && 
                    <View style={styles.choiceButtons}>

                        <Pressable style={StyleSheet.flatten([
                            styles.button,
                            applicationState.applicationStyleMode === "black" && darkStyles.button
                        ])}>
                            <Text style={[
                                styles.buttonText,
                                applicationState.applicationStyleMode === "black" && darkStyles.buttonText
                            ]}>
                                Previous Games
                            </Text>
                        </Pressable>

                        <Pressable style={StyleSheet.flatten([
                            styles.button,
                            applicationState.applicationStyleMode === "black" && darkStyles.button
                        ])}>
                            <Text style={[
                                styles.buttonText,
                                applicationState.applicationStyleMode === "black" && darkStyles.buttonText
                            ]}>
                                Leader Board
                            </Text>
                        </Pressable>

                        <Pressable style={StyleSheet.flatten([
                            styles.button,
                            applicationState.applicationStyleMode === "black" && darkStyles.button
                        ])}>
                            <Text style={[
                                styles.buttonText,
                                applicationState.applicationStyleMode === "black" && darkStyles.buttonText
                            ]}>
                                Graphs
                            </Text>
                        </Pressable>

                    </View>
                    }
                </View>

                <View>
                    <View />
                    <View />
                    <View />
                </View>

            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({

    utilityButtonContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },

    choiceButtons: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
    },

    container: {
        flex: 1,
        backgroundColor: "#ffffff"
    },

    content: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },

    profile: {
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
    },

    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: "#1a1a1a",
        alignSelf: "center",
    },

    name: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
        color: "#111111"
    },

    buttons: {
        alignItems: "center",
        gap: 10,
    },

    button: {
        width: 180,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#1a1a1a",
        alignItems: "center",
    },

    logOutButton: {
        width: 180,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#dd2020",
        alignItems: "center",
    },

    uploadButton: {
        width: 180,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#4a9604",
        alignItems: "center",
    },

    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },

})

const darkStyles = StyleSheet.create({

    container: {
        backgroundColor: "#111111"
    },

    content: {
        backgroundColor: "#111111"
    },

    profile: {
        backgroundColor: "#111111"
    },

    name: {
        color: "#ffffff"
    },

    button: {
        backgroundColor: "#ffffff"
    },

    buttonText: {
        color: "#111111"
    },

    uploadButton: {
        backgroundColor: "#5fae14"
    }

})