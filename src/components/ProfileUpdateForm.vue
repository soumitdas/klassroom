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
      <b-input v-model="name" name="name" />
      <p class="control">
          <b-button :disabled="!isNameChanged || name === ''" :loading="isLoading" class="button is-primary" @click="updateName">Update</b-button>
      </p>
    </b-field>
    <b-field horizontal label="E-mail">
      <b-input v-model="email" name="email" type="email" />
      <p class="control">
          <b-button :disabled="!isEmailChanged || email === ''" :loading="isEmailLoading" class="button is-primary" @click="updateEmail">Update</b-button>
      </p>
    </b-field>
  </card-component>
</template>

<script>
import { mapState } from 'vuex'
//import FilePicker from '@/components/FilePicker'
import CardComponent from '@/components/CardComponent'
import {auth, storage, firebase} from '../firebase'

export default {
  name: 'ProfileUpdateForm',
  components: {
    CardComponent,
  },
  data () {
    return {
      isFileUploaded: false,
      isLoading: false,
      isEmailLoading: false,
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
      return this.email !== this.user.email || this.email !== ''
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
    updateEmail() {
      this.isEmailLoading = true
      const url = `${window.location.protocol}//${window.location.hostname}`
      auth.currentUser.updateEmail(this.email)
        .then(() => auth.currentUser.sendEmailVerification({ url , handleCodeInApp: false }))
        .then(() => {
          this.isEmailLoading = false
          this.email = ''
          this.$store.dispatch('fetchAuthUser')
          this.$buefy.snackbar.open({
            message: 'Email Updated. Please verify your email',
            queue: false
          })
        })
        .catch(e => {
          if (e.code === 'auth/requires-recent-login') {
            this.$buefy.dialog.prompt({
                message: 'Authenticate yourself',
                inputAttrs: {
                    type: 'password',
                    placeholder: 'Enter your password',
                },
                confirmText: 'Submit',
                trapFocus: true,
                onConfirm: (value) => {
                  this.reAuth(value)
                    .then(() => this.updateEmail())
                    .catch(e => this.$buefy.snackbar.open({
                      message: `Error: ${e.message}`,
                      queue: false
                    }))
                }
            })
          } else {
            this.isEmailLoading = false
            this.$buefy.snackbar.open({
              message: `Error: ${e.message}`,
              queue: false
            })
          }
        })
    },
    /*updateEmailOnDatabase(newEmail) {
      const url = `${window.location.protocol}//${window.location.hostname}`
      return auth.currentUser.sendEmailVerification({ url , handleCodeInApp: false })
        .then(() => db.doc(`users/${this.user.uid}`).update({ studentData: { email: newEmail } }))
    },*/
    reAuth(password) {
      const user = auth.currentUser
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, password)
      return user.reauthenticateWithCredential(credential)
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
