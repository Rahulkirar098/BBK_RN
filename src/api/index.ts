import { Alert, Platform } from 'react-native';
import axios from 'axios';

const liveURL = 'https://bbk-be-1smn.vercel.app';
const baseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const instance = axios.create({
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Response interceptor with custom alert handling
instance.interceptors.response.use(
  response => {
    const { status, data } = response;
    if (status === 200 || status === 201) {
      return data;
    }
    Alert.alert('Error', data?.message || 'Unexpected response from server');
  },
  error => {
    if (error.response) {
      const { data } = error.response;
      Alert.alert('Error', data?.message || 'Something went wrong');
    } else {
      Alert.alert('Error', 'Network error. Please check your connection.');
    }
  },
);