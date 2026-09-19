
import {ScrollView , Pressable ,Text, View } from "react-native"
import {Link} from "expo-router"
import Navbar from "./component/navbar"



export default function Index(){


    return (

            <View style={styles.container}>
            <Navbar/>
                <ScrollView contentContainerStyle={styles.container}>
                </ScrollView>
            </View>

    )
}

const styles = {
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 30,
    },

    text: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
}

