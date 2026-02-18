import React, { useEffect, useReducer, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';

import { LogOut, Ship, Users, Pencil, Trash2 } from 'lucide-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { getAuth } from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import { Boat, Captain } from '../../../type';

import {
  StatCard,
  ProfileCard,
  Button,
  Input,
  Select,
  OutlinedButton,
} from '../../../components/atoms';

import {
  colors,
  typography,
  horizontalScale,
  verticalScale,
} from '../../../theme';

import ImageResizer from 'react-native-image-resizer';

import { language, statusOptions } from '../../../utils';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pickImageFromGallery } from '../../../utils/common_logic';

const auth = getAuth();
const db = getFirestore();

type State = {
  modalOpen: boolean;
  tab: 'boats' | 'captains';
  boats: Boat[];
  captains: Captain[];
  editingBoat: Boat | null;
  editingCaptain: Captain | null;
  boatImage: any | null;
  captainImage: any | null;
};

const emptyBoat: Boat = {
  id: '',
  boatName: '',
  boatCompany: '',
  boatCapacity: 0,
  boatModel: '',
  status: 'Active',
  imageUrl: '',
};

const emptyCaptain: Captain = {
  id: '',
  name: '',
  language: '',
  verified: false,
  imageUrl: '',
  rating: 0,
  licenseNumber: '',
};

const initialState: State = {
  modalOpen: false,
  tab: 'boats',
  boats: [],
  captains: [],
  editingBoat: null,
  editingCaptain: null,
  boatImage: null,
  captainImage: null,
};

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'OPEN_MODAL':
      return { ...state, modalOpen: true, tab: action.payload };

    case 'CLOSE_MODAL':
      return {
        ...state,
        modalOpen: false,
        editingBoat: null,
        editingCaptain: null,
        boatImage: null,
        captainImage: null,
      };

    case 'SET_BOATS':
      return { ...state, boats: action.payload };

    case 'SET_CAPTAINS':
      return { ...state, captains: action.payload };

    case 'CREATE_BOAT':
      return {
        ...state,
        editingBoat: action.payload,
        tab: 'boats',
        modalOpen: true,
      };

    case 'CREATE_CAPTAIN':
      return {
        ...state,
        editingCaptain: action.payload,
        tab: 'captains',
        modalOpen: true,
      };

    case 'EDIT_BOAT':
      return {
        ...state,
        editingBoat: action.payload,
        tab: 'boats',
        modalOpen: true,
      };

    case 'EDIT_CAPTAIN':
      return {
        ...state,
        editingCaptain: action.payload,
        tab: 'captains',
        modalOpen: true,
      };

    case 'SET_FIELD':
      const target = state[action.target];
      if (!target) return state;
      return {
        ...state,
        [action.target]: { ...target, [action.field]: action.value },
      };

    case 'SET_IMAGE':
      return { ...state, [action.target]: action.value };

    default:
      return state;
  }
}

