import Vue from 'vue'
import Vuex from 'vuex'

import {db, auth} from '../firebase'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    /* User */
    user: {
      uid: null,
      name: null,
      email: null,
      photoUrl: null,
      phone: null
    },
    userRole: [],
    userProfile: null,
    userEmailVerified: null,

    // Institute
    instituteDetails: null,

    // Students
    students: [],
    // Teachers
    teachers: [],
    teacherSubjects: [],
    // Subjects
    subjects: [],
    studentSubjects: [],

    /* NavBar */
    isNavBarVisible: true,

    /* FooterBar */
    isFooterBarVisible: true,

    /* Aside */
    isAsideVisible: true,
    isAsideMobileExpanded: false,

    isOuterLayout: false,
  },
  mutations: {
    /* A fit-them-all commit */
    basic (state, payload) {
      state[payload.key] = payload.value
    },

    /* User */
    setUser (state, payload) {
      if (payload) {
        state.user.uid = payload.uid
        state.user.name = payload.displayName || null
        state.user.email = payload.email || null
        state.user.photoUrl = payload.photoURL || null
        state.user.phone = payload.phoneNumber || null
        state.userEmailVerified = payload.emailVerified
      } else {
        state.user.uid = null
        state.user.name = null
        state.user.email = null
        state.user.photoUrl = null
        state.user.phone = null
        state.userRole = []
        state.userEmailVerified = null
      }      
    },
    setUserRole (state, payload) {
      state.userRole = payload.role ? payload.role : []
    },
    setInstitute (state, payload) {
      payload ? state.instituteDetails = payload : state.instituteDetails = null 
    },
    setUserProfile (state, payload) {
      state.userProfile = payload ? payload : null 
    },

    setStudents (state, payload) {
      state.students = payload
    },
    addOrUpdateStudent (state, payload) {
      const index = state.students.findIndex(s => s.uid === payload.uid)
      if (index !== -1) {
        state.students.splice(index, 1, payload)
      } else {
        state.students.push(payload)
      }
    },
    deleteStudent (state, payload) {
      const students = state.students.filter(s => payload !== s.uid)
      state.students = students
    },

    setTeachers (state, payload) {
      state.teachers = payload
    },
    addOrUpdateTeacher (state, payload) {
      const index = state.teachers.findIndex(t => t.uid === payload.uid)
      if (index !== -1) {
        state.teachers.splice(index, 1, payload)
      } else {
        state.teachers.push(payload)
      }
    },
    deleteTeacher (state, payload) {
      const teachers = state.teachers.filter(t => payload !== t.uid)
      state.teachers = teachers
    },

    setSubjects (state, payload) {
      state.subjects = payload
    },
    setStudentSubjects (state, payload) {
      state.studentSubjects = payload
    },

    /* Aside Mobile */
    asideMobileStateToggle (state, payload = null) {
      const htmlClassName = 'has-aside-mobile-expanded'

      let isShow

      if (payload !== null) {
        isShow = payload
      } else {
        isShow = !state.isAsideMobileExpanded
      }

      if (isShow) {
        document.documentElement.classList.add(htmlClassName)
      } else {
        document.documentElement.classList.remove(htmlClassName)
      }

      state.isAsideMobileExpanded = isShow
    },

    /* No Asidemenu & Navbar */
    hideAsideNavbar (state, payload) {
      const htmlClassName = ['has-navbar-fixed-top', 'has-aside-expanded']

      let isShow

      if (payload !== null) {
        isShow = payload
      } else {
        isShow = !state.isOuterLayout
      }

      if (isShow) {
        document.documentElement.classList.remove(...htmlClassName)
      } else {
        document.documentElement.classList.add(...htmlClassName)
      }

      state.isOuterLayout = isShow
    }
  },
  actions: {
    fetchAuthUser({ commit }) {
      commit('setUser', auth.currentUser)
    },
    async fetchInstituteDetails({ commit }) {
      const doc = await db.doc('settings/institute').get()
      const institute = doc.data()
      commit('setInstitute', {...institute, modifiedAt: institute.modifiedAt.toDate()})
    },
    async fetchUserProfile({ commit }, uid) {
      if (uid) {
        const user = await db.collection('users').doc(uid).get()
        commit('setUserProfile', user.data())
      }
    },

    async fetchStudents({ commit }) {
      const ref = db.collection('users').where('role', 'array-contains', 'student')
      const {docs} = await ref.get()
      const students = docs.map(doc => ({uid: doc.id, ...doc.data().studentData}))
      commit('setStudents', students)
    },
    async addStudent({ commit }, uid) {
      const doc = await db.collection('users').doc(uid).get()
      const student = {uid, ...doc.data().studentData}
      commit('addOrUpdateStudent', student)
    },

    async fetchTeachers({ commit }) {
      const ref = db.collection('users').where('role', 'array-contains', 'teacher')
      const {docs} = await ref.get()
      const teachers = docs.map(doc => ({uid: doc.id, ...doc.data().teacherData}))
      commit('setTeachers', teachers)
    },

    async fetchSubjects({ commit, state }) {
      let subjects = []
      if (state.userRole.includes('admin')) {
        const {docs} = await db.collection('subjects').get()
        subjects = docs.map(doc => {
          const data = doc.data()
          return { subjectCode: doc.id, ...data, ...(data.startDate && data.endDate && { startDate: data.startDate.toDate(), endDate: data.endDate.toDate() }),
            schedule: data.schedule.map(s => ({ ...s, ...(s.start && s.end && { start: s.start.toDate(), end: s.end.toDate() }) })) }       
        })
        
      } else if (state.userRole.includes('teacher')) {
        const userId = state.user.uid
        const {docs} = await db.collection('subjects').where('teacherId', 'array-contains', userId).get()
        subjects = docs.map(doc => {
          const data = doc.data()
          return { subjectCode: doc.id, ...data, ...(data.startDate && data.endDate && { startDate: data.startDate.toDate(), endDate: data.endDate.toDate() }),
            schedule: data.schedule.map(s => ({ ...s, ...(s.start && s.end && { start: s.start.toDate(), end: s.end.toDate() }) })) }
        })
        
      } else if (state.userRole.includes('student')) {
        const userId = state.user.uid
        const {docs} = await db.collection('subjects').where('studentId', 'array-contains', userId).get()
        subjects = docs.map(doc => {
          const data = doc.data()
          return { subjectCode: doc.id, ...data, ...(data.startDate && data.endDate && { startDate: data.startDate.toDate(), endDate: data.endDate.toDate() }),
            schedule: data.schedule.map(s => ({ ...s, ...(s.start && s.end && { start: s.start.toDate(), end: s.end.toDate() }) })) }
        })

      }
      commit('setSubjects', subjects)
    },

    async fetchAll({ dispatch, state }) {

      await dispatch('fetchInstituteDetails')
      await dispatch('fetchUserProfile', state.user.uid)

      if (state.userRole.includes('admin')) {
        await dispatch('fetchStudents')
        await dispatch('fetchTeachers')
        await dispatch('fetchSubjects')
      } else if (state.userRole.includes('teacher')) {
        await dispatch('fetchStudents')
      }
           
    }
  }
})
