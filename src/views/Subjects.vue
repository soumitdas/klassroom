<template>
  <section class="section">
    <title-bar>
      {{this.$route.meta.title}}
      <div class="buttons" slot="button">
        <b-button type="is-primary" icon-left="plus" @click="showNewForm">Add New Subject</b-button>
      </div>
    </title-bar>

    <div class="level">
      <div class="level-left">
        <b-field grouped group-multiline>
          <p class="control">
              <b-switch v-model="visible.schedule">
                  Show Schedule
              </b-switch>
          </p>
          <p class="control">
              <b-switch v-model="visible.startEndDate">
                  Show Start and End date
              </b-switch>
          </p>
          <p class="control">
              <b-switch v-model="searchable">
                  Searchable
              </b-switch>
          </p>
        </b-field>
      </div>
      <div class="level-right">
        <b-field grouped>
          <b-select v-model="perPage">
            <option value="10">10 per page</option>
            <option value="15">15 per page</option>
            <option value="20">20 per page</option>
            <option value="30">30 per page</option>
            <option value="50">50 per page</option>
          </b-select>
        </b-field>
      </div>
    </div>

    <card-component class="has-table" title="Subject Table" icon="account-multiple" headerIcon="refresh" @header-icon-click="fetchSubjects">
      <b-table
        :checkable="true"
        :loading="false"
        :paginated="subjects.length > perPage"
        :per-page="perPage"
        :striped="false"
        :hoverable="true"
        :mobile-cards="false"
        default-sort="subjectCode"
        :data="subjects">

        <template slot-scope="props">
          <b-table-column label="Subject Code" field="subjectCode" :searchable="searchable" sortable>
            {{ props.row.subjectCode }}
          </b-table-column>
          <b-table-column label="Subject Name" field="name" :searchable="searchable" sortable>
            {{ props.row.name }}
          </b-table-column>
          <b-table-column label="Students" field="students" centered>
            <b-taglist>
              <b-tag v-for="s in props.row.students" :key="s.uid">{{ s.univRoll }}</b-tag>
            </b-taglist>
          </b-table-column>
          <b-table-column label="Teachers" field="teachers" centered>
            <b-taglist>
              <b-tag v-for="t in props.row.teachers" :key="t.uid">{{ t.name }}</b-tag>
            </b-taglist>
          </b-table-column>
          <b-table-column label="Schedule" field="schedule" :visible="visible.schedule" centered>
            <b-taglist>
              <b-tag v-for="s in props.row.schedule" :key="s.uid">{{ days[s.day] }} - {{ s.start ? s.start.toLocaleTimeString('en-IN') : '' }} to {{ s.end ? s.end.toLocaleTimeString('en-IN') : '' }}</b-tag>
            </b-taglist>
          </b-table-column>
          <b-table-column label="Start Date" field="startDate" :visible="visible.startEndDate" centered>
            {{ props.row.startDate.toLocaleDateString('en-IN') }}
          </b-table-column>
          <b-table-column label="End Date" field="endDate" :visible="visible.startEndDate" centered>
            {{ props.row.endDate.toLocaleDateString('en-IN') }}
          </b-table-column>
          <b-table-column custom-key="actions" class="is-actions-cell">
            <div class="buttons is-right">
              <button class="button is-small is-primary" type="button" @click.prevent="showEditForm(props.row)">
                <b-icon icon="eye" custom-size="default"/>
              </button>
              <button class="button is-small is-danger" type="button" @click.prevent="showDeletePrompt(props.row)">
                <b-icon icon="trash-can" custom-size="default"/>
              </button>
            </div>
          </b-table-column>
        </template>

        <section class="section" slot="empty">
          <div class="content has-text-grey has-text-centered">
            <template v-if="isLoading">
              <p>
                <b-icon icon="dots-horizontal" size="is-large"/>
              </p>
              <p>Fetching data...</p>
            </template>
            <template v-else>
              <p>
                <b-icon icon="emoticon-sad" size="is-large"/>
              </p>
              <p>Nothing's there&hellip;</p>
            </template>
          </div>
        </section>
      </b-table>
    </card-component>

    <b-modal :aria-modal="true" :active.sync="isFormVisible" :width="600">
      <form @submit.prevent="onSubmit">
        <div class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p v-if="isEditing" class="modal-card-title">Edit Subject Details</p>
            <p v-else class="modal-card-title">Add New Subject</p>
            <p v-if="isEditing" class="has-text-grey is-size-7"><b>Subject Code</b>: {{ subCode }}</p>
          </header>
          <section class="modal-card-body">
            <b-field v-if="!isEditing" label="Subject Code" label-position="on-border">
              <b-input v-model="subCode" :maxlength="10" placeholder="Enter Subject Code" required></b-input>
            </b-field>
            <b-field label="Subject Name" label-position="on-border">
              <b-input v-model="subName" :maxlength="200" placeholder="Enter Subject Name" required></b-input>
            </b-field>
            <b-field label="Subject Description" label-position="on-border">
              <b-input v-model="subDesc" maxlength="200" type="textarea" placeholder="Write something about the subject..."></b-input>
            </b-field>
            <b-field label="Alloted Students" label-position="on-border">
              <b-taginput
                v-model="subStudents"
                :data="filteredStudents"
                autocomplete
                field="univRoll"
                icon=""
                placeholder="Add a Student"
                append-to-body
                @typing="getFilteredStudents">
              </b-taginput>
            </b-field>
            <b-field label="Alloted Teacher" label-position="on-border">
              <b-taginput
                v-model="subTeachers"
                :data="filteredTeachers"
                autocomplete
                field="name"
                icon=""
                placeholder="Add a Teacher"
                append-to-body
                @typing="getFilteredTeachers">
              </b-taginput>
            </b-field>
            <b-field label="Semester Period" label-position="on-border">
              <b-datepicker
                placeholder="Select the Date Range"
                v-model="subDates"
                range
                required>
              </b-datepicker>
            </b-field>
            <div class="field">
              <b-switch v-model="hasSchedule">Add Schedule</b-switch>
            </div>
            <div v-if="hasSchedule">
              <b-field v-for="(schedule,k) in subSchedule" :key="k">
                <b-select v-model="schedule.day" placeholder="Day">
                  <option value="0">Monday</option>
                  <option value="1">Tuesday</option>
                  <option value="2">Wednesday</option>
                  <option value="3">Thursday</option>
                  <option value="4">Friday</option>
                  <option value="5">Saturday</option>
                  <option value="6">Sunday</option>
                </b-select>
                <b-timepicker v-model="schedule.start"
                  rounded
                  placeholder="Select Start Time"
                  :hour-format="'12'">
                </b-timepicker>
                <b-timepicker v-model="schedule.end"
                  rounded
                  placeholder="Select End Time"
                  :hour-format="'12'">
                </b-timepicker>
                <p class="control">
                  <b-button @click="remove(k)" v-show="k || ( !k && subSchedule.length > 1)" icon-left="calendar-remove"></b-button>
                </p>
                <p class="control">
                  <b-button @click="add()" v-show="k === subSchedule.length-1" icon-left="calendar-plus"></b-button>
                </p>
              </b-field>
            </div>
          </section>
          <footer class="modal-card-foot has-text-right">
            <b-button @click="closeModalForm">Close</b-button>
            <b-button native-type="submit" type="is-primary" :loading="isButtonLoading">{{ isEditing ? 'Update' : 'Save'}}</b-button>
          </footer>
        </div>
      </form>
    </b-modal>

  </section>
