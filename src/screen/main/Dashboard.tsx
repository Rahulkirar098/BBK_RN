import React, { useState, useEffect } from 'react';
import OperatorDashboard from './operator/OperatorDashboard';
import { RiderDashboard } from './rider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('bbs_user');
        setRole(JSON.parse(storedRole || '{}').role);
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
