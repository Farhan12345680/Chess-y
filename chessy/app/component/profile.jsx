import { Image, Text, View, StyleSheet } from "react-native"
import { Link } from "expo-router"
import { useContext } from "react"
import { applicationContext, userDataContext } from "../context/contexts.jsx"

export default function ProfileComponent() {

    const { applicationState } = useContext(applicationContext)
    const {userState} =useContext(userDataContext)

    return (
        <Link href="/profile" asChild>
            <View style={StyleSheet.flatten([
                styles.container,
                applicationState.applicationStyleMode === "black" && darkStyles.container
            ])}>
                <Image
                    source={{
                        uri: userState.userProfilePicture
                    }}
                    style={styles.image}
                />

                <View style={styles.info}>
                    <Text style={[
                        styles.name,
                        applicationState.applicationStyleMode === "black" && darkStyles.name
                    ]}>
                        {userState.userName}
                    </Text>

                    <Text style={[
                        styles.country,
                        applicationState.applicationStyleMode === "black" && darkStyles.country
                    ]}>
                        {userState.userCountry}
                    </Text>
                </View>
            </View>
        </Link>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: 10,
        gap: 10,
        flexGrow: 1,
        margin: 0
    },

    image: {
        width: 50,
        height: 50,
        borderRadius: 50
    },

    info: {
        justifyContent: "center"
    },

    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#111111"
    },

    country: {
        fontSize: 13,
        color: "#444444"
    }
})

const darkStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: 10,
        gap: 10,
        flexGrow: 1,
        margin: 0
    },

    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#ffffff"
    },

    country: {
        fontSize: 13,
        color: "#bbbbbb"
    }
})