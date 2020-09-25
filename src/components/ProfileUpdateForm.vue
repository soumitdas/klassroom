<template>
  <card-component title="Edit Profile" icon="account-circle">
    <b-field horizontal label="Avatar" message="File should be less than 200 KB">
      <b-field class="file is-primary" :class="{'has-name': !!avatar}">
        <b-upload v-model="avatar" class="file-label" accept="image/*">
            <span class="file-cta">
                <b-icon class="file-icon" icon="upload"></b-icon>
                <span v-show="!avatar" class="file-label">Click to upload</span>
            </span>
            <span class="file-name" v-if="avatar">
                {{ avatar.name }}
            </span>
        </b-upload>
      </b-field>
      <p class="control">
          <b-button :disabled="!avatar" :loading="isAvatarLoading" class="button is-primary" @click="updateAvatar">Update</b-button>
      </p>
    </b-field>
    <hr>
    <b-field horizontal label="Name">
      <b-input v-model="name" name="name" required/>
      <p class="control">
          <b-button :disabled="!isNameChanged" :loading="isLoading" class="button is-primary" @click="updateName">Update</b-button>
      </p>
    </b-field>
    <b-field horizontal label="E-mail">
      <b-input v-model="email" name="email" type="email" required/>
      <p class="control">
          <b-button :disabled="!isEmailChanged" class="button is-primary">Update</b-button>
      </p>
    </b-field>
  </card-component>
</template>

<script>
import { mapState } from 'vuex'
//import FilePicker from '@/components/FilePicker'
import CardComponent from '@/components/CardComponent'
import {auth, storage} from '../firebase'

export default {
  name: 'ProfileUpdateForm',
  components: {
    CardComponent,
  },
  data () {
    return {
      isFileUploaded: false,
      isLoading: false,
      isAvatarLoading: false,
      avatar: null,
      name: '',
      email: ''
    }
  },
  computed: {
    ...mapState(['user']),
    isNameChanged() {
      return this.name !== this.user.name
    },
    isEmailChanged() {
      return this.email !== this.user.email
    }
  },
  methods: {
    updateName() {
      this.isLoading = true
      auth.currentUser.updateProfile({
        displayName: this.name
      })
      .then(() => {
        this.isLoading = false
        this.name = ''
        this.$store.dispatch('fetchAuthUser')
        this.$buefy.snackbar.open({
          message: 'Name Updated',
          queue: false
        })
      })
      .catch(e => {
        this.isLoading = false
        this.$buefy.snackbar.open({
          message: `Error: ${e.message}`,
          queue: false
        })
      })
    },
    updateAvatar() {
      if (this.avatar.size < 204800) {
        this.isAvatarLoading = true
        const avatarRef = storage.ref('avatars').child(this.user.uid)
        avatarRef.put(this.avatar)
          .then(() => avatarRef.getDownloadURL())
          .then(url => auth.currentUser.updateProfile({ photoURL: url }))
          .then(() => {
            this.isAvatarLoading = false
            this.avatar = null
            this.$store.dispatch('fetchAuthUser')
            this.$buefy.snackbar.open({
              message: 'Avatar Image Updated',
              queue: false
            })
          })
          .catch(e => {
            this.isAvatarLoading = false
            this.$buefy.toast.open({
              message: `Error: ${e.message}`,
              type: 'is-danger',
              queue: false
            })
          })
      } else {
        this.avatar = null
        this.$buefy.toast.open({
          message: 'Error: File size is more than 200 KB',
          type: 'is-danger',
          queue: false
        })
      }
    },
  },
}
</script>
