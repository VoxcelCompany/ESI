import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { decrypt } from "../tasks/crypt";

const credentials = JSON.parse(decrypt(process.env.GOOGLE_CREDENTIALS_CONTENT).split("\n").join("\\n"));
initializeApp({
  credential: cert(credentials)
});

const db = getFirestore();

/**
 * Create the document on Firestore, even if the collection does not exist.
 * Returns null if there's no error, otherwise the error is returned.
 * @param {string} col - Firestore collection name.
 * @param {string} id - Firestore document id.
 * @param {object} data - Firestore document data.
 */
export const createData = (col: string, id: string, data: any): Promise<FirebaseFirestore.WriteResult> => {
  const ref = db.collection(col).doc(id);
  return ref.set(data);
}

/**
 * Update the document on Firestore
 * Returns null if there's no error, otherwise the error is returned.
 * @param {string} col - Firestore collection name.
 * @param {string} id - Firestore document id.
 * @param {object} data - Firestore document data.
 */
export const updateData = (col: string, id: string, data: any): Promise<FirebaseFirestore.WriteResult> => {
  return db.collection(col).doc(id).update(data);
}

/**
 * Collect all data from the Firestore collection.
 * Returns null if there's no error, otherwise the error is returned.
 * @param {string} col - Firestore collection name.
 */
export const getAllData = async (col: string): Promise<{ [key: string]: any }> => {
  let datas = {};
  const ref = await db.collection(col).get();
  ref.forEach((doc) => {
    datas[doc.id] = { ...doc.data() };
  });
  return datas
}

/**
 * Collect one data from the Firestore collection.
 * Returns null if there's no error, otherwise the error is returned.
 * @param {string} col - Firestore collection name.
 * @param {string} id - Firestore document id.
 */
export const getData = async (col: string, id: string) => {
  return (await db.collection(col).doc(id).get()).data();
}

/**
 * Deletes the requested data from Firestore. Do nothing if the data is incorrect.
 * Returns null if there's no error, otherwise the error is returned.
 * @param {string} col - Firestore collection name.
 * @param {string} id - Firestore document id.
 */
export const deleteData = async (col: string, id: string): Promise<FirebaseFirestore.WriteResult> => {
  const ref = db.collection(col).doc(id);
  return ref.delete();
}