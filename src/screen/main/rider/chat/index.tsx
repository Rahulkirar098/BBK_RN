import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Image,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../../theme';
import { ChatInput } from './chatInput';
import { ScreenHeader } from '../../../../components/atoms';


export const ChatScreen = () => {
  const navigation = useNavigation<any>();
  const { params }: any = useRoute();
  const { sessionId } = params;

  const uid = auth().currentUser?.uid;

  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [text, setText] = useState('');

  const flatListRef = useRef<any>(null);

  /* ================= MEMBERS ================= */
  useEffect(() => {
    const unsub = firestore()
      .collection('chats')
      .doc(sessionId)
      .collection('members')
      .onSnapshot(snap => {
        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));
        setMembers(list);
      });

    return () => unsub();
  }, []);

  /* ================= MESSAGES ================= */
  useEffect(() => {
    const unsub = firestore()
      .collection('chats')
      .doc(sessionId)
      .collection('messages')
      .orderBy('createdAt', 'desc') // ✅ IMPORTANT
      .limit(50)
      .onSnapshot(snap => {
        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));

        setMessages(list); // ✅ NO reverse
      });

    return () => unsub();
  }, []);

  /* ================= HELPERS ================= */

  const getUser = (id: string) =>
    members.find(m => m.userId === id);

  const formatTime = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLabel = (date: any) => {
    if (!date) return '';

    const d = date.toDate ? date.toDate() : new Date(date);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = d.toDateString() === today.toDateString();
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return d.toLocaleDateString();
  };

  /* ================= DATE CHECK ================= */
  const shouldShowDate = (current: any, prev: any) => {
    if (!prev) return true;

    const c = current?.createdAt?.toDate?.();
    const p = prev?.createdAt?.toDate?.();

    if (!c || !p) return false;

    return c.toDateString() !== p.toDateString();
  };

  /* ================= RENDER ================= */
  const renderItem = ({ item, index }: any) => {
    const isMe = item.senderId === uid;
    const isSystem = item.type === 'system';

    const prev = messages[index + 1]; // inverted list
    const showDate = shouldShowDate(item, prev);

    const user = getUser(item.senderId);

    return (
      <View>
        {/* 📅 DATE */}
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {formatDateLabel(item.createdAt)}
            </Text>
          </View>
        )}

        {/* 🔥 SYSTEM */}
        {isSystem ? (
          <View style={styles.systemContainer}>
            <Text style={styles.systemText}>{item.text}</Text>
          </View>
        ) : (
          <View
            style={[
              styles.row,
              isMe ? styles.rowRight : styles.rowLeft,
            ]}
          >
            {/* 👤 Avatar */}
            {!isMe && (
              <Image
                source={{
                  uri: user?.photoURL || 'https://i.pravatar.cc/100',
                }}
                style={styles.avatar}
              />
            )}

            {/* 💬 BUBBLE */}
            <View
              style={[
                styles.bubble,
                isMe ? styles.myBubble : styles.otherBubble,
                item.imageUrl && { padding: 6 }, // tighter for media
              ]}
            >
              {/* ================= IMAGE ================= */}
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              )}

              {/* ================= TEXT ================= */}
              {item.text ? (
                <Text
                  style={{
                    color: isMe ? '#fff' : '#000',
                    marginTop: item.imageUrl ? 6 : 0,
                  }}
                >
                  {item.text}
                </Text>
              ) : null}

              {/* 🕒 TIME */}
              <Text
                style={[
                  styles.time,
                  { color: isMe ? '#eee' : '#666' },
                ]}
              >
                {formatTime(item.createdAt)}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderMembersHeader = () => {
    console.log(members,"===@@@")
    return (
      <View style={styles.membersHeader}>
        <FlatList
          data={members}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.memberItem}>
              <Image
                source={{
                  uri:
                    item.photoURL ||
                    'https://i.pravatar.cc/100?img=7',
                }}
                style={styles.memberAvatar}
              />
              <Text numberOfLines={1} style={styles.memberName}>
                {item.name || 'User'}
              </Text>
            </View>
          )}
        />
      </View>
    );
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: colors.background,
    }}>

      <View style={styles.container}>
        <ScreenHeader title="Chat" onBack={() => navigation.goBack()} />

        {renderMembersHeader()}

        <FlatList
          ref={flatListRef}
          data={messages}
          inverted
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10 }}
        />

        {/* INPUT */}
        <ChatInput sessionId={sessionId} />
      </View>
    </SafeAreaView>

  );
};

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },

  row: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },

  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
  },

  bubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 14,
  },

  myBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },

  otherBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },


  /* 📅 DATE */
  dateContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },

  dateText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  /* 🔥 SYSTEM */
  systemContainer: {
    alignItems: 'center',
    marginVertical: 6,
  },

  systemText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  /* INPUT */
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
  },

  input: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 15,
  },

  send: {
    marginLeft: 10,
    alignSelf: 'center',
    color: '#007AFF',
    fontWeight: '600',
  },

  membersHeader: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },

  memberItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: 60,
  },

  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  memberName: {
    fontSize: 11,
    marginTop: 4,
  },

  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },

  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});