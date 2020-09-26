<template>
  <form @submit.prevent="createOrUpdateLecture" class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">{{ isEditing ? 'Edit Lecture' : 'Lecture' }}</p>
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
                <b-field label="Lecture Topic" label-position="on-border">
                    <b-input v-model="lecture.topic" maxlength="100" placeholder="Enter the Topic of the Lecture" required></b-input>
                </b-field>
                <b-field label="Lecture Description" label-position="on-border">
                    <b-input v-model="lecture.description" maxlength="300" type="textarea" placeholder="Write something about the lecture..."></b-input>
                </b-field>
                <b-field message="PDF only">
                    <b-upload disabled multiple accept="application/pdf">
                    <a class="button">
                        <b-icon class="file-icon" icon="paperclip"></b-icon>
                        <span class="file-label">Attach</span>
                    </a>
                    </b-upload>
                </b-field>
                <b-field label="Mode of Delivery" label-position="on-border">
                    <b-select v-model="lecture.mode" placeholder="Select a Method" required>
                        <option value="virtual">Virtual Mode</option>
                        <option value="physical">Physical Mode</option>
                    </b-select>
                </b-field>
                <b-field v-show="lecture.mode === 'virtual'">
                    <b-select v-model="lecture.virtualMeet.platform" placeholder="Platform" :required="lecture.mode === 'virtual'">
                        <option value="Google Meet">Google Meet</option>
                        <option value="Zoom">Zoom</option>
                        <option value="Cisco Webex">Cisco Webex</option>
                        <option value="Skype">Skype</option>
                    </b-select>
                    <b-input v-model="lecture.virtualMeet.url" placeholder="Enter the URL" expanded :required="lecture.mode === 'virtual'"></b-input>
                </b-field>
            </div>
            <div class="column is-one-third">
                <b-field label="Lecture Timmings" label-position="on-border">
                    <b-select v-model="schedule" @input="showTimePicker()" placeholder="Select a Timming" required>
                        <option v-for="(s,i) in getSavedSchedule" :key="i" :value="i">
                            {{s.startTime.getHours()}}:{{s.startTime.getMinutes()}} - {{s.endTime.getHours()}}:{{s.endTime.getMinutes()}}
                        </option>
                        <option value="custom">Custom</option>
                    </b-select>
                </b-field>
                
                <b-field v-show="isScheduleSelected" label="Start Time" label-position="on-border">
                    <b-datetimepicker
                        v-model="lecture.startTime"
                        placeholder="Click to select..."
                        icon="clock"
                        horizontal-time-picker>
                    </b-datetimepicker>
                </b-field>
                <b-field v-show="isScheduleSelected" label="End Time" label-position="on-border">
                    <b-datetimepicker
                        v-model="lecture.endTime"
                        placeholder="Click to select..."
                        icon="clock"
                        horizontal-time-picker>
                    </b-datetimepicker>
                </b-field>
                <b-field v-show="isScheduleSelected" label="No of Period" label-position="on-border">
                    <b-numberinput v-model="lecture.period" min="0" max="10"></b-numberinput>
                </b-field>
                <div class="field">
                    <b-switch v-model="isTakingAttendance">Take Attendance</b-switch>
                </div>
            </div>
            <div v-if="isTakingAttendance" class="column is-one-third">
                <b-field grouped>
                    <p class="control">
                        <b-checkbox v-model="columns[0].visible">
                            University Roll
                        </b-checkbox>
                    </p>
                    <p class="control">
                        <b-checkbox v-model="columns[1].visible">
                            Class Roll
                        </b-checkbox>
                    </p>
                </b-field>
                <b-table
                    :data="classStudents"
                    :columns="columns"
                    :checked-rows.sync="attendees"
                    checkable
                    checkbox-position="right"
                    :hoverable="true"
                    :mobile-cards="false"
                    default-sort="univRoll">

                    <template slot="bottom-left">
                        <b>Total Students Present</b>: {{ attendees.length }}
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
import {db, firebase} from '../firebase'

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
          isTakingAttendance: false,
          schedule: null,
          isScheduleSelected: false,
          attendees: [],
          lecture: {
              topic: '',
              description: '',
              mode: null,
              virtualMeet: {
                  platform: null,
                  url: ''
              },
              startTime: null,
              endTime: null,
              period: null
          },

          columns: [
            {
                field: 'univRoll',
                label: 'University Roll',
                sortable: true,
                visible: true
            },
            {
                field: 'classRoll',
                label: 'Class Roll',
                sortable: true,
                visible: false
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
      getSavedSchedule() {
        if (this.subject.schedule.length > 0) {

            return this.subject.schedule.map(s => {
                let startTime = new Date()
                let endTime = new Date()
                startTime.setHours(s.start.getHours())
                startTime.setMinutes(s.start.getMinutes())
                startTime.setSeconds(s.start.getSeconds())
                endTime.setHours(s.end.getHours())
                endTime.setMinutes(s.end.getMinutes())
                endTime.setSeconds(s.end.getSeconds())
                return {startTime, endTime}
            })
        } else {
            return []
        }
    }
  },
  methods: {
      createOrUpdateLecture() {
          if (this.$props.isEditing) {
              this.updateLecture()
          } else {
              this.createLecture()
          }
      },
      createLecture() {
          this.isLoading = true
          /*const attendees = this.attendees.map(s => ({
              uid: s.uid,
              univRoll: s.univRoll,
              name: s.name
          }))*/
          const attendeeUids = this.attendees.map(s => s.uid)
          const lectureData = {
              ...this.lecture,
              //attendees,
              attendeeUids,
              createdBy: {
                  name: this.$store.state.user.name,
                  uid: this.$store.state.user.uid
              },
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              modifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
          }

          db.collection('subjects').doc(this.subject.subjectCode).collection('lectures')
            .add(lectureData)
            .then(() => this.onSuccess('created'))
            .catch(e => this.onFailure(e))
      },
      updateLecture() {
          this.isLoading = true
          const attendeeUids = this.attendees.map(s => s.uid)
          const lectureData = {
              ...this.lecture,
              attendeeUids,
              createdBy: {
                  name: this.$store.state.user.name,
                  uid: this.$store.state.user.uid
              },
              modifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
          }

          db.collection('subjects').doc(this.subject.subjectCode).collection('lectures')
            .doc(this.$props.formData.id).update(lectureData)
            .then(() => this.onSuccess('updated'))
            .catch(e => this.onFailure(e))
      },
      onSuccess(event) {
      this.isLoading = false;
      this.$emit('finished');
      this.$parent.close();
      this.$buefy.toast.open({
        message: `Lecture ${event} successfully`,
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
    showTimePicker() {
        this.isScheduleSelected = true
        if (this.schedule === 'custom') {
            this.lecture.startTime = new Date()
            this.lecture.endTime = new Date()
        } else {
            this.lecture.startTime = this.getSavedSchedule[this.schedule].startTime
            this.lecture.endTime = this.getSavedSchedule[this.schedule].endTime
        }
        this.calculatePeriod()
    },
    calculatePeriod() {
        let diff = Math.abs(this.lecture.endTime - this.lecture.startTime)
        let timeDiff = Math.floor((diff / 1000)/60)
        this.lecture.period = Math.floor(timeDiff / 45) + 1
    }
  },
  mounted() {
      if (this.$props.isEditing) {
          const data = this.$props.formData
          this.lecture.topic = data.topic
          this.lecture.description = data.description
          this.lecture.mode = data.mode
          this.lecture.virtualMeet.platform = data.virtualMeet.platform || null
          this.lecture.virtualMeet.url = data.virtualMeet.url || ''
          
          this.lecture.startTime = data.startTime
          this.lecture.endTime = data.endTime
          this.lecture.period = data.period
          this.schedule = 'custom'
          this.isScheduleSelected = true
          this.attendees = this.students.filter(s => data.attendeeUids.includes(s.uid))
          if (data.attendeeUids.length > 0) { this.isTakingAttendance = true }
      }
  }
};
</script>
