import { WhereFilterOp } from "firebase-admin/firestore";
import { db } from "./config";
import { firebaseCollectionPrefix } from "@/utils/constants";

interface addDocumentInterface<T> {
  data: T;
  collectionName: string;
  id?: string;
}

interface getDocumentByIdInterface {
  collectionName: string;
  id: string;
}

interface removeDocumentInterface {
  collectionName: string;
  id: string;
}

interface getDocumentInterface<T> {
  collectionName: string;
  // eslint-disable-next-line
  queries?: [keyof T, WhereFilterOp, any][];
  limit?: number;
}

interface updateDocumentByIdInterface<T> {
  id: string;
  // eslint-disable-next-line
  updates: Partial<T>;
  collectionName: string;
}

export const addDocument = async <T>({
  data,
  collectionName,
  id,
}: addDocumentInterface<T>) => {
  collectionName += firebaseCollectionPrefix;
  const collectionRef = db.collection(collectionName);
  let docRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | null =
    null;

  if (id) {
    docRef = collectionRef.doc(id);
    await docRef.set(data as object);
  } else {
    docRef = await collectionRef.add(data as object);
  }

  return docRef as T;
};

export const removeDocumentById = async ({
  collectionName,
  id,
}: removeDocumentInterface) => {
  try {
    collectionName += firebaseCollectionPrefix;
    const collectionRef = db.collection(collectionName);
    const docRef = collectionRef.doc(id);

    // Delete the document
    await docRef.delete();

    return true;
  } catch (e) {
    const error = e as Error;
    // eslint-disable-next-line no-console
    console.error("Error removing document:", error.message);
    return false;
  }
};

export const removeDocument = async <T>({
  queries,
  collectionName,
  limit: _limit,
}: getDocumentInterface<T>) => {
  collectionName += firebaseCollectionPrefix;
  const collectionRef = db.collection(collectionName);
  let queryRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
    collectionRef;

  if (queries && queries.length > 0) {
    for (const query of queries) {
      const [field, op, value] = query;
      queryRef = queryRef.where(String(field), op, value);
    }
  }

  if (_limit) {
    queryRef = queryRef.limit(_limit);
  }

  const querySnapshot = await queryRef.get();

  querySnapshot.forEach((doc) => {
    const docRef = collectionRef.doc(doc.id);
    docRef.delete();
  });

  return true;
};

export const getDocumentById = async <T>({
  collectionName,
  id,
}: getDocumentByIdInterface) => {
  collectionName += firebaseCollectionPrefix;
  const docRef = db.collection(collectionName).doc(id);
  const docSnapshot = await docRef.get();

  if (docSnapshot.exists) {
    const data = docSnapshot.data();
    return data as T;
  } else {
    return null;
  }
};

export const getDocument = async <T>({
  queries,
  collectionName,
  limit: _limit,
}: getDocumentInterface<T>) => {
  collectionName += firebaseCollectionPrefix;
  const collectionRef = db.collection(collectionName);
  let queryRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
    collectionRef;

  if (queries && queries.length > 0) {
    for (const query of queries) {
      const [field, op, value] = query;
      queryRef = queryRef.where(String(field), op, value);
    }
  }

  if (_limit) {
    queryRef = queryRef.limit(_limit);
  }

  const querySnapshot = await queryRef.get();

  // eslint-disable-next-line
  const data: any[] = [];

  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });

  return data as T[];
};

export const updateDocumentById = async <T>({
  id,
  updates,
  collectionName,
}: updateDocumentByIdInterface<T>) => {
  collectionName += firebaseCollectionPrefix;
  const dataRef = db.collection(collectionName).doc(id);
  await dataRef.update(updates as object);
  const docSnap = await dataRef.get();

  return { ...docSnap.data(), id: docSnap.id } as T;
};
