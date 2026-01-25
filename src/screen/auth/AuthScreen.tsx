import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getApp } from "@react-native-firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "@react-native-firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { colors } from "../../theme";

/* ---------------- TYPES ---------------- */

type UserRole = "RIDER" | "OPERATOR" | "ADMIN";

type AuthRouteParams = {
  role: UserRole;
};

/* ---------------- HELPERS ---------------- */

const cleanObject = (obj: any) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );

/* ---------------- SCREEN ---------------- */

const AuthScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { role: userRole } = route.params as AuthRouteParams;

  const app = getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- BACK HANDLER ---------------- */

  const handleBack = () => {
    setError(null);
    navigation.replace("role-selection");
  };

  /* ---------------- GOOGLE SIGN-IN ---------------- */

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const signInResult: any = await GoogleSignin.signIn();
      const idToken =
        signInResult?.data?.idToken || signInResult?.idToken;

      if (!idToken) {
        throw new Error("Google sign-in failed (no token)");
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      const user = result.user;

      /* ---------------- FIRESTORE ---------------- */

      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Validate role
      if (userSnap.exists()) {
        const existingRole = userSnap.data()?.role as UserRole;

        if (existingRole && existingRole !== userRole) {
          setError(
            `You are already registered as a ${existingRole}. Please continue as ${existingRole}.`
          );
          setLoading(false);
          return;
        }
      }

      /* ---------------- SAVE USER ---------------- */

      const baseUserData = cleanObject({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: userRole,
        provider: "google",
        updatedAt: serverTimestamp(),
      });

      await setDoc(
        userRef,
        {
          ...baseUserData,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      /* ---------------- LOCAL STORAGE ---------------- */

      await AsyncStorage.setItem(
        "bbs_user",
        JSON.stringify(baseUserData)
      );

      /* ---------------- REDIRECT ---------------- */

      const isProfileCompleted =
        userSnap.exists() && !!userSnap.data()?.userProfile;

      if (isProfileCompleted) {
        navigation.replace("bottom_tab");
      } else {
        navigation.replace("register", {
          role: userRole.toLowerCase(),
        });
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

  /* ---------------- UI ---------------- */

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign in as {roleLabel}</Text>
          <Text style={styles.subtitle}>
            Continue with Google to access your{" "}
            {roleLabel.toLowerCase()} dashboard.
          </Text>
        </View>

        {error && (
          <>
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>

            <Pressable style={styles.backBtn} onPress={handleBack}>
              <Text style={styles.backText}>← Back to Role Selection</Text>
            </Pressable>
          </>
        )}

        <Pressable
          onPress={handleGoogleSignIn}
          disabled={loading}
          style={[styles.googleBtn, loading && styles.disabledBtn]}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
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

/* ---------------- STYLES ---------------- */

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
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 28,
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  googleIconText: {
    color: colors.primary,
    fontWeight: "800",
  },
  googleText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
