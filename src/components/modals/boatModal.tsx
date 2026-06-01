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

import { Button, Input, Select } from '../atoms';
import { pickImageFromGallery } from '../../utils/common_logic';
import { statusOptions } from '../../utils';

// Firebase
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, serverTimestamp } from '@react-native-firebase/firestore';
import { apiCallMethod } from '../../api/apiCallMethod';

import FastImage from 'react-native-fast-image';

const emptyBoat: any = {
  operator_id: '',
  boatName: '',
  boatCompany: '',
  boatCapacity: 0,
  boatModel: '',
  status: 'Active',
  imageUrl: '',
};

export const BoatManagerModal = ({
  visible,
  onClose,
  data,
  handleDelete,
}: any) => {

  const app = getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const uid = auth.currentUser?.uid;

  const [editingBoat, setEditingBoat] = useState(false);
  const [boat, setBoat] = useState(emptyBoat);
  const [uploading, setUploading] = useState(false);

  // IMAGE PICK
  const handlePickImage = async () => {
    const asset = await pickImageFromGallery();
    if (!asset?.uri) return;
    setBoat((prev: any) => ({
      ...prev,
      imageUrl: asset.uri,
      _imageAsset: asset,
    }));
  };

  // IMAGE UPLOAD
  const uploadImageToServer = async () => {
    try {
      const uri = boat.imageUrl;
      const asset = boat._imageAsset;
      const fileName = asset?.fileName || `photo_${Date.now()}.jpg`;
      const type = asset?.type || 'image/jpeg';

      const formData = new FormData();
      formData.append('image', {
        uri,
        name: fileName,
        type,
      } as any);
      formData.append('path', 'boats');

      const response: any = await apiCallMethod.uploadImage(formData);

      if (response?.url) {
        return response?.url;
      }
      return '';
    } catch (error) {
      console.log('Upload error:', error);
      return '';
    }
  };

  // CREATE
  const handleCreate = () => {
    setBoat(emptyBoat);
    setEditingBoat(true);
  };

  // EDIT
  const handleEdit = (item: any) => {
    setBoat(item);
    setEditingBoat(true);
  };

  // SAVE
  const saveBoat = async () => {
    if (!boat.boatName) return;

    try {
      setUploading(true);

      let imageUrl = boat.imageUrl;

      if (boat.imageUrl && boat.imageUrl.startsWith('file')) {
        imageUrl = await uploadImageToServer();
      }

      const payload = {
        ...boat,
        imageUrl,
        operator_id: uid,
        createdAt: serverTimestamp(),
      };

      if (boat.id) {
        const response = await apiCallMethod.editBoat(boat.id, payload);
        console.log('Boat updated:', response);
      } else {
        const response = await apiCallMethod.createBoat(payload);
        console.log('Boat created:', response);
      }

      setEditingBoat(false);
      setBoat(emptyBoat);

    } catch (error) {
      Alert.alert('Save boat error:', String(error));
    }

    setUploading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>

      <View style={styles.modal}>
        <View style={styles.modalCard}>

          {!editingBoat ? (

            <FlatList
              data={data}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}

              ListHeaderComponent={
                <View style={styles.headerRow}>
                  <Text style={styles.modalTitle}>Boats</Text>
                  <X size={25} onPress={onClose} />
                </View>
              }

              renderItem={({ item }) => (
                <View style={styles.itemRow}>

                  <Text>{item.boatName}</Text>

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
                <Button label="Add New Boat" onPress={handleCreate} />
              }
            />

          ) : (

            <KeyboardAwareScrollView
              enableOnAndroid
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >

              <View style={styles.headerRow}>
                <Text style={styles.modalTitle}>Boat Details</Text>

                <X
                  size={25}
                  onPress={() => {
                    setBoat(emptyBoat);
                    setEditingBoat(false);
                  }}
                />
              </View>

              <Input
                placeholder="Boat Name"
                value={boat.boatName}
                onChangeText={v => setBoat({ ...boat, boatName: v })}
              />

              <Input
                placeholder="Boat Company"
                value={boat.boatCompany}
                onChangeText={v => setBoat({ ...boat, boatCompany: v })}
              />

              <Input
                placeholder="Boat Model"
                value={boat.boatModel}
                onChangeText={v => setBoat({ ...boat, boatModel: v })}
                keyboardType="numeric"
              />

              <Input
                placeholder="Boat Capacity"
                keyboardType="numeric"
                value={String(boat.boatCapacity)}
                onChangeText={v =>
                  setBoat({
                    ...boat,
                    boatCapacity: Number(v),
                  })
                }
              />

              <Select
                label="Status"
                options={statusOptions}
                value={boat.status}
                onChange={v => setBoat({ ...boat, status: v })}
              />

              {boat.imageUrl !== '' && (
                <FastImage
                  source={{
                    uri: boat.imageUrl,
                    priority: FastImage.priority.normal,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                  style={styles.preview}
                />

              )}

              <Button label="Pick Image" onPress={handlePickImage} />

              <Button
                disabled={uploading}
                label={uploading ? 'Saving...' : 'Save Boat'}
                onPress={saveBoat}
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