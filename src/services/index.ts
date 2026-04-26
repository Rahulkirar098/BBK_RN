import firestore from '@react-native-firebase/firestore';
import { collection, query, where, onSnapshot } from '@react-native-firebase/firestore';

const db = firestore();

export const listenUserCollection = (
  collectionName: string,
  uid: string,
  setState: (data: any[]) => void
) => {

  const q = query(
    collection(db, collectionName),
    where("operator_id", "==", uid)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {

      const list = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setState(list);

    },
    (error) => {
      console.log(`Realtime ${collectionName} error:`, error);
    }
  );

  return unsubscribe;
};