/* Styles */
import '@/scss/main.scss'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import Buefy from 'buefy'

import {auth} from './firebase'

/* Default title tag */
const defaultDocumentTitle = 'Klassroom'

let claims = null
/* Router Auth Guard */
router.beforeEach(async (to, from, next) => {

  if (to.matched.some(x => x.meta.requiresAuth) && !auth.currentUser) {
    next({ name: 'login' , query: { next: to.path } })
  }
  else if (auth.currentUser) {
    if (!claims) {
      try {
        const token = await auth.currentUser.getIdTokenResult()
        claims = token.claims
        store.commit('setUserRole', claims)
      } catch (e) {
        console.log(e)
      }
    }
    
    to.name == 'login' ? next({ name: 'dashboard' }) : next()
  } else {
    next()
  }
})

/* Collapse mobile aside menu on route change & set document title from route meta */
router.afterEach(to => {
  store.commit('asideMobileStateToggle', false)
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${defaultDocumentTitle}`
  } else {
    document.title = defaultDocumentTitle
  }
})

Vue.config.productionTip = false

Vue.use(Buefy)

let isAuthReady = false

auth.onAuthStateChanged(async (user) => {
  store.commit('setUser', user)

  if (!user) { claims = null }

  if (!isAuthReady) {
    isAuthReady = true
    new Vue({
      router,
      store,
      render: (h) => h(App),
    }).$mount('#app')
  }
})
