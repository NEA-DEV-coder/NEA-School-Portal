import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export const logActivity = async (userId, description) => {
  try {
    await addDoc(collection(db, "activities"), {
      userId,
      description,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

export const getUserActivities = async (userId) => {
  try {
    const q = query(
      collection(db, "activities"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};
