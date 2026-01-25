import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { colors } from "../../theme/color";
import { useNavigation } from "@react-navigation/native";

type UserRole = "RIDER" | "OPERATOR";

const RoleSelectionScreen = () => {
  const navigation = useNavigation<any>();

  const onSelect = (role: "RIDER" | "OPERATOR") => {
    navigation.navigate("auth", { role });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Choose your account type to continue
        </Text>
      </View>

      {/* Cards */}
      <View style={styles.cardContainer}>
        {/* Rider Card */}
        <Pressable
          onPress={() => onSelect("RIDER")}
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.cardLeft}>
            <View style={[styles.iconBox, styles.riderIconBg]}>
              {/* <Icon name="user" size={28} color="#2563EB" /> */}
            </View>

            <View>
              <Text style={styles.cardTitle}>I want to ride</Text>
              <Text style={styles.cardSubtitle}>
                Book seats on boats & wake trips
              </Text>
            </View>
          </View>

          <View style={styles.arrowBox}>
            {/* <Icon name="arrow-right" size={16} color="#9CA3AF" /> */}
          </View>
        </Pressable>

        {/* Operator Card */}
        <Pressable
          onPress={() => onSelect("OPERATOR")}
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.cardLeft}>
            <View style={[styles.iconBox, styles.operatorIconBg]}>
              {/* <Icon name="anchor" size={28} color="#EA580C" /> */}
            </View>

            <View>
              <Text style={styles.cardTitle}>I am a Captain</Text>
              <Text style={styles.cardSubtitle}>
                List slots & fill empty seats
              </Text>
            </View>
          </View>

          <View style={styles.arrowBox}>
            {/* <Icon name="arrow-right" size={16} color="#9CA3AF" /> */}
          </View>
        </Pressable>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        BOOKBYSEAT DUBAI
      </Text>
    </View>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  cardContainer: {
    width: "100%",
    maxWidth: 420,
    gap: 16,
  },
  card: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  riderIconBg: {
    backgroundColor: "#EFF6FF",
  },
  operatorIconBg: {
    backgroundColor: "#FFF7ED",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    position: "absolute",
    bottom: 32,
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "700",
    letterSpacing: 2,
  },
});
