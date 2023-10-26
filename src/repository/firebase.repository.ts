import { firestore } from "firebase-admin";
import { ServiceAccount, cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import FirestoreCacheValue from "../models/FirestoreCacheValue";
import { decrypt } from "../utils/crypt";
import Firestore = firestore.Firestore;

class FirebaseRepository {
    private credentials: ServiceAccount;
    private database: Firestore;
    private cache: Map<string, FirestoreCacheValue>;

    constructor() {
        this.credentials = JSON.parse(decrypt(process.env.GOOGLE_CREDENTIALS_CONTENT).split("\n").join("\\n"));
        this.cache = new Map<string, FirestoreCacheValue>();

        initializeApp({
            credential: cert(this.credentials),
        });

        this.database = getFirestore();
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

        if (this.cache.has(col)) {
            this.cache.get(col).data.set(id, data);
        } else {
            this.cache.set(col, {
                data: new Map<string, any>([[id, data]]),
                isPartial: true,
            });
        }

        return ref.set(data);
    }

    /**
     * Update the document on Firestore
     * Returns null if there's no error, otherwise the error is returned.
     * @param {string} col - Firestore collection name.
     * @param {string} id - Firestore document id.
     * @param {object} data - Firestore document data.
     */
    public updateData(col: string, id: string, data: any): Promise<FirebaseFirestore.WriteResult> {
        const collectionUpdate = this.database.collection(col).doc(id).update(data);

        if (this.cache.has(col)) {
            this.cache.get(col).data.set(id, data);
        } else {
            this.cache.set(col, {
                data: new Map<string, any>([[id, data]]),
                isPartial: true,
            });
        }

        return collectionUpdate;
    }

    /**
     * Collect all data from the Firestore collection.
     * Returns null if there's no error, otherwise the error is returned.
     * @param {string} col - Firestore collection name.
     */
    public async getAllData(col: string): Promise<firestore.DocumentData> {
        const data: { [key: string]: any } = {};

        if (this.cache.has(col) && !this.cache.get(col).isPartial) {
            return Object.fromEntries(this.cache.get(col).data);
        }

        const ref = await this.database.collection(col).get();
        ref.forEach((doc) => {
            data[doc.id] = { ...doc.data() };
        });

        this.cache.set(col, {
            data: new Map<string, any>(Object.entries(data)),
            isPartial: false,
        });

        return data;
    }

    /**
     * Collect one data from the Firestore collection.
     * Returns null if there's no error, otherwise the error is returned.
     * @param {string} col - Firestore collection name.
     * @param {string} id - Firestore document id.
     */
    public async getData(col: string, id: string): Promise<firestore.DocumentData> {
        if (this.cache.has(col) && this.cache.get(col).data.has(id)) {
            return this.cache.get(col).data.get(id);
        }

        const data = (await this.database.collection(col).doc(id).get()).data();
        if (!data) return null;

        if (this.cache.has(col)) {
            this.cache.get(col).data.set(id, data);
        } else {
            this.cache.set(col, {
                data: new Map<string, any>([[id, data]]),
                isPartial: true,
            });
        }

        return data;
    }

    /**
     * Deletes the requested data from Firestore. Do nothing if the data is incorrect.
     * Returns null if there's no error, otherwise the error is returned.
     * @param {string} col - Firestore collection name.
     * @param {string} id - Firestore document id.
     */
    public async deleteData(col: string, id: string): Promise<FirebaseFirestore.WriteResult> {
        if (this.cache.has(col)) {
            this.cache.get(col).data.delete(id);
        }

        return this.database.collection(col).doc(id).delete();
    }
}

export default new FirebaseRepository();
