<template>
  <section class="section">
    <title-bar>
      {{ title }}
      <b-dropdown v-if="isAdminOrTeacher" position="is-bottom-left" aria-role="list" slot="button">
        <button class="button is-primary" slot="trigger" slot-scope="{ active }">
            <b-icon icon="plus"></b-icon>
            <span>Create</span>
            <b-icon :icon="active ? 'menu-up' : 'menu-down'"></b-icon>
        </button>

        <b-dropdown-item aria-role="listitem" @click="createLecture">
          <b-icon icon="teach" size="is-small"></b-icon>
          Lecture
        </b-dropdown-item>
        <b-dropdown-item aria-role="listitem" @click="createAssignment">
          <b-icon icon="clipboard-text" size="is-small"></b-icon>
          Assignment
        </b-dropdown-item>
      </b-dropdown>
      <!--<b-button type="is-primary" icon-left="refresh" slot="button" @click="fetchSubjects">Refresh</b-button>-->
    </title-bar>
    <b-tabs type="is-toggle" expanded>
      <b-tab-item>
        <template slot="header">
          <b-icon icon="teach"></b-icon>
          <span> Lectures <b-tag rounded> {{lectures.length}} </b-tag> </span>
        </template>
        <b-skeleton v-if="isPageLoading"></b-skeleton>
        <b-skeleton v-if="isPageLoading"></b-skeleton>
        <b-collapse v-for="(lecture, index) in lectures" :key="lecture.id" 
          class="card" animation="slide" aria-id="contentIdForA11y3"
          :open="false">
          <div
              slot="trigger" 
              slot-scope="props"
              class="card-header"
              role="button"
              aria-controls="contentIdForA11y3">
              <p class="card-header-title">
                <b-icon icon="book" custom-size="default"></b-icon>
                  {{lecture.startTime.toDateString()}} - {{lecture.topic}}
              </p>
              <a class="card-header-icon">
                  <b-icon
                      :icon="props.open ? 'menu-down' : 'menu-up'">
                  </b-icon>
              </a>
          </div>
          <div class="card-content">
              <div class="content">
                <strong>Lecture Topic</strong>: {{ lecture.topic }}
                <br>
                <strong>Lecture Description</strong>: {{ lecture.description }}
              </div>
              <div class="content">
                <p>
                  <strong>Start Time</strong>: {{lecture.startTime.toLocaleTimeString()}}
                  <br>
                  <strong>End Time</strong>: {{lecture.endTime.toLocaleTimeString()}}
                </p>
                <p>
                  <strong>{{lecture.virtualMeet.platform}} Link</strong>: <a :href="lecture.virtualMeet.url">{{lecture.virtualMeet.url}}</a>
                </p>
                <p>
                  <small>Created By: {{lecture.createdBy.name}}</small>
                </p>
              </div>
          </div>
          <footer v-if="isAdminOrTeacher" class="card-footer">
              <a @click.prevent="editLecture(lecture)" class="card-footer-item">Edit</a>
              <a @click.prevent="deleteLecture(lecture, index)" class="card-footer-item">Delete</a>
          </footer>
        </b-collapse>
      </b-tab-item>
      <b-tab-item>
        <template slot="header">
          <b-icon icon="forum"></b-icon>
          <span>Discussions</span>
        </template>
        <subject-discussions :subjectCode="subjectCode" />
      </b-tab-item>
      <b-tab-item>
        <template slot="header">
          <b-icon icon="clipboard-text"></b-icon>
          <span> Assignments <b-tag rounded> {{assignments.length}} </b-tag> </span>
        </template>
        <b-collapse v-for="(assignment, index) in assignments" :key="assignment.id" class="card" animation="slide">
          <div
            slot="trigger"
            slot-scope="props"
            class="card-header"
            role="button"
            aria-controls="contentIdForA11y3"
          >
            <p class="card-header-title">
              <b-icon icon="school" custom-size="default" />
              {{assignment.title}}
            </p>
            <a class="card-header-icon">
              <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"></b-icon>
            </a>
          </div>
          <div class="card-content">
            <div class="content">
              <p>
                {{assignment.instructions}}
              </p>
            </div>
            <div class="content">
              <nav v-if="assignment.attachments.length > 0" class="level is-mobile">
                <div class="level-left">
                  <b-taglist>
                    <b-tag v-for="(attachment, i) in assignment.attachments" :key="i" size="is-medium" ellipsis>
                      <a :href="attachment.downloadUrl" target="_blank" rel="noopener noreferrer">{{ attachment.fileName }}</a>
                    </b-tag>
                  </b-taglist>
                </div>
              </nav>
              <p>
                <strong>Due Date</strong>: {{ assignment.dueDate ? assignment.dueDate.toLocaleString() : 'No due date' }}
              </p>
              <p>
                <small>Created By: {{assignment.createdBy.name}}</small>
              </p>
            </div>
          </div>
          <footer class="card-footer">
            <router-link 
              :to="{ 
                name: 'subject-assignment', 
                params: { 
                  subjectCode: subjectCode,
                  assignmentId: assignment.id
                }
              }" class="card-footer-item">View Assignment {{ isAdminOrTeacher ? 'Submissions' : ''}}</router-link>
            <a v-if="isAdminOrTeacher" class="card-footer-item" @click.prevent="editAssignment(assignment)">Edit</a>
            <a v-if="isAdminOrTeacher" class="card-footer-item" @click.prevent="deleteAssignment(assignment, index)">Delete</a>
          </footer>
        </b-collapse>
      </b-tab-item>
    </b-tabs>

    <b-modal 
      :active.sync="isLectureModalActive"
      has-modal-card
      full-screen 
      :can-cancel="false">
      <lecture-form :subject="subjectDetails" :isEditing="isEditingLecture" :formData="editLectureData" @finished="getLectures" />
    </b-modal>
    <b-modal 
      :active.sync="isAssignmentModalActive"
      has-modal-card
      full-screen 
      :can-cancel="false">
      <assignment-form :subject="subjectDetails" :isEditing="isEditingAssignment" :formData="editAssignmentData" @finished="getAssignments"/>
    </b-modal>
  </section>
