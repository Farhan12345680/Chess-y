import { TextInput, Text, View, StyleSheet } from "react-native";
import { useState, useContext } from "react";
import { applicationContext } from "../context/contexts.jsx";

export default function Input({ labelText, changeInputState, ...props }) {

    const { applicationState } = useContext(applicationContext);
    const isDarkMode = applicationState.applicationStyleMode === "black";

    const [inputStateLocal, changeInputStateLocal] = useState({
        input: ""
    });

    return (
        <View style={styles.container}>

            <Text style={[
                styles.label,
                isDarkMode && darkStyles.label
            ]}>
                {labelText}
            </Text>

            <TextInput
                {...props}
                onChangeText={(text) => {
                    changeInputState(text);

                    changeInputStateLocal({
                        input: text
                    });
                }}
                style={[
                    styles.input,
                    isDarkMode && darkStyles.input,
                    inputStateLocal.input.length !== 0 &&
                    styles.inputColor,
                    inputStateLocal.input.length !== 0 &&
                    isDarkMode &&
                    darkStyles.inputColor
                ]}
            />

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        width: "100%",
        marginBottom: 18,
    },

    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 7,
        color: "#111111"
    },

    input: {
        height: 48,
        borderWidth: 1,
        borderColor: "#aaa",
        borderRadius: 8,
        paddingHorizontal: 14,
        fontSize: 16,
        backgroundColor: "#fff",
        alignContent: "center",
        color: "#5a5a5a"
    },

    inputColor: {
        color: "#006A4E"
    }
});

const darkStyles = StyleSheet.create({

    label: {
        color: "#ffffff"
    },

    input: {
        backgroundColor: "#1a1a1a",
        borderColor: "#555555",
        color: "#aaaaaa"
    },

    inputColor: {
        color: "#006A4E"
    }
});