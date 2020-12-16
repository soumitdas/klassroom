import * as functions from 'firebase-functions';
import {auth} from './config';

const ADMIN_EMAIL = "admin@example.com"

/**
 * Delete this function from your firebase project after Admin creation
 */
export const setAdmin = functions.auth.user().onCreate( async (user, _) => {
    if (user.email === ADMIN_EMAIL) {
        await auth.setCustomUserClaims(user.uid, { role: ["admin"] })
    }
    return auth.updateUser(user.uid, { emailVerified: true })
})
