import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Pencil, Trash2, X } from 'lucide-react-native';

import {
  colors,
  horizontalScale,
  verticalScale,
  typography,
} from '../../theme';

import { Button, Input } from '../atoms';

// Firebase
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import firestore, { serverTimestamp } from '@react-native-firebase/firestore';

const emptyActivity = {
  label: '',
  durationMinutes: '',
};

export const ActivityManagerModal = ({
  visible,
  onClose,
  data,
  handleDelete,
}: any) => {

  const app = getApp();
  const auth = getAuth(app);
  const uid = auth.currentUser?.uid;

  const [editingActivity, setEditingActivity] = useState(false);
  const [activity, setActivity] = useState<any>(emptyActivity);
  const [saving, setSaving] = useState(false);

  // CREATE
  const handleCreate = () => {
    setActivity(emptyActivity);
    setEditingActivity(true);
  };

  // EDIT
  const handleEdit = (item: any) => {
    setActivity(item);
    setEditingActivity(true);
  };

  // SAVE
  const handleSaveActivity = async () => {

    if (!activity.label) return;

    try {

      setSaving(true);

      const payload = {
        label: activity.label,
        value: activity.label,
        durationMinutes: Number(activity.durationMinutes),
        operator_id: uid,
        createdAt: serverTimestamp(),
      };

      if (activity.id) {

        await firestore()
          .collection('activities')
          .doc(activity.id)
          .update(payload);

      } else {

        await firestore()
          .collection('activities')
          .add(payload);
      }

      setSaving(false);
      setEditingActivity(false);
      setActivity(emptyActivity);

    } catch (error) {

      setSaving(false);
      Alert.alert('Save activity error', String(error));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>

      <View style={styles.modal}>

        <View style={styles.modalCard}>

          {!editingActivity ? (

            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}

              ListHeaderComponent={
                <View style={styles.headerRow}>
                  <Text style={styles.modalTitle}>Activities</Text>
                  <X size={25} onPress={onClose} />
                </View>
              }

              renderItem={({ item }) => (

                <View style={styles.itemRow}>

                  <Text>{item.label}</Text>

                  <View style={styles.iconRow}>

                    <TouchableOpacity onPress={() => handleEdit(item)}>
                      <Pencil size={18} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Trash2 size={18} />
                    </TouchableOpacity>

                  </View>

                </View>

              )}

              ListFooterComponent={
                <Button
                  label="Add New Activity"
                  onPress={handleCreate}
                />
              }

            />

          ) : (

            <KeyboardAwareScrollView
              enableOnAndroid
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >

              <View style={styles.headerRow}>
                <Text style={styles.modalTitle}>Activity Details</Text>

                <X
                  size={25}
                  onPress={() => {
                    setActivity(emptyActivity);
                    setEditingActivity(false);
                  }}
                />

              </View>

              <Input
                placeholder="Label"
                value={activity.label}
                onChangeText={(v) =>
                  setActivity({ ...activity, label: v })
                }
              />

              <Input
                placeholder="Duration (minutes)"
                keyboardType="numeric"
                value={String(activity.durationMinutes)}
                onChangeText={(v) =>
                  setActivity({ ...activity, durationMinutes: v })
                }
              />

              <Button
                disabled={saving}
                label={saving ? 'Saving...' : 'Save Activity'}
                onPress={handleSaveActivity}
              />

            </KeyboardAwareScrollView>

          )}

        </View>

      </View>

    </Modal>
  );
};


const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: horizontalScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    backgroundColor: colors.white,
    padding: 16,
    maxHeight: '80%',
    width: '100%',
    borderRadius: horizontalScale(20),
  },

  modalTitle: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },

  headerRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
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

  preview: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: verticalScale(10),
    alignSelf: 'center',
  },

});