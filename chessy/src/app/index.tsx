
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { styles } from "./style";

export default function HomeScreen() {

  const router = useRouter();

  return (

    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.homeContainer}
    >

      <View style={styles.header}>

        <View>

          <Text style={styles.logo}>Chessy</Text>

          <Text style={styles.subtitle}>
            Play. Think. Conquer.
          </Text>

        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/profile")}
        >

          <Ionicons
            name="person-outline"
            size={24}
            color="#ffffff"
          />

        </TouchableOpacity>

      </View>

      {/* Welcome */}

      <View style={styles.welcomeContainer}>

        <Text style={styles.welcomeTitle}>
          Welcome back, Player
        </Text>

        <Text style={styles.welcomeText}>
          Ready for your next game?
        </Text>

      </View>


      <Text style={styles.sectionTitle}>
        Play Chess
      </Text>

      <View style={styles.modeGrid}>


        <TouchableOpacity
          style={styles.modeCard}
          activeOpacity={0.8}
          onPress={() => router.push("/play")}
        >

          <View style={styles.modeIcon}>

            <Ionicons
              name="people"
              size={30}
              color="#ffffff"
            />

          </View>

          <Text style={styles.modeTitle}>
            Play Online
          </Text>

          <Text style={styles.modeDescription}>
            Challenge chess players from around the world.
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.modeCard}
          activeOpacity={0.8}
          onPress={() => router.push("/engine")}
        >

          <View style={styles.modeIcon}>

            <Ionicons
              name="hardware-chip"
              size={30}
              color="#ffffff"
            />

          </View>

          <Text style={styles.modeTitle}>
            Play Engine
          </Text>

          <Text style={styles.modeDescription}>
            Test your skills against Chessy's engines.
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modeCard}
          activeOpacity={0.8}
          onPress={() => router.push("/selfPlay")}
        >

          <View style={styles.modeIcon}>

            <Ionicons
              name="hardware-chip"
              size={30}
              color="#ffffff"
            />

          </View>

          <Text style={styles.modeTitle}>
            Pass and Play
          </Text>

          <Text style={styles.modeDescription}>
            Test your skills against Chessy's engines.
          </Text>

        </TouchableOpacity>
      </View>


      <Text style={styles.sectionTitle}>
        Your Statistics
      </Text>

      <View style={styles.statsContainer}>

        <View style={styles.stat}>

          <Text style={styles.statValue}>
            1200
          </Text>

          <Text style={styles.statLabel}>
            Rating
          </Text>

        </View>

        <View style={styles.stat}>

          <Text style={styles.statValue}>
            24
          </Text>

          <Text style={styles.statLabel}>
            Games
          </Text>

        </View>

        <View style={styles.stat}>

          <Text style={styles.statValue}>
            58%
          </Text>

          <Text style={styles.statLabel}>
            Win Rate
          </Text>

        </View>

      </View>


      <View style={styles.sectionHeader}>

        <Text style={styles.sectionTitle}>
          Recent Games
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/game")}
        >

          <Text style={styles.viewAll}>
            View all
          </Text>

        </TouchableOpacity>

      </View>


      <View style={styles.gameCard}>

        <View>

          <Text style={styles.gameOpponent}>
            vs Stockfish
          </Text>

          <Text style={styles.gameDetails}>
            Blitz • 10 min
          </Text>

        </View>

        <Text style={styles.win}>
          WIN
        </Text>

      </View>


      <View style={styles.gameCard}>

        <View>

          <Text style={styles.gameOpponent}>
            vs Alex
          </Text>

          <Text style={styles.gameDetails}>
            Rapid • 10 + 5
          </Text>

        </View>

        <Text style={styles.loss}>
          LOSS
        </Text>

      </View>

    </ScrollView>

  );
}

