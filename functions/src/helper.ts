import * as functions from 'firebase-functions';
import {db} from './config';

// helper functions
export const getAuthUID = (context: any) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('permission-denied', 'User must be authenticated');
    } else {
        return context.auth.uid;
    }
}

export const userRole = async (context: any) => {  
    const authUID = getAuthUID(context);

    const userSnap = await db.doc(`users/${authUID}`).get();
    const userDoc = userSnap.data();

    return userDoc && userDoc.role ? userDoc.role : null; 
}

export const userRoleFromToken = (context: any) => { 
    if (!context.auth.token.role) {
        throw new functions.https.HttpsError('permission-denied', 'Unauthorized access');
    } else {
        return context.auth.token.role;
    } 
}

export const catchErrors = async (promise: Promise<any>) => {
    try {
        return await promise;
    } catch(err) {
        console.error(err);
        throw new functions.https.HttpsError('unknown', 'Sorry, something went wrong');
    }
}
