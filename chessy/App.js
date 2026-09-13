
import { createContext, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Link } from "expo-router";

export const appContext = createContext();

export default function App() {
    const [appState, changeAppState] = useState({
        profile: null,
        profile_image: "",
        rapidPlayed: null,
        bulletPlayed: null,
        blitzPlayed: null,
        rapidRating: null,
        blitzRating: null,
        bulletRating: null
    });

    return (
        <appContext.Provider value={[appState, changeAppState]}>
            <View style={styles.container}>

                <Text style={styles.title}>Chessy</Text>
                <Text style={styles.subtitle}>Play. Think. Conquer.</Text>

                <Link href="/profile" asChild>
                  {console.log("pressed profile")}
                    <Pressable onPress={()=>{
                      console.log("pressed this button")
                    }} style={styles.button}>
                        <Text style={styles.buttonText}>Profile</Text>
                    </Pressable>
                </Link>

                <Link href="/src/rapid" asChild>
                    <Pressable  style={styles.button}>
                        <Text style={styles.buttonText}>Play Rapid</Text>
                    </Pressable>
                </Link>

                <Link href="/src/blitz" asChild>
                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>Play Blitz</Text>
                    </Pressable>
                </Link>

                <Link href="/src/bullet" asChild>
                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>Play Bullet</Text>
                    </Pressable>
                </Link>

                <Link href="/src/passPlay" asChild>
                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>Pass and Play</Text>
                    </Pressable>
                </Link>

            </View>
        </appContext.Provider>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        padding: 20
    },

    title: {
        fontSize: 40,
        fontWeight: "bold",
        marginBottom: 5
    },

    subtitle: {
        fontSize: 18,
        marginBottom: 30,
        color: "#666"
    },

    button: {
        width: "80%",
        paddingVertical: 16,
        marginVertical: 7,
        borderRadius: 10,
        backgroundColor: "#222",
        alignItems: "center"
    },

    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600"
    }
});
