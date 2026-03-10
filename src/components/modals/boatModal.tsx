import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native';
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

//--------Firebase--------//
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import firestore, {
  getFirestore,
  doc,
  collection,
  deleteDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from '@react-native-firebase/firestore';
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
  handleFetch,
  handleDelete,
}: any) => {
  //Firebase
  const app = getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const uid = auth.currentUser?.uid;

  const [editingBoat, setEditingBoat] = useState(false);
  const [boat, setBoat] = useState(emptyBoat);
  const [uploading, setUploading] = useState(false);

  // IMAGE PICKER
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

  // 🔥 UPLOAD IMAGE WITH LOADER
  const uploadImage = async (uri: string, path: string) => {
    try {
      // FIX for iOS
      const uploadUri = uri.replace('file://', '');

      const reference = storage().ref(path);

      await reference.putFile(uploadUri);

      const url = await reference.getDownloadURL();

      return url;
    } catch (error) {
      console.log('Upload error:', error);
      setUploading(false);
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

      const data = {
        ...boat,
        imageUrl,
        operator_id: uid,
        createdAt: serverTimestamp(),
      };

      if (boat.id) {
        await firestore().collection('boats').doc(boat.id).update(data);
        handleFetch();
        setUploading(false);
      } else {
        await firestore().collection('boats').add(data);
        handleFetch();
        setUploading(false);
      }
      setEditingBoat(false);
      setBoat(emptyBoat);
    } catch (error) {
      Alert.alert('Save boat error:', String(error));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modal}>
        <View style={styles.modalCard}>
          {!editingBoat ? (
            <FlatList
              data={data}
              keyExtractor={item => item.id}
              ListHeaderComponent={
                <View
                  style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                  }}
                >
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
            <ScrollView>
              <View
                style={{
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}
              >
                <Text style={styles.modalTitle}>Boat Details</Text>
                <X size={25} onPress={() => {
                  setBoat(emptyBoat);
                  setEditingBoat(false);
                }} />
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
                <Image source={{ uri: boat.imageUrl }} style={styles.preview} />
              )}

              <Button label="Pick Image" onPress={handlePickImage} />

              <Button
                disabled={uploading}
                label={uploading ? 'Saving...' : 'Save Boat'}
                onPress={saveBoat}
              />
            </ScrollView>
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
    width: '100%',
  },

  preview: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: verticalScale(10),
    alignSelf: 'center',
  },
});
