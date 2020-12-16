<template>
  <section class="section">
    <title-bar>
      {{$route.meta.title}}
      <b-button type="is-primary" icon-left="arrow-left" slot="button" @click="$router.go(-1)">Back</b-button>
    </title-bar>
    <card-component title="Attendence Report" icon="file-chart">
      <form class="attendence-report-form" @submit.prevent="getAttendenceReport">
        <b-field label="Subject Code" horizontal grouped group-multiline>
          <b-select @input="attendenceReport = null" v-model="attendenceSubjectCode" placeholder="Select a subject code">
            <option
                v-for="subject in subjects"
                :value="subject.subjectCode"
                :key="subject.subjectCode">
                {{ subject.subjectCode }}
            </option>
          </b-select>
          <p class="control">
            <b-button native-type="submit" :loading="isAttendenceReportLoading" class="button is-primary">Submit</b-button>
          </p>
        </b-field>
      </form>
      <b-notification v-if="attendenceReport" :closable="false">
        <div class="level">
          <div class="level-left">
            <div class="level-item">
              <p class="subtitle is-6">
                Last Updated on: <strong>{{ attendenceReport.generatedAt }}</strong>
              </p>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <div class="buttons">
                <b-button :loading="isAttendenceReportGenerateLoading" icon-left="refresh" @click="generateAttendenceReport"></b-button>
                <b-button @click="downloadAttendenceReport">Download</b-button>
              </div>
            </div>
          </div>
        </div>
      </b-notification>
    </card-component>
  </section>
</template>

<script>
import TitleBar from '@/components/TitleBar'
import CardComponent from '@/components/CardComponent'
import { mapState } from 'vuex'
import { db, functions } from '../firebase'
import downloadJSONtoCSV from '../jsonToCsv'

function addProps(obj, propName, propValue) {
  obj[propName] = propValue
}

export default {
    name: 'Reports',
    components: { TitleBar, CardComponent },
    data() {
      return {
        attendenceSubjectCode: null,
        attendenceReport: null,
        attendenceReportExport: {},
        isAttendenceReportLoading: false,
        isAttendenceReportGenerateLoading: false
      }
    },
    computed: {
      ...mapState(['subjects', 'students']),
    },
    methods: {
      getAttendenceReport() {
        this.isAttendenceReportLoading = true
        db.collection('reports').doc(`attendenceReport_${this.attendenceSubjectCode}`).get()
          .then(doc => {
            if (doc.exists) {
              const data = doc.data()
              this.attendenceReport = {
                ...data,
                generatedAt: data.generatedAt.toDate()
              }
            } else {
              this.attendenceReport = {}
              this.attendenceReport['generatedAt'] = 'No report found'
            }
            this.isAttendenceReportLoading = false
          })
          .catch(e => {
            this.isAttendenceReportLoading = false
            this.onFailure(e)
          })
      },
      async generateAttendenceReport() {
        try {
          this.isAttendenceReportGenerateLoading = true
          const { data } = await this.generateReport('student-attendence', this.attendenceSubjectCode)
          //console.log(data)
          if (data.status === 'success') {
            this.onSuccess(data.message)
            this.getAttendenceReport()
          } else {
            this.onFailure({ message: data.error })
          }
          this.isAttendenceReportGenerateLoading = false
        } catch (e) {
          this.isAttendenceReportGenerateLoading = false
          //console.log(e)
          this.onFailure(e)
        }
      },
      downloadAttendenceReport() {
        const report = this.attendenceReport.data.map(data => {
          const student = this.students.filter(s => s.uid === data.uid)
          let attendence = {}
          data.lectureAttended.forEach(lec => {
            const date = lec.date.toDate().toLocaleDateString('en-GB')
            if (date in attendence) {
              attendence[date] += lec.period
            } else {
              addProps(attendence, date, lec.period)
            }
          })
          return {
            universityRoll: student[0].univRoll,
            classRoll: student[0].classRoll,
            name: student[0].name,
            ...attendence
          }
        })
        downloadJSONtoCSV(`Student_Attendence_Report_${this.attendenceSubjectCode}`, report)
      },
      async generateReport(reportName, subjectCode) {
        return functions.httpsCallable("generateReport")({ reportName, subjectCode })
      },
      onSuccess(msg) {
        this.isLoading = false
        this.$buefy.toast.open({
          message: msg,
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
    }
}
</script>

<style>
  .attendence-report-form {
    margin-bottom: 2rem;
  }
</style>