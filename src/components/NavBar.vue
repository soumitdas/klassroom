<template>
  <nav v-show="isNavBarVisible" id="navbar-main" class="navbar is-fixed-top">
    <div class="navbar-brand">
      <a class="navbar-item is-hidden-desktop" @click.prevent="menuToggleMobile">
        <b-icon :icon="menuToggleMobileIcon"/>
      </a>
      <div class="navbar-item">
        <router-link to="/" class="is-size-5 is-hidden-mobile">
          {{ instituteDetails ? instituteDetails.name : '' }}
        </router-link>
        <router-link to="/" class="is-size-7 is-hidden-tablet">
          {{ instituteDetails ? instituteDetails.name : '' }}
        </router-link>
      </div>
    </div>
    <div class="navbar-brand is-right">
      <div class="navbar-item navbar-item-menu-toggle is-hidden-desktop">
        <a @click.prevent="menuNavBarToggle">
          <b-icon :icon="menuNavBarToggleIcon" custom-size="default"/>
        </a>
      </div>
    </div>
    <div class="navbar-menu fadeIn animated faster" :class="{'is-active':isMenuNavBarActive}">
      <div class="navbar-end">
        <nav-bar-menu class="has-user-avatar">
          <div class="is-user-avatar">
            <img v-if="!!user.photoUrl" :src="user.photoUrl" :alt="user.name">
            <user-avatar v-else :userName="user.name" size="nav" />
          </div>
          <div class="is-user-name">
            <span>{{ user.name }}</span>
          </div>

          <div slot="dropdown" class="navbar-dropdown">
            <a class="navbar-item">
              <b-icon icon="account" custom-size="default"></b-icon>
              <router-link :to="{name: 'profile'}">My Profile</router-link>
            </a>
        <!--    <hr class="navbar-divider">
            <a class="navbar-item">
              <b-icon icon="logout" custom-size="default"></b-icon>
              <span>Log Out</span>
            </a> -->
          </div>
        </nav-bar-menu>
        <a class="navbar-item" title="Log out" @click="logout">
          <b-icon icon="logout" custom-size="default"/>
          <span>Log out</span>
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
import NavBarMenu from '@/components/NavBarMenu'
import UserAvatar from '@/components/UserAvatar'

import { mapState } from 'vuex'
import {auth} from '../firebase'

export default {
  name: 'NavBar',
  components: {
    NavBarMenu, UserAvatar
  },
  data () {
    return {
      isMenuNavBarActive: false
    }
  },
  computed: {
    menuNavBarToggleIcon () {
      return (this.isMenuNavBarActive) ? 'close' : 'dots-vertical'
    },
    menuToggleMobileIcon () {
      return this.isAsideMobileExpanded ? 'backburger' : 'forwardburger'
    },
    ...mapState([
      'user',
      'isNavBarVisible',
      'isAsideMobileExpanded',
      'instituteDetails'
    ])
  },
  methods: {
    menuToggleMobile () {
      this.$store.commit('asideMobileStateToggle')
    },
    menuNavBarToggle () {
      this.isMenuNavBarActive = (!this.isMenuNavBarActive)
    },
    logout () {
      auth.signOut()
      .then(() =>{
        //this.$router.replace({ name: 'login' })
        window.location.href = '/'
      })
    }
  }
}
</script>
