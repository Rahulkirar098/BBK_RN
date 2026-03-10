import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';

import { LogOut, Ship, Users, AlignCenter } from 'lucide-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { getAuth } from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  deleteDoc,
} from '@react-native-firebase/firestore';

import { fetchUserCollection } from "../../../services";

import {
  StatCard,
  ProfileCard,
  OutlinedButton,
} from '../../../components/atoms';

import {
  colors,
  typography,
  horizontalScale,
  verticalScale,
} from '../../../theme';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityManagerModal, BoatManagerModal, CaptainManagerModal } from '../../../components/modals';
import { getApp } from '@react-native-firebase/app';

const OperatorProfile = () => {
  const app = getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const uid: any = auth.currentUser?.uid;

  const navigation = useNavigation<any>();

  const [operatorData, setOperatorData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activityModal, setActivityModal] = useState(false);
  const [boatModal, setBoatModal] = useState(false);
  const [captionModal, setCaptionModal] = useState(false);

  const [activities, setActivities] = useState<Array<any>>([])
  const [boats, setBoats] = useState<Array<any>>([])
  const [captains, setCaptains] = useState<Array<any>>([])

  const fetchProfile = async () => {
    const snap = await getDoc(doc(db, 'users', uid));

    if (!snap.exists) {
      setError('Profile not found');
      return;
    }

    const profile = snap.data()?.userProfile;

    if (profile.userRole !== 'OPERATOR') {
      setError('Invalid operator profile');
      return;
    }

    setOperatorData({
      companyName: profile.agencyName,
      tradeLicense: profile.licenceNumber,
      taxId: profile.taxId || '',
      address: profile.address || '',
      payoutBalance: profile.payoutBalance ?? 0,
      fleetSize: profile.fleetSize ?? 0,
      activeCaptains: profile.activeCaptains ?? 0,
      complianceStatus: profile.complianceStatus ?? 'PENDING',
    });

    setLoading(false);
  };

  const fetchActivities = async () => {
    const data = await fetchUserCollection("activities", uid);
    setActivities(data);
  };

  const fetchBoats = async () => {
    const data = await fetchUserCollection("boats", uid);
    setBoats(data);
  };

  const fetchCaptains = async () => {
    const data = await fetchUserCollection("captains", uid);
    setCaptains(data);
  };

  useEffect(() => {
    if (!uid) return;
    fetchProfile();
    fetchActivities();
    fetchBoats();
    fetchCaptains();
  }, [uid]);

  // DELETE
  const handleActivityDelete = (id: string) => {
    Alert.alert('Delete Activity', 'Are you sure you want to delete this Activity?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'activities', id));
            const filtered = activities.filter(b => b.id !== id);
            setActivities(filtered);
            fetchActivities();
          } catch (error) {
            console.log('Delete error:', error);
          }
        },
      },
    ]);
  };

  const handleBoatDelete = (id: string) => {
    Alert.alert('Delete Boat', 'Are you sure you want to delete this boat?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'boats', id));
            const filtered = boats.filter(b => b.id !== id);
            setBoats(filtered);
            fetchBoats();
          } catch (error) {
            console.log('Delete error:', error);
          }
        },
      },
    ]);
  };

  const handleCaptianDelete = (id: string, name: string) => {
    Alert.alert('Delete Captain', `Delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'captains', id));
          const filtered = captains.filter(b => b.id !== id);
          setCaptains(filtered);
          fetchCaptains();
        },
      },
    ]);
  };


  const logout = async () => {
    await auth.signOut();
    await AsyncStorage.removeItem('bbs_user');
    navigation.replace('role-selection');
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  if (error || !operatorData)
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Business Hub</Text>
        </View>

        <ProfileCard operatorData={operatorData} />

        <TouchableOpacity style={{
          flexDirection: "row",
          gap: horizontalScale(5),
          alignItems: "center",
          backgroundColor: colors.white,
          padding: horizontalScale(10),
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.gray200,
        }} onPress={() => setActivityModal(true)}>
          <AlignCenter size={20} />
          <Text style={{ ...typography.sectionTitle }}>{activities.length} Activity</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <StatCard
            icon={<Ship size={20} />}
            count={boats.length}
            label="Active Boats"
            onPress={() => setBoatModal(true)}
          />
          <StatCard
            icon={<Users size={20} />}
            count={captains.length}
            label="Captains"
            onPress={() =>
              setCaptionModal(true)
            }
          />
        </View>

        <OutlinedButton
          label="Logout"
          onPress={logout}
          Icon={LogOut}
          color={colors.error}
        />
      </View>

      {activityModal && <ActivityManagerModal
        visible={activityModal}
        onClose={() => setActivityModal(false)}
        data={activities}
        handleDelete={handleActivityDelete}
        handleFetch={fetchActivities}
      />}

      {boatModal && <BoatManagerModal
        visible={boatModal}
        onClose={() => setBoatModal(false)}
        data={boats}
        handleDelete={handleBoatDelete}
        handleFetch={fetchBoats}
      />}

      {captionModal && <CaptainManagerModal
        visible={captionModal}
        onClose={() => setCaptionModal(false)}
        data={captains}
        handleDelete={handleCaptianDelete}
        handleFetch={fetchCaptains}
      />}

    </SafeAreaView>
  );
};

export default OperatorProfile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    paddingHorizontal: horizontalScale(20),
    gap: verticalScale(14),
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },

  row: {
    flexDirection: 'row',
    gap: horizontalScale(10),
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  error: {
    ...typography.body,
    color: colors.orange500,
  },
});
