import {cert, initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {decrypt} from "../tasks/crypt";
import {firestore} from "firebase-admin";
import Firestore = firestore.Firestore;

class FirebaseRepository {
    credentials: any;
    database: Firestore;

    constructor() {
        this.credentials = JSON.parse(decrypt(process.env.GOOGLE_CREDENTIALS_CONTENT).split("\n").join("\\n"));
        this.database = getFirestore();

        initializeApp({
            credential: cert(this.credentials),
        });
    }

    /**
     * Create the document on Firestore, even if the collection does not exist.
     * Returns null if there's no error, otherwise the error is returned.
     * @param {string} col - Firestore collection name.
     * @param {string} id - Firestore document id.
     * @param {object} data - Firestore document data.
     */
    public createData(col: string, id: string, data: any): Promise<FirebaseFirestore.WriteResult> {
        const ref = this.database.collection(col).doc(id);
        return ref.set(data);
    };

    /**
     * Update the document on Firestore
     * Returns null if there's no error, otherwise the error is returned.
     * @param {string} col - Firestore collection name.
     * @param {string} id - Firestore document id.
     * @param {object} data - Firestore document data.
     */
    public updateData(col: string, id: string, data: any): Promise<FirebaseFirestore.WriteResult> {
        return this.database.collection(col).doc(id).update(data);
    };

    /**
     * Collect all data from the Firestore collection.
     * Returns null if there's no error, otherwise the error is returned.
     * @param {string} col - Firestore collection name.
     */
    public async getAllData(col: string): Promise<{ [key: string]: any }> {
        const data: { [key: string]: any } = {};
        const ref = await this.database.collection(col).get();
        ref.forEach((doc) => {
            data[doc.id] = {...doc.data()};
        });
        return data;
    };

    /**
     * Collect one data from the Firestore collection.
     * Returns null if there's no error, otherwise the error is returned.
     * @param {string} col - Firestore collection name.
     * @param {string} id - Firestore document id.
     */
    public async getData(col: string, id: string) {
        return (await this.database.collection(col).doc(id).get()).data();
    };

    /**
     * Deletes the requested data from Firestore. Do nothing if the data is incorrect.
     * Returns null if there's no error, otherwise the error is returned.
     * @param {string} col - Firestore collection name.
     * @param {string} id - Firestore document id.
     */
    public async deleteData(col: string, id: string): Promise<FirebaseFirestore.WriteResult> {
        return this.database.collection(col).doc(id).delete();
    };
}

export default new FirebaseRepository();