const OperatorProfile = () => {
  const navigation = useNavigation<any>();

  const [operatorData, setOperatorData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false); // 🔥 loader state

  const [state, dispatch] = useReducer(reducer, initialState);

  const [uid, setUid] = useState<any>(null);

  useEffect(() => {
    const getUid = async () => {
      const stored = await AsyncStorage.getItem('bbs_user');
      if (stored) {
        setUid(JSON.parse(stored).uid);
      }
    };
    getUid();
  }, []);

  useEffect(() => {
    if (!uid) return;

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

    fetchProfile();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    const unsubBoats = onSnapshot(
      collection(db, 'users', uid, 'boats'),
      snap => {
        const boats = snap.docs.map(
          (d: any) => ({ id: d.id, ...d.data() } as Boat),
        );
        dispatch({ type: 'SET_BOATS', payload: boats });
      },
    );

    const unsubCaptains = onSnapshot(
      collection(db, 'users', uid, 'captains'),
      snap => {
        const captains = snap.docs.map(
          (d: any) => ({ id: d.id, ...d.data() } as Captain),
        );
        dispatch({ type: 'SET_CAPTAINS', payload: captains });
      },
    );

    return () => {
      unsubBoats();
      unsubCaptains();
    };
  }, [uid]);

  // 📌 IMAGE PICKER + COMPRESS
  const handlePickImage = async (target: string) => {
    const asset = await pickImageFromGallery();

    if (!asset?.uri) return;

    // 🔥 Compress image
    const compressed = await ImageResizer.createResizedImage(
      asset.uri,
      800,
      800,
      'JPEG',
      70,
    );

    dispatch({
      type: 'SET_IMAGE',
      target,
      value: { uri: compressed.uri },
    });
  };

  // 🔥 UPLOAD IMAGE WITH LOADER
  const uploadImage = async (file: any, path: string) => {
    setUploading(true);

    const reference = storage().ref(path);
    await reference.putFile(file.uri);
    const url = await reference.getDownloadURL();

    setUploading(false);
    return url;
  };

  const saveBoat = async () => {
    if (!state.editingBoat) return;
    if (!state.editingBoat.id && state.boats.length >= 5) {
      return Alert.alert('Maximum 5 boats allowed');
    }

    const id = state.editingBoat.id || Math.random().toString(36).substr(2, 9);
    let imageUrl = state.editingBoat.imageUrl;

    if (state.boatImage) {
      imageUrl = await uploadImage(state.boatImage, `boats/${uid}/${id}`);
    }

    await setDoc(doc(db, 'users', uid, 'boats', id), {
      ...state.editingBoat,
      id,
      imageUrl,
      createdAt: serverTimestamp(),
    });

    dispatch({ type: 'CLOSE_MODAL' });
  };

  const saveCaptain = async () => {
    if (!state.editingCaptain) return;
    if (!state.editingCaptain.id && state.captains.length >= 5) {
      return Alert.alert('Maximum 5 captains allowed');
    }

    const id =
      state.editingCaptain.id || Math.random().toString(36).substr(2, 9);
    let imageUrl = state.editingCaptain.imageUrl;

    if (state.captainImage) {
      imageUrl = await uploadImage(state.captainImage, `captains/${uid}/${id}`);
    }

    await setDoc(doc(db, 'users', uid, 'captains', id), {
      ...state.editingCaptain,
      id,
      imageUrl,
      createdAt: serverTimestamp(),
    });

    dispatch({ type: 'CLOSE_MODAL' });
  };

  const deleteItem = async (type: 'boats' | 'captains', id: string) => {
    await deleteDoc(doc(db, 'users', uid, type, id));
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

        <View style={styles.row}>
          <StatCard
            icon={<Ship size={20} />}
            count={state.boats.length}
            label="Active Boats"
            onPress={() => dispatch({ type: 'OPEN_MODAL', payload: 'boats' })}
          />
          <StatCard
            icon={<Users size={20} />}
            count={state.captains.length}
            label="Captains"
            onPress={() =>
              dispatch({ type: 'OPEN_MODAL', payload: 'captains' })
            }
          />
        </View>

        {/* 🔥 UPLOADING LOADER */}
        {uploading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="white" />
            <Text style={{ color: 'white', marginTop: 8 }}>Uploading...</Text>
          </View>
        )}

        <OutlinedButton
          label="Logout"
          onPress={logout}
          Icon={LogOut}
          color={colors.error}
        />
      </View>

      {/* 🚀 MODAL */}
      <Modal
        visible={state.modalOpen}
        animationType="slide"
        onRequestClose={() => dispatch({ type: 'CLOSE_MODAL' })}
        transparent={true}
      >
        <View style={styles.modal}>
          <View style={styles.modalCard}>
            <ScrollView nestedScrollEnabled={true}>
              <Text style={styles.modalTitle}>
                {state.tab === 'boats' ? 'Boats' : 'Captains'}
              </Text>

              {!state.editingBoat && !state.editingCaptain && (
                <FlatList
                  data={state.tab === 'boats' ? state.boats : state.captains}
                  keyExtractor={item => item.id}
                  nestedScrollEnabled
                  renderItem={({ item }) => (
                    <View style={styles.itemRow}>
                      <Text>
                        {state.tab === 'boats' ? item.boatName : item.name}
                      </Text>
                      <View style={styles.iconRow}>
                        <TouchableOpacity
                          onPress={() =>
                            dispatch({
                              type:
                                state.tab === 'boats'
                                  ? 'EDIT_BOAT'
                                  : 'EDIT_CAPTAIN',
                              payload: item,
                            })
                          }
                        >
                          <Pencil size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => deleteItem(state.tab, item.id)}
                        >
                          <Trash2 size={18} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              )}

              {!state.editingBoat && !state.editingCaptain && (
                <Button
                  label="Add New"
                  onPress={() =>
                    dispatch({
                      type:
                        state.tab === 'boats'
                          ? 'CREATE_BOAT'
                          : 'CREATE_CAPTAIN',
                      payload:
                        state.tab === 'boats'
                          ? { ...emptyBoat }
                          : { ...emptyCaptain },
                    })
                  }
                />
              )}

              {state.editingBoat && (
                <View style={{ gap: horizontalScale(5) }}>
                  <Input
                    placeholder="Boat Name"
                    value={state.editingBoat.boatName}
                    onChangeText={v =>
                      dispatch({
                        type: 'SET_FIELD',
                        target: 'editingBoat',
                        field: 'boatName',
                        value: v,
                      })
                    }
                  />
                  <Input
                    placeholder="Boat Company"
                    value={state.editingBoat.boatCompany}
                    onChangeText={v =>
                      dispatch({
                        type: 'SET_FIELD',
                        target: 'editingBoat',
                        field: 'boatCompany',
                        value: v,
                      })
                    }
                  />
                  <Input
                    placeholder="Boat Model"
                    value={state.editingBoat.boatModel}
                    onChangeText={v =>
                      dispatch({
                        type: 'SET_FIELD',
                        target: 'editingBoat',
                        field: 'boatModel',
                        value: v,
                      })
                    }
                  />
                  <Input
                    placeholder="Boat Capacity"
                    keyboardType="numeric"
                    value={String(state.editingBoat.boatCapacity)}
                    onChangeText={v =>
                      dispatch({
                        type: 'SET_FIELD',
                        target: 'editingBoat',
                        field: 'boatCapacity',
                        value: Number(v),
                      })
                    }
                  />

                  <Select
                    label="Status"
                    options={statusOptions}
                    onChange={v =>
                      dispatch({
                        type: 'SET_FIELD',
                        target: 'editingBoat',
                        field: 'status',
                        value: v,
                      })
                    }
                    value={state.editingBoat.status}
                  />

                  {/* 📌 IMAGE PREVIEW */}
                  {state.boatImage && (
                    <Image
                      source={{ uri: state.boatImage.uri }}
                      style={styles.preview}
                    />
                  )}
                  <Button
                    label="Pick Image"
                    onPress={() => handlePickImage('boatImage')}
                  />

                  <Button label="Save Boat" onPress={saveBoat} />
                </View>
              )}

              {state.editingCaptain && (
                <View style={{ gap: horizontalScale(5) }}>
                  <Input
                    placeholder="Captain Name"
                    value={state.editingCaptain.name}
                    onChangeText={v =>
                      dispatch({
                        type: 'SET_FIELD',
                        target: 'editingCaptain',
                        field: 'name',
                        value: v,
                      })
                    }
                  />

                  <Select
                    label="Status"
                    options={statusOptions}
                    onChange={v =>
                      dispatch({
                        type: 'SET_FIELD',
                        target: 'editingCaptain',
                        field: 'status',
                        value: v,
                      })
                    }
                    value={state.editingCaptain.status}
                  />

                  <Select
                    label="Language"
                    options={language}
                    onChange={v =>
                      dispatch({
                        type: 'SET_FIELD',
                        target: 'editingCaptain',
                        field: 'language',
                        value: v,
                      })
                    }
                    value={state.editingCaptain.language}
                  />

                  {/* 📌 IMAGE PREVIEW */}
                  {state.captainImage && (
                    <Image
                      source={{ uri: state.captainImage.uri }}
                      style={styles.preview}
                    />
                  )}
                  <Button
                    label="Pick Image"
                    onPress={() => handlePickImage('captainImage')}
                  />

                  <Button label="Save Captain" onPress={saveCaptain} />
                </View>
              )}
            </ScrollView>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => dispatch({ type: 'CLOSE_MODAL' })}
          >
            <Text style={{ color: 'white' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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

  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: horizontalScale(20),
    paddingTop: verticalScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    backgroundColor: colors.white,
    padding: 16,
    maxHeight: 500,
    width: '100%',
    borderRadius: horizontalScale(20),
  },

  modalTitle: {
    ...typography.screenTitle,
    marginBottom: 20,
    color: colors.textPrimary,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    marginBottom: 10,
  },

  iconRow: {
    flexDirection: 'row',
    gap: 16,
  },

  closeBtn: {
    backgroundColor: colors.gray900,
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },

  preview: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginTop: 10,
    alignSelf: 'center',
  },

  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
