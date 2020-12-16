import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import PageNotFound from '../views/PageNotFound.vue'

//import DefaultLayout from '../layouts/DefaultLayout.vue'
import OuterLayout from '../layouts/OuterLayout.vue'

const DefaultLayout = () => import(/* webpackChunkName: "main" */ '../layouts/DefaultLayout.vue')


Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'login',
    component: Home,
    meta: { 
      title: 'Login',
      layout: OuterLayout 
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import(/* webpackChunkName: "main" */ '../views/Dashboard.vue'),
    meta: {
      title: 'Dashboard',
      layout: DefaultLayout,
      requiresAuth: true
    }
  },
  {
    path: '/students',
    name: 'students',
    component: () => import(/* webpackChunkName: "admin-dash" */ '../views/Students.vue'),
    meta: { title: "Students", layout: DefaultLayout, requiresAuth: true }
  },
  {
    path: '/teachers',
    name: 'teachers',
    component: () => import(/* webpackChunkName: "admin-dash" */ '../views/Teachers.vue'),
    meta: { title: "Teachers", layout: DefaultLayout, requiresAuth: true }
  },
  {
    path: '/subjects',
    name: 'subjects',
    component: () => import(/* webpackChunkName: "admin-dash" */ '../views/Subjects.vue'),
    meta: {
      title: 'Subjects',
      layout: DefaultLayout,
      requiresAuth: true 
    }
  },
  {
    path: '/classroom',
    name: 'classroom',
    component: () => import(/* webpackChunkName: "main" */ '../views/Classroom.vue'),
    meta: { title: "Classroom", layout: DefaultLayout, requiresAuth: true }
  },
  {
    path: '/classroom/:subjectCode',
    name: 'subject-classroom',
    component: () => import(/* webpackChunkName: "main" */ '../views/SubjectClassroom.vue'),
    meta: { title: "Classroom", layout: DefaultLayout, requiresAuth: true }
  },
  {
    path: '/classroom/:subjectCode/assignment/:assignmentId',
    name: 'subject-assignment',
    component: () => import(/* webpackChunkName: "main" */ '../views/Assignment.vue'),
    meta: { title: "Assignment", layout: DefaultLayout, requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import(/* webpackChunkName: "main" */ '../views/Profile.vue'),
    meta: {
      title: 'Profile',
      layout: DefaultLayout,
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import(/* webpackChunkName: "admin-dash" */ '../views/Settings.vue'),
    meta: { title: 'Settings', layout: DefaultLayout, requiresAuth: true }
  },
  // This feature will be in future version
  // {
  //   path: '/reports',
  //   name: 'reports',
  //   component: () => import(/* webpackChunkName: "admin-dash" */ '../views/Reports.vue'),
  //   meta: { title: 'Reports', layout: DefaultLayout, requiresAuth: true }
  // },
  {
    path: '*',
    name: 'PageNotFound',
    component: PageNotFound,
    meta: {
      title: 'Page Not Found',
      layout: OuterLayout
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
