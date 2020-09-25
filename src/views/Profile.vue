<template>
  <section class="section">
    <title-bar>
      {{this.$route.meta.title}}
      <router-link to="/" class="button is-primary" slot="button">
        Dashboard
      </router-link>
    </title-bar>

    <tiles>
      <profile-update-form class="tile is-child"/>
      <card-component title="Profile" icon="account" class="tile is-child">
        <div class="image is-user-avatar has-max-width is-aligned-center">
          <img v-if="!!user.photoUrl" :src="user.photoUrl" :alt="user.name">
          <user-avatar v-else :userName="user.name" />
        </div>
        <hr>
        <b-field label="Name">
          <b-input :value="user.name" custom-class="is-static" readonly/>
        </b-field>
        <b-field label="E-mail">
          <b-input :value="user.email" custom-class="is-static" readonly/>
        </b-field>
      </card-component>
    </tiles>
    <password-update-form/>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import CardComponent from '@/components/CardComponent'
import TitleBar from '@/components/TitleBar'
import ProfileUpdateForm from '@/components/ProfileUpdateForm'
import Tiles from '@/components/Tiles'
import PasswordUpdateForm from '@/components/PasswordUpdateForm'
import UserAvatar from '@/components/UserAvatar'

export default {
  name: 'Profile',
  components: { Tiles, ProfileUpdateForm, TitleBar, CardComponent, PasswordUpdateForm, UserAvatar },
  computed: {
    ...mapState(['user'])
  }
}
</script>