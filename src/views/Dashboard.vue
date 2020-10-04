<template>
  <section class="section">
    <title-bar>
      Welcome {{ getUserName }}
      <b-button v-if="isAdmin" type="is-primary" icon-left="refresh" slot="button" @click="fetchAll">Refresh</b-button>
    </title-bar>
    <admin-dashboard v-if="isAdmin"></admin-dashboard>
    <div v-else class="columns">
      <div v-if="isStudent" class="column">
        <div class="box">
          <article class="media">
            <div class="media-content">
              <div class="content">
                <div class="subtitle">Student Details</div>
                <p v-if="userProfile">
                  <strong>Class Roll:</strong> {{ userProfile.studentData.classRoll }}
                  <br>
                  <strong>University Roll:</strong> {{ userProfile.studentData.univRoll }}
                  <br>
                  <strong>Department:</strong> {{ userProfile.studentData.dept }}
                  <br>
                  <strong>Batch:</strong> {{ userProfile.studentData.batch }}
                </p>
                <div v-else>
                  <b-skeleton></b-skeleton>
                  <b-skeleton></b-skeleton>
                  <b-skeleton></b-skeleton>
                  <b-skeleton></b-skeleton>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
      <div v-if="isTeacher" class="column">
        <div class="box">
          <article class="media">
            <div class="media-content">
              <div class="content">
                <div class="subtitle">Teacher Details</div>
                <p v-if="userProfile">
                  <strong>Department:</strong> {{ userProfile.teacherData.dept }}
                </p>
                <div v-else>
                  <b-skeleton></b-skeleton>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
      <div class="column">
        <div class="box">
          <article class="media">
            <div class="media-content">
              <div class="content">
                <div class="subtitle">Institute Details</div>
                <p v-if="instituteDetails">
                  <strong>Name:</strong> {{ instituteDetails.name }}
                  <br>
                  <strong>Address:</strong> {{ instituteDetails.address }}
                  <br>
                  <strong>Contact No:</strong> {{ instituteDetails.contactNo }}
                  <br>
                  <strong>Email:</strong> {{ instituteDetails.email }}
                  <br>
                </p>
                <div v-else>
                  <b-skeleton></b-skeleton>
                  <b-skeleton></b-skeleton>
                  <b-skeleton></b-skeleton>
                  <b-skeleton></b-skeleton>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
// @ is an alias to /src
import TitleBar from '@/components/TitleBar'
import AdminDashboard from '@/components/AdminDashboard'
import {mapState} from 'vuex'

export default {
  name: 'Dashboard',
  components: {
    TitleBar, AdminDashboard
  },
  computed: {
    ...mapState(['userProfile', 'instituteDetails']),
    getUserName() {
      return this.$store.state.user.name
    },
    isAdmin() {
      return this.$store.state.userRole.includes('admin')
    },
    isTeacher() {
      return this.$store.state.userRole.includes('teacher')
    },
    isStudent() {
      return this.$store.state.userRole.includes('student')
    }
  },
  methods: {
    fetchAll() {
      this.$store.dispatch('fetchAll')
    }
  },
}
</script>