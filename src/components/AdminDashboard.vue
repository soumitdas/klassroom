<template>
  <tiles>
      <card-widget
        class="tile is-child"
        icon="account-group"
        :number="totalStudents"
        label="Students"
      />
      <card-widget class="tile is-child" icon="teach" :number="totalTeachers" label="Teachers" />
      <card-widget class="tile is-child" icon="school" label="Classrooms" />
    </tiles>
</template>

<script>
import CardWidget from '@/components/CardWidget'
import Tiles from '@/components/Tiles'

export default {
  name: 'AdminDashboard',
  components: {
    Tiles, CardWidget
  },
  computed: {
    totalStudents() {
      return this.$store.state.students.length
    },
    totalTeachers() {
      return this.$store.state.teachers.length
    }
  },
}
</script>