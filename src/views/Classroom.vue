<template>
  <section class="section">
    <title-bar>
      {{this.$route.meta.title}}
      <b-button type="is-primary" icon-left="refresh" slot="button" @click="fetchSubjects">Refresh</b-button>
    </title-bar>
    <b-collapse v-for="subject in subjects" :key="subject.subjectCode" class="card" animation="slide" aria-id="contentIdForA11y3">
      <div
          slot="trigger" 
          slot-scope="props"
          class="card-header"
          role="button"
          aria-controls="contentIdForA11y3">
          <p class="card-header-title">
            <b-icon icon="school" custom-size="default" />
              {{ subject.name }} ({{ subject.subjectCode }})
          </p>
          <a class="card-header-icon">
              <b-icon
                  :icon="props.open ? 'menu-down' : 'menu-up'">
              </b-icon>
          </a>
      </div>
      <div class="card-content">
          <div class="content">
            <p>Description: {{ subject.description }}</p>
            <p>Students:  <span v-for="student in subject.students" :key="student.uid">{{ student.univRoll }} </span></p>
            <p>Teacher:  <span v-for="teacher in subject.teachers" :key="teacher.uid">{{ teacher.name }} </span></p>
          </div>
      </div>
      <footer class="card-footer">
        <router-link :to="{ name: 'subject-classroom', params: { subjectCode: subject.subjectCode } }" class="card-footer-item">Go to Classroom</router-link>
      </footer>
    </b-collapse>
  </section>
</template>

<script>
import TitleBar from '@/components/TitleBar'
import {mapState, mapActions} from 'vuex'

export default {
  name: 'Classroom',
  components: {
    TitleBar
  },
  computed: {
    ...mapState(['subjects'])
  },
  methods: {
    ...mapActions(['fetchSubjects'])
  },
  created() {
    if (!this.subjects.length) {
      this.fetchSubjects()
    }
  }
}
</script>