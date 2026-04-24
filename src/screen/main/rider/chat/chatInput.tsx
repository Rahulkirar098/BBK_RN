import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';

import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import { launchImageLibrary } from 'react-native-image-picker';
import { Send, Image as ImageIcon, X } from 'lucide-react-native';

export const ChatInput = ({ sessionId }: any) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const uid = auth().currentUser?.uid;

  /* ================= PICK IMAGE ================= */
  const handlePickImage = async () => {
    if (uploading) return;

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setImage(asset); // 🔥 store locally first (preview)
  };

  /* ================= SEND ================= */
  const handleSend = async () => {
    if (!text.trim() && !image) return;

    const messageText = text.trim();

    setUploading(true);

    try {
      let imageUrl = null;

      // 🔥 Upload image if exists
      if (image) {
        const fileName = `chat/${sessionId}/${Date.now()}.jpg`;
        const ref = storage().ref(fileName);

        await ref.putFile(image.uri);
        imageUrl = await ref.getDownloadURL();
      }

      const chatRef = firestore().collection('chats').doc(sessionId);

      await chatRef.collection('messages').add({
        type: imageUrl ? 'media' : 'text',
        text: messageText || null,
        imageUrl: imageUrl || null,
        senderId: uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // 🔥 reset
      setText('');
      setImage(null);

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();

    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.wrapper}>

      {/* 🖼 IMAGE PREVIEW */}
      {image && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image.uri }} style={styles.preview} />

          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => setImage(null)}
          >
            <X size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.container}>

        {/* 📷 PICK IMAGE */}
        <TouchableOpacity
          onPress={handlePickImage}
          style={styles.iconBtn}
          disabled={uploading}
        >
          <ImageIcon size={22} color="#555" />
        </TouchableOpacity>

        {/* ✏️ INPUT */}
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add a caption..."
          multiline
          editable={!uploading}
          style={styles.input}
        />

        {/* 🚀 SEND */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPress={handleSend}
            style={styles.sendBtn}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Send size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
  },

  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F1F1F1',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 10,
    fontSize: 15,
  },

  iconBtn: {
    padding: 6,
  },

  sendBtn: {
    backgroundColor: '#007AFF',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },

  previewContainer: {
  marginBottom: 8,
  alignSelf: 'flex-start',
},

preview: {
  width: 100,
  height: 100,
  borderRadius: 10,
},

removeBtn: {
  position: 'absolute',
  top: -6,
  right: -6,
  backgroundColor: 'red',
  borderRadius: 10,
  padding: 4,
},
});