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
import { Button, Input, Select } from '../atoms';
import {
  colors,
  horizontalScale,
  verticalScale,
  typography,
} from '../../theme';

import { pickImageFromGallery } from '../../utils/common_logic';
import ImageResizer from 'react-native-image-resizer';

import { statusOptions, language } from '../../utils';

// Firebase
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';

import storage from '@react-native-firebase/storage';

const emptyCaptain = {
  name: '',
  language: '',
  status: 'Active',
  imageUrl: '',
  operator_id: '',
  phone_no: '',
};

export const CaptainManagerModal = ({ visible, onClose, data, handleDelete }: any) => {
  const app = getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const uid = auth.currentUser?.uid;

  const [editingCaptain, setEditingCaptain] = useState<any | null>(null);
  const [captain, setCaptain] = useState<any>(emptyCaptain);
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

    setCaptain({
      ...captain,
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
    setCaptain(emptyCaptain);
    setEditingCaptain({});
  };

  // EDIT
  const handleEdit = (item: any) => {
    setCaptain(item);
    setEditingCaptain(item);
  };

  // SAVE
  const saveCaptain = async () => {
    if (!captain.name) return;

    try {
      setUploading(true);

      let imageUrl = captain.imageUrl;

      if (imageUrl?.startsWith('file')) {
        const path = `captains/${uid}/${Date.now()}.jpg`;
        imageUrl = await uploadImage(imageUrl, path);
      }

      const payload = {
        ...captain,
        imageUrl,
        operator_id: uid,
        createdAt: serverTimestamp(),
      };

      if (captain.id) {
        await updateDoc(doc(db, 'captains', captain.id), payload);
      } else {
        await addDoc(collection(db, 'captains'), payload);
      }

      setEditingCaptain(null);
      setCaptain(emptyCaptain);
    } catch (error) {
      Alert.alert('Save Captain Error', String(error));
    }

    setUploading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modal}>
        <View style={styles.modalCard}>

          {!editingCaptain ? (
            <FlatList
              data={data}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}

              ListHeaderComponent={
                <View style={styles.headerRow}>
                  <Text style={styles.modalTitle}>Captains</Text>
                  <X size={25} onPress={onClose} />
                </View>
              }

              renderItem={({ item }) => (
                <View style={styles.itemRow}>
                  <Text>{item.name}</Text>

                  <View style={styles.iconRow}>
                    <TouchableOpacity onPress={() => handleEdit(item)}>
                      <Pencil size={18} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(item.id, item.name)}
                    >
                      <Trash2 size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              ListFooterComponent={
                <Button label="Add Captain" onPress={handleCreate} />
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
                <Text style={styles.modalTitle}>Captain Details</Text>

                <X
                  size={25}
                  onPress={() => {
                    setCaptain(emptyCaptain);
                    setEditingCaptain(null);
                  }}
                />
              </View>

              <Input
                placeholder="Captain Name"
                value={captain.name}
                onChangeText={v => setCaptain({ ...captain, name: v })}
              />

              <Input
                placeholder="Captain Phone no"
                value={captain.phone_no}
                keyboardType="numeric"
                onChangeText={v =>
                  setCaptain({ ...captain, phone_no: v })
                }
              />

              <Select
                label="Status"
                options={statusOptions}
                value={captain.status}
                onChange={v =>
                  setCaptain({ ...captain, status: v })
                }
              />

              <Select
                label="Language"
                options={language}
                value={captain.language}
                onChange={v =>
                  setCaptain({ ...captain, language: v })
                }
              />

              {captain.imageUrl !== '' && (
                <Image
                  source={{ uri: captain.imageUrl }}
                  style={styles.preview}
                />
              )}

              <Button label="Pick Image" onPress={handlePickImage} />

              <Button
                disabled={uploading}
                label={uploading ? 'Saving...' : 'Save Captain'}
                onPress={saveCaptain}
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