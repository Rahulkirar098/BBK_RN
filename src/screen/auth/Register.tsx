import React, { useReducer } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';

import { useRoute, useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

/* ---------------- FIREBASE ---------------- */

import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

/* ---------------- COMPONENTS ---------------- */

import { Input } from '../../components/atoms/input';
import { Select } from '../../components/atoms/select';

/* ---------------- CONSTANTS ---------------- */

const riderSkillLevels = ['beginner', 'Intermediate', 'Advance'] as const;

const languages = [
  { label: 'English', value: 'EN' },
  { label: 'Chinese', value: 'CN' },
  { label: 'Russian', value: 'RU' },
];

/* ---------------- TYPES ---------------- */

type UserRole = 'RIDER' | 'OPERATOR';

type State = {
  name: string;
  skillLevel: string;
  agencyName: string;
  licenceNumber: string;
  language: string;
  emiratesFront: any | null;
  emiratesBack: any | null;
  loading: boolean;
  error: string | null;
};

/* ---------------- REDUCER ---------------- */

const initialState: State = {
  name: '',
  skillLevel: 'beginner',
  agencyName: '',
  licenceNumber: '',
  language: '',
  emiratesFront: null,
  emiratesBack: null,
  loading: false,
  error: null,
};

function reducer(state: State, action: any): State {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_ERROR':
      return { ...state, error: action.value };
    default:
      return state;
  }
}

/* ---------------- HELPERS ---------------- */

const normalizeUri = (uri: string) =>
  Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

/* ---------------- SCREEN ---------------- */

const RegisterScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [state, dispatch] = useReducer(reducer, initialState);

  const auth = getAuth(getApp());
  const db = getFirestore(getApp());

  const roleParam = route.params?.role?.toLowerCase();
  const userRole: UserRole | null =
    roleParam === 'rider'
      ? 'RIDER'
      : roleParam === 'operator'
      ? 'OPERATOR'
      : null;

  if (!userRole) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Invalid registration type</Text>
      </View>
    );
  }

  /* ---------- IMAGE PICKER ---------- */

  const pickImage = async (field: 'emiratesFront' | 'emiratesBack') => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (!res.didCancel && res.assets?.[0]) {
      dispatch({ type: 'SET_FIELD', field, value: res.assets[0] });
    }
  };

  /* ---------- SUBMIT ---------- */

  const handleSubmit = async () => {
    dispatch({ type: 'SET_ERROR', value: null });

    const {
      name,
      skillLevel,
      agencyName,
      licenceNumber,
      language,
      emiratesFront,
      emiratesBack,
    } = state;

    if (!name || !language || !emiratesFront || !emiratesBack) {
      return dispatch({
        type: 'SET_ERROR',
        value: 'Please complete all required fields.',
      });
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', value: true });

      /* -------- STORAGE (CORRECT WAY) -------- */

      const frontRef = storage().ref(
        `users/${user.uid}/emirates/front-${Date.now()}.jpg`
      );

      const backRef = storage().ref(
        `users/${user.uid}/emirates/back-${Date.now()}.jpg`
      );

      await frontRef.putFile(normalizeUri(emiratesFront.uri));
      await backRef.putFile(normalizeUri(emiratesBack.uri));

      const frontUrl = await frontRef.getDownloadURL();
      const backUrl = await backRef.getDownloadURL();

      /* -------- FIRESTORE -------- */

      await setDoc(
        doc(db, 'users', user.uid),
        {
          userProfile: {
            userRole,
            name,
            language,
            emiratesId: { frontUrl, backUrl },
            ...(userRole === 'RIDER'
              ? { skillLevel }
              : { agencyName, licenceNumber }),
            complianceStatus: 'PENDING',
            createdAt: serverTimestamp(),
          },
        },
        { merge: true }
      );

      navigation.replace('bottom_tab');
    } catch (e) {
      console.log(e);
      dispatch({
        type: 'SET_ERROR',
        value: 'Upload failed. Please try again.',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  };

  /* ---------- UI ---------- */

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {userRole === 'RIDER'
            ? 'Rider Registration'
            : 'Operator Registration'}
        </Text>

        {state.error && <Text style={styles.error}>{state.error}</Text>}

        <Input
          placeholder="Full Name"
          value={state.name}
          onChangeText={v =>
            dispatch({ type: 'SET_FIELD', field: 'name', value: v })
          }
        />

        {userRole === 'RIDER' && (
          <Select
            label="Skill Level"
            options={riderSkillLevels.map(v => ({ label: v, value: v }))}
            value={state.skillLevel}
            onChange={v =>
              dispatch({ type: 'SET_FIELD', field: 'skillLevel', value: v })
            }
          />
        )}

        <Select
          label="Language"
          options={languages}
          value={state.language}
          onChange={v =>
            dispatch({ type: 'SET_FIELD', field: 'language', value: v })
          }
        />

        <TouchableOpacity
          style={styles.upload}
          onPress={() => pickImage('emiratesFront')}
        >
          <Text>Upload Emirates ID Front</Text>
        </TouchableOpacity>

        {state.emiratesFront && (
          <Image source={{ uri: state.emiratesFront.uri }} style={styles.preview} />
        )}

        <TouchableOpacity
          style={styles.upload}
          onPress={() => pickImage('emiratesBack')}
        >
          <Text>Upload Emirates ID Back</Text>
        </TouchableOpacity>

        {state.emiratesBack && (
          <Image source={{ uri: state.emiratesBack.uri }} style={styles.preview} />
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          {state.loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    gap: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  upload: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  preview: {
    height: 140,
    borderRadius: 16,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  error: {
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 12,
    fontSize: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
