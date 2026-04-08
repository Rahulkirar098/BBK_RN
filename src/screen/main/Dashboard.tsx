import React, { useState, useEffect } from 'react';
import OperatorDashboard from './operator/dashboard';
import { RiderDashboard } from './rider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('bbs_user');
        const onBoardStatus = await AsyncStorage.getItem('onBoardStatus');

        const role = JSON.parse(storedRole || '{}').role;

        if (onBoardStatus === 'pending') {
          navigation.replace('register', { role });
          return;
        }
        setRole(role);
      } catch (e) {
        console.log('Error reading role', e);
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, []);
  if (loading) return null;
  return role === 'RIDER' ? <RiderDashboard /> : <OperatorDashboard />;
};

export default Dashboard;
