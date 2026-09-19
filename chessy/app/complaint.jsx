
import { useContext, useState } from "react";
import { Link } from "expo-router";
import { View, Text, Pressable, ScrollView, Image,StyleSheet } from "react-native";
import Navbar from "./component/navbar"
import Input from "./component/input"


export default function Complaint() {
    const [complaintForm , changeComplaintForm]=useState({
        complaintType:null,
        complaintSubject:null,
        complaintDescription:null,
        complaintGameURL: null
    })
    return (
        <View style={styles.container}>
            <Navbar />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Submit a Complaint</Text>

                <Text style={styles.description}>
                    Tell us about your complaint and we will look into it.
                </Text>

                <Input
                    labelText="Complaint Type"
                    placeholder="Cheating / Hacking / Bug / Other"
                    changeInputState={(text)=>{
                        changeComplaintForm({
                            ...complaintForm,
                            complaintType:text
                        })
                    }}
                />

                <Input
                    labelText="Subject"
                    placeholder="Enter complaint subject"
                    changeInputState={(text)=>{
                        changeComplaintForm({
                            ...complaintForm,
                            complaintSubject:text
                        })
                    }}
                />

                <Input
                    labelText="Description"
                    placeholder="Describe your complaint"
                    multiline
                    numberOfLines={5}
                    changeInputState={(text)=>{
                        changeComplaintForm({
                            ...complaintForm,
                            complaintDescription:text
                        })
                    }}
                />
                <Input
                    labelText="Game URL"
                    placeholder="paste the game url"
                    changeInputState={(text)=>{
                        changeComplaintForm({
                            ...complaintForm,
                            complaintGameURL:text
                        })
                    }}
                />
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Submit Complaint</Text>
                </Pressable>
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
        width:"50%",
        padding: 24,
        flex:1,
        flexDirection:"column",

    
        alignSelf:"center"
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 8,
    },

    description: {
        fontSize: 15,
        color: "#666",
        marginBottom: 28,
    },

    button: {
        backgroundColor: "#222",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        flexGrow:1,
        height: 50,

    },

    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});