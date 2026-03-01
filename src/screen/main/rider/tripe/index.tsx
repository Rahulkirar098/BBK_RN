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


import { useNavigation } from '@react-navigation/native';


import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripsHeader } from './header';
import { StatsCards } from './stats';
import { UpcomingSessions } from './upcomming';

export const Trip = () => {
  const navigation = useNavigation<any>();


  /* ---------------- MAIN UI ---------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TripsHeader />
        <StatsCards bookings={[]} />
        <UpcomingSessions 
          bookings={[]}
  // onBrowse={}
  // handleAddToCalendar,
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
});
