<template>
  <section class="section">
    <title-bar>
      {{title}}
      <b-button type="is-primary" icon-left="arrow-left" slot="button" @click="$router.go(-1)">Back</b-button>
    </title-bar>
    <assignment-grading v-if="isAdminOrTeacher" 
      :subjectCode="$route.params.subjectCode" 
      :assignmentId="$route.params.assignmentId" />
    <template v-if="isStudent">
      <div v-if="assignment" class="columns">
        <div class="column">
          <div class="box">
            <div class="content">
              <h1>{{ assignment.title }}</h1>
              <p class="is-size-7">{{ assignment.createdBy.name }} - {{ assignment.createdAt.toLocaleString() }}</p>
              <div class="level">
                  <div class="level-left">                  
                    <span class="is-size-6">Due on: {{ assignment.dueDate.toLocaleString() }}</span>
                  </div>
                  <div class="level-right">
                    <span class="is-size-6">Marks: {{ assignment.marks }}</span>
                  </div>
                </div>
              <h6></h6>
              <hr>
              <p>{{ assignment.instructions }}</p>
              <b-taglist>
                <b-tag v-for="(attachment, i) in assignment.attachments" :key="i" size="is-medium" ellipsis>
                  <a :href="attachment.downloadUrl" target="_blank" rel="noopener noreferrer">{{ attachment.fileName }}</a>
                </b-tag>
              </b-taglist>
            </div>
          </div>
        </div>
        <div class="column is-one-quarter">
          <form @submit.prevent="submitAssignment" class="box has-text-centered">
            <div class="subtitle">Your Work</div>
            <template v-if="submission">
              <p v-if="submission.isGraded || submission.isReturned" class="is-size-7 has-text-right">{{ submission.isGraded ? 'Graded' : submission.isReturned ? 'Returned' : '' }}<br>{{ submission.isGraded ? submission.grade : ''}}</p>
              <b-taglist>
                <b-tag v-for="(attachment, i) in submission.attachments" :key="i" size="is-medium" ellipsis>
                  <a :href="attachment.downloadUrl" target="_blank" rel="noopener noreferrer">{{ attachment.fileName }}</a>
                </b-tag>
              </b-taglist>
              <p class="is-size-7">Last Submission: {{ submission.createdAt.toLocaleString() }}</p>
            </template>
            <b-field message="PDF only (1 Mb per file)">
              <b-upload v-model="files" multiple expanded :required="!submission" accept="application/pdf">
                <a class="button is-fullwidth">
                    <b-icon class="file-icon" icon="paperclip"></b-icon>
                    <span class="file-label">Attach</span>
                </a>
              </b-upload>
            </b-field>
            <b-field grouped group-multiline
              :type="{ 'is-danger': !isFileWithinSize }"
              :message="{ 'One file exceeds 1 Mb': !isFileWithinSize }">
              <div class="control" v-for="(file, index) in files" :key="index">
                <b-tag
                    type="is-primary"
                    attached
                    ellipsis
                    aria-close-label="Close tag"
                    closable
                    @close="deleteUploadFile(index)"
                >{{file.name}}</b-tag>
              </div>
            </b-field>
            <b-field label="Message" label-position="on-border">
                <b-input v-model="message" maxlength="200" type="textarea"
                  :readonly="isAssignmentSubmitted"></b-input>
            </b-field>
            <b-field v-show="isAssignmentSubmitted">
              <b-button type="is-primary" @click="isAssignmentSubmitted = false" :disabled="isSubmissionEnded" expanded>Edit Submission</b-button>
            </b-field>
            <b-field v-show="!isAssignmentSubmitted"
              :type="{ 'is-danger': isDueDateOver }"
              :message="{ 'Due date passed': isDueDateOver }">
              <div class="control">
                <b-button native-type="submit" type="is-primary" :disabled="isSubmissionEnded || !isFileWithinSize" :loading="isLoading" expanded>Submit</b-button>
              </div>
            </b-field>          
          </form>
        </div>
      </div>
      <div v-else-if="isAssignmentNotAlloted" class="subtitle has-text-centered">
        Something went wrong. Contact your course instructor for support.
      </div>
      <div v-else>
        <b-skeleton></b-skeleton>
        <b-skeleton></b-skeleton>
        <b-skeleton></b-skeleton>
        <b-skeleton></b-skeleton>
      </div>
    </template>
  </section>
</template>

<script>
import TitleBar from '@/components/TitleBar'
import AssignmentGrading from '@/components/AssignmentGrading'
import {mapState} from 'vuex'
import {db, storage, firebase} from '../firebase'

