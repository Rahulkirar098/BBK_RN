import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';

import {
  colors,
  horizontalScale,
  verticalScale,
  typography,
} from '../../../../theme';

/* ---------------- FIRESTORE LISTENER ---------------- */
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { SettingsHeader } from './header';
import { EmiratesIdSection } from './emiratesID';
import { PaymentMethodsSection } from './paymentCards';
import { LanguageNotificationsSection } from './language&Notifications';
import { useNavigation } from '@react-navigation/native';
import { SettingsActions } from './reset&Logout';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const Setting = () => {
  const navigation = useNavigation<any>();

  const goBack = () => {
    navigation.goBack();
  };

  const [riderData, setRiderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- AUTH + FIRESTORE LISTENER ---------------- */

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(user => {
      if (!user) {
        setRiderData(null);
        setLoading(false);
        return;
      }

      const unsubscribeFirestore = firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot(
          (doc: any) => {
            if (doc.exists) {
              setRiderData({
                id: doc.id,
                ...doc.data(),
              });
            }
            setLoading(false);
          },
          (error: any) => {
            console.error('Profile listener error:', error);
            setLoading(false);
          },
        );

      return unsubscribeFirestore;
    });

    return unsubscribeAuth;
  }, []);

  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('paymentMethods')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const list: any[] = [];

        snapshot.forEach(doc => {
          list.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setCards(list);
      });

    return () => unsubscribe();
  }, []);

  const deleteCard = async (cardId: string) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('paymentMethods')
        .doc(cardId)
        .delete();

      Alert.alert('Card deleted successfully ✅');
    } catch (error) {
      console.log(error);
      Alert.alert('Error deleting card');
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = async () => {
    await auth().signOut();
    await AsyncStorage.removeItem('bbs_user');
    navigation.replace('role-selection');
  };

  /* ---------------- LOADING STATE ---------------- */
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ---------------- NO PROFILE ---------------- */

  if (!riderData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>No profile found</Text>
        </View>
      </SafeAreaView>
    );
  }
  console.log(riderData?.userProfile?.emiratesId)
  /* ---------------- MAIN UI ---------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SettingsHeader goBack={goBack} />
        <EmiratesIdSection idData={riderData?.userProfile?.emiratesId}/>
        <PaymentMethodsSection cards={cards} onRemove={deleteCard} />
        <LanguageNotificationsSection
          language={riderData?.userProfile?.language}
          setLanguage={() => { }}
        />
        <SettingsActions onResetData={() => { }} onLogout={logout} />
      </View>
    </SafeAreaView>
  );
};

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    paddingHorizontal: horizontalScale(20),
    gap: verticalScale(14),
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 8,
  },

  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
