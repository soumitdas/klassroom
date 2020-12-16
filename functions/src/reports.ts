import * as functions from 'firebase-functions';
import { db, timestamp } from './config';
import { userRoleFromToken, getAuthUID } from './helper';

// for future version
export const generateReport = functions.https.onCall(async (data, context) => {

    const userRole = userRoleFromToken(context);
    const isAdmin = userRole.includes('admin') ? true : false;
    const isTeacher = userRole.includes('teacher') ? true : false;
    const userId = getAuthUID(context);

    if (!isAdmin && !isTeacher) {
        throw new functions.https.HttpsError('permission-denied', 'Not authorized to create user');
    }
    if (!data.reportName) {
        throw new functions.https.HttpsError('invalid-argument', 'The incoming data is not in proper format');
    }

    if (data.reportName === 'student-attendence' && data.subjectCode) {
        return generateAttendenceReport(data.subjectCode, userId);
    } else if (data.reportName === 'student-assignment' && data.subjectCode) {
        return generateAssignmentSubmissionReport(data.subjectCode, userId);
    } else {
        throw new functions.https.HttpsError('invalid-argument', 'The incoming data is not in proper format');
    }
});

const generateAttendenceReport = async (subjectCode: string, requestedUserId: any) => {

    let lectureData: any[] = [];

    const snap = await db.collection('subjects').doc(subjectCode).collection('lectures').get();
    snap.forEach(doc => {
        if (doc.exists) {
            lectureData.push({
                lectureId: doc.id,
                ...doc.data()
            });
        }
    });

    if (!(lectureData.length > 0)) {
        return ({ status: 'failed', error: 'Invalid Subject Code' });
    }
    
    const allotedStudents: any[] = lectureData.length > 1 ? [...new Set(lectureData.reduce((a, b) => a.attendeeUids.concat(b.attendeeUids)))] : lectureData[0].attendeeUids;
    
    const attendenceReport = allotedStudents.map(uid => {
        const lectureAttended = lectureData.filter(lec => lec.attendeeUids.includes(uid)).map(l => ({
            lectureId: l.lectureId,
            topic: l.topic || '',
            description: l.description || '',
            date: l.startTime,
            period: l.period
        }));
        return ({ uid, lectureAttended, totalLectures: lectureData.length });
    });

    await db.collection('reports').doc(`attendenceReport_${subjectCode}`).set({
        type: 'student-attendence',
        data: attendenceReport,
        requestedBy: requestedUserId ? requestedUserId : null,
        generatedAt: timestamp
    })

    return ({ status: 'success', message: 'Report generated successfully' });
}

const assignmentSubmissionReport = async (subjectCode: string, assignmentId: string) => {

    let assignmentSubmissionData: any[] = [];

    const snap = await db.collection(`subjects/${subjectCode}/assignments/${assignmentId}/submissions`).get();
    snap.forEach(doc => {
        if (doc.exists) {
            const data = doc.data();
            assignmentSubmissionData.push({
                assignmentId,
                studentUid: doc.id,
                studentMsg: data.message,
                grade: data.grade,
                remarks: data.remarks,
                submittedAt: data.modifiedAt
            });
        }
    });

    return assignmentSubmissionData;
}

const generateAssignmentSubmissionReport = async (subjectCode: string, requestedUserId: any) => {

    let assignmentData: any[] = [];

    const snap = await db.collection(`subjects/${subjectCode}/assignments`).get();
    snap.forEach(doc => {
        if (doc.exists) {
            assignmentData.push({
                assignmentId: doc.id,
                ...doc.data()
            });
        }
    });

    if (!(assignmentData.length > 0)) {
        return ({ status: 'failed', error: 'Invalid Subject Code or No assignments' });
    }

    const promises = assignmentData.map(a => assignmentSubmissionReport(subjectCode, a.assignmentId))
    const result = await Promise.all(promises);
    const submissions = result.length > 1 ? result.reduce((a,b) => a.concat(b)) : result[0];

    const report = assignmentData.map(a => ({
        ...a,
        submissions: submissions.filter(el => el.assignmentId === a.assignmentId),
    }));

    await db.collection('reports').doc(`assignmentReport_${subjectCode}`).set({
        type: 'student-assignment',
        data: report,
        requestedBy: requestedUserId ? requestedUserId : null,
        generatedAt: timestamp
    })

    return ({ status: 'success', message: 'Report generated successfully' });
}