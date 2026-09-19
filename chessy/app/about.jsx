import { ScrollView, View, Pressable, Text, Linking, StyleSheet } from "react-native"
import { Link } from "expo-router"
import Navbar from "./component/navbar"
import { useContext } from "react"
import { applicationContext } from "./context/contexts.jsx"

export default function About() {
    const { applicationState } = useContext(applicationContext)

    return (
        <View>
            <Navbar/>

            <ScrollView contentContainerStyle={[
                styles.container,
                applicationState.applicationStyleMode === "black" && darkStyles.container
            ]}>
                <Text style={[
                    styles.title,
                    applicationState.applicationStyleMode === "black" && darkStyles.title
                ]}>
                    About us
                </Text>

                <Text style={[
                    styles.description,
                    applicationState.applicationStyleMode === "black" && darkStyles.description
                ]}>
                    Chessy is a open-source chess playing platform for playing and houning your skill in chess
                </Text>

                <Link href="/complaint" asChild>
                    <Pressable style={StyleSheet.flatten([
                        styles.button,
                        applicationState.applicationStyleMode === "black" && darkStyles.button
                    ])}>
                        <Text style={[
                            styles.buttonText,
                            applicationState.applicationStyleMode === "black" && darkStyles.buttonText
                        ]}>
                            Have Any Complaint
                        </Text>
                    </Pressable>
                </Link>

                <Pressable
                    style={StyleSheet.flatten([
                        styles.button,
                        applicationState.applicationStyleMode === "black" && darkStyles.button
                    ])}
                    onPress={() => Linking.openURL("https://github.com/Farhan12345680/Chess-y")}
                >
                    <Text style={[
                        styles.buttonText,
                        applicationState.applicationStyleMode === "black" && darkStyles.buttonText
                    ]}>
                        Give a Star on Github <Text style={styles.yellowStar}>★</Text>
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    yellowStar: {
        color: "#f9fd00",
        fontSize: 22
    },

    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
        gap: 20,
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        color: "#111111"
    },

    description: {
        fontSize: 18,
        textAlign: "center",
        maxWidth: 500,
        lineHeight: 28,
        color: "#222222"
    },

    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        backgroundColor: "#222",
        minWidth: 220,
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

    title: {
        color: "#ffffff"
    },

    description: {
        color: "#dddddd"
    },

    button: {
        backgroundColor: "#ffffff"
    },

    buttonText: {
        color: "#111111"
    }
})