
import { useContext } from "react";
import { Link } from "expo-router";
import { View, Text, Pressable, ScrollView } from "react-native";
import { appContext } from "../App.js";

export default function Profile() {
    const [appState, changeAppState] = useContext(appContext);
    
    return (
        <ScrollView contentContainerStyle={styles.container}>

            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>

                <Link href="/" asChild>
                    <Pressable style={styles.backButton}>
                        <Text style={styles.backButtonText}>Home</Text>
                    </Pressable>
                </Link>
            </View>

            <View style={styles.profileCard}>

                <View style={styles.profileImage}>
                    <Text style={styles.profileInitial}>
                        {appState.profile
                            ? appState.profile.charAt(0).toUpperCase()
                            : "?"}
                    </Text>
                </View>

                <Text style={styles.username}>
                    {appState.profile || "Guest"}
                </Text>

            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ratings</Text>

                <View style={styles.ratingRow}>

                    <View style={styles.ratingCard}>
                        <Text style={styles.ratingType}>Rapid</Text>
                        <Text style={styles.ratingValue}>
                            {appState.rapidRating ?? "-"}
                        </Text>
                        <Text style={styles.gamesPlayed}>
                            {appState.rapidPlayed ?? 0} games
                        </Text>
                    </View>

                    <View style={styles.ratingCard}>
                        <Text style={styles.ratingType}>Blitz</Text>
                        <Text style={styles.ratingValue}>
                            {appState.blitzRating ?? "-"}
                        </Text>
                        <Text style={styles.gamesPlayed}>
                            {appState.blitzPlayed ?? 0} games
                        </Text>
                    </View>

                    <View style={styles.ratingCard}>
                        <Text style={styles.ratingType}>Bullet</Text>
                        <Text style={styles.ratingValue}>
                            {appState.bulletRating ?? "-"}
                        </Text>
                        <Text style={styles.gamesPlayed}>
                            {appState.bulletPlayed ?? 0} games
                        </Text>
                    </View>

                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Statistics</Text>

                <View style={styles.statsCard}>

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Rapid games</Text>
                        <Text style={styles.statValue}>
                            {appState.rapidPlayed ?? 0}
                        </Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Blitz games</Text>
                        <Text style={styles.statValue}>
                            {appState.blitzPlayed ?? 0}
                        </Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Bullet games</Text>
                        <Text style={styles.statValue}>
                            {appState.bulletPlayed ?? 0}
                        </Text>
                    </View>

                </View>
            </View>

            <View style={styles.actions}>

                <Link href="/play" asChild>
                    <Pressable style={styles.playButton}>
                        <Text style={styles.playButtonText}>Play Game</Text>
                    </Pressable>
                </Link>

                <Pressable
                    style={styles.logoutButton}
                    onPress={() => {
                        changeAppState({
                            ...appState,
                            profile: null,
                        });
                    }}
                >
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                </Pressable>

            </View>

        </ScrollView>
    );
}


const styles = {
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 25,
    },

    title: {
        fontSize: 30,
        fontWeight: "700",
    },

    backButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "#222",
    },

    backButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },

    profileCard: {
        alignItems: "center",
        padding: 25,
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 25,
    },

    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#ddd",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 15,
    },

    profileInitial: {
        fontSize: 40,
        fontWeight: "700",
    },

    username: {
        fontSize: 24,
        fontWeight: "700",
    },

    section: {
        marginBottom: 25,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
    },

    ratingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },

    ratingCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        alignItems: "center",
    },

    ratingType: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
    },

    ratingValue: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 5,
    },

    gamesPlayed: {
        fontSize: 12,
        color: "#777",
    },

    statsCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 18,
    },

    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },

    statLabel: {
        fontSize: 15,
    },

    statValue: {
        fontSize: 15,
        fontWeight: "700",
    },

    actions: {
        gap: 12,
        marginTop: 5,
        marginBottom: 30,
    },

    playButton: {
        backgroundColor: "#222",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
    },

    playButtonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },

    logoutButton: {
        backgroundColor: "#fff",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
    },

    logoutButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
};

