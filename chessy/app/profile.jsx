import { useContext } from "react";
import { router } from "expo-router";
import { View, Text, Pressable, ScrollView, Image, StyleSheet } from "react-native";
import Navbar from "./component/navbar";
import {
    applicationContext,
    userDataContext,
    AuthContext
} from "./context/contexts.jsx";

export default function Profile() {

    const { applicationState } = useContext(applicationContext);
    const { userState } = useContext(userDataContext);
    const { logout } = useContext(AuthContext);

    const isDark = applicationState.applicationStyleMode === "black";

    return (
        <View style={[
            styles.container,
            isDark && darkStyles.container
        ]}>

            <Navbar />

            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    isDark && darkStyles.content
                ]}
                showsVerticalScrollIndicator={false}
            >

                <View style={[
                    styles.profileCard,
                    isDark && darkStyles.profileCard
                ]}>

                    <Image
                        source={{
                            uri: userState.userProfilePicture
                        }}
                        style={[
                            styles.profileImage,
                            isDark && darkStyles.profileImage
                        ]}
                    />

                    <Text style={[
                        styles.name,
                        isDark && darkStyles.name
                    ]}>
                        {userState.userName}
                    </Text>

                    <Text style={[
                        styles.country,
                        isDark && darkStyles.country
                    ]}>
                        {userState.userCountry}
                    </Text>

                    {userState.isLoggedIN ? (

                        <>
                            <View style={styles.utilityButtonContainer}>



                                <Pressable
                                    onPress={logout}
                                    style={styles.logOutButton}
                                >
                                    <Text style={styles.buttonText}>
                                        Log Out
                                    </Text>
                                </Pressable>

                            </View>


                        </>

                    ) : (

                        <View style={styles.loggedOutContainer}>

                            <Text style={[
                                styles.loginTitle,
                                isDark && darkStyles.loginTitle
                            ]}>
                                Welcome to Chess-y
                            </Text>

                            <Text style={[
                                styles.loginDescription,
                                isDark && darkStyles.loginDescription
                            ]}>
                                Log in to play games, track your rating,
                                and see your chess history.
                            </Text>

                            <Pressable
                                onPress={() => router.push("/login")}
                                style={[
                                    styles.loginButton,
                                    isDark && darkStyles.loginButton
                                ]}
                            >
                                <Text style={[
                                    styles.loginButtonText,
                                    isDark && darkStyles.loginButtonText
                                ]}>
                                    Log In
                                </Text>
                            </Pressable>

                        </View>
                    )}

                </View>

            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },

    content: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },

    profileCard: {
        width: "100%",
        maxWidth: 520,
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 20,
        paddingVertical: 35,
        paddingHorizontal: 24,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 5,
    },

    profileImage: {
        width: 125,
        height: 125,
        borderRadius: 63,
        borderWidth: 4,
        borderColor: "#1a1a1a",
        marginBottom: 14,
    },

    name: {
        fontSize: 27,
        fontWeight: "700",
        color: "#111111",
        textAlign: "center",
    },

    country: {
        fontSize: 15,
        color: "#777777",
        marginTop: 5,
        marginBottom: 25,
    },

    utilityButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: "100%",
    },

    uploadButton: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 10,
        backgroundColor: "#4a9604",
        alignItems: "center",
    },

    logOutButton: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 10,
        backgroundColor: "#dd2020",
        alignItems: "center",
    },

    divider: {
        width: "100%",
        height: 1,
        backgroundColor: "#e5e5e5",
        marginVertical: 25,
    },

    choiceButtons: {
        width: "100%",
        alignItems: "center",
        gap: 10,
    },

    button: {
        width: "100%",
        paddingVertical: 13,
        borderRadius: 10,
        backgroundColor: "#1a1a1a",
        alignItems: "center",
    },

    buttonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },

    loggedOutContainer: {
        width: "100%",
        alignItems: "center",
        marginTop: 5,
    },

    loginTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111111",
        textAlign: "center",
        marginBottom: 8,
    },

    loginDescription: {
        fontSize: 14,
        lineHeight: 21,
        color: "#777777",
        textAlign: "center",
        maxWidth: 350,
        marginBottom: 22,
    },

    loginButton: {
        width: "100%",
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: "#1a1a1a",
        alignItems: "center",
    },

    loginButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },

});

const darkStyles = StyleSheet.create({

    container: {
        backgroundColor: "#0b0b0b"
    },

    content: {
        backgroundColor: "#0b0b0b"
    },

    profileCard: {
        backgroundColor: "#151515",
        shadowColor: "#000000",
        shadowOpacity: 0.35,
    },

    profileImage: {
        borderColor: "#ffffff",
    },

    name: {
        color: "#ffffff"
    },

    country: {
        color: "#999999"
    },

    divider: {
        backgroundColor: "#2b2b2b"
    },

    button: {
        backgroundColor: "#ffffff"
    },

    buttonText: {
        color: "#111111"
    },

    uploadButton: {
        backgroundColor: "#5fae14"
    },

    loginTitle: {
        color: "#ffffff"
    },

    loginDescription: {
        color: "#999999"
    },

    loginButton: {
        backgroundColor: "#ffffff"
    },

    loginButtonText: {
        color: "#111111"
    }

});