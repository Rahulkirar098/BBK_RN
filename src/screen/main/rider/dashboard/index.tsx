import React, { useState, useEffect } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';

//Firebase
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  serverTimestamp,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  updateDoc,
  getDocs,
  Timestamp,
} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors, horizontalScale, verticalScale } from '../../../../theme';
import { Header } from '../../../../components/molicules';
import { TimeFilterBar } from '../../../../components/molicules';
import { TimeFilter } from '../../../../type';

export const RiderDashboard = () => {
  const navigation = useNavigation<any>();

  //Time line bar and filter//
  //State
  const [selectedTab, setSelectedTab] = useState<TimeFilter>('NOW');
  const [languageFilter, setLanguageFilter] = useState<string | null>(null);

  const toggleLanguageFilter = () => {
    if (languageFilter === null) setLanguageFilter('Russian');
    else if (languageFilter === 'Russian') setLanguageFilter('Chinese');
    else setLanguageFilter(null);
  };

  const t = {
    now: 'Now',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
  };
  //Time line bar and filter//

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onPressHelp={() => navigation.navigate('explanation')} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalScale(20),
          marginVertical: verticalScale(10),
        }}
      >
        <TimeFilterBar
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          t={t}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
