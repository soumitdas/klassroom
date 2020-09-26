<template>
  <div id="app">
    <nav-bar/>
    <aside-menu :menu="menu" />
    <slot/>
    <footer-bar/>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar'
import AsideMenu from '@/components/AsideMenu'
import FooterBar from '@/components/FooterBar'
import MenuItems from './menu'

import {auth} from '../firebase'

export default {
  beforeCreate() {
    this.$store.commit('hideAsideNavbar',false)
  },
  components: { FooterBar, AsideMenu, NavBar },
  computed: {
      menu () {
        return this.$store.state.userRole.includes('student') 
          ? MenuItems.student : this.$store.state.userRole.includes('teacher') 
          ? MenuItems.teacher : this.$store.state.userRole.includes('admin') 
          ? MenuItems.admin : null
      }
  },
  methods: {
    emailNotVerifiedAlert() {
      this.$buefy.dialog.alert({
          title: 'Access Denied',
          message: 'Please verify your <b>email address</b> by clicking on the link sent to your email',
          type: 'is-danger',
          hasIcon: true,
          icon: 'close-octagon',
          iconPack: 'mdi',
          ariaRole: 'alertdialog',
          ariaModal: true,
          onConfirm: () => this.signOut()
      })
    },
    signOut() {
      auth.signOut()
        .then(() =>{
          window.location.href = '/'
        })
    }
  },
  mounted() {
    if (this.$store.state.userEmailVerified === false) {
      this.emailNotVerifiedAlert()
    }
  }
}
</script>

<style>
  .section {
    min-height: calc(100vh - 6rem);
  }
</style>
