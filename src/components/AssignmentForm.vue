<template>
  <form @submit.prevent="createOrUpdateAssignment" class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">{{ isEditing ? 'Edit Assignment' : 'Assignment' }}</p>
    </header>
    <section class="modal-card-body">
        <div class="columns">
            <div class="column">
                <b-field label="Subject Code" label-position="on-border">
                    <b-input :value="subject.subjectCode" readonly></b-input>
                </b-field>
                <b-field label="Subject Name" label-position="on-border">
                    <b-input :value="subject.name" readonly></b-input>
                </b-field>
                <b-field label="Title" label-position="on-border">
                    <b-input v-model="assignment.title" maxlength="100" placeholder="Enter the Assignment Title" required></b-input>
                </b-field>
                <b-field label="Instructions" label-position="on-border">
                    <b-input v-model="assignment.instructions" maxlength="300" type="textarea" placeholder="Write the Instructions..."></b-input>
                </b-field>

                <b-taglist v-if="isEditing">
                    <b-tag v-for="(attachment, i) in uploadedFiles" :key="i" size="is-medium" ellipsis>
                        <a :href="attachment.downloadUrl" target="_blank" rel="noopener noreferrer">{{ attachment.fileName }}</a>
                    </b-tag>
                </b-taglist>

                <b-field v-else message="PDF only">
                    <b-upload v-model="files" multiple accept="application/pdf">
                    <a class="button">
                        <b-icon class="file-icon" icon="paperclip"></b-icon>
                        <span class="file-label">Attach</span>
                    </a>
                    </b-upload>
                </b-field>
                <b-field grouped group-multiline>
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
                
                <b-field label="Marks" label-position="on-border">
                    <b-input v-model="assignment.marks" required></b-input>
                </b-field>
                
                <b-field label="Due on" label-position="on-border">
                    <b-datetimepicker
                        v-model="assignment.dueDate"
                        placeholder="Click to select..."
                        icon="clock"
                        horizontal-time-picker>
                    </b-datetimepicker>
                </b-field>
                <div class="field">
                    <b-switch v-model="isQuiz">Add Quiz</b-switch>
                </div>
            </div>
            <div class="column is-one-quarter">
                
                <b-field label="Alloted Student" label-position="on-border">
                    <b-select v-model="studentSelection" placeholder="Select a option" required>
                        <option value="all">All Students</option>
                        <option value="custom">Custom</option>
                    </b-select>
                </b-field>
                <b-table v-show="studentSelection === 'custom'"
                    :data="classStudents"
                    :columns="columns"
                    :checked-rows.sync="allotedStudents"
                    checkable
                    checkbox-position="right"
                    :hoverable="true"
                    :mobile-cards="false"
                    default-sort="univRoll">

                    <template slot="bottom-left">
                        <b>Total Students Alloted</b>: {{ allotedStudents.length }}
                    </template>

                    <section class="section" slot="empty">
                        <div class="content has-text-grey has-text-centered">
                            <p>
                                <b-icon icon="emoticon-sad" size="is-large"/>
                            </p>
                            <p>Nothing's there&hellip;</p>
                            <p>Load the Students first</p>
                        </div>
                    </section>
                </b-table>
            </div>
            <div v-if="isQuiz" class="column is-half"></div>
        </div>

    </section>
    <footer class="modal-card-foot">
      <b-button @click="$parent.close()">Close</b-button>
      <b-button native-type="submit" type="is-primary" :loading="isLoading">{{ isEditing ? 'Update' : 'Save' }}</b-button>
    </footer>
  </form>
</template>

<script>
import {mapState} from 'vuex'
import {db, firebase, storage} from '../firebase'

export default {
  name: 'LectureForm',
  props: {
      subject: {
          type: Object,
          required: true
      },
      isEditing: {
          type: Boolean,
          default: false
      },
      formData: {
          type: Object,
          default: () => {}
      }
  },
  data() {
      return {
          isLoading: false,
          isQuiz: false,
          studentSelection: null,
          allotedStudents: [],
          assignment: {
              title: '',
              instructions: '',
              marks: null,
              dueDate: null,
          },
          files: [],
          uploadedFiles: [],

          columns: [
                {
                    field: 'univRoll',
                    label: 'University Roll',
                    sortable: true,
                    visible: true
                },
                {
                    field: 'name',
                    label: 'Name',
                    sortable: true,
                    visible: true
                },       
            ]
      }
  },
  computed: {
      ...mapState(['students']),
      classStudents() {
          return this.students.filter(s => this.subject.studentId.includes(s.uid))
      },
  },
  methods: {
    deleteUploadFile(index) {
      this.files.splice(index, 1)
    },
    
    uploadFiles() {
      const storageRef = storage.ref(this.subject.subjectCode).child('assignments')

      const promises = this.files.map(file => {
        const ref = storageRef.child(`${new Date().getTime()}_${this.assignment.title}_${file.name}`)
        return ref.put(file).then(() => ref.getDownloadURL()).then(downloadUrl => ({ fileName: file.name, downloadUrl }))
      })

      return Promise.all(promises)
    },
    createOrUpdateAssignment() {
        if (this.$props.isEditing) {
            this.updateAssignment()
        } else {
            this.createAssignment()
        }
    },
    async createAssignment() {
        try {
        this.isLoading = true
        if (this.studentSelection === 'all') {
            this.allotedStudents = this.classStudents
        }
        let attachments = []
        if (this.files.length > 0) {
            attachments = await this.uploadFiles()
        }
        const allotedStudents = this.allotedStudents.map(s => s.uid)
        const assignment = {
            ...this.assignment,
            allotedStudents,
            attachments,
            createdBy: {
                name: this.$store.state.user.name,
                uid: this.$store.state.user.uid
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            modifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }
        
        await db.doc(`subjects/${this.subject.subjectCode}`)
            .collection('assignments').add(assignment)
        this.onSuccess('created')
        } catch (error) {
        this.onFailure(error)
        }
    },
    async updateAssignment() {
        try {
        this.isLoading = true
        if (this.studentSelection === 'all') {
            this.allotedStudents = this.classStudents
        }
        let attach = []
        if (this.files.length > 0) {
            attach = await this.uploadFiles()
        }
        const attachments = this.uploadedFiles.concat(attach)
        const allotedStudents = this.allotedStudents.map(s => s.uid)
        const assignment = {
            ...this.assignment,
            allotedStudents,
            attachments,
            createdBy: {
                name: this.$store.state.user.name,
                uid: this.$store.state.user.uid
            },
            modifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }
        
        await db.doc(`subjects/${this.subject.subjectCode}`)
            .collection('assignments').doc(this.$props.formData.id)
            .update(assignment)

        this.onSuccess('updated')
        } catch (error) {
        this.onFailure(error)
        }
    },
    onSuccess(event) {
      this.isLoading = false;
      this.$emit('finished');
      this.$parent.close();
      this.$buefy.toast.open({
        message: `Assignment ${event} successfully`,
        type: "is-success",
        queue: false
      })
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
  mounted() {          
      if (this.$props.isEditing) {
          const data = this.$props.formData

          this.assignment.title = data.title
          this.assignment.instructions = data.instructions
          this.assignment.marks = data.marks
          this.assignment.dueDate = data.dueDate

          this.uploadedFiles = data.attachments

          this.allotedStudents = this.students.filter(s => data.allotedStudents.includes(s.uid))
          this.studentSelection = 'custom'
      }
  }
};
</script>
