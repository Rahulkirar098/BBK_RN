import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';

import { colors } from '../../theme';
import { apiCallMethod } from '../../api/apiCallMethod';

/* ---------------- TYPES ---------------- */

type UserRole = 'RIDER' | 'OPERATOR' | 'ADMIN';

type AuthRouteParams = {
  role: UserRole;
};

/* ---------------- HELPERS ---------------- */

const cleanObject = (obj: any) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

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

  /* ---------------- STRIPE ---------------- */

  const handleCreateStripeAccount = async (
    operatorUid: string,
    email: string,
  ) => {
    try {
      let response = await apiCallMethod.createConnectAccount({
        operatorUid,
        email,
      });

      if (response.status === 200) {
        const stripeAccountId = response?.data?.stripeAccountId;

        // ✅ SAVE IN FIRESTORE
        const app = getApp();
        const firestore = getFirestore(app);

        await setDoc(
          doc(firestore, 'users', operatorUid),
          {
            stripeAccountId: stripeAccountId,
            stripe: {
              accountId: stripeAccountId,
              onboardingComplete: false, // optional but recommended
            },
          },
          { merge: true },
        );

        // ✅ NAVIGATE
        navigation.replace('register', {
          role: userRole.toLowerCase(),
        });
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
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
      const idToken = signInResult?.data?.idToken || signInResult?.idToken;

      if (!idToken) {
        throw new Error('Google sign-in failed (no token)');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      const user: any = result.user;

      /* ---------------- FIRESTORE ---------------- */

      const userRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      // ❗ ROLE VALIDATION
      if (userSnap.exists()) {
        const existingRole = userSnap.data()?.role;

        if (existingRole && existingRole !== userRole) {
          setError(
            `You are already registered as a ${existingRole}. Please continue as ${existingRole}.`,
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
        provider: 'google',
        updatedAt: serverTimestamp(),
      });

      // ✅ NEW USER
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          ...baseUserData,
          createdAt: serverTimestamp(),
          userProfile: {
            onBoardStatus: 'pending',
          },
        });
      } else {
        // ✅ EXISTING USER (DO NOT OVERRIDE onboarding)
        await setDoc(userRef, baseUserData, { merge: true });
      }

      /* ---------------- GET FINAL STATUS ---------------- */

      const updatedSnap = await getDoc(userRef);

      let onBoardStatus = 'pending';

      if (updatedSnap.exists()) {
        const dbStatus = updatedSnap.data()?.userProfile?.onBoardStatus;

        if (dbStatus === 'completed') {
          onBoardStatus = 'completed';
        }
      }

      /* ---------------- LOCAL STORAGE ---------------- */

      await AsyncStorage.setItem('bbs_user', JSON.stringify(baseUserData));
      await AsyncStorage.setItem('onBoardStatus', onBoardStatus);

      console.log('FINAL STATUS:', onBoardStatus);

      /* ---------------- REDIRECT ---------------- */

      if (onBoardStatus === 'completed') {
        navigation.replace('bottom_tab');
      } else {
        // still pending
        if (userRole === 'OPERATOR') {
          await handleCreateStripeAccount(user.uid, user.email);
        } else {
          navigation.replace('register', {
            role: userRole.toLowerCase(),
          });
        }
      }
    } catch (err: any) {
      console.log(err);
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  const roleLabel =
    userRole === 'RIDER'
      ? 'Rider'
      : userRole === 'OPERATOR'
        ? 'Operator'
        : 'Admin';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign in as {roleLabel}</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          onPress={handleGoogleSignIn}
          disabled={loading}
          style={[styles.googleBtn, loading && styles.disabledBtn]}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.googleText}>Continue with Google</Text>
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
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 28,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
  },
  googleBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  googleText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
