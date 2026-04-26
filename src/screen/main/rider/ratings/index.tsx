import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader, StarRating } from "../../../../components/atoms";
import { colors, typography } from "../../../../theme";
import { useNavigation, useRoute } from "@react-navigation/native";

import firestore from '@react-native-firebase/firestore';
import { Alert } from "react-native";

export const Ratings = () => {

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { session, uid } = route.params;

  const [sessionRating, setSessionRating] = useState(0);
  const [captainRating, setCaptainRating] = useState(0);
  const [operatorRating, setOperatorRating] = useState(0);

  const [loading, setLoading] = useState(false);

  const isValid =
    sessionRating > 0 &&
    captainRating > 0 &&
    operatorRating > 0;

  // ✅ Check duplicate rating
  const checkAlreadyRated = async () => {
    const snapshot = await firestore()
      .collection('ratings')
      .where('riderId', '==', uid)
      .where('slotId', '==', session.id)
      .get();

    return !snapshot.empty;
  };

  // ✅ Update avg function
  const updateAverageRating = async (collection: any, docId: any, rating: any) => {
    const ref = firestore().collection(collection).doc(docId);

    await firestore().runTransaction(async transaction => {
      const doc = await transaction.get(ref);
      if (!doc.exists) return;

      const data = doc.data();

      const avg = data?.ratingAvg || 0;
      const count = data?.ratingCount || 0;

      const newCount = count + 1;
      const newAvg = (avg * count + rating) / newCount;

      transaction.update(ref, {
        ratingAvg: newAvg,
        ratingCount: newCount,
      });
    });
  };

  // ✅ Submit
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const alreadyRated = await checkAlreadyRated();

      if (alreadyRated) {
        Alert.alert("Already Rated", "You already rated this session");
        setLoading(false);
        return;
      }

      // 🔥 1. Save rating
      await firestore().collection('ratings').add({
        riderId: uid,
        operatorId: session.operator_id ? session.operator_id : session.operatorId,
        slotId: session?.slotId ? session?.slotId : session?.id,
        captainId: session.captain?.id,

        ratingSession: sessionRating,
        ratingCaptain: captainRating,
        ratingOperator: operatorRating,

        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // 🔥 2. Update averages
      await Promise.all([
        updateAverageRating('slots', session?.slotId ? session?.slotId : session?.id, sessionRating),
        updateAverageRating('users', session.operator_id ? session.operator_id : session.operatorId, operatorRating),
        updateAverageRating('captains', session.captain?.id, captainRating),
      ]);

      Alert.alert("Success", "Thanks for your feedback!");

      navigation.goBack();
    } catch (error) {
      console.log("Rating Error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* 🔙 Header */}
      <ScreenHeader title="Rate Experience" onBack={() => navigation.goBack()} />

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
            (!isValid || loading) && styles.disabledBtn,
          ]}
          disabled={!isValid || loading}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            {loading ? "Submitting..." : "Submit Rating"}
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
    color: colors.white,
    fontWeight: "600",
  },
});