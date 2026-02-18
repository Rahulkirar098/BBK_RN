import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RiderProfile } from './rider/profile';
import OperatorProfile from './operator/OperatorProfile';

const Profile = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('bbs_user');
        setRole(JSON.parse(storedRole || '{}').role); // e.g. "rider" | "owner"
      } catch (e) {
        console.log('Error reading role', e);
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, []);

  // Prevent navigator from flashing wrong tabs
  if (loading) return null;
  return role === 'RIDER' ? <RiderProfile /> : <OperatorProfile />;
};

export default Profile;
