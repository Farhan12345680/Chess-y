import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { styles } from "./style";

export default function PlayScreen() {

  return (
    <View
      style={[
        styles.screen,
        styles.homeContainer,
      ]}
    >

      <Text style={styles.logo}>
        Play Online
      </Text>

      <Text
        style={[
          styles.subtitle,
          { marginBottom: 30 },
        ]}
      >
        Find an opponent and start playing.
      </Text>

      {/* Quick Match */}

      <TouchableOpacity
        style={[
          styles.primaryButton,
          { marginBottom: 15 },
        ]}
      >
        <Text style={styles.primaryButtonText}>
          Quick Match
        </Text>
      </TouchableOpacity>

      {/* Time Controls */}

      <Text style={styles.sectionTitle}>
        Time Control
      </Text>

      <View style={styles.modeGrid}>

        <TouchableOpacity
          style={styles.modeCard}
        >
          <Text style={styles.modeTitle}>
            Bullet
          </Text>

          <Text style={styles.modeDescription}>
            1 + 0
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modeCard}
        >
          <Text style={styles.modeTitle}>
            Blitz
          </Text>

          <Text style={styles.modeDescription}>
            5 + 0
          </Text>
        </TouchableOpacity>

      </View>

      <View
        style={[
          styles.modeGrid,
          { marginTop: 12 },
        ]}
      >

        <TouchableOpacity
          style={styles.modeCard}
        >
          <Text style={styles.modeTitle}>
            Rapid
          </Text>

          <Text style={styles.modeDescription}>
            10 + 5
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modeCard}
        >
          <Text style={styles.modeTitle}>
            Custom
          </Text>

          <Text style={styles.modeDescription}>
            Choose your time
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}