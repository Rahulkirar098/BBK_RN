import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

type UserRole = "RIDER" | "OPERATOR" | "ADMIN";

const AuthScreen = () => {
//   const navigation = useNavigation<any>();
//   const route = useRoute<any>();

  const userRole = "RIDER";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- BACK HANDLER ---------------- */
  const handleBack = () => {
    setError(null);
    // navigation.navigate("RoleSelection");
  };

  /* ---------------- GOOGLE SIGN-IN ---------------- */
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      await GoogleSignin.hasPlayServices();

      const response:any = await GoogleSignin.signIn();

      const googleCredential =
        auth.GoogleAuthProvider.credential(response.idToken);

      const result = await auth().signInWithCredential(
        googleCredential
      );

      const user = result.user;

      const userRef = firestore().collection("users").doc(user.uid);
      const userSnap:any = await userRef.get();

      /* ---------------- ROLE VALIDATION ---------------- */
      if (userSnap.exists) {
        const existingRole = userSnap.data()?.role as UserRole;

        if (existingRole && existingRole !== userRole) {
          setError(
            `You are already registered as a ${existingRole}. Please continue as a ${existingRole}.`
          );
          setLoading(false);
          return;
        }
      }

      /* ---------------- SAVE USER DATA ---------------- */
      const baseUserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: userRole,
        provider: "google",
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await userRef.set(
        {
          ...baseUserData,
          createdAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      /* ---------------- LOCAL STORAGE ---------------- */
      await AsyncStorage.setItem(
        "bbs_user",
        JSON.stringify(baseUserData)
      );

      /* ---------------- REDIRECT LOGIC ---------------- */
      const isProfileCompleted = userSnap.exists && !!userSnap.data()?.userProfile;

      if (isProfileCompleted) {
        // navigation.replace("Dashboard");
      } else {
        // navigation.replace("Register", {
        //   role: userRole.toLowerCase(),
        // });
      }
    } catch (err: any) {
      console.log(err);
      setError(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI LABEL ---------------- */
  const roleLabel =
    userRole === "RIDER"
      ? "Rider"
      : userRole === "OPERATOR"
      ? "Operator"
      : "Admin";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* TITLE */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Sign in as {roleLabel}
          </Text>
          <Text style={styles.subtitle}>
            Continue with your Google account to access your{" "}
            {roleLabel.toLowerCase()} dashboard.
          </Text>
        </View>

        {/* ERROR */}
        {error && (
          <>
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>

            <Pressable style={styles.backBtn} onPress={handleBack}>
              <Text style={styles.backText}>
                ← Back to Role Selection
              </Text>
            </Pressable>
          </>
        )}

        {/* GOOGLE BUTTON */}
        <Pressable
          onPress={handleGoogleSignIn}
          disabled={loading}
          style={[
            styles.googleBtn,
            loading && styles.disabledBtn,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleText}>
                Continue with Google
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default AuthScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: "#DC2626",
  },
  backBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  googleIconText: {
    color: "#2563EB",
    fontWeight: "800",
  },
  googleText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
