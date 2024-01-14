import { initializeApp, getApps } from "firebase-admin/app";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { FIREBASE_KEY } from "@/utils/env";

const serviceAccount = FIREBASE_KEY || "";
const apps = getApps();

if (!apps.length) {
  initializeApp({
    credential: admin.credential.cert(JSON.parse(decodeURIComponent(serviceAccount))),
  });
}

export const db = getFirestore();
