import { collection, getDocs, query, where } from '@react-native-firebase/firestore';
import firestore from '@react-native-firebase/firestore';

const db = firestore();

export const fetchUserCollection = async (
  collectionName: string,
  uid: string
) => {

  try {

    const q = query(
      collection(db, collectionName),
      where("operator_id", "==", uid)
    );

    const snapshot = await getDocs(q);

    const list = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return list;

  } catch (error) {
    console.log(`Fetch ${collectionName} error:`, error);
    return [];
  }

};