</template>

<script>
import TitleBar from '@/components/TitleBar'
//import SubjectAssignments from '@/components/SubjectAssignments'
import SubjectDiscussions from '@/components/SubjectDiscussions'
import LectureForm from '@/components/LectureForm'
import AssignmentForm from '@/components/AssignmentForm'
import {mapState, mapActions} from 'vuex'
import {db} from '../firebase'

export default {
  name: 'SubjectClassroom',
  components: {
    TitleBar, SubjectDiscussions,
    LectureForm, AssignmentForm
  },
  data() {
    return {
      isPageLoading: false,
      isLectureModalActive: false,
      isAssignmentModalActive: false,
      lectures: [],
      editLectureData: null,
      isEditingLecture: false,

      assignments: [],
      editAssignmentData: null,
      isEditingAssignment: false,
    }
  },
  computed: {
    ...mapState(['subjects', 'userRole']),
    subjectDetails() {
      const subject = this.subjects.filter(s => s.subjectCode === this.$route.params.subjectCode.toUpperCase())
      return subject[0]
    },
    title() {
      return `${this.subjectDetails.name} (${this.subjectDetails.subjectCode})`
    },
    subjectCode() {
      return this.subjectDetails.subjectCode || null
    },
    isAdminOrTeacher() {
      return this.userRole.includes('admin') || this.userRole.includes('teacher')
    },
    isStudent() {
      return this.userRole.includes('student')
    }
  },
  methods: {
    ...mapActions(['fetchSubjects']),
    createLecture() {
      this.isEditingLecture = false
      this.isLectureModalActive = true
    },
    editLecture(lecture) {
      this.isEditingLecture = true
      this.editLectureData = lecture
      this.isLectureModalActive = true
    },
    deleteLecture(lecture, index) {
      this.$buefy.dialog.confirm({
        title: 'Confirm action',
        message: `This will permanently delete <b>${lecture.topic}</b><br>This action can not be undone.`,
        confirmText: 'Delete',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => {
          db.collection('subjects').doc(this.subjectCode).collection('lectures')
            .doc(lecture.id).delete()
            .then(() => {
              this.$buefy.toast.open({
                message: 'Lecture deleted successfully',
                type: 'is-success',
                queue: false
              })
              this.lectures.splice(index,1)
            })
            .catch((e) => this.$buefy.toast.open({
                message: `Cannot be deleted. Error: ${e.message}`,
                type: 'is-danger',
                queue: false
              }))
        }
      })
    },
    
    createAssignment() {
      this.isEditingAssignment = false
      this.isAssignmentModalActive = true
    },
    editAssignment(assignment) {
      this.isEditingAssignment = true
      this.editAssignmentData = assignment
      this.isAssignmentModalActive = true
    },
    deleteAssignment(assignment, index) {
      this.$buefy.dialog.confirm({
        title: 'Confirm action',
        message: `This will permanently delete <b>${assignment.title}</b><br>This action can not be undone.`,
        confirmText: 'Delete',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => {
          db.collection('subjects').doc(this.subjectCode).collection('assignments')
            .doc(assignment.id).delete()
            .then(() => {
              this.$buefy.toast.open({
                message: 'Assignment deleted successfully',
                type: 'is-success',
                queue: false
              })
              this.assignments.splice(index,1)
            })
            .catch((e) => this.$buefy.toast.open({
                message: `Cannot be deleted. Error: ${e.message}`,
                type: 'is-danger',
                queue: false
              }))
        }
      })
    },

    getLectures() {
      this.isPageLoading = true
      let lectures = []
      db.collection('subjects').doc(this.subjectCode)
        .collection('lectures').get()
        .then(snapshot => {
          snapshot.forEach(s => {
            const data = s.data()
            lectures.push({
              id: s.id,
              ...data,
              startTime: data.startTime.toDate(),
              endTime: data.endTime.toDate(),
              createdAt: data.createdAt.toDate(),
              modifiedAt: data.modifiedAt.toDate(),
            })
          })
          this.lectures = lectures
          this.isPageLoading = false
        })
    },
    getAssignments() {
      let assignments = []
      db.collection('subjects').doc(this.subjectCode)
        .collection('assignments').get()
        .then(snapshot => {
          snapshot.forEach(s => {
            const data = s.data()
            assignments.push({
              id: s.id,
              ...data,
              dueDate: data.dueDate ? data.dueDate.toDate() : null,
              createdAt: data.createdAt.toDate(),
              modifiedAt: data.modifiedAt.toDate(),
            })
          })
          this.assignments = assignments
        })
    }
  },
  created() {
    if (this.subjectDetails) {
      this.getLectures()
      this.getAssignments()
    } else {
      this.$router.replace({ name: 'classroom' })
    }
  }
}
</script>