<template>
    <form @submit.prevent="formSubmit">
        <div class="modal-card" style="width: auto">
            <header class="modal-card-head">
                <p class="modal-card-title">View Assignment Submission</p>
            </header>
            <section class="modal-card-body">
                <b-field label="University Roll-No" label-position="on-border">
                    <b-input :value="data.student.univRoll" readonly></b-input>
                </b-field>

                <b-field label="Class Roll-No" label-position="on-border">
                    <b-input :value="data.student.classRoll" readonly></b-input>
                </b-field>

                <b-field label="Name" label-position="on-border">
                    <b-input :value="data.student.name" readonly></b-input>
                </b-field>

                <b-field label="Submitted Files">
                    <b-taglist>
                        <b-tag v-for="(attachment, i) in data.attachments" :key="i" size="is-medium" ellipsis>
                            <a :href="attachment.downloadUrl" target="_blank" rel="noopener noreferrer">{{ attachment.fileName }}</a>
                        </b-tag>
                    </b-taglist>
                </b-field>
                <b-field label="Submitted on" label-position="on-border">
                    <b-input :value="data.createdAt.toLocaleString()" readonly></b-input>
                </b-field>
                <b-field label="Note from Student" label-position="on-border">
                    <b-input :value="data.message" type="textarea" readonly></b-input>
                </b-field>

                <div class="field">
                    <b-switch v-model="isGraded" @input="isReturned = false">Grade Assignment</b-switch>
                </div>
                <div class="field">
                    <b-switch v-model="isReturned" @input="isGraded = false">Return Assignment</b-switch>
                </div>

                <b-field v-show="isGraded" label="Marks" label-position="on-border">
                    <b-input v-model="marks" :required="isGraded"></b-input>
                </b-field>
                <b-field v-show="isGraded || isReturned" label="Remarks" label-position="on-border">
                    <b-input v-model="remarks" maxlength="200" type="textarea" placeholder="Write comments....." required></b-input>
                </b-field>

            </section>
            <footer class="modal-card-foot has-text-right">
                <b-button @click="$parent.close()">Close</b-button>
                <b-button native-type="submit" type="is-primary" :loading="isButtonLoading">Save</b-button>
            </footer>
        </div>
    </form>
</template>

<script>
import {db, firebase} from '../firebase'

export default {
    name: 'AssignmentGradingForm',
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            isButtonLoading: false,
            isGraded: this.data.isGraded || false,
            isReturned: this.data.isReturned || false,
            remarks: this.data.remarks || '',
            marks: this.data.grade || ''
        }
    },
    methods: {
        formSubmit() {
            if (this.isGraded && !this.isReturned) {
                this.gradeAssignment()
            }
            if (this.isReturned && !this.isGraded) {
                this.returnAssignment()
            }
        },
        gradeAssignment() {
            this.isButtonLoading = true
            const grading = {
                isGraded: true,
                isReturned: false,
                grade: this.marks, 
                remarks: this.remarks,
                modifiedAt: firebase.firestore.FieldValue.serverTimestamp()
            }
            db.doc(`subjects/${this.data.subjectCode}/assignments/${this.data.assignmentId}`)
                .collection('submissions').doc(this.data.id)
                .set(grading ,{merge: true})
                .then(() => this.onSuccess('graded'))
                .catch((e) => this.onFailure(e))
        },
        returnAssignment() {
            this.isButtonLoading = true
            const data = {
                isGraded: false,
                grade: '',
                isReturned: true,
                remarks: this.remarks,
                modifiedAt: firebase.firestore.FieldValue.serverTimestamp()
            }
            db.doc(`subjects/${this.data.subjectCode}/assignments/${this.data.assignmentId}`)
                .collection('submissions').doc(this.data.id)
                .set(data ,{merge: true})
                .then(() => this.onSuccess('returned'))
                .catch((e) => this.onFailure(e))
        },
        onSuccess(event) {
            this.isButtonLoading = false;
            this.$emit('finished');
            this.$parent.close();
            this.$buefy.toast.open({
                message: `Assignment ${event} successfully`,
                type: "is-success",
                queue: false
            })
        },
        onFailure(error) {
            this.isButtonLoading = false;
            this.$buefy.toast.open({
                message: `Error: ${error.message}`,
                type: "is-danger",
                queue: false
            })
        },
    }
}
</script>
