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
  }
}
</script>

<style>
  .section {
    min-height: calc(100vh - 6rem);
  }
</style>