export default {
  name: 'Classroom',
  components: {
    TitleBar, AssignmentGrading
  },
  data() {
    return {
      assignment: null,
      submission: null,
      message: '',
      files: [],
      isLoading: false,
      isAssignmentNotAlloted: false,
      isAssignmentSubmitted: false
    }
  },
  computed: {
    ...mapState(['subjects', 'userRole']),
    isAdminOrTeacher() {
      return this.$store.state.userRole.includes('admin') || this.$store.state.userRole.includes('teacher')
    },
    isStudent() {
      return this.$store.state.userRole.includes('student')
    },
    title() {
      return `${this.$route.meta.title} - ${this.$route.params.subjectCode}`
    },
    subjectDetails() {
      const subject = this.subjects.filter(s => s.subjectCode === this.$route.params.subjectCode)
      return subject[0]
    },
    isDueDateOver() {
      const time = new Date()
      return time.getTime() > this.assignment.dueDate.getTime()
    },
    isSubmissionEnded() {
      return this.submission ? this.isDueDateOver || this.submission.isGraded : this.isDueDateOver
    },
    isFileWithinSize() {
      const size = 1024 * 1024 // 1 Mb
      return this.files.length === this.files.filter(f => f.size <= size).length
    }
  },
  methods: {
    deleteUploadFile(index) {
      this.files.splice(index, 1)
    },
    
    uploadFiles() {
      const storageRef = storage.ref(this.$route.params.subjectCode).child('assignments')
                                .child(this.assignment.id).child(this.$store.state.user.uid)

      const promises = this.files.map(file => {
        const ref = storageRef.child(file.name)
        return ref.put(file).then(() => ref.getDownloadURL()).then(downloadUrl => ({ fileName: file.name, downloadUrl }))
      })

      return Promise.all(promises)
    },
    getAssignment() {
      db.doc(`subjects/${this.$route.params.subjectCode}/assignments/${this.$route.params.assignmentId}`)
        .get()
        .then(doc => {
          if (doc.exists) {
            const data = doc.data()
            this.assignment = {
              id: doc.id,
              ...data,
              dueDate: data.dueDate.toDate(),
              createdAt: data.createdAt.toDate(),
              modifiedAt: data.modifiedAt.toDate(),
            }
          } else {
            this.$router.replace({ path: '/error'})
          }
        }).catch(e => {
          this.onFailure(e)
          this.isAssignmentNotAlloted = true
        })
        this.getAssignmentSubmission()
    },
    getAssignmentSubmission() {
      db.doc(`subjects/${this.$route.params.subjectCode}/assignments/${this.$route.params.assignmentId}`)
        .collection('submissions').doc(this.$store.state.user.uid)
        .get()
        .then(doc => {
          if (doc.exists) {
            const data = doc.data()
            this.message = data.message
            this.submission = {
              ...data,
              createdAt: data.createdAt.toDate(),
              modifiedAt: data.modifiedAt.toDate(),
            }
            this.isAssignmentSubmitted = true
          }
        }).catch(e => this.onFailure(e))
    },
    async submitAssignment() {
      this.isLoading = true
      try {
        let attachments = []
        
        if (this.files.length > 0 && this.isFileWithinSize) {
            attachments = await this.uploadFiles()
        }

        const assignmentSubmissionNew = {
          message: this.message,
          attachments,
          submittedBy: {
            uid: this.$store.state.user.uid,
            name: this.$store.state.user.name
          },
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          modifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }
        if (this.submission) { attachments = attachments.concat(this.submission.attachments) }
        const assignmentSubmissionEdit = {
          message: this.message,
          attachments,
          modifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }
        const assignmentSubmission = this.submission ? assignmentSubmissionEdit : assignmentSubmissionNew
        
        await db.doc(`subjects/${this.$route.params.subjectCode}/assignments/${this.$route.params.assignmentId}`)
          .collection('submissions').doc(this.$store.state.user.uid)
          .set(assignmentSubmission, { merge: this.submission ? true : false })
        
        this.onSuccess('submitted')

      } catch (error) {
        this.onFailure(error)
      }
    },
    onSuccess(event) {
      this.isLoading = false;
      this.files = []
      this.message = ''
      this.$buefy.toast.open({
        message: `Assignment ${event} successfully`,
        type: "is-success",
        queue: false
      })
      this.getAssignmentSubmission()
    },
    onFailure(error) {
      this.isLoading = false;
      this.$buefy.toast.open({
        message: `Error: ${error.message}`,
        type: "is-danger",
        queue: false
      })
    },
  },
  created() {
    if (this.isStudent) { this.getAssignment() }
  }
}
</script>