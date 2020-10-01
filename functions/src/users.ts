import * as functions from 'firebase-functions';
import {auth, db} from './config';
import {userRoleFromToken} from './helper';

export const createUser = functions.https.onCall(async (data, context) => {

    // Check user role (must be a Teacher or Admin to edit)
    // Teacher can Create Student only
    // Admin can Create Admin, Teacher and Students
    
    const userRole = userRoleFromToken(context);
    const isAdmin = userRole.includes('admin') ? true : false ;
    const isTeacher = userRole.includes('teacher') ? true : false ;

    if (!isAdmin && !isTeacher)
    {
        throw new functions.https.HttpsError('permission-denied', 'Not authorized to create user');
    }
    if (!data.role || !data.data.email || !data.data.name)
    {
        throw new functions.https.HttpsError('invalid-argument', 'The incoming data is not in proper format');
    }

    let userData = {};

    if (data.role === 'student')
    {
        userData = {
            role: ['student'],
            studentData: data.data
        }
    } else if (data.role === 'teacher' && isAdmin) {
        userData = {
            role: ['teacher'],
            teacherData: data.data
        }
    } else if (data.role === 'admin' && isAdmin) {
        userData = {
            role: ['admin'],
            teacherData: data.data
        }
    } else {
        throw new functions.https.HttpsError('invalid-argument', 'The incoming data is not in proper format');
    }

    const user = await auth.createUser({
        email: data.data.email,
        password: Math.random().toString(36).slice(-8),
        displayName: data.data.name,
        phoneNumber: data.data.mobile && data.data.mobile.match(/^\d{10}$/) ? '+91' + data.data.mobile : undefined
    })

    await auth.setCustomUserClaims(user.uid, { role: [data.role] });
    await db.collection('users').doc(user.uid).set(userData);

    return ({ status: 'success', userId: user.uid });
})

export const deleteUserSync = functions.firestore
    .document('users/{userId}')
    .onDelete((_, context) => auth.deleteUser(context.params.userId))
