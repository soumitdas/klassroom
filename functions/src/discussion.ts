import * as functions from 'firebase-functions';

export const deleteAllReply = functions.firestore
    .document('subjects/{subjectId}/discussions/{discussionId}')
    .onDelete((_, context) => {
        const firebase_tools = require("firebase-tools");
        const { subjectId, discussionId } = context.params;
        return firebase_tools.firestore
            .delete(`subjects/${subjectId}/discussions/${discussionId}/replies`, {
                project: process.env.GCLOUD_PROJECT,
                recursive: true,
                yes: true,
                token: functions.config().ci.token
            });
    })