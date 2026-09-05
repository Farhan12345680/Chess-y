import React from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { styles } from "./style";

export default function EngineScreen() {

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.homeContainer}
    >

      <Text style={styles.logo}>
        Chess Engines
      </Text>

      <Text
        style={[
          styles.subtitle,
          { marginBottom: 30 },
        ]}
      >
        Challenge the engines built for Chessy.
      </Text>

      {/* Engine 1 */}

      <TouchableOpacity
        style={styles.gameCard}
      >

        <View
          style={styles.modeIcon}
        >
          <Ionicons
            name="hardware-chip"
            size={28}
            color="#ffffff"
          />
        </View>

        <View style={{ flex: 1, marginLeft: 15 }}>

          <Text style={styles.modeTitle}>
            Swamp
          </Text>

          <Text style={styles.modeDescription}>
            Chess engine written in C.
          </Text>

          <Text
            style={[
              styles.gameDetails,
              { marginTop: 8 },
            ]}
          >
            Rating: ~1300
          </Text>

        </View>

      </TouchableOpacity>

      {/* Engine 2 */}

      <TouchableOpacity
        style={styles.gameCard}
      >

        <View
          style={styles.modeIcon}
        >
          <Ionicons
            name="hardware-chip"
            size={28}
            color="#ffffff"
          />
        </View>

        <View style={{ flex: 1, marginLeft: 15 }}>

          <Text style={styles.modeTitle}>
            Swamp Pro
          </Text>

          <Text style={styles.modeDescription}>
            Advanced version of the Swamp engine.
          </Text>

          <Text
            style={[
              styles.gameDetails,
              { marginTop: 8 },
            ]}
          >
            Rating: ~1800
          </Text>

        </View>

      </TouchableOpacity>

    </ScrollView>
  );
}