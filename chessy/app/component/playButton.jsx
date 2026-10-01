import { View, Pressable, Text, StyleSheet } from "react-native"
import { useContext } from "react"
import { applicationContext } from "../context/contexts.jsx"

export default function ({ gameType, onPressFunction }) {

    const { applicationState } = useContext(applicationContext)

    return (
        <View style={{width:"24%"}}>
            <Pressable
                style={StyleSheet.flatten([
                    styles.button,
                    applicationState.applicationStyleMode === "black" && darkStyles.button
                ])}
                onPress={() => {
                    onPressFunction()
                }}
            >
                <Text
                    style={[
                        styles.buttonText,
                        applicationState.applicationStyleMode === "black" && darkStyles.buttonText
                    ]}
                >
                    {gameType}
                </Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        width:"100%",

        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        backgroundColor: "#ffffff",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333333",
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2
    },

    buttonText: {
        color: "#222222",
        fontSize: 20,
        fontWeight: "300"
    }
})

const darkStyles = StyleSheet.create({
    button: {
        backgroundColor: "#1a1a1a",
        borderColor: "#333333",
        shadowColor: "#ffffff",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2
    },

    buttonText: {
        color: "#ffffff"
    }
})