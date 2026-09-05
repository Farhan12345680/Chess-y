import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  /* =========================
     GLOBAL
     ========================= */

  screen: {
    flex: 1,
    backgroundColor: "#101114",
  },

  homeContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  /* =========================
     HEADER
     ========================= */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 30,
  },

  logo: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
  },

  subtitle: {
    fontSize: 14,
    color: "#8d9099",
    marginTop: 3,
  },

  profileButton: {
    width: 45,
    height: 45,

    borderRadius: 23,

    backgroundColor: "#202228",

    justifyContent: "center",
    alignItems: "center",
  },

  /* =========================
     WELCOME
     ========================= */

  welcomeContainer: {
    marginBottom: 30,
  },

  welcomeTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#ffffff",
  },

  welcomeText: {
    marginTop: 6,

    fontSize: 15,
    color: "#8d9099",
  },

  /* =========================
     SECTIONS
     ========================= */

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",

    marginBottom: 15,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 30,
  },

  viewAll: {
    color: "#7c8cff",
    fontSize: 14,
    fontWeight: "600",
  },

  /* =========================
     PLAY MODES
     ========================= */

  modeGrid: {
    flexDirection: "row",
    gap: 12,
  },

  modeCard: {
    flex: 1,

    backgroundColor: "#1a1c21",

    borderRadius: 16,

    padding: 18,

    minHeight: 180,
  },

  modeIcon: {
    width: 52,
    height: 52,

    borderRadius: 14,

    backgroundColor: "#30343d",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 15,
  },

  modeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",

    marginBottom: 8,
  },

  modeDescription: {
    fontSize: 13,
    lineHeight: 19,

    color: "#8d9099",
  },

  /* =========================
     STATISTICS
     ========================= */

  statsContainer: {
    flexDirection: "row",

    backgroundColor: "#1a1c21",

    borderRadius: 16,

    paddingVertical: 20,

    marginBottom: 10,
  },

  stat: {
    flex: 1,

    alignItems: "center",
  },

  statValue: {
    fontSize: 22,

    fontWeight: "800",

    color: "#ffffff",
  },

  statLabel: {
    fontSize: 12,

    color: "#8d9099",

    marginTop: 5,
  },

  /* =========================
     GAME HISTORY
     ========================= */

  gameCard: {
    backgroundColor: "#1a1c21",

    borderRadius: 14,

    padding: 17,

    marginBottom: 10,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  gameOpponent: {
    color: "#ffffff",

    fontSize: 15,

    fontWeight: "600",
  },

  gameDetails: {
    color: "#777b85",

    fontSize: 12,

    marginTop: 5,
  },

  win: {
    color: "#4ade80",

    fontSize: 13,

    fontWeight: "800",
  },

  loss: {
    color: "#f87171",

    fontSize: 13,

    fontWeight: "800",
  },

  /* =========================
     CHESS BOARD
     ========================= */

  chessBoard: {
    width: "30%",
    aspectRatio: 1,
  },

  chessRow: {
    flex: 1,

    flexDirection: "row",
  },

  chessSquare: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  lightSquare: {
    backgroundColor: "#f0d9b5",
  },

  darkSquare: {
    backgroundColor: "#b58863",
  },

  chessPiece: {
    fontSize: 40,
  },

  /* =========================
     GAME SCREEN
     ========================= */

  gameScreen: {
    flex: 1,

    backgroundColor: "#101114",
  },

  gameHeader: {
    height: 70,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingHorizontal: 20,
  },

  playerName: {
    color: "#ffffff",

    fontSize: 16,

    fontWeight: "700",
  },

  playerRating: {
    color: "#777b85",

    fontSize: 12,

    marginTop: 3,
  },

  timer: {
    backgroundColor: "#1a1c21",

    borderRadius: 8,

    paddingHorizontal: 14,

    paddingVertical: 8,

    color: "#ffffff",

    fontSize: 18,

    fontWeight: "700",
  },

  /* =========================
     BUTTONS
     ========================= */

  primaryButton: {
    backgroundColor: "#5865f2",
    width:"10%",
    borderRadius: 12,

    paddingVertical: 15,

    alignItems: "center",

    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#ffffff",

    fontSize: 16,

    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: "#1a1c21",

    borderRadius: 12,

    paddingVertical: 15,

    alignItems: "center",

    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#ffffff",

    fontSize: 16,

    fontWeight: "600",
  },

});