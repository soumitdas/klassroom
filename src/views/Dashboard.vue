<template>
  <section class="section">
    <title-bar>
      Welcome {{ getUserName }}
      <b-button v-if="isAdmin" type="is-primary" icon-left="refresh" slot="button" @click="fetchAll">Refresh</b-button>
    </title-bar>
    <admin-dashboard v-if="isAdmin"></admin-dashboard>
  </section>
</template>

<script>
// @ is an alias to /src
import TitleBar from '@/components/TitleBar'
import AdminDashboard from '@/components/AdminDashboard'

export default {
  name: 'Dashboard',
  components: {
    TitleBar, AdminDashboard
  },
  computed: {
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
/*  created() {
    db.collection('users').where('role', 'array-contains', 'student')
    .onSnapshot(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data().role[0] + ' ' + doc.data().studentData);
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
  }*/

}
</script>