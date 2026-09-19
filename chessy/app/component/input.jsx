import { TextInput, Text, View, StyleSheet } from "react-native";
import { useState } from "react";

export default function Input({ labelText, changeInputState, ...props }) {
    const [inputStateLocal  , changeInputStateLocal] =  useState({
        input:""
    })

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{labelText}</Text>

            <TextInput
                {...props}
                onChangeText={(text)=>{
                    changeInputState(text)
                    
                    changeInputStateLocal({
                        input:text
                    })
                }}  
                style={[styles.input , inputStateLocal.input.length!==0 
                        && styles.inputColor  ]}
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
    },

    input: {
        height: 48,
        borderWidth: 1,
        borderColor: "#aaa",
        borderRadius: 8,
        paddingHorizontal: 14,
        fontSize: 16,
        backgroundColor: "#fff",
        alignContent:"center",
        color:"#5a5a5a"
    },

    inputColor:{
        color:"#000000"
    }
});