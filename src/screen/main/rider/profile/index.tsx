import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';

import {
  colors,
  horizontalScale,
  verticalScale,
  typography,
} from '../../../../theme';

import Header from './header';
import { RiderProfileCard } from './reiderProfileCard';
import { SkillLevelSelector } from './skillLevel';
import { UpcomingBookings } from './upcomingBookings';
import { PastBookings } from './pastBookings';

/* ---------------- FIRESTORE LISTENER ---------------- */
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


import { useNavigation } from '@react-navigation/native';

export const RiderProfile = () => {
  const [riderData, setRiderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [skillLevel, setSkillLevel] = useState('');

  const navigation = useNavigation<any>();

  /* ---------------- AUTH + FIRESTORE LISTENER ---------------- */

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(user => {
      if (!user) {
        console.log('No user found');
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
            setSkillLevel(doc.data().userProfile.skillLevel);
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
          <Text style={styles.emptyText}>No profile found...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ---------------- UPDATE SKILLS ---------------- */
  const updateSkillLevel = async (level: string) => {
    try {
      const currentUser = auth().currentUser;

      if (!currentUser) return;

      await firestore().collection('users').doc(currentUser.uid).update({
        'userProfile.skillLevel': level,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Skill level updated successfully');
    } catch (error) {
      Alert.alert(JSON.stringify(error));
    }
  };


  const navigateSetting = () => {
    navigation.navigate('setting');
  };
  /* ---------------- MAIN UI ---------------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header />

        <RiderProfileCard
          riderData={riderData}
          navigateSetting={navigateSetting}
        />

        <SkillLevelSelector
          skillLevel={skillLevel}
          setSkillLevel={updateSkillLevel}
        />

        <UpcomingBookings
          upcomingBookings={riderData?.upcomingBookings || []}
          onBrowse={() => {}}
        />

        <PastBookings
          bookings={riderData?.bookings || []}
          pastBookings={riderData?.pastBookings || []}
          onBrowse={() => {}}
        />
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
