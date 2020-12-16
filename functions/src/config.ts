import * as admin from 'firebase-admin';

admin.initializeApp();

export const fbadmin = admin;
export const auth = admin.auth();
export const db = admin.firestore();
export const timestamp = admin.firestore.FieldValue.serverTimestamp();