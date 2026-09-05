import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { styles } from "./style";

export default function ProfileScreen() {

  return (
    <View
      style={[
        styles.screen,
        styles.homeContainer,
      ]}
    >

      <View
        style={{
          alignItems: "center",
          marginBottom: 30,
        }}
      >

        <View style={styles.profileButton}>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 20,
            }}
          >
            P
          </Text>
        </View>

        <Text
          style={[
            styles.logo,
            { marginTop: 15 },
          ]}
        >
          Player
        </Text>

        <Text style={styles.subtitle}>
          Rating 1200
        </Text>

      </View>

      <View style={styles.statsContainer}>

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            12
          </Text>

          <Text style={styles.statLabel}>
            Wins
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            8
          </Text>

          <Text style={styles.statLabel}>
            Losses
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            4
          </Text>

          <Text style={styles.statLabel}>
            Draws
          </Text>
        </View>

      </View>

      <TouchableOpacity
        style={[
          styles.secondaryButton,
          { marginTop: 20 },
        ]}
      >
        <Text style={styles.secondaryButtonText}>
          Game History
        </Text>
      </TouchableOpacity>

    </View>
  );
}