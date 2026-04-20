import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

import { StarRating } from "../../../../components/atoms";
import { colors, typography } from "../../../../theme";

export const Ratings = ({ navigation }: any) => {
  const [sessionRating, setSessionRating] = useState(0);
  const [captainRating, setCaptainRating] = useState(0);
  const [operatorRating, setOperatorRating] = useState(0);

  const isValid =
    sessionRating > 0 &&
    captainRating > 0 &&
    operatorRating > 0;

  const handleSubmit = () => {
    const payload = {
      sessionRating,
      captainRating,
      operatorRating,
    };

    console.log("Submitted:", payload);

    // 👉 call API / firestore here
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 🔙 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Rate Experience</Text>

        <View style={{ width: 22 }} /> {/* spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Session */}
        <View style={styles.card}>
          <Text style={styles.title}>How was the session experience?</Text>
          <StarRating rating={sessionRating} onChange={setSessionRating} />
        </View>

        {/* Captain */}
        <View style={styles.card}>
          <Text style={styles.title}>How was the Captain?</Text>
          <StarRating rating={captainRating} onChange={setCaptainRating} />
        </View>

        {/* Operator */}
        <View style={styles.card}>
          <Text style={styles.title}>How was the Operator?</Text>
          <StarRating rating={operatorRating} onChange={setOperatorRating} />
        </View>

      </ScrollView>

      {/* ✅ Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            !isValid && styles.disabledBtn,
          ]}
          disabled={!isValid}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            Submit Rating
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* 🔙 Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  content: {
    padding: 16,
    gap: 16,
  },

  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  title: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 10,
  },

  /* ✅ Footer */
  footer: {
    padding: 16,
  },

  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  disabledBtn: {
    backgroundColor: "#ccc",
  },

  submitText: {
    color: "#fff",
    fontWeight: "600",
  },
});