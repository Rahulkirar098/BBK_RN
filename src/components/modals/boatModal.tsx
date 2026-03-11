import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
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
import ImageResizer from 'react-native-image-resizer';
import { statusOptions } from '../../utils';

// Firebase
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import firestore, { getFirestore, serverTimestamp } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

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

    const compressed = await ImageResizer.createResizedImage(
      asset.uri,
      800,
      800,
      'JPEG',
      70,
    );

    setBoat({
      ...boat,
      imageUrl: compressed.uri,
    });
  };

  // IMAGE UPLOAD
  const uploadImage = async (uri: string, path: string) => {
    try {
      const uploadUri = uri.replace('file://', '');

      const reference = storage().ref(path);

      await reference.putFile(uploadUri);

      const url = await reference.getDownloadURL();

      return url;
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
        const path = `boats/${uid}/${Date.now()}.jpg`;
        imageUrl = await uploadImage(boat.imageUrl, path);
      }

      const payload = {
        ...boat,
        imageUrl,
        operator_id: uid,
        createdAt: serverTimestamp(),
      };

      if (boat.id) {
        await firestore().collection('boats').doc(boat.id).update(payload);
      } else {
        await firestore().collection('boats').add(payload);
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
                <Image
                  source={{ uri: boat.imageUrl }}
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