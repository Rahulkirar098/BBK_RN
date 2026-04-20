import { collection, query, where, onSnapshot } from '@react-native-firebase/firestore';
import firestore from '@react-native-firebase/firestore';

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

  return unsubscribe; // important
};


export const getCaptainRating = async (captainId: string) => {
  try {
    const doc: any = await firestore()
      .collection('captains')
      .doc(captainId)
      .get();

    if (doc.exists) {
      const data = doc.data();

      return {
        avg: data?.ratingAvg || 0,
        count: data?.ratingCount || 0,
      };
    }
  } catch (error) {
    console.log(error);
  }
};