</template>

<script>
import {mapState,mapActions} from 'vuex'
import CardComponent from '@/components/CardComponent'
import TitleBar from '@/components/TitleBar'
import {db} from '../firebase'

export default {
  name: 'Subjects',
  components: { TitleBar, CardComponent },
  data() {
    return {
      subCode: '',
      subName: '',
      subDesc: '',
      subStudents: [],
      subTeachers: [],
      subDates: [],
      hasSchedule: false,
      subSchedule: [{
        day: null,
        start: null,
        end: null
      }],

      filteredTeachers: [],
      filteredStudents: [],

      isFormVisible: false,
      isEditing: false,

      isLoading: false,
      isButtonLoading: false,
      perPage: 10,
      searchable: false,
      visible: {
        schedule: false,
        startEndDate: false
      },

      days: [
        'Monday',
        'Tueday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ]
    }
  },
  computed: {
    ...mapState(['subjects','students','teachers']),
    hasFormChanged() {
      return this.isEditing ? JSON.stringify(this.form) !== this.formCopy : true
    }
  },
  methods: {
    ...mapActions(['fetchSubjects']),
    showNewForm() {
      this.subCode = ''
      this.subName = ''
      this.subDesc = ''
      this.subStudents = []
      this.subTeachers = []
      this.subDates = []
      this.subSchedule = [{
        day: null,
        start: null,
        end: null
      }]
      this.isFormVisible = true
      this.isEditing = false
    },
    showEditForm(sub) {
      this.subCode = sub.subjectCode
      this.subName = sub.name
      this.subDesc = sub.description || ''
      this.subStudents = sub.students
      this.subTeachers = sub.teachers
      this.subDates = [ sub.startDate, sub.endDate ]
      this.hasSchedule = true
      this.subSchedule = sub.schedule
      this.isFormVisible = true
      this.isEditing = true
    },
    closeModalForm() {
      this.isFormVisible = false
      this.subCode = ''
      this.subName = ''
      this.subDesc = ''
      this.subStudents = []
      this.subTeachers = []
      this.subDates = []
      this.hasSchedule = false
      this.subSchedule = [{
        day: null,
        start: null,
        end: null
      }]
      this.isEditing = false
    },
    onSubmit() {
      if (this.isEditing) {
        this.updateSubject()
        return
      }
      this.addSubject()
    },

    getFilteredStudents(text) {
      this.filteredStudents = this.students.filter((option) => option.univRoll.toString().toLowerCase().indexOf(text.toLowerCase()) >= 0)
    },
    getFilteredTeachers(text) {
      this.filteredTeachers = this.teachers.filter((option) => option.name.toString().toLowerCase().indexOf(text.toLowerCase()) >= 0)
    },

    addSubject() {
      this.isButtonLoading = true
      const subData = {
        name: this.subName,
        description: this.subDesc,
        students: this.subStudents.map(s => ({ uid: s.uid, univRoll: s.univRoll })),
        teachers: this.subTeachers.map(t => ({ uid: t.uid, name: t.name })),
        studentId: this.subStudents.map(s => s.uid),
        teacherId: this.subTeachers.map(t => t.uid),
        startDate: new Date(this.subDates[0]),
        endDate: new Date(this.subDates[1]),
        schedule: this.subSchedule
      }
      db.collection('subjects').doc(this.subCode).set(subData)
        .then(() => this.onSuccess('created'))
        .catch(e => this.onFailure(e))
    },
    updateSubject() {
      this.isButtonLoading = true
      const subData = {
        name: this.subName,
        description: this.subDesc,
        students: this.subStudents.map(s => ({ uid: s.uid, univRoll: s.univRoll })),
        teachers: this.subTeachers.map(t => ({ uid: t.uid, name: t.name })),
        studentId: this.subStudents.map(s => s.uid),
        teacherId: this.subTeachers.map(t => t.uid),
        startDate: new Date(this.subDates[0]),
        endDate: new Date(this.subDates[1]),
        schedule: this.subSchedule
      }
      db.collection('subjects').doc(this.subCode).update(subData)
        .then(() => this.onSuccess("updated"))
        .catch(e => this.onFailure(e))
    },
    onSuccess(event) {
      this.isButtonLoading = false;
      this.isFormVisible = false;
      this.$store.dispatch('fetchSubjects')
      this.$buefy.toast.open({
        message: `Subject ${event} successfully`,
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

    showDeletePrompt(sub) {
      this.$buefy.dialog.confirm({
        title: 'Confirm action',
        message: `This will permanently delete <b>${sub.name} (${sub.subjectCode})</b><br>This action can not be undone.`,
        confirmText: 'Delete',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => db.collection('subjects').doc(sub.subjectCode).delete()
                          .then(() => this.onSuccess("deleted"))
                          .catch(error => this.onFailure(error))
      })
    },
    add() {
      this.subSchedule.push({ day: null, start: null, end: null });
    },
    remove(index) {
      this.subSchedule.splice(index, 1);
    }
  },
}
</script>